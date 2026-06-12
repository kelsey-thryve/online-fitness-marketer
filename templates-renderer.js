/* ============================================================
   TRAINER LAUNCH — Personalized template renderer

   Loads the original 1080x1920 template PNG, then paints user
   brand data into the slot rects defined in templates-config.js.

   Slot types:
     - 'text'  → cover with coverColor, then draw text with style
     - 'image' → cover with coverColor, then draw user image (cover-fit)
     - 'pill'  → rounded rect filled with a brand colour (recolour)

   Field resolution (slot.field):
     - 'photo_url' | 'logo_url' | 'app_url' | 'business_name'
       'handle' | 'full_name'              → from profile
     - 'brand_primary' | 'brand_secondary'
       'brand_accent'                       → brand colours
     - 'challengeName' | 'promise' | 'price'
       'ctaStyle' | 'spots' | 'duration'
       'biggestPain' | 'topDesire' | 'included' …  → from latest
       challenge intake (or formData if passed in)
     - 'feature.0' | 'feature.1' | 'feature.2'   → derived: included
       split by commas/periods/newlines
   ============================================================ */

const TEMPLATE_W = 1080;
const TEMPLATE_H = 1920;

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

function resolveField(field, ctx) {
  if (!field) return undefined;
  if (field.startsWith('feature.')) {
    const idx = Number(field.split('.')[1]) || 0;
    const list = String(ctx.included || '').split(/[\n,;.]+/).map(s => s.trim()).filter(Boolean);
    return list[idx];
  }
  return ctx[field];
}

function applyTransform(text, transform) {
  if (!text) return '';
  if (transform === 'upper') return String(text).toUpperCase();
  if (transform === 'lower') return String(text).toLowerCase();
  return String(text);
}

