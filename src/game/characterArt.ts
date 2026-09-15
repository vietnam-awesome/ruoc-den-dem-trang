const palettes = [
  { outfit: '#d84255', trim: '#ffd98a', pants: '#f5e6ca', shoe: '#713b31', lantern: '#ff4f55', hair: '#24191b' },
  { outfit: '#2d86a8', trim: '#f6d899', pants: '#27405f', shoe: '#e9c99b', lantern: '#ffb13b', hair: '#1c1820' },
  { outfit: '#e99634', trim: '#fff0b5', pants: '#6b3e43', shoe: '#edd19d', lantern: '#ff5d73', hair: '#3a241e' },
  { outfit: '#4c9474', trim: '#ffe1a3', pants: '#243b50', shoe: '#ddb98b', lantern: '#ef6bb2', hair: '#211a22' },
] as const;

function palette(index: number) {
  return palettes[((index % palettes.length) + palettes.length) % palettes.length] ?? palettes[0];
}

function hairMarkup(index: number, hair: string): string {
  switch (((index % 4) + 4) % 4) {
    case 0:
      return `<path d="M55 74c1-35 24-55 55-55 34 0 57 23 57 57-17-9-30-10-43-7-14 4-23 11-32 20-8-8-18-13-37-15Z" fill="${hair}"/><path d="M57 62c-14 9-17 28-8 38 5 5 12 7 18 7V74Z" fill="${hair}"/><path d="M164 61c15 10 18 29 8 39-5 5-11 7-18 7V73Z" fill="${hair}"/>`;
    case 1:
      return `<path d="M52 79c0-39 23-61 59-61 36 0 59 24 59 61-17-15-34-18-53-13-14 4-27 12-38 24-8-5-17-9-27-11Z" fill="${hair}"/><path d="M62 78c-11 22-7 48 3 65 7-8 12-19 13-33Z" fill="${hair}"/>`;
    case 2:
      return `<path d="M53 80c2-40 26-61 59-61 32 0 55 19 58 56-13-9-25-14-38-14-23 0-43 10-59 29-6-4-13-7-20-10Z" fill="${hair}"/><circle cx="51" cy="75" r="18" fill="${hair}"/><circle cx="171" cy="75" r="18" fill="${hair}"/>`;
    default:
      return `<path d="M55 80c0-38 21-60 56-60 37 0 58 25 58 61-14-8-27-12-41-12-22 0-39 7-56 23-4-5-10-8-17-12Z" fill="${hair}"/><path d="M148 49c8 4 16 11 21 20-12-5-21-6-31-3Z" fill="#ffffff" opacity=".1"/>`;
  }
}

function faceMarkup(index: number): string {
  const wink = index % 4 === 2;
  return `<ellipse cx="83" cy="101" rx="4.4" ry="5.6" fill="#2d2326"/>${wink ? '<path d="M133 100q8 8 16 0" fill="none" stroke="#2d2326" stroke-width="4" stroke-linecap="round"/>' : '<ellipse cx="139" cy="101" rx="4.4" ry="5.6" fill="#2d2326"/>'}<ellipse cx="72" cy="116" rx="10" ry="5" fill="#ef8c87" opacity=".28"/><ellipse cx="150" cy="116" rx="10" ry="5" fill="#ef8c87" opacity=".28"/><path d="M100 116q11 10 22 0" fill="none" stroke="#a65356" stroke-width="3.2" stroke-linecap="round"/>`;
}

export function characterSvg(index: number): string {
  const p = palette(index);
  const variant = ((index % 4) + 4) % 4;
  const sash = variant % 2 === 0 ? p.trim : '#f3bd65';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 310">
  <ellipse cx="110" cy="296" rx="54" ry="10" fill="#06101f" opacity=".24"/>
  <path d="M75 213c-6 25-7 52-3 76h31l7-66Z" fill="${p.pants}" stroke="#392f36" stroke-width="4" stroke-linejoin="round"/>
  <path d="M145 213c6 25 7 52 3 76h-31l-7-66Z" fill="${p.pants}" stroke="#392f36" stroke-width="4" stroke-linejoin="round"/>
  <path d="M66 286q18-8 39 1l-4 12H65Z" fill="${p.shoe}" stroke="#493329" stroke-width="3"/>
  <path d="M154 286q-18-8-39 1l4 12h36Z" fill="${p.shoe}" stroke="#493329" stroke-width="3"/>
  <path d="M72 144Q110 125 148 144l19 87q-24 21-57 22-34-1-57-22Z" fill="${p.outfit}" stroke="#6e2e3b" stroke-width="5" stroke-linejoin="round"/>
  <path d="M89 140q21 20 42 0l-10 25H99Z" fill="${p.trim}" opacity=".96"/>
  <path d="M110 161v77" stroke="${p.trim}" stroke-width="3.5" opacity=".85"/>
  <path d="M55 165q-17 29-13 63" fill="none" stroke="#f0b58c" stroke-width="15" stroke-linecap="round"/>
  <circle cx="43" cy="230" r="9" fill="#f0b58c"/>
  <path d="M162 164q16 22 22 47" fill="none" stroke="#f0b58c" stroke-width="15" stroke-linecap="round"/>
  <circle cx="186" cy="215" r="9" fill="#f0b58c"/>
  <path d="M70 183q40 22 80 0" fill="none" stroke="${sash}" stroke-width="5" opacity=".7"/>
  <circle cx="110" cy="103" r="52" fill="#f2bd95" stroke="#7a4b3c" stroke-width="4"/>
  ${hairMarkup(index, p.hair)}
  <path d="M86 88q8-7 17 0M126 88q8-7 17 0" fill="none" stroke="#7b493d" stroke-width="2.6" stroke-linecap="round" opacity=".65"/>
  ${faceMarkup(index)}
  <path d="M158 168l31-86" stroke="#bf8548" stroke-width="6" stroke-linecap="round"/>
  <path d="M164 173q12 13 23 0" fill="none" stroke="#f0b58c" stroke-width="8" stroke-linecap="round"/>
  <path d="M82 153q28 18 57 0" fill="none" stroke="#fff4db" stroke-width="3" opacity=".22"/>
  <path d="M66 196q21 11 44 10" fill="none" stroke="#fff" stroke-width="3" opacity=".1"/>
</svg>`;
}

export function lanternSvg(index: number): string {
  const p = palette(index);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 170">
  <defs><radialGradient id="g"><stop offset="0" stop-color="#fff4b4"/><stop offset=".34" stop-color="${p.lantern}"/><stop offset="1" stop-color="${p.lantern}" stop-opacity=".35"/></radialGradient></defs>
  <circle cx="75" cy="72" r="67" fill="${p.lantern}" opacity=".10"/>
  <polygon points="75,12 92,50 134,54 102,81 111,123 75,101 39,123 48,81 16,54 58,50" fill="url(#g)" stroke="#ffd47d" stroke-width="7" stroke-linejoin="round"/>
  <polygon points="75,27 86,57 118,59 94,79 101,108 75,92 49,108 56,79 32,59 64,57" fill="none" stroke="#fff0b5" stroke-width="2.5" opacity=".72"/>
  <circle cx="75" cy="73" r="11" fill="#fff4c4" opacity=".94"/>
  <path d="M75 125v24M66 148l9 15 9-15" fill="none" stroke="#e7b054" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
}
