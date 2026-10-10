#!/usr/bin/env python3
"""Build compact WebP gallery previews; keep originals for full-resolution lightbox."""
from pathlib import Path
from urllib.parse import unquote
from PIL import Image, ImageOps
import re

ROOT = Path(__file__).resolve().parents[1]
PAGES = [ROOT / 'index.html', ROOT / 'animals/index.html', ROOT / 'other/index.html']
IMG = re.compile(r'(<img\s+src=")([^"]+)(")')
FULL = re.compile(r'data-full="([^"]+)"')
used_originals = set()

def path_for_url(url):
    if not url.startswith(('/', 'images/')):
        return None
    relative = unquote(url.lstrip('/'))
    return ROOT / relative

for page in PAGES:
    html = page.read_text(encoding='utf-8')
    # Capture full-resolution sources before replacing gallery image URLs.
    for url in FULL.findall(html):
        path = path_for_url(url)
        if path is not None:
            used_originals.add(path.resolve())
    def replace(match):
        url = match.group(2)
        path = path_for_url(url)
        if path is None or not path.is_file() or '/optimized/' in url:
            return match.group(0)
        out = ROOT / 'images/optimized' / path.relative_to(ROOT / 'images')
        out = out.with_suffix('.webp')
        out.parent.mkdir(parents=True, exist_ok=True)
        with Image.open(path) as source:
            source = ImageOps.exif_transpose(source).convert('RGB')
            source.thumbnail((1200, 1200), Image.Resampling.LANCZOS)
            source.save(out, 'WEBP', quality=82, method=6)
        return match.group(1) + '/' + out.relative_to(ROOT).as_posix() + match.group(3)
    updated = IMG.sub(replace, html)
    page.write_text(updated, encoding='utf-8')

# Delete original image files not used in any lightbox; never delete gallery previews.
for path in (ROOT / 'images').rglob('*'):
    if not path.is_file() or 'optimized' in path.relative_to(ROOT / 'images').parts:
        continue
    if path.resolve() not in used_originals:
        print('Removing unused original:', path.relative_to(ROOT))
        path.unlink()

print('Gallery previews generated; original lightbox files preserved.')
