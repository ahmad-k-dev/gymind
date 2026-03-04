interface JwtPayload {
  nameid?: string;
  unique_name?: string;
  sub?: string;
}

function safeBase64UrlDecode(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');

  if (typeof globalThis.atob === 'function') {
    return decodeURIComponent(
      Array.prototype.map
        .call(globalThis.atob(padded), (ch: string) => `%${(`00${ch.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join('')
    );
  }
  throw new Error('No base64 decoder available');
}

export function getUserIdFromToken(token: string): string | null {
  try {
    const chunks = token.split('.');
    if (chunks.length < 2) return null;
    const payload = JSON.parse(safeBase64UrlDecode(chunks[1])) as JwtPayload;

    return payload.nameid ?? payload.unique_name ?? payload.sub ?? null;
  } catch {
    return null;
  }
}
