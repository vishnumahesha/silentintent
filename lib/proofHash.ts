// Deterministic hash + canonicalization helpers for the SilentIntent
// sandbox proof model.
//
// These helpers are non-cryptographic. They exist so the demo's
// commitments are stable across runs and across server/client renders
// (no Math.random, no Date.now in the value path). Production should
// replace `demoHash` with a Midnight-compatible primitive (e.g.
// `persistentHash` exposed by Compact, or a Poseidon-family hash) so
// the on-chain commitments are real.

/**
 * Canonical JSON serializer. Sorts object keys recursively so that
 * `canonical({a:1,b:2})` and `canonical({b:2,a:1})` produce the same
 * string. Arrays are preserved in order.
 */
export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
  const keys = Object.keys(value as Record<string, unknown>).sort();
  return (
    '{' +
    keys
      .map(
        (k) =>
          JSON.stringify(k) + ':' + stableStringify((value as Record<string, unknown>)[k]),
      )
      .join(',') +
    '}'
  );
}

/**
 * Non-cryptographic 256-bit-shaped hash. Two parallel FNV-style rounds
 * plus mixing produce a 32-hex-char output prefixed with `0x`.
 *
 * Suitable for: deterministic demo commitments, UI scramble seeds,
 * verification-script parity checks.
 *
 * NOT suitable for: collision resistance, signatures, or any real
 * privacy guarantee. Swap for `persistentHash` (Compact) in production.
 */
export function demoHash(value: unknown): string {
  const input = typeof value === 'string' ? value : stableStringify(value);
  let h1 = 0x811c9dc5;
  let h2 = 0xdeadbeef;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193);
    h2 = Math.imul(h2 ^ c, 0x85ebca6b);
  }
  h1 = (h1 ^ (h1 >>> 16)) >>> 0;
  h2 = (h2 ^ (h2 >>> 13)) >>> 0;
  const part = (n: number) => n.toString(16).padStart(8, '0');
  return '0x' + part(h1) + part(h2) + part(h1 ^ h2) + part((h2 + 0x9e3779b9) >>> 0);
}

/**
 * `0xABCD⋯1234` truncation helper for display. Keeps the leading `0x`,
 * shows 4 leading nibbles after it and 4 trailing nibbles. Returns the
 * original string unchanged if it's already short.
 */
export function shortHash(hash: string): string {
  const hex = hash.startsWith('0x') ? hash.slice(2) : hash;
  if (hex.length <= 10) return hash;
  return `0x${hex.slice(0, 4)}⋯${hex.slice(-4)}`;
}

/**
 * Map a human-readable label like `"freshness_verified"` to a stable
 * hash. Use this when committing categorical strings into the witness.
 */
export function hashLabel(label: string): string {
  return demoHash('label:' + label.trim().toLowerCase());
}
