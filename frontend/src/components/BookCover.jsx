// BookCover: Tạo bìa sách đẹp tự động theo tên + tác giả
// Không dùng API ngoài → không bao giờ sai

const GRADIENTS = [
  ['#f97316', '#ea580c'],   // cam
  ['#3b82f6', '#1d4ed8'],   // xanh dương
  ['#8b5cf6', '#7c3aed'],   // tím
  ['#10b981', '#059669'],   // xanh lá
  ['#ef4444', '#dc2626'],   // đỏ
  ['#f59e0b', '#d97706'],   // vàng
  ['#06b6d4', '#0891b2'],   // cyan
  ['#ec4899', '#db2777'],   // hồng
  ['#6366f1', '#4f46e5'],   // indigo
  ['#14b8a6', '#0d9488'],   // teal
];

const PATTERNS = [
  // Diagonal lines
  `<pattern id="p" patternUnits="userSpaceOnUse" width="20" height="20" patternTransform="rotate(45)">
    <line x1="0" y1="0" x2="0" y2="20" stroke="rgba(255,255,255,0.08)" stroke-width="8"/>
  </pattern>`,
  // Dots
  `<pattern id="p" patternUnits="userSpaceOnUse" width="16" height="16">
    <circle cx="8" cy="8" r="2" fill="rgba(255,255,255,0.1)"/>
  </pattern>`,
  // Grid
  `<pattern id="p" patternUnits="userSpaceOnUse" width="24" height="24">
    <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>
  </pattern>`,
  // Waves
  `<pattern id="p" patternUnits="userSpaceOnUse" width="40" height="20">
    <path d="M0 10 Q10 0 20 10 Q30 20 40 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="2"/>
  </pattern>`,
];

function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function truncate(str, max) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

export default function BookCover({ title = '', author = '', size = 'md' }) {
  const hash = hashStr(title + author);
  const [c1, c2] = GRADIENTS[hash % GRADIENTS.length];
  const patternSvg = PATTERNS[(hash >> 3) % PATTERNS.length];

  const dims = {
    sm:  { w: 40,  h: 56,  titleSize: 7,  authorSize: 6,  spineW: 5  },
    md:  { w: 56,  h: 80,  titleSize: 9,  authorSize: 7,  spineW: 7  },
    lg:  { w: 160, h: 220, titleSize: 14, authorSize: 11, spineW: 16 },
    xl:  { w: 200, h: 280, titleSize: 16, authorSize: 12, spineW: 20 },
  };
  const d = dims[size] || dims.md;

  // Word-wrap title for SVG (max 2 lines for small, 3 for large)
  const words = truncate(title, size === 'lg' || size === 'xl' ? 60 : 30).split(' ');
  const maxChars = size === 'lg' || size === 'xl' ? 16 : size === 'md' ? 9 : 7;
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxChars && cur) { lines.push(cur); cur = w; }
    else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  const maxLines = size === 'lg' || size === 'xl' ? 4 : 2;
  const titleLines = lines.slice(0, maxLines);

  const cx = d.w / 2;
  const titleY = d.h * 0.35 - (titleLines.length - 1) * d.titleSize * 0.7;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${d.w}" height="${d.h}" viewBox="0 0 ${d.w} ${d.h}">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${c1}"/>
        <stop offset="100%" style="stop-color:${c2}"/>
      </linearGradient>
      ${patternSvg}
    </defs>
    <!-- Background -->
    <rect width="${d.w}" height="${d.h}" rx="4" fill="url(#g)"/>
    <rect width="${d.w}" height="${d.h}" rx="4" fill="url(#p)"/>
    <!-- Spine shadow -->
    <rect x="0" y="0" width="${d.spineW}" height="${d.h}" rx="4" fill="rgba(0,0,0,0.15)"/>
    <!-- Top decorative line -->
    <rect x="${d.spineW + 4}" y="${d.h * 0.12}" width="${d.w - d.spineW - 12}" height="1.5" fill="rgba(255,255,255,0.4)" rx="1"/>
    <!-- Bottom decorative line -->
    <rect x="${d.spineW + 4}" y="${d.h * 0.82}" width="${d.w - d.spineW - 12}" height="1" fill="rgba(255,255,255,0.25)" rx="1"/>
    <!-- Title -->
    ${titleLines.map((line, i) => `
    <text x="${cx + d.spineW / 2}" y="${titleY + i * d.titleSize * 1.4}"
      font-family="Georgia, serif" font-size="${d.titleSize}" font-weight="bold"
      fill="white" text-anchor="middle" dominant-baseline="middle"
      filter="drop-shadow(0 1px 2px rgba(0,0,0,0.3))">${line}</text>`).join('')}
    <!-- Author -->
    <text x="${cx + d.spineW / 2}" y="${d.h * 0.82 + 10}"
      font-family="Arial, sans-serif" font-size="${d.authorSize}"
      fill="rgba(255,255,255,0.75)" text-anchor="middle" dominant-baseline="middle">
      ${truncate(author, size === 'sm' ? 10 : 20)}
    </text>
    <!-- Shine -->
    <rect x="${d.spineW}" y="0" width="${d.w * 0.15}" height="${d.h}" fill="rgba(255,255,255,0.06)" rx="0"/>
  </svg>`;

  const dataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;

  const sizeClass = {
    sm: 'w-10 h-14',
    md: 'w-14 h-20',
    lg: 'w-full',
    xl: 'w-full',
  }[size];

  return (
    <img src={dataUrl} alt={title}
      className={`${sizeClass} object-contain rounded-lg shadow-md`}
      style={size === 'lg' ? { aspectRatio: '160/220' } : {}}
    />
  );
}
