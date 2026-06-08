const TOKEN_KEY = 'tdc_matchmaker_token';

export const setToken = (_token: string): void => {
  // Auth token is managed as an httpOnly cookie by backend login.
};

export const getToken = (): string | null => {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${TOKEN_KEY}=`));

  return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
};

export const clearToken = (): void => {
  if (typeof document === 'undefined') {
    return;
  }

  // httpOnly cookie is cleared via /api/auth/logout proxy route.
  void fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
};

export const isLoggedIn = (): boolean => !!getToken();
