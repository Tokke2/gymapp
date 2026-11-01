#!/usr/bin/env python3
"""Bygger tryckklara SVG-filer för Gymlig: visitkort (fram/bak) och A5-flyer."""
import re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'tryck'
OUT.mkdir(exist_ok=True)

SANS = "Helvetica Neue, Helvetica, Arial, sans-serif"
MONO = "SFMono-Regular, Menlo, Consolas, monospace"


def qr_svg(x, y, size):
    src = (OUT / 'qr-kod.svg').read_text(encoding='utf-8')
    inner = re.sub(r'^.*?<svg[^>]*>', '', src, flags=re.S)
    inner = re.sub(r'</svg>\s*$', '', inner, flags=re.S)
    return (f'<svg x="{x}" y="{y}" width="{size}" height="{size}" '
            f'viewBox="0 0 33 33">{inner}</svg>')


DEFS = f'''<defs>
    <linearGradient id="mark" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#a78bfa"/><stop offset="1" stop-color="#22d3ee"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#22d3ee"/><stop offset="1" stop-color="#a78bfa"/>
    </linearGradient>
    <linearGradient id="stripe" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#22d3ee"/><stop offset="1" stop-color="#7c3aed"/>
    </linearGradient>
    <linearGradient id="headline" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#c4b5fd"/><stop offset="0.55" stop-color="#67e8f9"/>
      <stop offset="1" stop-color="#a78bfa"/>
    </linearGradient>
    <radialGradient id="glowA" cx="0.2" cy="0.92" r="0.9">
      <stop offset="0" stop-color="#7c3aed" stop-opacity="0.55"/>
      <stop offset="0.5" stop-color="#4c1d95" stop-opacity="0.2"/>
      <stop offset="1" stop-color="#080814" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowB" cx="0.32" cy="1" r="0.6">
      <stop offset="0" stop-color="#22d3ee" stop-opacity="0.22"/>
      <stop offset="1" stop-color="#22d3ee" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowC" cx="0.85" cy="0.95" r="0.6">
      <stop offset="0" stop-color="#22d3ee" stop-opacity="0.22"/>
      <stop offset="1" stop-color="#22d3ee" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="edgeFade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#7c3aed" stop-opacity="0"/>
      <stop offset="0.65" stop-color="#7c3aed" stop-opacity="0.18"/>
      <stop offset="1" stop-color="#a78bfa" stop-opacity="0.42"/>
    </linearGradient>
  </defs>'''


def mark(x, y, size, letter):
    r = size * 0.27
    return (f'<rect x="{x}" y="{y}" width="{size}" height="{size}" rx="{r:.2f}" fill="url(#mark)"/>'
            f'<text x="{x + size / 2:.2f}" y="{y + size * 0.705:.2f}" font-family="{SANS}" '
            f'font-size="{size * 0.58:.2f}" font-weight="700" text-anchor="middle" fill="#ffffff">{letter}</text>')


# ── FRAMSIDA ────────────────────────────────────────────────────
front = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="91mm" height="61mm" viewBox="0 0 91 61"
     role="img" aria-label="Gymlig visitkort, framsida">
  <title>Gymlig – visitkort framsida (85 × 55 mm + 3 mm bleed)</title>
  {DEFS}
  <rect width="91" height="61" fill="#080814"/>
  <rect width="91" height="61" fill="url(#glowA)"/>
  <rect width="91" height="61" fill="url(#glowB)"/>
  <g fill="none" stroke="#a78bfa" stroke-opacity="0.16" stroke-width="0.1">
    <path d="M-6 58 L26 22 L30 64"/>
    <path d="M2 64 L33 28"/>
    <path d="M-8 40 L20 12"/>
    <path d="M12 66 L40 34"/>
    <circle cx="20" cy="46" r="13"/>
    <circle cx="20" cy="46" r="19"/>
    <circle cx="20" cy="46" r="26"/>
  </g>
  <g fill="none" stroke="#67e8f9" stroke-opacity="0.1" stroke-width="0.08">
    <path d="M-4 30 L18 8"/>
    <path d="M0 50 L30 20"/>
  </g>
  {mark(56, 13.6, 9.6, 'G')}
  <text x="55.7" y="33.3" font-family="{SANS}" font-size="7.6" font-weight="700"
        letter-spacing="-0.16" fill="#f8fafc">Gymlig</text>
  <text x="56" y="38.4" font-family="{SANS}" font-size="2.3" fill="#a8b3c4">Ditt pass. Ditt tempo.</text>
  <rect x="56" y="41.2" width="15.5" height="0.42" rx="0.21" fill="url(#accent)"/>
  <text x="56" y="45.7" font-family="{SANS}" font-size="1.32" font-weight="700"
        letter-spacing="0.34" fill="#8b96a8">TRÄNING · SCHEMA · BALANS</text>