function wrapLines(c, text, maxWidth) {
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

function drawTextSlot(c, slot, ctx) {
  const raw = resolveField(slot.field, ctx) || slot.fallback || '';
  const text = applyTransform(raw, slot.style?.transform);
  const r = slot.rect;
  // Cover the placeholder
  if (slot.coverColor) {
    c.fillStyle = slot.coverColor;
    if (slot.coverRadius) {
      const radius = Math.min(slot.coverRadius, r.w / 2, r.h / 2);
      c.beginPath();
      c.moveTo(r.x + radius, r.y);
      c.arcTo(r.x + r.w, r.y, r.x + r.w, r.y + r.h, radius);
      c.arcTo(r.x + r.w, r.y + r.h, r.x, r.y + r.h, radius);
      c.arcTo(r.x, r.y + r.h, r.x, r.y, radius);
      c.arcTo(r.x, r.y, r.x + r.w, r.y, radius);
      c.closePath();
      c.fill();
    } else {
      c.fillRect(r.x, r.y, r.w, r.h);
    }
  }
  if (!text) return;
  // Auto-shrink font until it fits
  let size = slot.style?.fontSize || 48;
  const minSize = slot.style?.minFontSize || 18;
  const weight = slot.style?.fontWeight || 'bold';
  const family = slot.style?.fontFamily || (ctx.brandFontName ? `"${ctx.brandFontName}", Inter, sans-serif` : 'Inter, sans-serif');
  let lines;
  while (size >= minSize) {
    c.font = `${weight} ${size}px ${family}`;
    lines = wrapLines(c, text, r.w * 0.92);
    const lineH = size * (slot.style?.lineHeight || 1.1);
    const totalH = lines.length * lineH;
    if (totalH <= r.h * 0.95 && lines.length <= (slot.style?.maxLines || 8)) break;
    size -= 2;
  }
  const lineH = size * (slot.style?.lineHeight || 1.1);
  const totalH = lines.length * lineH;
  const align = slot.style?.align || 'center';
  const valign = slot.style?.valign || 'middle';
  c.fillStyle = slot.style?.color || '#ffffff';
  c.textAlign = align;
  c.textBaseline = 'top';
  const tx = align === 'left' ? r.x + 12 : (align === 'right' ? r.x + r.w - 12 : r.x + r.w / 2);
  const baseY = valign === 'top' ? r.y + 6
              : valign === 'bottom' ? r.y + r.h - totalH - 6
              : r.y + (r.h - totalH) / 2;
  lines.forEach((line, i) => c.fillText(line, tx, baseY + i * lineH));
}

async function drawImageSlot(c, slot, ctx) {
  const r = slot.rect;
  if (slot.coverColor) {
    c.fillStyle = slot.coverColor;
    c.fillRect(r.x, r.y, r.w, r.h);
  }
  const url = resolveField(slot.field, ctx);
  const img = await loadImage(url);
  if (!img) return;
  c.save();
  c.beginPath();
  c.rect(r.x, r.y, r.w, r.h);
  c.clip();
  // cover-fit
  const iw = img.naturalWidth, ih = img.naturalHeight;
  const ir = iw / ih, dr = r.w / r.h;
  let sw, sh, sx, sy;
  if (ir > dr) { sh = ih; sw = ih * dr; sx = (iw - sw) / 2; sy = 0; }
  else         { sw = iw; sh = iw / dr; sx = 0; sy = (ih - sh) / 2; }
  c.drawImage(img, sx, sy, sw, sh, r.x, r.y, r.w, r.h);
  c.restore();
}

function drawPillSlot(c, slot, ctx) {
  const r = slot.rect;
  const colorField = slot.colorField || 'brand_primary';
  const color = ctx[colorField] || slot.color || '#6366f1';
  const radius = slot.radius != null ? slot.radius : Math.min(r.h / 2, 100);
  c.fillStyle = color;
  c.beginPath();
  c.moveTo(r.x + radius, r.y);
  c.arcTo(r.x + r.w, r.y, r.x + r.w, r.y + r.h, radius);
  c.arcTo(r.x + r.w, r.y + r.h, r.x, r.y + r.h, radius);
  c.arcTo(r.x, r.y + r.h, r.x, r.y, radius);
  c.arcTo(r.x, r.y, r.x + r.w, r.y, radius);
  c.closePath();
  c.fill();
}

export async function renderPersonalizedTemplate(template, ctx) {
  const canvas = document.createElement('canvas');
  canvas.width = TEMPLATE_W;
  canvas.height = TEMPLATE_H;
  const c = canvas.getContext('2d');

  // 1. Paint the base template
  const bg = await loadImage(template.file);
  if (bg) {
    c.drawImage(bg, 0, 0, TEMPLATE_W, TEMPLATE_H);
  } else {
    c.fillStyle = '#0a0a0f';
    c.fillRect(0, 0, TEMPLATE_W, TEMPLATE_H);
  }

  // 2. Optional brand font preload
  if (ctx.brandFontUrl && ctx.brandFontName) {
    try {
      const font = new FontFace(ctx.brandFontName, `url("${ctx.brandFontUrl}")`);
      await font.load();
      document.fonts.add(font);
    } catch (_) { /* fall back to Inter */ }
  }

  // 3. Layer each slot
  for (const slot of (template.slots || [])) {
    if (slot.type === 'pill')  drawPillSlot(c, slot, ctx);
    if (slot.type === 'text')  drawTextSlot(c, slot, ctx);
    if (slot.type === 'image') await drawImageSlot(c, slot, ctx);
  }

  return canvas;
}

/* Build the render context from a profile row + optional challenge intake */
export function buildRenderContext(profile, challenge) {
  const p = profile || {};
  const f = (challenge && challenge.intake) || {};
  return {
    // Brand
    brand_primary:   p.brand_primary   || '#6366f1',
    brand_secondary: p.brand_secondary || '#10b981',
    brand_accent:    p.brand_accent    || '#ffffff',
    brandFontUrl:    p.font_url        || null,
    brandFontName:   p.font_name       || null,
    // Profile fields
    photo_url:       p.photo_url || '',
    logo_url:        p.logo_url  || '',
    app_url:         p.app_url   || '',
    business_name:   p.business_name || '',
    full_name:       p.full_name || '',
    handle:          p.handle ? (p.handle.startsWith('@') ? p.handle : '@' + p.handle) : '',
    niche:           p.niche || '',
    // Challenge fields
    challengeName:   f.challengeName || '',
    promise:         f.promise || '',
    price:           f.price || '',
    ctaStyle:        f.ctaStyle || '',
    spots:           f.spots || '',
    duration:        f.duration || '',
    biggestPain:     f.biggestPain || '',
    topDesire:       f.topDesire || '',
    included:        f.included || '',
    bonuses:         f.bonuses || '',
    format:          f.format || ''
  };
}
