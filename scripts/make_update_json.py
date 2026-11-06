#!/usr/bin/env python3
"""Generate `update.json` + release notes for a GitHub Release.

The file is uploaded as a release asset alongside the APK. It is a stable,
machine-readable manifest for the in-app updater (and for future clients),
while the in-app check itself reads the public GitHub Releases API.

    python3 scripts/make_update_json.py --tag v1.1.0 \
        --apk-name Birochon-Somahar-v1.1.0.apk \
        --apk-url https://github.com/OWNER/REPO/releases/download/v1.1.0/Birochon-Somahar-v1.1.0.apk \
        --out update.json --notes-out release_notes.md
"""
import argparse
import json
import os
import re
from datetime import datetime, timezone

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


def notes_for(version: str) -> str:
    path = os.path.join(BASE_DIR, "RELEASE_NOTES.md")
    if not os.path.exists(path):
        return f"বিরচন সমাহার v{version}"
    with open(path, encoding="utf-8") as f:
        text = f.read()
    pattern = re.compile(
        r"^##\s*v?" + re.escape(version) + r"\b.*?$([\s\S]*?)(?=^##\s|\Z)",
        re.MULTILINE,
    )
    match = pattern.search(text)
    if not match:
        return f"বিরচন সমাহার v{version}"
    return match.group(1).strip() or f"বিরচন সমাহার v{version}"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--tag", required=True, help="e.g. v1.1.0")
    parser.add_argument("--apk-name", required=True)
    parser.add_argument("--apk-url", required=True)
    parser.add_argument("--out", default="update.json")
    parser.add_argument("--notes-out", default="release_notes.md")
    args = parser.parse_args()

    with open(os.path.join(BASE_DIR, "version.json"), encoding="utf-8") as f:
        info = json.load(f)

    version = info["version"]
    notes = notes_for(version)
    manifest = {
        "version": version,
        "versionCode": info["versionCode"],
        "tag": args.tag,
        "package": info["package"],
        "minSupportedVersion": info["minSupportedVersion"],
        "apk": args.apk_name,
        "url": args.apk_url,
        "releaseUrl": f"https://github.com/{info['repo']}/releases/tag/{args.tag}",
        "notes": notes,
        "publishedAt": datetime.now(timezone.utc).isoformat(),
    }

    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
        f.write("\n")
    with open(args.notes_out, "w", encoding="utf-8") as f:
        f.write(notes + "\n")

    print(f"Wrote {args.out} and {args.notes_out} for {args.tag}")


if __name__ == "__main__":
    main()
