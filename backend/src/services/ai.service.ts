import type { Client } from '../types/client.types.js';
import { getScoreLabel, type ScoreBreakdown } from './matching.service.js';

export interface AIMatchInsight {
  label: 'High Potential' | 'Good Match' | 'Possible';
  reason: string;
  emailDraft: string;
}

export type InsightSource = 'gemini' | 'fallback' | 'local';

export interface InsightResult {
  insight: AIMatchInsight;
  source: InsightSource;
  quotaExceeded?: boolean;
}

const getGeminiApiKey = (): string | undefined =>
  process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

const buildProfileSummary = (client: Client): string => {
  const age = new Date().getFullYear() - new Date(client.dateOfBirth).getFullYear();

  return [
    `Name: ${client.firstName} ${client.lastName}`,
    `Age: ${age}`,
    `City: ${client.currentCity}, ${client.currentCountry}`,
    `Profession: ${client.designation} at ${client.currentCompany} (${client.professionCategory})`,
    `Education: ${client.highestDegree} from ${client.undergradCollege}`,
    `Family type: ${client.familyType ?? 'not specified'}`,
    `Want kids: ${client.wantKids}`,
    `Open to relocate: ${client.openToRelocate}`,
    `Diet: ${client.diet}`,
    `Personality: ${client.personalityTags.join(', ')}`,
    `Religion: ${client.religion}`,
  ].join('\n');
};

const buildEmailDraft = (client: Client, candidate: Client): string =>
  `Dear ${client.firstName}, we found a promising introduction for you with ${candidate.firstName} ${candidate.lastName}, ${candidate.designation} based in ${candidate.currentCity}. Please let us know if you would like to explore the profile further.`;

const parseInsight = (text: string): AIMatchInsight | null => {
  try {
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned) as Partial<AIMatchInsight>;

    if (
      parsed.label === 'High Potential' ||
      parsed.label === 'Good Match' ||
      parsed.label === 'Possible'
    ) {
      return {
        label: parsed.label,
        reason: typeof parsed.reason === 'string' ? parsed.reason : 'Shared values and lifestyle compatibility detected.',
        emailDraft:
          typeof parsed.emailDraft === 'string'
            ? parsed.emailDraft
            : 'We found a promising introduction worth exploring further.',
      };
    }

    return null;
  } catch {
    return null;
  }
};

/** Local-only insight from matching algorithm — no API call */
export const getLocalMatchInsight = (
  client: Client,
  candidate: Client,
  score: number,
  breakdown?: ScoreBreakdown,
): AIMatchInsight => {
  const aligned: string[] = [];

  if (breakdown) {
    if (breakdown.religionMatch > 0) aligned.push('religion');
    if (breakdown.dietCompatible > 0) aligned.push('diet');
    if (breakdown.relocationCompatible > 0) aligned.push('relocation');
    if (breakdown.wantKidsMatch > 0) aligned.push('kids');
    if (breakdown.languageOverlap > 0) aligned.push('languages');
    if (breakdown.familyTypeMatch > 0) aligned.push('family type');
    if (breakdown.professionCompatible > 0) aligned.push('profession');
    if (breakdown.personalityOverlap > 0) aligned.push('personality');
  }

  const reason =
    aligned.length > 0
      ? `Score ${score}/100 — strong alignment on ${aligned.slice(0, 3).join(', ')} (local matching rules).`
      : `Score ${score}/100 — ranked by compatibility algorithm (no AI enrichment).`;

  return {
    label: getScoreLabel(score),
    reason,
    emailDraft: buildEmailDraft(client, candidate),
  };
};

const fallbackInsight = (
  client: Client,
  candidate: Client,
  score?: number,
): AIMatchInsight => {
  const label = score !== undefined ? getScoreLabel(score) : 'Possible';

  const shared: string[] = [];
  if (client.religion === candidate.religion) shared.push('same religion');
  if (client.diet === candidate.diet) shared.push('matching diet');
  if (client.wantKids === candidate.wantKids) shared.push('aligned on kids');
  if (client.openToRelocate === candidate.openToRelocate) shared.push('similar relocation outlook');

  const reason =
    shared.length > 0
      ? `Strong overlap on ${shared.slice(0, 2).join(' and ')} — worth a closer look.`
      : 'Profile alignment suggests potential compatibility based on lifestyle and values.';

  return {
    label,
    reason,
    emailDraft: buildEmailDraft(client, candidate),
  };
};

const isQuotaError = (message: string): boolean =>
  /quota|429|rate.?limit/i.test(message);
const callGemini = async (
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
): Promise<string> => {
  const model = process.env.GEMINI_MODEL || 'gpt-4.1-mini';

  const response = await fetch(
    'https://api.chatanywhere.tech/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 600,
        response_format: {
          type: 'json_object',
        },
      }),
    },
  );

  const data = (await response.json()) as {
    error?: {
      message?: string;
      code?: string | number;
    };
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };

  if (!response.ok) {
    const msg =
      data.error?.message ||
      `GPT API error (${response.status})`;

    throw new Error(msg);
  }

  const text = data.choices?.[0]?.message?.content ?? '';

  if (!text) {
    throw new Error('GPT returned an empty response');
  }

  return text;
};

/** Gemini call for a single top-ranked pair — use only after local scoring */
export const getAIMatchInsight = async (
  client: Client,
  candidate: Client,
  score?: number,
): Promise<InsightResult> => {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    console.warn('[AI Service] GEMINI_API_KEY not set — using local fallback');
    return { insight: fallbackInsight(client, candidate, score), source: 'fallback' };
  }

  const systemPrompt = [
    'You are an assistant for TDC Matchmaker, a premium Indian matchmaking company.',
    'Respond only with valid JSON and no markdown.',
    'Return exactly these keys: label, reason, emailDraft.',
    'label must be one of: High Potential, Good Match, Possible.',
    'reason must be one concise sentence explaining why these two people could be a good match.',
    'emailDraft must be a warm 3-4 sentence intro note mentioning the candidate name, profession, city, and one shared value.',
    'Do not mention income or caste.',
  ].join(' ');

  const userPrompt = [
    score !== undefined ? `Compatibility score: ${score}/100` : '',
    'CLIENT:',
    buildProfileSummary(client),
    '',
    'CANDIDATE:',
    buildProfileSummary(candidate),
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const text = await callGemini(systemPrompt, userPrompt, apiKey);
    const parsed = parseInsight(text);
    if (parsed) {
      return { insight: parsed, source: 'gemini' };
    }
    console.warn(
      '[AI Service] Could not parse Gemini JSON — fallback. candidate:',
      candidate.id,
      'raw:',
      text.slice(0, 120),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[AI Service] Gemini failed for', candidate.id, ':', message.slice(0, 120));

    if (isQuotaError(message)) {
      return {
        insight: fallbackInsight(client, candidate, score),
        source: 'fallback',
        quotaExceeded: true,
      };
    }
  }

  return { insight: fallbackInsight(client, candidate, score), source: 'fallback' };
};
