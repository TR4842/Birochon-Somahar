#!/usr/bin/env bash
# Print (and optionally compare) the signing certificate SHA-256 of APK(s).
# Identical fingerprints => the newer APK can be installed over the older one.
#
#   ./scripts/verify_apk_signature.sh old.apk new.apk
#   EXPECTED_SIGNATURE_SHA256=ab:cd:... ./scripts/verify_apk_signature.sh new.apk
#
# Requires Android SDK build-tools (apksigner) — available in GitHub Actions.
set -euo pipefail

if [ "$#" -lt 1 ] || [ "$#" -gt 2 ]; then
  echo "Usage: $0 <apk> [second-apk]" >&2
  exit 2
fi

if command -v apksigner >/dev/null 2>&1; then
  APKSIGNER=apksigner
else
  APKSIGNER=$(find "${ANDROID_HOME:-$HOME/Android/Sdk}"/build-tools -name apksigner -type f 2>/dev/null | sort -V | tail -1 || true)
fi
if [ -z "${APKSIGNER}" ]; then
  echo "apksigner not found (install Android SDK build-tools or set ANDROID_HOME)" >&2
  exit 2
fi

fingerprint() {
  "$APKSIGNER" verify --print-certs "$1" \
    | awk '/SHA-256 digest/ {print $NF; exit}' \
    | tr '[:upper:]' '[:lower:]'
}

FIRST=$(fingerprint "$1")
echo "APK 1: $1"
echo "SHA-256: $FIRST"

if [ "$#" -eq 2 ]; then
  SECOND=$(fingerprint "$2")
  echo "APK 2: $2"
  echo "SHA-256: $SECOND"
  if [ "$FIRST" != "$SECOND" ]; then
    echo "❌ SIGNATURE MISMATCH — দুটি APK একই key দিয়ে স্বাক্ষরিত নয়; সরাসরি আপডেট সম্ভব নয়।" >&2
    exit 1
  fi
  echo "✅ Signatures match — নতুন APK পুরনোটির ওপরে ইনস্টল করা যাবে।"
elif [ -n "${EXPECTED_SIGNATURE_SHA256:-}" ]; then
  EXPECTED=$(echo "$EXPECTED_SIGNATURE_SHA256" | tr '[:upper:]' '[:lower:]')
  if [ "$FIRST" != "$EXPECTED" ]; then
    echo "❌ Signature does not match EXPECTED_SIGNATURE_SHA256" >&2
    exit 1
  fi
  echo "✅ Signature matches the expected stable certificate."
else
  echo "ℹ️  Save this fingerprint as EXPECTED_SIGNATURE_SHA256 in GitHub secrets to enforce it in CI."
fi
