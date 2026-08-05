const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Converts any string ID (like 'crs-123', 'cat-456', 'usr-admin-001') into a valid 36-character UUID v4.
 * If the string is already a valid UUID, it is returned as-is.
 * If the string is empty or null, returns null.
 */
export function toUUID(str?: string | null): string | null {
  if (!str || typeof str !== 'string') return null;
  const trimmed = str.trim();
  if (!trimmed) return null;
  if (UUID_REGEX.test(trimmed)) return trimmed;

  // Convert non-UUID string to a deterministic valid UUID v4 format
  let hash1 = 0;
  let hash2 = 0;
  for (let i = 0; i < trimmed.length; i++) {
    const ch = trimmed.charCodeAt(i);
    hash1 = ((hash1 << 5) - hash1) + ch;
    hash1 |= 0;
    hash2 = ((hash2 << 7) + hash2) ^ ch;
    hash2 |= 0;
  }
  const h1 = Math.abs(hash1).toString(16).padStart(8, '0');
  const h2 = Math.abs(hash2).toString(16).padStart(8, '0');
  const h3 = Math.abs(hash1 ^ hash2).toString(16).padStart(8, '0');
  const h4 = Math.abs(hash1 * 31 + hash2).toString(16).padStart(8, '0');
  const raw = (h1 + h2 + h3 + h4).substring(0, 32);

  return `${raw.substring(0, 8)}-${raw.substring(8, 12)}-4${raw.substring(13, 16)}-a${raw.substring(17, 20)}-${raw.substring(20, 32)}`;
}

/**
 * Generates a fresh RFC4122 compliant UUID v4 string.
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return toUUID(`gen-${Date.now()}-${Math.random()}`)!;
}
