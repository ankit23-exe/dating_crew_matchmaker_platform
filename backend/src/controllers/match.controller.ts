import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { runMatchingAlgorithm, getScoreLabel } from '../services/matching.service.js';
import { getAIMatchInsight, getLocalMatchInsight } from '../services/ai.service.js';
import { sendMatchEmail } from '../services/email.service.js';
import type { Client } from '../types/client.types.js';

const CLIENTS_PATH = path.resolve(process.cwd(), 'src/data/clients.json');
const POOL_PATH = path.resolve(process.cwd(), 'src/data/pool.json');

/** How many match cards to show in the UI */
const DISPLAY_TOP_N = Number(process.env.MATCH_DISPLAY_TOP_N) || 5;
/** How many of those get a Gemini "why they match" call (rest use local scoring only) */
const GEMINI_ENRICH_TOP_N = Number(process.env.GEMINI_ENRICH_TOP_N) || 3;

const readClients = (): Client[] =>
  JSON.parse(fs.readFileSync(CLIENTS_PATH, 'utf-8')) as Client[];

const readPool = (): Client[] =>
  JSON.parse(fs.readFileSync(POOL_PATH, 'utf-8')) as Client[];

const writeClients = (clients: Client[]): void => {
  fs.writeFileSync(CLIENTS_PATH, JSON.stringify(clients, null, 2));
};

const computeAge = (dateOfBirth: string): number => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDelta = today.getMonth() - birthDate.getMonth();

  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age;
};

export const getMatches = async (req: Request, res: Response): Promise<void> => {
  const matchmakerId = req.matchmakerId;

  if (!matchmakerId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const clients = readClients();
    const client = clients.find((entry) => entry.id === req.params.clientId);

    if (!client) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    const pool = readPool();

    // ── Step 1: Score entire pool locally (zero API calls) ──────────────────
    console.log(
      `[Match] ${client.id}: scoring ${pool.length} pool candidates locally (no AI)...`,
    );
    const ranked = runMatchingAlgorithm(client, pool, DISPLAY_TOP_N);
    console.log(
      `[Match] ${client.id}: top ${ranked.length} selected → scores [${ranked.map((m) => m.score).join(', ')}]`,
    );

    // ── Step 2: Gemini only for top N — rest use local insight ────────────
    let geminiCallsAttempted = 0;
    let geminiSuccess = 0;
    let localOnly = 0;
    let geminiQuotaHit = false;

    const enriched = [];
    for (let i = 0; i < ranked.length; i++) {
      const match = ranked[i];
      const rank = i + 1;
      const useGemini = rank <= GEMINI_ENRICH_TOP_N && !geminiQuotaHit;

      let aiInsight;
      let insightSource: string;

      if (useGemini) {
        geminiCallsAttempted++;
        const result = await getAIMatchInsight(client, match.candidate, match.score);
        aiInsight = result.insight;
        insightSource = result.source;

        if (result.source === 'gemini') {
          geminiSuccess++;
        }

        if (result.quotaExceeded) {
          geminiQuotaHit = true;
          console.warn(
            `[Match] ${client.id}: Gemini quota exceeded — ranks ${rank + 1}+ will use local scoring only`,
          );
        }
      } else {
        localOnly++;
        aiInsight = getLocalMatchInsight(
          client,
          match.candidate,
          match.score,
          match.breakdown,
        );
        insightSource = geminiQuotaHit ? 'local (quota skip)' : 'local (rank skip)';
      }

      console.log(
        `[Match] #${rank} ${client.id} -> ${match.candidate.id} | score: ${match.score} | source: ${insightSource}`,
      );

      enriched.push({
        candidate: match.candidate,
        age: computeAge(match.candidate.dateOfBirth),
        score: match.score,
        label: getScoreLabel(match.score),
        aiInsight,
        insightSource,
        rawScore: match.rawScore,
        breakdown: match.breakdown,
        passedHardFilters: match.passedHardFilters,
        hardFilterFailReasons: match.hardFilterFailReasons,
        softPenalties: match.softPenalties,
      });
    }

    console.log(
      `[Match] ${client.id} SUMMARY: pool=${pool.length} | shown=${ranked.length} | gemini_attempted=${geminiCallsAttempted} | gemini_ok=${geminiSuccess} | local_only=${localOnly}`,
    );

    res.json({ clientId: client.id, matches: enriched });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
};

export const sendMatch = async (req: Request, res: Response): Promise<void> => {
  const matchmakerId = req.matchmakerId;

  if (!matchmakerId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const { clientId, candidateId, emailDraft } = req.body as {
      clientId?: string;
      candidateId?: string;
      emailDraft?: string;
    };

    if (!clientId || !candidateId) {
      res.status(400).json({ error: 'clientId and candidateId are required' });
      return;
    }

    const clients = readClients();
    const clientIndex = clients.findIndex((entry) => entry.id === clientId);

    if (clientIndex === -1) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    const newMatch = {
      candidateId,
      sentDate: new Date().toISOString(),
      outcome: 'pending' as const,
    };

    clients[clientIndex].matchesSent.push(newMatch);
    clients[clientIndex].status = 'Match Sent';
    clients[clientIndex].journeyStage = 'intro_sent';
    writeClients(clients);

    const candidate = readPool().find((entry) => entry.id === candidateId);

    await sendMatchEmail({
      toEmail: clients[clientIndex].email,
      toName: `${clients[clientIndex].firstName} ${clients[clientIndex].lastName}`,
      candidateId,
      emailBody:
        emailDraft ??
        `We have found a potential match${candidate ? `: ${candidate.firstName} ${candidate.lastName}` : ''}.`,
    });

    res.json({ success: true, match: newMatch });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
};
