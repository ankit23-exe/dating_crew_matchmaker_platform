import type { Client, Diet, Gender, JourneyStage, MaritalStatus, OpenToRelocate, WantKids } from '@/types/client';
import { calcAge } from '@/lib/utils';

export type AgeRange = '' | '18-25' | '26-30' | '31-35' | '36-40' | '41-50' | '50+';
export type IncomeRange = '' | '0-15' | '15-30' | '30-50' | '50-100' | '100+';
export type QuickFilter = 'All' | 'Male' | 'Female' | 'Active' | 'Paused' | 'NRI';

export interface ClientFilters {
  query: string;
  quickFilter: QuickFilter;
  location: string;
  ageRange: AgeRange;
  status: string;
  journeyStage: string;
  gender: Gender | '';
  diet: Diet | '';
  wantKids: WantKids | '';
  openToRelocate: OpenToRelocate | '';
  nri: '' | 'yes' | 'no';
  incomeRange: IncomeRange;
  maritalStatus: MaritalStatus | '';
  religion: string;
}

export const defaultFilters: ClientFilters = {
  query: '',
  quickFilter: 'All',
  location: '',
  ageRange: '',
  status: '',
  journeyStage: '',
  gender: '',
  diet: '',
  wantKids: '',
  openToRelocate: '',
  nri: '',
  incomeRange: '',
  maritalStatus: '',
  religion: '',
};

const matchesAgeRange = (age: number, range: AgeRange): boolean => {
  if (!range) return true;
  const ranges: Record<AgeRange, [number, number]> = {
    '': [0, 200],
    '18-25': [18, 25],
    '26-30': [26, 30],
    '31-35': [31, 35],
    '36-40': [36, 40],
    '41-50': [41, 50],
    '50+': [50, 200],
  };
  const [min, max] = ranges[range];
  return age >= min && age <= max;
};

const matchesIncomeRange = (income: number, range: IncomeRange): boolean => {
  if (!range) return true;
  switch (range) {
    case '0-15':
      return income < 15;
    case '15-30':
      return income >= 15 && income < 30;
    case '30-50':
      return income >= 30 && income < 50;
    case '50-100':
      return income >= 50 && income < 100;
    case '100+':
      return income >= 100;
    default:
      return true;
  }
};

const matchesQuery = (client: Client, query: string): boolean => {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const age = client.age ?? calcAge(client.dateOfBirth);
  const haystack = [
    client.id,
    client.firstName,
    client.lastName,
    `${client.firstName} ${client.lastName}`,
    client.currentCity,
    client.currentCountry,
    client.hometown,
    client.currentCompany,
    client.designation,
    client.religion,
    client.motherTongue,
    String(age),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(q);
};

export const applyClientFilters = (clients: Client[], filters: ClientFilters): Client[] =>
  clients.filter((client) => {
    const age = client.age ?? calcAge(client.dateOfBirth);

    if (!matchesQuery(client, filters.query)) return false;

    switch (filters.quickFilter) {
      case 'Male':
        if (client.gender !== 'male') return false;
        break;
      case 'Female':
        if (client.gender !== 'female') return false;
        break;
      case 'Active':
        if (client.status !== 'Active') return false;
        break;
      case 'Paused':
        if (client.status !== 'Paused') return false;
        break;
      case 'NRI':
        if (!client.isNRI) return false;
        break;
      default:
        break;
    }

    if (filters.location && client.currentCity !== filters.location) return false;
    if (!matchesAgeRange(age, filters.ageRange)) return false;
    if (filters.status && client.status !== filters.status) return false;
    if (filters.journeyStage && client.journeyStage !== filters.journeyStage) return false;
    if (filters.gender && client.gender !== filters.gender) return false;
    if (filters.diet && client.diet !== filters.diet) return false;
    if (filters.wantKids && client.wantKids !== filters.wantKids) return false;
    if (filters.openToRelocate && client.openToRelocate !== filters.openToRelocate) return false;
    if (filters.nri === 'yes' && !client.isNRI) return false;
    if (filters.nri === 'no' && client.isNRI) return false;
    if (!matchesIncomeRange(client.annualIncomeLPA, filters.incomeRange)) return false;
    if (filters.maritalStatus && client.maritalStatus !== filters.maritalStatus) return false;
    if (filters.religion && client.religion !== filters.religion) return false;

    return true;
  });

export const getUniqueCities = (clients: Client[]): string[] =>
  [...new Set(clients.map((c) => c.currentCity))].sort();

export const getUniqueReligions = (clients: Client[]): string[] =>
  [...new Set(clients.map((c) => c.religion))].sort();

export const countActiveFilters = (filters: ClientFilters): number => {
  let count = 0;
  if (filters.location) count += 1;
  if (filters.ageRange) count += 1;
  if (filters.status) count += 1;
  if (filters.journeyStage) count += 1;
  if (filters.gender) count += 1;
  if (filters.diet) count += 1;
  if (filters.wantKids) count += 1;
  if (filters.openToRelocate) count += 1;
  if (filters.nri) count += 1;
  if (filters.incomeRange) count += 1;
  if (filters.maritalStatus) count += 1;
  if (filters.religion) count += 1;
  return count;
};
