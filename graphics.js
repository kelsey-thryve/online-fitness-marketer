/* ============================================================
   TRAINER LAUNCH — Ad-graphic templates (canvas-rendered)
   Four templates modelled on the reference screenshots:
     announcement → "Deal Split" (split colour panel + photo, big stacked deal)
     hero         → "Photo Overlay" (full-bleed photo + centred title + pill)
     offer        → "Offer Split" (photo + brand panel with feature pills + CTA)
     testimonial  → "Polaroid Trust" (collage on dark with abstract shapes)
   ============================================================ */

export const TEMPLATES = [
  { id: 'announcement', title: 'Deal split',       w: 1080, h: 1080 },
  { id: 'hero',         title: 'Photo overlay',    w: 1080, h: 1350 },
  { id: 'offer',        title: 'Offer split',      w: 1080, h: 1350 },
  { id: 'testimonial',  title: 'Polaroid trust',   w: 1080, h: 1350 }
];

const renderers = { announcement, hero, offer, testimonial };

/* ---- Stock fitness photo fallbacks (Unsplash CDN) ----------
   Used when the creator hasn't uploaded their own photo yet, so previews
   and demo launches still look polished. The same launch always gets the
   same fallback photo (deterministic seed by challenge name) so re-renders
   don't surprise the user. Replace these URLs with your own curated set
   any time — graphics will keep working if any URL fails (loadImage
   returns null on error and the template falls back to a brand-colour
   block).
*/
const UNSPLASH = (id, w = 1080) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80&crop=entropy`;

const FALLBACK_HERO_PHOTOS = [
  UNSPLASH('photo-1534438327276-14e5300c3a48'),
  UNSPLASH('photo-1518611012118-696072aa579a'),
  UNSPLASH('photo-1571019613454-1cb2f99b2d8b'),
  UNSPLASH('photo-1517836357463-d25dfeac3438'),
  UNSPLASH('photo-1583500178690-f7fd39d108a3'),
  UNSPLASH('photo-1540497077202-7c8a3999166f'),
  UNSPLASH('photo-1599058917765-a780eda07a3e'),
  UNSPLASH('photo-1546483875-ad9014c88eba')
];

const FALLBACK_TESTIMONIAL_PHOTOS = [
  UNSPLASH('photo-1488426862026-3ee34a7d66df', 600),
  UNSPLASH('photo-1524504388940-b1c1722653e1', 600),
  UNSPLASH('photo-1546483875-ad9014c88eba', 600),
  UNSPLASH('photo-1521146764736-56c929d59c83', 600),
  UNSPLASH('photo-1583500178690-f7fd39d108a3', 600)
];

function hashSeed(s) {
  let h = 0;
  const str = String(s || 'launch');
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pickFallback(list, seed, offset = 0) {
  if (!list.length) return null;
  return list[(hashSeed(seed) + offset) % list.length];
}

// Returns ctx.photoUrl when set, otherwise a stable stock-photo fallback.
function heroPhotoFor(ctx) {
  return ctx.photoUrl || pickFallback(FALLBACK_HERO_PHOTOS, ctx.challengeName || ctx.businessName || '');
}
function sidePhotoFor(ctx, slotIdx) {
  const photos = (ctx.testimonialPhotos || []).filter(Boolean);
  if (photos[slotIdx]) return photos[slotIdx];
  return pickFallback(FALLBACK_TESTIMONIAL_PHOTOS, ctx.challengeName || '', slotIdx + 1);
}

export async function renderGraphic(templateId, ctx) {
  const tpl = TEMPLATES.find(t => t.id === templateId);
  const canvas = document.createElement('canvas');
  canvas.width = tpl.w;
  canvas.height = tpl.h;
  const c = canvas.getContext('2d');
  await renderers[templateId](c, tpl.w, tpl.h, ctx);
  return canvas;
}

export function canvasToBlob(canvas) {
  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
}

export function downloadCanvas(canvas, filename) {
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 'image/png');
}

/* ============================================================
   Helpers
   ============================================================ */

function loadImage(url) {
  return new Promise(resolve => {
    if (!url) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

function headlineFont(size, weight, ctx) {
  const family = ctx && ctx.brandFontName ? `"${ctx.brandFontName}", Inter, sans-serif` : 'Inter, sans-serif';
  return `${weight} ${size}px ${family}`;
}

function wrap(c, text, maxWidth) {
  const words = String(text || '').split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    if (c.measureText(test).width > maxWidth && cur) { lines.push(cur); cur = w; }
    else { cur = test; }
  }
  if (cur) lines.push(cur);
  return lines;
}

function drawWrap(c, text, x, y, font, color, maxWidth, align = 'left', lineHeight = 1.1) {
  c.font = font; c.fillStyle = color;
  c.textAlign = align; c.textBaseline = 'top';
  const lines = wrap(c, text, maxWidth);
  const size = parseInt(font, 10) || 32;
  lines.forEach((line, i) => c.fillText(line, x, y + i * size * lineHeight));
  return y + lines.length * size * lineHeight;
}

function drawSingle(c, text, x, y, font, color, align = 'left') {
  c.font = font; c.fillStyle = color;
  c.textAlign = align; c.textBaseline = 'top';
  c.fillText(text, x, y);
}

function coverDraw(c, img, dx, dy, dw, dh) {
  if (!img) return;
  const iw = img.naturalWidth, ih = img.naturalHeight;
  const ir = iw / ih, dr = dw / dh;
  let sw, sh, sx, sy;
  if (ir > dr) { sh = ih; sw = ih * dr; sx = (iw - sw) / 2; sy = 0; }
  else         { sw = iw; sh = iw / dr; sx = 0; sy = (ih - sh) / 2; }
  c.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

// Rounded-rect path
function rr(c, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  c.beginPath();
  c.moveTo(x + rad, y);
  c.lineTo(x + w - rad, y);
  c.quadraticCurveTo(x + w, y, x + w, y + rad);
  c.lineTo(x + w, y + h - rad);
  c.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
  c.lineTo(x + rad, y + h);
  c.quadraticCurveTo(x, y + h, x, y + h - rad);
  c.lineTo(x, y + rad);
  c.quadraticCurveTo(x, y, x + rad, y);
  c.closePath();
}

function fillRR(c, x, y, w, h, r, color) {
  c.fillStyle = color;
  rr(c, x, y, w, h, r);
  c.fill();
}

// A pill = rounded rect with text centred inside.
function drawPill(c, text, x, y, opts = {}) {
  const {
    bg = '#10b981',
    fg = '#ffffff',
    font = 'bold 26px Inter, sans-serif',
    padX = 24,
    padY = 12,
    radius = 100,
    maxWidth = null
  } = opts;
  c.font = font;
  const lines = maxWidth ? wrap(c, text, maxWidth) : [text];
  const sz = parseInt(font, 10) || 26;
  const lineH = sz * 1.15;
  const textWidth = Math.max(...lines.map(l => c.measureText(l).width));
  const w = textWidth + padX * 2;
  const h = lines.length * lineH + padY * 2;
  fillRR(c, x, y, w, h, radius, bg);
  c.fillStyle = fg;
  c.textAlign = 'center';
  c.textBaseline = 'top';
  lines.forEach((l, i) => c.fillText(l, x + w / 2, y + padY + i * lineH));
  return { w, h };
}

// Brush-stroke-ish accent (a hand-drawn diagonal swoosh)
function drawSwoosh(c, x, y, length, color, thickness = 18) {
  c.save();
  c.translate(x, y);
  c.rotate(-Math.PI / 5);
  c.fillStyle = color;
  c.beginPath();
  c.moveTo(0, 0);
  c.quadraticCurveTo(length * 0.5, -thickness * 0.6, length, 0);
  c.quadraticCurveTo(length * 0.5, thickness * 1.4, 0, thickness * 0.9);
  c.closePath();
  c.fill();
  c.restore();
}

// Squiggly arrow blob (small accents)
function drawChevrons(c, x, y, color, size = 60) {
  c.save();
  c.translate(x, y);
  c.fillStyle = color;
  for (let i = 0; i < 3; i++) {
    const ox = i * size * 0.45;
    c.beginPath();
    c.moveTo(ox + size * 0.4, 0);
    c.lineTo(ox + size * 0.05, size * 0.45);
    c.lineTo(ox + size * 0.4, size * 0.9);
    c.lineTo(ox + size * 0.55, size * 0.75);
    c.lineTo(ox + size * 0.3, size * 0.45);
    c.lineTo(ox + size * 0.55, size * 0.15);
    c.closePath();
    c.fill();
  }
  c.restore();
}

// Drop a tilted polaroid frame around an image.
async function drawPolaroid(c, imageUrl, fallbackColor, cx, cy, w, h, rotationDeg) {
  c.save();
  c.translate(cx, cy);
  c.rotate(rotationDeg * Math.PI / 180);
  // Outer white frame
  c.fillStyle = '#ffffff';
  c.shadowColor = 'rgba(0,0,0,0.45)';
  c.shadowBlur = 20;
  c.shadowOffsetY = 6;
  c.fillRect(-w / 2, -h / 2, w, h);
  c.shadowColor = 'transparent'; c.shadowBlur = 0;
  // Inner photo area
  const innerPad = 16;
  const bottomBand = 56;
  const ix = -w / 2 + innerPad;
  const iy = -h / 2 + innerPad;
  const iw = w - innerPad * 2;
  const ih = h - innerPad - bottomBand;
  c.fillStyle = fallbackColor;
  c.fillRect(ix, iy, iw, ih);
  const img = await loadImage(imageUrl);
  if (img) {
    c.save();
    c.beginPath();
    c.rect(ix, iy, iw, ih);
    c.clip();
    coverDraw(c, img, ix, iy, iw, ih);
    c.restore();
  }
  c.restore();
}

// Split a comma/period/newline-separated string into N short feature lines.
function splitFeatures(text, n = 3) {
  if (!text) return [];
  const parts = String(text)
    .split(/[\n,;.]+/)
    .map(s => s.trim())
    .filter(Boolean);
  return parts.slice(0, n);
}

/* ============================================================
   Template 1 — "Deal Split"
   ============================================================ */

async function announcement(c, w, h, ctx) {
  const primary   = ctx.brandPrimary   || '#0a0a0f';
  const secondary = ctx.brandSecondary || '#10b981';
  const accent    = ctx.brandAccent    || '#ffffff';

  // Right photo background
  c.fillStyle = '#1a1a22';
  c.fillRect(0, 0, w, h);
  const photo = await loadImage(heroPhotoFor(ctx));
  if (photo) coverDraw(c, photo, w * 0.4, 0, w * 0.6, h);

  // Brush accents in secondary on photo half
  drawSwoosh(c, w * 0.78, h * 0.15, 180, secondary, 28);
  drawChevrons(c, w * 0.50, h * 0.78, secondary, 60);

  // Left dark column
  c.fillStyle = '#0a0a0f';
  c.fillRect(0, 0, w * 0.42, h);

  // Top pill: short challenge framing
  const topLabel = (ctx.format || 'CUSTOM PROGRAM').toUpperCase();
  drawPill(c, topLabel, 56, 56, {
    bg: secondary, fg: accent,
    font: 'bold 22px Inter, sans-serif',
    padX: 22, padY: 12, radius: 100, maxWidth: w * 0.55
  });

  // Big stacked deal text on the dark column
  const stackX = 56;
  let stackY = h * 0.28;
  if (ctx.price) {
    drawSingle(c, 'ONLY', stackX, stackY, headlineFont(64, '900', ctx), accent);
    stackY += 78;
    drawSingle(c, String(ctx.price), stackX, stackY, headlineFont(108, '900', ctx), accent);
    stackY += 124;
  }
  if (ctx.duration) {
    drawSingle(c, String(ctx.duration).toUpperCase(), stackX, stackY, headlineFont(78, '900', ctx), accent);
  }

  // Bottom pill: bonuses / guarantee
  const bottomLabel = (ctx.bonuses && ctx.bonuses.toUpperCase().slice(0, 28))
    || (ctx.guarantee && ctx.guarantee.toUpperCase().slice(0, 28))
    || (ctx.spots ? `LIMITED TO ${ctx.spots} SPOTS` : 'JOIN THE CHALLENGE');
  drawPill(c, bottomLabel, 56, h - 260, {
    bg: secondary, fg: accent,
    font: 'bold 26px Inter, sans-serif',
    padX: 22, padY: 14, radius: 100, maxWidth: w * 0.36
  });

  // Logo + handle bottom-left
  const logo = await loadImage(ctx.logoUrl);
  if (logo) {
    const lw = 72, lh = 72;
    c.save();
    c.globalAlpha = 0.95;
    c.drawImage(logo, 56, h - 110, lw, lh);
    c.restore();
    drawSingle(c, (ctx.businessName || '').toUpperCase(), 140, h - 92, 'bold 20px Inter, sans-serif', accent);
    drawSingle(c, ctx.handle || '', 140, h - 64, '500 16px Inter, sans-serif', 'rgba(255,255,255,0.6)');
  } else {
    drawSingle(c, (ctx.businessName || '').toUpperCase(), 56, h - 92, 'bold 22px Inter, sans-serif', accent);
    drawSingle(c, ctx.handle || '', 56, h - 60, '500 18px Inter, sans-serif', 'rgba(255,255,255,0.6)');
  }
}

/* ============================================================
   Template 2 — "Photo Overlay"
   ============================================================ */

async function hero(c, w, h, ctx) {
  const primary   = ctx.brandPrimary   || '#6366f1';
  const secondary = ctx.brandSecondary || '#ec4899';
  const accent    = ctx.brandAccent    || '#ffffff';

  // Photo background
  c.fillStyle = '#1f1f28';
  c.fillRect(0, 0, w, h);
  const photo = await loadImage(heroPhotoFor(ctx));
  if (photo) coverDraw(c, photo, 0, 0, w, h);

  // Soft bottom gradient for legibility
  const g = c.createLinearGradient(0, h * 0.5, 0, h);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.55)');
  c.fillStyle = g;
  c.fillRect(0, h * 0.5, w, h * 0.5);

  // Year tag (optional accent)
  const year = String(new Date().getFullYear() + 1);
  drawSingle(c, year, w / 2, h * 0.55, headlineFont(168, '900', ctx), accent, 'center');

  // Title
  const title = (ctx.challengeName || 'Your Challenge').toUpperCase();
  drawWrap(c, title, w / 2, h * 0.70, headlineFont(72, '900', ctx), accent, w * 0.86, 'center', 1.04);

  // Pill underneath
  const pillText = ctx.ctaStyle
    ? String(ctx.ctaStyle).slice(0, 32)
    : (ctx.duration ? `Join the ${ctx.duration} challenge` : 'Join the challenge');
  c.font = 'bold 28px Inter, sans-serif';
  const pillW = c.measureText(pillText).width + 48;
  drawPill(c, pillText, (w - pillW) / 2, h - 170, {
    bg: secondary, fg: accent,
    font: 'bold 28px Inter, sans-serif',
    padX: 24, padY: 14, radius: 100
  });
}

/* ============================================================
   Template 3 — "Offer Split"
   ============================================================ */

async function offer(c, w, h, ctx) {
  const primary   = ctx.brandPrimary   || '#a855f7';
  const secondary = ctx.brandSecondary || '#ec4899';
  const accent    = ctx.brandAccent    || '#ffffff';

  // Left photo half
  c.fillStyle = '#1a1a22';
  c.fillRect(0, 0, w / 2, h);
  const photo = await loadImage(heroPhotoFor(ctx));
  if (photo) coverDraw(c, photo, 0, 0, w / 2, h);

  // Right brand panel
  c.fillStyle = secondary;
  c.fillRect(w / 2, 0, w / 2, h);

  // Title on right panel
  const titleLine1 = 'EXCLUSIVE TO';
  const titleLine2 = `THE ${(ctx.challengeName || 'CHALLENGE').toUpperCase()}`;
  drawSingle(c, titleLine1, w / 2 + 48, 100, headlineFont(54, '900', ctx), accent);
  drawWrap(c, titleLine2, w / 2 + 48, 168, headlineFont(54, '900', ctx), accent, w / 2 - 96, 'left', 1.08);

  // 3 feature pills with bullets
  const features = splitFeatures(ctx.included, 3);
  while (features.length < 3) features.push(['CUSTOM WORKOUTS', 'NUTRITION FOCUS', 'LOSE WEIGHT & KEEP IT OFF'][features.length] || 'PROGRAM ACCESS');
  const pillStartY = h * 0.42;
  const pillBg = 'rgba(0,0,0,0.28)';
  features.slice(0, 3).forEach((feat, i) => {
    const y = pillStartY + i * 100;
    fillRR(c, w / 2 + 48, y, w / 2 - 96, 80, 40, pillBg);
    // Bullet dot
    c.fillStyle = accent;
    c.beginPath();
    c.arc(w / 2 + 80, y + 40, 10, 0, Math.PI * 2);
    c.fill();
    drawSingle(c, String(feat).toUpperCase().slice(0, 36),
      w / 2 + 108, y + 24, 'bold 22px Inter, sans-serif', accent);
  });

  // CTA pill
  const ctaText = (ctx.ctaStyle || 'JOIN NOW').toUpperCase().slice(0, 24);
  c.font = 'bold 30px Inter, sans-serif';
  const ctaW = c.measureText(`▶ ${ctaText}`).width + 56;
  fillRR(c, w / 2 + 48, h - 260, ctaW, 76, 40, 'rgba(0,0,0,0.5)');
  drawSingle(c, `▶ ${ctaText}`, w / 2 + 48 + ctaW / 2, h - 244, 'bold 30px Inter, sans-serif', accent, 'center');

  // Logo + brand mark bottom-right
  const logo = await loadImage(ctx.logoUrl);
  if (logo) {
    const lh = 80;
    const lw = logo.naturalWidth * (lh / logo.naturalHeight);
    c.drawImage(logo, w - lw - 56, h - 130, lw, lh);
  } else {
    drawSingle(c, (ctx.businessName || '').toUpperCase(),
      w - 56, h - 90, 'bold 28px Inter, sans-serif', accent, 'right');
  }
}

/* ============================================================
   Template 4 — "Polaroid Trust"
   ============================================================ */

async function testimonial(c, w, h, ctx) {
  const primary   = ctx.brandPrimary   || '#a855f7';
  const secondary = ctx.brandSecondary || '#ec4899';
  const accent    = ctx.brandAccent    || '#ffffff';

  // Black background
  c.fillStyle = '#0a0a0f';
  c.fillRect(0, 0, w, h);

  // Abstract colour blobs
  c.save();
  c.globalAlpha = 0.55;
  c.fillStyle = secondary;
  c.beginPath();
  c.ellipse(w * 0.85, h * 0.18, 280, 160, Math.PI / 6, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = primary;
  c.beginPath();
  c.ellipse(w * 0.12, h * 0.78, 260, 140, -Math.PI / 5, 0, Math.PI * 2);
  c.fill();
  c.globalAlpha = 0.25;
  c.fillStyle = secondary;
  c.beginPath();
  c.ellipse(w * 0.18, h * 0.18, 180, 90, Math.PI / 8, 0, Math.PI * 2);
  c.fill();
  c.restore();

  // Top pill — trust statement
  const trustLine = (ctx.testimonialNumbers && ctx.testimonialNumbers.length < 40)
    ? ctx.testimonialNumbers.toUpperCase()
    : 'CUSTOM PLANS TRUSTED BY HUNDREDS';
  drawPill(c, trustLine, w / 2 - 280, 64, {
    bg: 'rgba(255,255,255,0.08)', fg: accent,
    font: 'bold 22px Inter, sans-serif', padX: 28, padY: 14,
    radius: 100, maxWidth: 480
  });

  // 3 polaroids: centre primary, two side
  const polW = 340, polH = 420;
  const cyMid = h * 0.45;
  const leftUrl   = sidePhotoFor(ctx, 0);
  const rightUrl  = sidePhotoFor(ctx, 1);
  const centerUrl = heroPhotoFor(ctx);
  await drawPolaroid(c, leftUrl,   primary,   w * 0.25, cyMid + 20, polW, polH, -10);
  await drawPolaroid(c, rightUrl,  secondary, w * 0.75, cyMid + 20, polW, polH,  10);
  await drawPolaroid(c, centerUrl, '#222',    w * 0.5,  cyMid,      polW, polH,   0);

  // Title block
  const title = (ctx.challengeName || 'YOUR CHALLENGE').toUpperCase();
  drawWrap(c, title, w / 2, h - 380, headlineFont(76, '900', ctx), accent, w * 0.86, 'center', 1.04);
  drawSingle(c, 'NOW LIVE', w / 2, h - 250, headlineFont(48, '800', ctx), accent, 'center');

  // Logo + handle
  const logo = await loadImage(ctx.logoUrl);
  if (logo) {
    const lh = 70;
    const lw = logo.naturalWidth * (lh / logo.naturalHeight);
    c.drawImage(logo, (w - lw) / 2, h - 140, lw, lh);
  } else {
    drawSingle(c, (ctx.businessName || '').toUpperCase(),
      w / 2, h - 116, 'bold 26px Inter, sans-serif', accent, 'center');
  }
}
