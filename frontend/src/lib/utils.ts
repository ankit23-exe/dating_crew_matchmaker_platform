export const calcAge = (dateOfBirth: string): number => {
  const today = new Date();
  const dob = new Date(dateOfBirth);
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }

  return age;
};

export const formatLPA = (lpa: number): string =>
  lpa >= 100 ? `${(lpa / 100).toFixed(1)}Cr` : `${lpa}L`;

export const getInitials = (firstName: string, lastName: string): string =>
  `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();

export const getStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    Active: 'var(--tag-active-bg)',
    'Match Sent': 'var(--tag-pending-bg)',
    Matched: 'var(--tag-matched-bg)',
    Paused: 'var(--tag-paused-bg)',
    New: 'var(--tag-new-bg)',
  };

  return map[status] || 'var(--tag-paused-bg)';
};

export const getStatusTextColor = (status: string): string => {
  const map: Record<string, string> = {
    Active: 'var(--tag-active-text)',
    'Match Sent': 'var(--tag-pending-text)',
    Matched: 'var(--tag-matched-text)',
    Paused: 'var(--tag-paused-text)',
    New: 'var(--tag-new-text)',
  };

  return map[status] || 'var(--tag-paused-text)';
};

export const getStageLabel = (stage: string): string => {
  const map: Record<string, string> = {
    onboarding: 'Onboarding',
    profiling: 'Profiling',
    active_search: 'Active Search',
    intro_sent: 'Intro Sent',
    date_scheduled: 'Date Scheduled',
    post_date: 'Post Date',
    committed: 'Committed',
    paused: 'Paused',
  };

  return map[stage] || stage;
};
