import * as SecureStore from 'expo-secure-store';

export const TOKEN_STORAGE_KEY = 'Token';
export const REFRESH_TOKEN_STORAGE_KEY = 'RefreshToken';

export interface StoredTokens {
  token: string | null;
  refreshToken: string | null;
}

export async function setStoredTokens(token: string, refreshToken: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, token);
  await SecureStore.setItemAsync(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
}

export async function getStoredTokens(): Promise<StoredTokens> {
  const [token, refreshToken] = await Promise.all([
    SecureStore.getItemAsync(TOKEN_STORAGE_KEY),
    SecureStore.getItemAsync(REFRESH_TOKEN_STORAGE_KEY),
  ]);

  return { token, refreshToken };
}

export async function clearStoredTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_STORAGE_KEY),
  ]);
}
