import type {
  Client,
  Gender,
  WantKids,
  OpenToRelocate,
  Diet,
  FamilyType,
  ProfessionCategory,
} from '../types/client.types';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ScoredCandidate {
  candidate: Client;
  score: number;           // 0–100 final score (after penalties applied)
  rawScore: number;        // positive scoring only (before soft penalties)
  breakdown: ScoreBreakdown;
  passedHardFilters: boolean;
  hardFilterFailReasons: string[];
  softPenalties: SoftPenalty[];
}

export interface ScoreBreakdown {
  // Positive points
  wantKidsMatch: number;
  religionMatch: number;
  casteMatch: number;
  dietCompatible: number;
  relocationCompatible: number;
  familyTypeMatch: number;
  languageOverlap: number;
  openToPetsMatch: number;
  drinkingMatch: number;
  smokingMatch: number;
  professionCompatible: number;  // female-client matching only
  personalityOverlap: number;
}

export interface SoftPenalty {
  reason: string;
  points: number;   // negative number
}

// ─────────────────────────────────────────────────────────────────────────────
// Hard filter helpers (male-client matching)
// ─────────────────────────────────────────────────────────────────────────────

function computeAge(dateOfBirth: string): number {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function hardFiltersForMaleClient(
  client: Client,
  candidate: Client,
): { pass: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const clientAge = computeAge(client.dateOfBirth);
  const candidateAge = computeAge(candidate.dateOfBirth);

  // 1. Candidate must be younger than client, or at most 2 years older
  if (candidateAge > clientAge + 2) {
    reasons.push(
      `Age mismatch: candidate is ${candidateAge} (client is ${clientAge}, max allowed +2)`,
    );
  }

  // 2. Candidate must be shorter (or equal) in height
  if (candidate.heightCm > client.heightCm) {
    reasons.push(
      `Height mismatch: candidate ${candidate.heightCm}cm > client ${client.heightCm}cm`,
    );
  }

  // 3. Candidate income must be ≤ client income (per assignment spec)
  if (candidate.annualIncomeLPA > client.annualIncomeLPA) {
    reasons.push(
      `Income: candidate ₹${candidate.annualIncomeLPA}L > client ₹${client.annualIncomeLPA}L`,
    );
  }

  // 4. wantKids must be compatible — if client says "no", candidate must also be "no" or "maybe"
  if (client.wantKids === 'no' && candidate.wantKids === 'yes') {
    reasons.push(`Kids dealbreaker: client says "no", candidate says "yes"`);
  }
  if (client.wantKids === 'yes' && candidate.wantKids === 'no') {
    reasons.push(`Kids dealbreaker: client says "yes", candidate says "no"`);
  }

  // 5. Partner age preference (candidate's stated preference)
  if (candidate.partnerAgeMin && clientAge < candidate.partnerAgeMin) {
    reasons.push(
      `Outside candidate's preferred age range (min ${candidate.partnerAgeMin})`,
    );
  }
  if (candidate.partnerAgeMax && clientAge > candidate.partnerAgeMax) {
    reasons.push(
      `Outside candidate's preferred age range (max ${candidate.partnerAgeMax})`,
    );
  }

  return { pass: reasons.length === 0, reasons };
}

// ─────────────────────────────────────────────────────────────────────────────
// Soft penalty computation (female-client matching)
// ─────────────────────────────────────────────────────────────────────────────

const DEGREE_ORDER: Record<string, number> = {
  'B.A.': 1, 'B.Com': 1, 'BCA': 1, 'B.Sc': 2, 'B.Arch': 2,
  'B.Tech': 3, 'B.E.': 3, 'MBBS': 4, 'LLB': 4, 'CA': 4,
  'MBA': 5, 'M.Tech': 5, 'M.Sc': 5, 'LLM': 5, 'MD': 6, 'PhD': 7,
};

function degreeLevel(degree: string): number {
  return DEGREE_ORDER[degree] ?? 2;
}

function softPenaltiesForFemaleClient(
  client: Client,
  candidate: Client,
): SoftPenalty[] {
  const penalties: SoftPenalty[] = [];
  const clientAge = computeAge(client.dateOfBirth);
  const candidateAge = computeAge(candidate.dateOfBirth);
  const ageDiff = candidateAge - clientAge; // positive = candidate older

  // IIT Delhi + Michigan studies: women prefer man's education ≥ their own
  if (degreeLevel(candidate.highestDegree) < degreeLevel(client.highestDegree)) {
    penalties.push({
      reason: `Man's education (${candidate.highestDegree}) lower than woman's (${client.highestDegree})`,
      points: -20,
    });
  }

  // IIT Delhi confirmed: income same-direction preference
  if (candidate.annualIncomeLPA < client.annualIncomeLPA) {
    penalties.push({
      reason: `Man's income ₹${candidate.annualIncomeLPA}L < woman's ₹${client.annualIncomeLPA}L`,
      points: -15,
    });
  }

  // Michigan study: men ~25yr older preference, women prefer slightly older
  // Ideal: candidate 2–7 years older than client
  if (ageDiff < 0) {
    // Man younger than woman
    penalties.push({
      reason: `Man ${Math.abs(ageDiff)} year(s) younger than woman`,
      points: -10,
    });
  } else if (ageDiff > 10) {
    // Too large an age gap
    penalties.push({
      reason: `Age gap too large: man is ${ageDiff} years older`,
      points: -8,
    });
  }

  // Height preference — soft signal only for female clients
  if (candidate.heightCm < 165) {
    penalties.push({
      reason: `Man's height ${candidate.heightCm}cm below typical preference (165cm)`,
      points: -5,
    });
  }

  return penalties;
}

// ─────────────────────────────────────────────────────────────────────────────
// Positive scoring (shared logic, weighted differently per gender)
// ─────────────────────────────────────────────────────────────────────────────

function isRelocationCompatible(a: OpenToRelocate, b: OpenToRelocate): boolean {
  if (a === 'yes' || b === 'yes') return true;
  if (a === 'maybe' && b === 'maybe') return true;
  if (a === 'no' && b === 'no') return true;
  return false;
}

function isDietCompatible(a: Diet, b: Diet): boolean {
  if (a === b) return true;
  // veg is compatible with eggetarian, vegan
  if ((a === 'veg' && b === 'vegan') || (a === 'vegan' && b === 'veg')) return true;
  if ((a === 'veg' && b === 'eggetarian') || (a === 'eggetarian' && b === 'veg')) return true;
  // non-veg is compatible with eggetarian
  if ((a === 'non-veg' && b === 'eggetarian') || (a === 'eggetarian' && b === 'non-veg'))
    return true;
  return false;
}

function isProfessionCompatible(a: ProfessionCategory, b: ProfessionCategory): boolean {
  const compatible: Record<ProfessionCategory, ProfessionCategory[]> = {
    tech: ['tech', 'finance', 'business', 'other'],
    finance: ['finance', 'tech', 'law', 'business'],
    medicine: ['medicine', 'other', 'govt'],
    law: ['law', 'finance', 'govt', 'business'],
    govt: ['govt', 'medicine', 'law', 'other'],
    business: ['business', 'tech', 'finance', 'creative'],
    creative: ['creative', 'business', 'other'],
    other: ['other', 'tech', 'medicine', 'govt', 'creative'],
  };
  return compatible[a]?.includes(b) ?? false;
}

function languageOverlapCount(a: string[], b: string[]): number {
  return a.filter((lang) => b.includes(lang)).length;
}

function personalityOverlapCount(a: string[], b: string[]): number {
  return a.filter((tag) => b.includes(tag)).length;
}

// ── Male client scoring weights (0–100 total positive) ──────────────────────
const MALE_WEIGHTS = {
  religion: 15,
  caste: 10,
  diet: 15,
  relocation: 20,
  familyType: 15,
  language: 10,
  openToPets: 8,
  lifestyle: 7, // drinking + smoking combined
};

// ── Female client scoring weights (0–100 total positive) ────────────────────
const FEMALE_WEIGHTS = {
  wantKids: 25,
  profession: 20,
  relocation: 18,
  diet: 12,
  familyType: 10,
  religion: 8,
  language: 7,
};

function buildBreakdown(): ScoreBreakdown {
  return {
    wantKidsMatch: 0,
    religionMatch: 0,
    casteMatch: 0,
    dietCompatible: 0,
    relocationCompatible: 0,
    familyTypeMatch: 0,
    languageOverlap: 0,
    openToPetsMatch: 0,
    drinkingMatch: 0,
    smokingMatch: 0,
    professionCompatible: 0,
    personalityOverlap: 0,
  };
}

function computePositiveScore(
  client: Client,
  candidate: Client,
  isMaleClient: boolean,
): { score: number; breakdown: ScoreBreakdown } {
  const bd = buildBreakdown();
  let total = 0;

  if (isMaleClient) {
    // Religion (15 pts)
    if (client.religion === candidate.religion) {
      bd.religionMatch = MALE_WEIGHTS.religion;
      total += bd.religionMatch;
    }

    // Caste (10 pts) — only if both have caste set
    if (client.caste && candidate.caste && client.caste === candidate.caste) {
      bd.casteMatch = MALE_WEIGHTS.caste;
      total += bd.casteMatch;
    }

    // Diet (15 pts)
    if (isDietCompatible(client.diet, candidate.diet)) {
      bd.dietCompatible = MALE_WEIGHTS.diet;
      total += bd.dietCompatible;
    }

    // Relocation (20 pts)
    if (isRelocationCompatible(client.openToRelocate, candidate.openToRelocate)) {
      bd.relocationCompatible = MALE_WEIGHTS.relocation;
      total += bd.relocationCompatible;
    }

    // Family type (15 pts)
    if (client.familyType && candidate.familyType && client.familyType === candidate.familyType) {
      bd.familyTypeMatch = MALE_WEIGHTS.familyType;
      total += bd.familyTypeMatch;
    }

    // Language overlap (10 pts) — 1+ shared language
    const overlap = languageOverlapCount(client.languagesKnown, candidate.languagesKnown);
    if (overlap >= 1) {
      bd.languageOverlap = MALE_WEIGHTS.language;
      total += bd.languageOverlap;
    }

    // Pets (8 pts)
    if (client.openToPets === candidate.openToPets) {
      bd.openToPetsMatch = MALE_WEIGHTS.openToPets;
      total += bd.openToPetsMatch;
    }

    // Lifestyle: drinking + smoking (7 pts total)
    const lifestylePoints = MALE_WEIGHTS.lifestyle;
    if (client.drinking === candidate.drinking) {
      bd.drinkingMatch = Math.floor(lifestylePoints * 0.55);
      total += bd.drinkingMatch;
    }
    if (client.smoking === candidate.smoking) {
      bd.smokingMatch = Math.ceil(lifestylePoints * 0.45);
      total += bd.smokingMatch;
    }

    // Personality overlap (bonus, uncapped — max ~5 for 1+ overlap)
    const pOverlap = personalityOverlapCount(client.personalityTags, candidate.personalityTags);
    if (pOverlap >= 1) {
      bd.personalityOverlap = Math.min(5, pOverlap * 2);
      total += bd.personalityOverlap;
    }

    // wantKids already filtered as hard filter — add bonus if exact match
    if (client.wantKids === candidate.wantKids) {
      bd.wantKidsMatch = 5;
      total += bd.wantKidsMatch;
    }
  } else {
    // ── Female client ──────────────────────────────────────────────────────

    // wantKids (25 pts)
    if (client.wantKids === candidate.wantKids) {
      bd.wantKidsMatch = FEMALE_WEIGHTS.wantKids;
      total += bd.wantKidsMatch;
    } else if (
      (client.wantKids === 'maybe' && candidate.wantKids !== 'no') ||
      (candidate.wantKids === 'maybe' && client.wantKids !== 'no')
    ) {
      bd.wantKidsMatch = Math.floor(FEMALE_WEIGHTS.wantKids * 0.5);
      total += bd.wantKidsMatch;
    }

    // Profession (20 pts)
    if (isProfessionCompatible(client.professionCategory, candidate.professionCategory)) {
      bd.professionCompatible = FEMALE_WEIGHTS.profession;
      total += bd.professionCompatible;
    }

    // Relocation (18 pts)
    if (isRelocationCompatible(client.openToRelocate, candidate.openToRelocate)) {
      bd.relocationCompatible = FEMALE_WEIGHTS.relocation;
      total += bd.relocationCompatible;
    }

    // Diet (12 pts)
    if (isDietCompatible(client.diet, candidate.diet)) {
      bd.dietCompatible = FEMALE_WEIGHTS.diet;
      total += bd.dietCompatible;
    }

    // Family type (10 pts)
    if (client.familyType && candidate.familyType && client.familyType === candidate.familyType) {
      bd.familyTypeMatch = FEMALE_WEIGHTS.familyType;
      total += bd.familyTypeMatch;
    }

    // Religion (8 pts)
    if (client.religion === candidate.religion) {
      bd.religionMatch = FEMALE_WEIGHTS.religion;
      total += bd.religionMatch;
    }

    // Language (7 pts)
    const overlap = languageOverlapCount(client.languagesKnown, candidate.languagesKnown);
    if (overlap >= 1) {
      bd.languageOverlap = FEMALE_WEIGHTS.language;
      total += bd.languageOverlap;
    }

    // Pets (bonus, 4 pts)
    if (client.openToPets === candidate.openToPets) {
      bd.openToPetsMatch = 4;
      total += bd.openToPetsMatch;
    }

    // Drinking / smoking (bonus, 3 pts each)
    if (client.drinking === candidate.drinking) {
      bd.drinkingMatch = 3;
      total += bd.drinkingMatch;
    }
    if (client.smoking === candidate.smoking) {
      bd.smokingMatch = 3;
      total += bd.smokingMatch;
    }

    // Caste (optional bonus 5 pts if both have it and it matches)
    if (client.caste && candidate.caste && client.caste === candidate.caste) {
      bd.casteMatch = 5;
      total += bd.casteMatch;
    }

    // Personality overlap (bonus)
    const pOverlap = personalityOverlapCount(client.personalityTags, candidate.personalityTags);
    if (pOverlap >= 1) {
      bd.personalityOverlap = Math.min(5, pOverlap * 2);
      total += bd.personalityOverlap;
    }
  }

  return { score: total, breakdown: bd };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main exported function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Runs the full 4-step matching algorithm:
 * 1. Filter by opposite gender
 * 2. Apply hard filters (male client) or soft penalties (female client)
 * 3. Compute weighted compatibility score 0–100
 * 4. Return sorted results (top N, default 10)
 *
 * This is pure TypeScript/math — NO API calls, runs synchronously.
 * AI enrichment (Gemini) happens AFTER this in match.controller.ts,
 * only for the top GEMINI_ENRICH_TOP_N results (default 3).
 */
export function runMatchingAlgorithm(
  client: Client,
  pool: Client[],
  topN = 10,
): ScoredCandidate[] {
  const isMaleClient = client.gender === 'male';
  const oppositeGender: Gender = isMaleClient ? 'female' : 'male';

  const results: ScoredCandidate[] = [];

  for (const candidate of pool) {
    // ── Step 1: Gender filter ─────────────────────────────────────────────
    if (candidate.gender !== oppositeGender) continue;

    // ── Step 2: Hard filters (male) / collect soft penalties (female) ─────
    let hardFilterFailReasons: string[] = [];
    let softPenalties: SoftPenalty[] = [];
    let passedHardFilters = true;

    if (isMaleClient) {
      const { pass, reasons } = hardFiltersForMaleClient(client, candidate);
      passedHardFilters = pass;
      hardFilterFailReasons = reasons;
      if (!pass) continue; // hard remove — skip entirely for male clients
    } else {
      softPenalties = softPenaltiesForFemaleClient(client, candidate);
      // Female clients: no one is hard-removed, penalties reduce score only
    }

    // ── Step 3: Weighted compatibility score ──────────────────────────────
    const { score: rawScore, breakdown } = computePositiveScore(client, candidate, isMaleClient);

    const penaltyTotal = softPenalties.reduce((sum, p) => sum + p.points, 0);
    const finalScore = Math.max(0, Math.min(100, rawScore + penaltyTotal));

    results.push({
      candidate,
      score: finalScore,
      rawScore,
      breakdown,
      passedHardFilters,
      hardFilterFailReasons,
      softPenalties,
    });
  }

  // ── Step 4: Sort descending, return top N ─────────────────────────────────
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, topN);
}

// ─────────────────────────────────────────────────────────────────────────────
// Score label helper (used by AI service to pre-label without API call)
// ─────────────────────────────────────────────────────────────────────────────

export function getScoreLabel(score: number): 'High Potential' | 'Good Match' | 'Possible' {
  if (score >= 70) return 'High Potential';
  if (score >= 45) return 'Good Match';
  return 'Possible';
}

export function getScoreBadgeColor(label: ReturnType<typeof getScoreLabel>): string {
  switch (label) {
    case 'High Potential': return 'green';
    case 'Good Match':     return 'blue';
    case 'Possible':       return 'gray';
  }
}