#!/usr/bin/env python3
"""Scan the repository for HTML files and generate pages.json for the index page."""

import json
import os
import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
EXCLUDE_FILES = {"index.html"}
EXCLUDE_DIRS = {".git", ".github", "node_modules", "scripts", "projects"}


def extract_title(html_path: Path) -> str:
    """Extract <title> content from an HTML file."""
    try:
        text = html_path.read_text(encoding="utf-8", errors="ignore")
        match = re.search(r"<title>(.*?)</title>", text, re.IGNORECASE | re.DOTALL)
        if match:
            return match.group(1).strip()
    except Exception:
        pass
    return html_path.stem


def scan_html_files() -> list[dict]:
    """Find all HTML files and build page entries."""
    pages = []

    for root, dirs, files in os.walk(REPO_ROOT):
        # Skip excluded directories
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

        for filename in sorted(files):
            if not filename.endswith(".html"):
                continue

            filepath = Path(root) / filename
            rel_path = filepath.relative_to(REPO_ROOT).as_posix()

            if filename in EXCLUDE_FILES and root == str(REPO_ROOT):
                continue

            title = extract_title(filepath)
            page_id = rel_path.replace("/", "-").replace(".html", "")

            pages.append({
                "id": page_id,
                "title": title,
                "path": rel_path,
                "description": title,
            })

    return pages


def main():
    pages = scan_html_files()
    output_path = REPO_ROOT / "pages.json"
    output_path.write_text(json.dumps(pages, indent=2, ensure_ascii=False) + "\n")
    print(f"Generated pages.json with {len(pages)} entries")
    for p in pages:
        print(f"  - {p['title']} ({p['path']})")


if __name__ == "__main__":
    main()
