#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-only
# Copyright (C) 2026 Pierre Springer
"""Package the readable extension sources using an explicit file allowlist."""
import hashlib
import json
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

root = Path(__file__).resolve().parent.parent
manifest = json.loads((root / "manifest.json").read_text())
package = json.loads((root / "package.json").read_text())
version = manifest["version"]
if version != package["version"]:
    raise SystemExit("manifest.json and package.json versions differ")
files = [
    "LICENSE", "PRIVACY.md", "README.txt", "manifest.json",
    "providers.js", "core.js", "ui-style.js", "content.js", "content.css",
    "popup.html", "popup.js", "popup.css",
    "icons/icon16.png", "icons/icon32.png", "icons/icon48.png", "icons/icon128.png",
]
referenced = set(manifest["icons"].values())
referenced.update(manifest["action"]["default_icon"].values())
referenced.add(manifest["action"]["default_popup"])
for script in manifest["content_scripts"]:
    referenced.update(script.get("js", []))
    referenced.update(script.get("css", []))
if not referenced.issubset(files):
    raise SystemExit(f"Unpackaged manifest files: {referenced - set(files)}")

dist = root / "dist"
dist.mkdir(exist_ok=True)
for suffix, prefix in [("", "ai-chat-auswahl/"), ("-webstore", "")]:
    destination = dist / f"ai-chat-auswahl-{version}{suffix}.zip"
    with ZipFile(destination, "w", compression=ZIP_DEFLATED) as archive:
        for name in sorted(files):
            info = ZipInfo(f"{prefix}{name}", date_time=(2026, 1, 1, 0, 0, 0))
            info.create_system = 3
            info.external_attr = 0o100644 << 16
            info.compress_type = ZIP_DEFLATED
            archive.writestr(info, (root / name).read_bytes())
    with ZipFile(destination) as archive:
        assert archive.testzip() is None
        assert set(archive.namelist()) == {f"{prefix}{name}" for name in files}
        for name in files:
            assert archive.read(f"{prefix}{name}") == (root / name).read_bytes()
    digest = hashlib.sha256(destination.read_bytes()).hexdigest()
    destination.with_suffix(".zip.sha256").write_text(f"{digest}  {destination.name}\n")
    print(f"Created and verified {destination} ({len(files)} files)")
    print(f"SHA-256: {digest}")