</svg>
'''
(OUT / 'visitkort-framsida.svg').write_text(front, encoding='utf-8')

# ── BAKSIDA ─────────────────────────────────────────────────────
back = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="91mm" height="61mm" viewBox="0 0 91 61"
     role="img" aria-label="Gymlig visitkort, baksida">
  <title>Gymlig – visitkort baksida (85 × 55 mm + 3 mm bleed)</title>
  {DEFS}
  <rect width="91" height="61" fill="#080814"/>
  <rect width="91" height="61" fill="url(#glowC)"/>
  <g fill="none" stroke="#a78bfa" stroke-opacity="0.1" stroke-width="0.09">
    <path d="M46 0 L60 14 L74 0"/>
    <path d="M50 61 L66 45 L82 61"/>
    <path d="M70 8 L86 24 L70 40"/>
    <path d="M64 20 L78 34"/>
  </g>
  <rect x="86.2" y="0" width="1.1" height="61" fill="url(#stripe)"/>
  {mark(7, 6.2, 4.8, 'G')}
  <text x="13.2" y="10.4" font-family="{SANS}" font-size="2.7" font-weight="700" fill="#f8fafc">Gymlig</text>
  <text x="7" y="29.2" font-family="{SANS}" font-size="4.75" font-weight="700"
        letter-spacing="-0.05" fill="#f8fafc">Rickard Längkvist</text>
  <text x="7" y="34.2" font-family="{SANS}" font-size="2.15" fill="#a8b3c4">Träning, schema och balans i fickan.</text>
  <rect x="7" y="37.2" width="15.5" height="0.4" rx="0.2" fill="url(#accent)"/>
  <text x="7" y="42.3" font-family="{MONO}" font-size="2.25" fill="#67e8f9">tokke2.github.io/gymapp</text>
  <text x="7" y="46.6" font-family="{SANS}" font-size="1.2" font-weight="700"
        letter-spacing="0.22" fill="#8b96a8">OFFLINE · INGET KONTO · ALLT SPARAS LOKALT</text>
  <text x="7" y="56.7" font-family="{SANS}" font-size="1.15" fill="#64748b">© 2026 Rickard Längkvist</text>
  {qr_svg(70.5, 32.4, 11.6)}
  <text x="70.5" y="47.4" font-family="{SANS}" font-size="1.2" fill="#8b96a8">Skanna till appen</text>
</svg>
'''
(OUT / 'visitkort-baksida.svg').write_text(back, encoding='utf-8')

# ── FLYER A5 ────────────────────────────────────────────────────
W, H = 154, 216  # 148 × 210 mm + 3 mm bleed

features = [
    ('Bara dagens pass', 'Öppna appen – passet ligger redan framme.', 84),
    ('Redskap hemma', 'Saknar du något? Du får ett förslag direkt.', 98),
    ('Balans &amp; framsteg', 'Streak, vikter och balansrutin på ett ställe.', 112),
]
feature_svg = ''
for title, desc, y in features:
    feature_svg += f'''
  <circle cx="14.4" cy="{y - 1.1}" r="1.45" fill="url(#accent)"/>
  <text x="19.5" y="{y}" font-family="{SANS}" font-size="3.5" font-weight="700" fill="#f8fafc">{title}</text>
  <text x="19.5" y="{y + 4.6}" font-family="{SANS}" font-size="2.45" fill="#a8b3c4">{desc}</text>'''

phone_rows = ''
for i, y in enumerate((114, 127, 140, 153)):
    phone_rows += f'''
    <rect x="108" y="{y}" width="30" height="12" rx="2" fill="#141428"/>
    <rect x="110" y="{y + 2}" width="8" height="8" rx="1.2" fill="#1d1d36"/>
    <rect x="120" y="{y + 3}" width="14" height="1.6" rx="0.8" fill="#a8b3c4" opacity="0.75"/>
    <rect x="120" y="{y + 6.4}" width="9" height="1.2" rx="0.6" fill="#67e8f9" opacity="0.65"/>'''

