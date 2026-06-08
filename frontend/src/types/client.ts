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
  | 'tech'
  | 'finance'
  | 'medicine'
  | 'law'
  | 'govt'
  | 'business'
  | 'creative'
  | 'other';
export type ClientType = 'partner_search' | 'tdc_member';
export type JourneyStage =
  | 'onboarding'
  | 'profiling'
  | 'active_search'
  | 'intro_sent'
  | 'date_scheduled'
  | 'post_date'
  | 'committed'
  | 'paused';

export interface MatchSent {
  candidateId: string;
  sentDate: string;
  outcome: 'pending' | 'accepted' | 'rejected' | 'no_response';
}

export interface Note {
  text: string;
  timestamp: string;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  dateOfBirth: string;
  email: string;
  phone: string;
  maritalStatus: MaritalStatus;
  currentCity: string;
  currentCountry: string;
  hometown?: string;
  isNRI: boolean;
  visaStatus?: 'H1B' | 'PR' | 'Citizen' | 'Work Visa' | 'N/A';
  openToRelocate: OpenToRelocate;
  heightCm: number;
  bloodGroup?: string;
  undergradCollege: string;
  highestDegree: string;
  currentCompany: string;
  designation: string;
  professionCategory: ProfessionCategory;
  annualIncomeLPA: number;
  siblings: number;
  familyType?: FamilyType;
  fatherOccupation?: string;
  motherOccupation?: string;
  religion: string;
  caste?: string;
  motherTongue?: string;
  languagesKnown: string[];
  gotra?: string;
  manglikStatus?: ManglikStatus;
  nakshatra?: string;
  wantKids: WantKids;
  openToPets: boolean;
  diet: Diet;
  drinking: Drinking;
  smoking: Smoking;
  personalityTags: string[];
  partnerAgeMin?: number;
  partnerAgeMax?: number;
  clientType: ClientType;
  journeyStage: JourneyStage;
  status: 'New' | 'Active' | 'Match Sent' | 'Matched' | 'Paused';
  notes: Note[];
  matchesSent: MatchSent[];
  age?: number;
}
