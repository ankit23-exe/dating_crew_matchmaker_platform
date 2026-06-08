// types/client.ts

export type Gender = 'male' | 'female';
export type MaritalStatus = 'never_married' | 'divorced' | 'widowed';
export type WantKids = 'yes' | 'no' | 'maybe';
export type OpenToRelocate = 'yes' | 'no' | 'maybe';
export type Diet = 'veg' | 'non-veg' | 'eggetarian' | 'vegan';
export type Drinking = 'never' | 'socially' | 'regularly';
export type Smoking = 'never' | 'occasionally' | 'regularly';
export type FamilyType = 'nuclear' | 'joint' | 'extended';
export type ManglikStatus = 'manglik' | 'non-manglik' | 'partial' | 'unknown';
export type ProfessionCategory =
  | 'tech' | 'finance' | 'medicine' | 'law'
  | 'govt' | 'business' | 'creative' | 'other';
export type ClientType = 'partner_search' | 'tdc_member';
export type JourneyStage =
  | 'onboarding' | 'profiling' | 'active_search'
  | 'intro_sent' | 'date_scheduled' | 'post_date'
  | 'committed' | 'paused';

export interface MatchSent {
  candidateId: string;
  sentDate: string; // ISO
  outcome: 'pending' | 'accepted' | 'rejected' | 'no_response';
}

export interface Note {
  text: string;
  timestamp: string; // ISO
}

export interface Client {
  // ── Group 1: Identity (required) ──
  id: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  dateOfBirth: string;         // ISO — compute age from this
  email: string;
  phone: string;
  maritalStatus: MaritalStatus;

  // ── Group 2: Location ──
  currentCity: string;
  currentCountry: string;
  hometown?: string;           // top-3 filter in Indian matching
  isNRI: boolean;
  visaStatus?: 'H1B' | 'PR' | 'Citizen' | 'Work Visa' | 'N/A';
  openToRelocate: OpenToRelocate; // high match weight

  // ── Group 3: Physical ──
  heightCm: number;            // hard filter for male client matching
  bloodGroup?: string;         // show on profile, don't score

  // ── Group 4: Education & Career ──
  undergradCollege: string;
  highestDegree: string;       // hard filter for female-client matches
  currentCompany: string;
  designation: string;
  professionCategory: ProfessionCategory; // used in compat scoring
  annualIncomeLPA: number;     // most-biased field — use carefully

  // ── Group 5: Family ──
  siblings: number;
  familyType?: FamilyType;     // real dealbreaker for many Indians
  fatherOccupation?: string;   // context during intro, not scored
  motherOccupation?: string;

  // ── Group 6: Cultural Identity (low weight) ──
  religion: string;            // 3 pts only at TDC
  caste?: string;              // optional for scoring, user's choice
  motherTongue?: string;
  languagesKnown: string[];    // language overlap = communication comfort
  gotra?: string;              // show only if filled, never score
  manglikStatus?: ManglikStatus; // show only if filled
  nakshatra?: string;          // show only if filled

  // ── Group 7: Values & Lifestyle (highest match weight) ──
  wantKids: WantKids;          // #1 signal — dealbreaker if mismatch
  openToPets: boolean;
  diet: Diet;
  drinking: Drinking;
  smoking: Smoking;
  personalityTags: string[];   // ['ambitious','family-oriented',...]
  partnerAgeMin?: number;      // filter before scoring
  partnerAgeMax?: number;

  // ── Group 8: CRM (internal dashboard only) ──
  clientType: ClientType;
  journeyStage: JourneyStage;
  status: 'New' | 'Active' | 'Match Sent' | 'Matched' | 'Paused';
  notes: Note[];
  matchesSent: MatchSent[];
}