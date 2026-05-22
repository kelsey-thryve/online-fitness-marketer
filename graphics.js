/* ============================================================
   TRAINER LAUNCH — Ad-graphic templates (canvas-rendered)
   Each template draws to an off-screen canvas using the coach's
   brand colours and intake data, then exports as a PNG.
   ============================================================ */

export const TEMPLATES = [
  { id: 'announcement', title: 'Challenge announcement', w: 1080, h: 1350 },
  { id: 'quote',        title: 'Quote card',             w: 1080, h: 1080 },
  { id: 'offer',        title: 'Offer card',             w: 1080, h: 1350 },
  { id: 'testimonial',  title: 'Testimonial card',       w: 1080, h: 1080 }
];

const renderers = { announcement, quote, offer, testimonial };

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

function gradientBg(c, w, h, c1, c2) {
  const g = c.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, c1); g.addColorStop(1, c2);
  c.fillStyle = g;
  c.fillRect(0, 0, w, h);
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

function drawWrap(c, text, x, y, font, color, maxWidth, align = 'left', lineHeight = 1.15) {
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

/* ============================================================
   Templates
   ============================================================ */

async function announcement(c, w, h, ctx) {
  const { brandPrimary = '#6366f1', brandSecondary = '#10b981', brandAccent = '#ffffff' } = ctx;
  gradientBg(c, w, h, brandPrimary, brandSecondary);

  // Optional photo bottom-right, masked
  const photo = await loadImage(ctx.photoUrl);
  if (photo) {
    c.save();
    c.globalAlpha = 0.25;
    coverDraw(c, photo, w * 0.35, h * 0.25, w * 0.7, h * 0.75);
    c.restore();
  }

  // Soft diagonal stripe
  c.save();
  c.globalAlpha = 0.08;
  c.fillStyle = '#ffffff';
  c.beginPath();
  c.moveTo(0, h);
  c.lineTo(w, h * 0.3);
  c.lineTo(w, h);
  c.fill();
  c.restore();

  drawSingle(c, 'NEW CHALLENGE', 80, 100, 'bold 36px Inter, sans-serif', brandAccent);
  c.fillStyle = brandAccent;
  c.fillRect(80, 152, 64, 4);

  drawWrap(c, (ctx.challengeName || 'Your Challenge').toUpperCase(),
    80, 220, 'bold 92px Inter, sans-serif', brandAccent, w - 160, 'left', 1.05);

  const bottomY = h - 320;
  drawSingle(c, 'STARTS', 80, bottomY, 'bold 22px Inter, sans-serif', brandAccent);
  drawSingle(c, ctx.startDate || 'Coming soon', 80, bottomY + 32, 'bold 48px Inter, sans-serif', brandAccent);
  drawSingle(c, 'SPOTS', 80, bottomY + 130, 'bold 22px Inter, sans-serif', brandAccent);
  drawSingle(c, String(ctx.spots || '—'), 80, bottomY + 162, 'bold 48px Inter, sans-serif', brandAccent);
  drawSingle(c, `@${ctx.handle || ctx.businessName || ''}`, 80, h - 90, '500 28px Inter, sans-serif', brandAccent);
}

async function quote(c, w, h, ctx) {
  const { brandPrimary = '#6366f1', brandAccent = '#ffffff' } = ctx;
  c.fillStyle = brandPrimary;
  c.fillRect(0, 0, w, h);

  drawSingle(c, '"', 80, 40, 'bold 280px Georgia, serif', 'rgba(255,255,255,0.15)');

  const txt = ctx.contrarianBelief || ctx.promise || 'Your headline goes here.';
  drawWrap(c, txt, 80, 300, 'bold 56px Inter, sans-serif', brandAccent, w - 160, 'left', 1.2);

  drawSingle(c, `— ${ctx.fullName || ctx.businessName || ''}`,
    80, h - 130, '500 32px Inter, sans-serif', 'rgba(255,255,255,0.7)');
}

async function offer(c, w, h, ctx) {
  const { brandPrimary = '#6366f1', brandSecondary = '#10b981', brandAccent = '#ffffff' } = ctx;

  c.fillStyle = '#0a0a0f';
  c.fillRect(0, 0, w, h);

  // Top brand bar
  gradientBg(c, w, 14, brandPrimary, brandSecondary);

  drawSingle(c, 'INTRODUCING', 80, 80, 'bold 28px Inter, sans-serif', brandPrimary);
  drawWrap(c, ctx.challengeName || 'Your Challenge',
    80, 130, 'bold 72px Inter, sans-serif', brandAccent, w - 160, 'left', 1.05);
  drawWrap(c, ctx.promise || '',
    80, 320, '500 32px Inter, sans-serif', 'rgba(255,255,255,0.7)', w - 160, 'left', 1.3);

  const blockY = h - 560;
  c.fillStyle = 'rgba(255,255,255,0.05)';
  c.fillRect(80, blockY, w - 160, 400);
  // Left bar accent
  c.fillStyle = brandPrimary;
  c.fillRect(80, blockY, 6, 400);

  drawSingle(c, 'INVESTMENT', 120, blockY + 40, 'bold 24px Inter, sans-serif', brandSecondary);
  drawSingle(c, ctx.price || '$—', 120, blockY + 78, 'bold 96px Inter, sans-serif', brandAccent);
  drawSingle(c, `${ctx.duration || ''}${ctx.duration && ctx.format ? ' · ' : ''}${ctx.format || ''}`,
    120, blockY + 210, '500 26px Inter, sans-serif', brandAccent);
  drawSingle(c, `${ctx.spots || '—'} spots · starts ${ctx.startDate || 'soon'}`,
    120, blockY + 250, '500 22px Inter, sans-serif', 'rgba(255,255,255,0.6)');

  // CTA bar
  c.fillStyle = brandPrimary;
  c.fillRect(120, blockY + 310, w - 240, 60);
  drawSingle(c, (ctx.ctaStyle || 'Apply now').toUpperCase().slice(0, 28),
    w / 2, blockY + 327, 'bold 26px Inter, sans-serif', brandAccent, 'center');
}

async function testimonial(c, w, h, ctx) {
  const { brandPrimary = '#6366f1', brandSecondary = '#10b981', brandAccent = '#ffffff' } = ctx;
  gradientBg(c, w, h, '#161620', '#0a0a0f');

  // Brand bar on left
  c.fillStyle = brandPrimary;
  c.fillRect(0, 0, 18, h);

  drawSingle(c, 'CLIENT WIN', 80, 80, 'bold 28px Inter, sans-serif', brandSecondary);
  c.fillStyle = brandSecondary;
  c.fillRect(80, 130, 64, 4);

  const t = '"' + (ctx.topTestimonial || 'A client transformation story.').slice(0, 280) + '"';
  drawWrap(c, t, 80, 200, '500 38px Inter, sans-serif', brandAccent, w - 160, 'left', 1.3);

  drawSingle(c, `Coached by ${ctx.fullName || ctx.businessName || ''}`,
    80, h - 110, '500 26px Inter, sans-serif', 'rgba(255,255,255,0.6)');
}