flyer = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="{W}mm" height="{H}mm" viewBox="0 0 {W} {H}"
     role="img" aria-label="Gymlig flyer A5">
  <title>Gymlig – flyer A5 (148 × 210 mm + 3 mm bleed)</title>
  {DEFS}
  <rect width="{W}" height="{H}" fill="#080814"/>
  <rect width="{W}" height="{H}" fill="url(#glowA)"/>
  <rect width="{W}" height="{H}" fill="url(#glowB)"/>
  <rect width="{W}" height="{H}" fill="url(#glowC)"/>
  <g fill="none" stroke="#a78bfa" stroke-opacity="0.13" stroke-width="0.12">
    <path d="M-10 150 L50 90 L60 216"/>
    <path d="M6 216 L70 152"/>
    <path d="M-14 96 L44 38"/>
    <circle cx="26" cy="150" r="42"/>
    <circle cx="26" cy="150" r="58"/>
    <circle cx="26" cy="150" r="74"/>
  </g>
  <g fill="none" stroke="#67e8f9" stroke-opacity="0.09" stroke-width="0.1">
    <path d="M-6 190 L60 124"/>
    <path d="M96 0 L154 58"/>
  </g>
  {mark(12, 12, 7.5, 'G')}
  <text x="21.6" y="18.4" font-family="{SANS}" font-size="4.1" font-weight="700" fill="#f8fafc">Gymlig</text>

  <text x="12" y="52" font-family="{SANS}" font-size="11.4" font-weight="700"
        letter-spacing="-0.3" fill="#f8fafc">Ditt pass.</text>
  <text x="12" y="64.4" font-family="{SANS}" font-size="11.4" font-weight="700"
        letter-spacing="-0.3" fill="url(#headline)">Ditt tempo.</text>
  <text x="12" y="73.5" font-family="{SANS}" font-size="3.15" fill="#a8b3c4">Träning, schema och balans – offline i fickan.</text>
  <rect x="12" y="78.4" width="24" height="0.6" rx="0.3" fill="url(#accent)"/>
  {feature_svg}

  <g>
    <rect x="103" y="76" width="40" height="100" rx="6.5" fill="#0b0b18" stroke="#2c2c4a" stroke-width="0.35"/>
    <rect x="117" y="79.4" width="12" height="1.6" rx="0.8" fill="#2c2c4a"/>
    <rect x="106" y="84.5" width="34" height="18" rx="3" fill="url(#mark)" opacity="0.2"/>
    <rect x="109" y="88" width="16" height="2" rx="1" fill="#f8fafc" opacity="0.85"/>
    <rect x="109" y="92.4" width="11" height="1.4" rx="0.7" fill="#a8b3c4" opacity="0.6"/>
    <rect x="109" y="96.6" width="20" height="1.4" rx="0.7" fill="#67e8f9" opacity="0.5"/>
    {phone_rows}
  </g>

  <rect x="12" y="128" width="86" height="17" rx="3" fill="#ffffff" fill-opacity="0.045"
        stroke="#22d3ee" stroke-opacity="0.22" stroke-width="0.25"/>
  <text x="16" y="136.2" font-family="{SANS}" font-size="3.1" font-weight="700" fill="#f8fafc">Inget konto. Ingen prenumeration.</text>
  <text x="16" y="141.6" font-family="{SANS}" font-size="2.4" fill="#a8b3c4">Allt sparas lokalt i telefonen.</text>

  <rect x="12" y="156" width="27" height="27" rx="2" fill="#ffffff"/>
  {qr_svg(13, 157, 25)}
  <text x="44" y="163.5" font-family="{SANS}" font-size="3.1" font-weight="700" fill="#f8fafc">Skanna till appen</text>
  <text x="44" y="169.2" font-family="{MONO}" font-size="2.5" fill="#67e8f9">tokke2.github.io/gymapp</text>
  <text x="44" y="174.8" font-family="{SANS}" font-size="2.3" fill="#a8b3c4">Fungerar offline. Lägg till på hemskärmen.</text>
  <text x="44" y="180.2" font-family="{SANS}" font-size="2.3" fill="#a8b3c4">Inget konto krävs.</text>

  <rect x="12" y="197" width="130" height="0.35" fill="#2a2a44"/>
  <text x="12" y="203.6" font-family="{SANS}" font-size="2.1" fill="#64748b">© 2026 Rickard Längkvist · Gymlig</text>
  <text x="142" y="203.6" text-anchor="end" font-family="{SANS}" font-size="2.1" fill="#64748b">Träning &amp; balans</text>
</svg>
'''
(OUT / 'flyer-a5.svg').write_text(flyer, encoding='utf-8')

print('skrev:', ', '.join(p.name for p in sorted(OUT.glob('*.svg'))))
