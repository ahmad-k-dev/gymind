import { getStoredTokens } from './tokenStorage';

interface TokenSnapshot {
  token: string | null;
  refreshToken: string | null;
}

type TokenGetter = () => TokenSnapshot;

let tokenGetter: TokenGetter | null = null;

export function setTokenGetter(getter: TokenGetter): void {
  tokenGetter = getter;
}

export async function getAuthTokens(): Promise<TokenSnapshot> {
  const fromState = tokenGetter?.();
  if (fromState?.token || fromState?.refreshToken) {
    return fromState;
  }

  return getStoredTokens();
}
