// Single source of truth for the running build: version.json (root).
// Vite injects the values at build time; the fallbacks keep this module usable
// in plain Node (unit tests, scripts). `scripts/check_version.mjs` fails CI if
// these fallbacks ever drift away from version.json.
const FALLBACK_VERSION = '1.1.0';
const FALLBACK_VERSION_CODE = 2;
const FALLBACK_REPO = 'TR4842/Birochon-Somahar';
const FALLBACK_MIN_SUPPORTED = '1.0.0';

export const APP_VERSION =
  typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : FALLBACK_VERSION;
export const APP_VERSION_CODE =
  typeof __APP_VERSION_CODE__ === 'number' ? __APP_VERSION_CODE__ : FALLBACK_VERSION_CODE;
export const GITHUB_REPO =
  typeof __GITHUB_REPO__ === 'string' ? __GITHUB_REPO__ : FALLBACK_REPO;
export const MIN_SUPPORTED_VERSION =
  typeof __MIN_SUPPORTED_VERSION__ === 'string'
    ? __MIN_SUPPORTED_VERSION__
    : FALLBACK_MIN_SUPPORTED;

export const RELEASES_PAGE_URL = `https://github.com/${GITHUB_REPO}/releases`;
export const RELEASES_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases?per_page=30`;

/** Bengali digits helper shared by update + reading UI. */
export const formatBnNumber = (value) => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(value).replace(/\d/g, (d) => bnDigits[d]);
};

/** Extract "1.1.0" from tags like "v1.1.0", "1.1", "Birochon-1.1.0". */
export const versionFromTag = (tag) => {
  const match = String(tag || '').match(/(\d+(?:\.\d+){1,3})(?:[-+][0-9A-Za-z.-]+)?/);
  return match ? match[1] : '';
};

/**
 * Numeric semver-ish comparison. Returns -1 / 0 / 1.
 * Ignores prerelease suffixes, tolerates "v" prefixes and missing patch parts.
 */
export const compareVersions = (a, b) => {
  const parts = (value) =>
    String(value || '')
      .trim()
      .replace(/^v/i, '')
      .split(/[-+]/)[0] // ignore prerelease / build suffixes
      .split('.')
      .map((p) => parseInt(p, 10))
      .filter((n) => Number.isFinite(n));
  const left = parts(a);
  const right = parts(b);
  const len = Math.max(left.length, right.length, 3);
  for (let i = 0; i < len; i++) {
    const l = left[i] || 0;
    const r = right[i] || 0;
    if (l > r) return 1;
    if (l < r) return -1;
  }
  return 0;
};

export const isVersionLikeTag = (tag) => /^v?\d+(\.\d+){1,3}/i.test(String(tag || '').trim());
