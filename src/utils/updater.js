// ============================================================================
// Optional GitHub Release update check
// ----------------------------------------------------------------------------
// The app stays 100% offline by default. NO request is made unless the user
// taps "আপডেট চেক করুন" or enables the opt-in daily check. Everything is read
// from the public GitHub Releases API; there is no tracking and no server.
// ============================================================================

import {
  APP_VERSION,
  RELEASES_API_URL,
  RELEASES_PAGE_URL,
  compareVersions,
  versionFromTag
} from './appVersion.js';

export const UPDATE_CHECK_INTERVAL_MS = 12 * 60 * 60 * 1000; // 12 hours

export const shouldAutoCheck = (settings = {}) => {
  if (!settings.autoCheckUpdates) return false;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return false;
  const last = Number(settings.lastUpdateCheckAt) || 0;
  return Date.now() - last > UPDATE_CHECK_INTERVAL_MS;
};

const pickRelease = (releases, includePrereleases) => {
  const candidates = (Array.isArray(releases) ? releases : [])
    .filter((r) => r && !r.draft && (includePrereleases || !r.prerelease))
    .map((r) => {
      const apk = (r.assets || []).find((a) => /\.apk$/i.test(a.name || ''));
      const version = versionFromTag(r.tag_name) ||
        (apk ? versionFromTag(apk.name) : '') ||
        versionFromTag(r.name);
      return { release: r, apk, version };
    })
    .filter((c) => c.version && compareVersions(c.version, '0.0.1') >= 0)
    .sort((a, b) => {
      const byVersion = compareVersions(b.version, a.version);
      if (byVersion !== 0) return byVersion;
      return new Date(b.release.published_at || 0) - new Date(a.release.published_at || 0);
    });
  return candidates[0] || null;
};

/** @returns {Promise<object>} update info. Throws on offline / API failure. */
export const checkForUpdate = async ({ timeoutMs = 9000, includePrereleases = false } = {}) => {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    const error = new Error('OFFLINE');
    error.code = 'OFFLINE';
    throw error;
  }

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
  try {
    const response = await fetch(RELEASES_API_URL, {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      cache: 'no-store',
      ...(controller ? { signal: controller.signal } : {})
    });
    if (!response.ok) {
      const error = new Error(`HTTP_${response.status}`);
      error.code = response.status === 403 ? 'RATE_LIMIT' : 'HTTP';
      throw error;
    }
    const releases = await response.json();
    const picked = pickRelease(releases, includePrereleases);
    const checkedAt = Date.now();

    if (!picked) {
      return {
        ok: true,
        checkedAt,
        currentVersion: APP_VERSION,
        latestVersion: APP_VERSION,
        updateAvailable: false,
        noVersionedRelease: true,
        notes: '',
        downloadUrl: RELEASES_PAGE_URL,
        releaseUrl: RELEASES_PAGE_URL,
        apkName: null,
        apkSize: null,
        publishedAt: null,
        tag: null
      };
    }

    const { release, apk, version } = picked;
    return {
      ok: true,
      checkedAt,
      currentVersion: APP_VERSION,
      latestVersion: version,
      updateAvailable: compareVersions(version, APP_VERSION) > 0,
      noVersionedRelease: false,
      notes: String(release.body || '').trim(),
      downloadUrl: apk?.browser_download_url || release.html_url || RELEASES_PAGE_URL,
      releaseUrl: release.html_url || RELEASES_PAGE_URL,
      apkName: apk?.name || null,
      apkSize: apk?.size || null,
      publishedAt: release.published_at || release.created_at || null,
      tag: release.tag_name || null,
      prerelease: !!release.prerelease
    };
  } finally {
    if (timer) clearTimeout(timer);
  }
};

/** Human readable offline / API error messages (Bangla UI). */
export const describeUpdateError = (error) => {
  const code = error?.code || error?.name;
  if (code === 'OFFLINE') return 'ইন্টারনেট সংযোগ নেই। অ্যাপটি অফলাইনে ঠিকঠাক চলবে — সংযোগ ফিরলে আবার চেক করুন।';
  if (code === 'RATE_LIMIT') return 'GitHub সাময়িকভাবে অনুরোধ সীমিত করেছে। কিছুক্ষণ পর আবার চেষ্টা করুন বা Releases পেজ খুলুন।';
  if (code === 'AbortError' || code === 'TimeoutError') return 'সার্ভার থেকে উত্তর আসেনি। একটু পর আবার চেষ্টা করুন।';
  return 'আপডেটের তথ্য আনা যায়নি। নিচের বাটন থেকে সরাসরি GitHub Releases পেজ খুলতে পারেন।';
};

export { RELEASES_PAGE_URL };
