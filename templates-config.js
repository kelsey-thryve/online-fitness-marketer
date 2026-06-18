/* ============================================================
   TRAINER LAUNCH — Ad Template Manifest
   The 21 wireframe-style Canva templates available to subscribers.

   slots[] drives the "with your branding" personalized preview
   (see templates-renderer.js). Coordinates are in 1080x1920
   canvas space.
   ============================================================ */

export const AD_TEMPLATES = [

  /* ---- Template 01 — "Reminder Card v2" -------------------- */
  {
    id: '1',  file: 'templates/1.png',
    title: 'Template 01 — Reminder Card',
    canvaUrl: 'https://www.canva.com/d/EnObVYAyRVU_N0_',
    slots: [
      // [WEBSITE] tag in the white frame top-right
      { type: 'text', field: 'handle', fallback: '@yourbrand',
        rect: { x: 620, y: 320, w: 260, h: 55 },
        coverColor: '#ffffff',
        style: { fontSize: 30, fontWeight: 'bold', color: '#1a1a2e',
                 align: 'right', valign: 'middle', maxLines: 1 } },
      // Big "% OFF" headline in the cyan card
      { type: 'text', field: 'ctaStyle', fallback: '25% OFF',
        rect: { x: 195, y: 525, w: 690, h: 180 },
        coverColor: '#4ec8d2',
        style: { fontSize: 140, fontWeight: '900', color: '#0a0a0f',
                 align: 'left', valign: 'middle', transform: 'upper', maxLines: 1 } },
      // [PRODUCT] line below the headline
      { type: 'text', field: 'challengeName', fallback: 'Your product',
        rect: { x: 195, y: 740, w: 690, h: 100 },
        coverColor: '#4ec8d2',
        style: { fontSize: 64, fontWeight: '900', color: '#0a0a0f',
                 align: 'left', valign: 'middle', transform: 'upper', maxLines: 1 } },
      // [KEY MESSAGING] line directly below product
      { type: 'text', field: 'promise', fallback: 'Key messaging',
        rect: { x: 195, y: 840, w: 690, h: 100 },
        coverColor: '#4ec8d2',
        style: { fontSize: 60, fontWeight: '900', color: '#0a0a0f',
                 align: 'left', valign: 'middle', transform: 'upper', maxLines: 1 } }
    ]
  },

  /* ---- Template 02 — "Sale Promotion" ------------------ */
  {
    id: '2', file: 'templates/2.png',
    title: 'Template 02 — Sale Promotion',
    canvaUrl: 'https://www.canva.com/d/DxDxIoYuL0WqI_Y',
    slots: [
      { type: 'text', field: 'ctaStyle', fallback: '$XX',
        rect: { x: 40, y: 200, w: 320, h: 110 },
        coverColor: '#ffffff', coverRadius: 20,
        style: { fontSize: 48, fontWeight: 'bold', color: '#1a1a2e',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 1 } },
      { type: 'image', field: 'logo_url',
        rect: { x: 880, y: 60, w: 140, h: 140 },
        coverColor: '#ffffff' },
      { type: 'text', field: 'challengeName', fallback: 'SALE PROMOTION',
        rect: { x: 80, y: 900, w: 800, h: 260 },
        coverColor: '#0a0a0f',
        style: { fontSize: 80, fontWeight: 'bold', color: '#ffffff',
                 align: 'left', valign: 'middle', transform: 'upper', maxLines: 2 } },
      { type: 'text', field: 'ctaStyle', fallback: 'Shop now',
        rect: { x: 260, y: 1240, w: 560, h: 120 },
        coverColor: '#4ec8d2', coverRadius: 60,
        style: { fontSize: 42, fontWeight: 'bold', color: '#0a0a0f',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 1 } }
    ]
  },

  /* ---- Template 03 — "Product / Pain Point" ------------ */
  {
    id: '3', file: 'templates/3.png',
    title: 'Template 03 — Product / Pain Point',
    canvaUrl: 'https://www.canva.com/d/uPH6J1ySpDAtOle',
    slots: [
      { type: 'image', field: 'logo_url',
        rect: { x: 460, y: 90, w: 150, h: 150 },
        coverColor: '#ffffff' },
      { type: 'text', field: 'biggestPain', fallback: 'pain point of ideal customer',
        rect: { x: 40, y: 1100, w: 900, h: 260 },
        coverColor: '#000000',
        style: { fontSize: 72, fontWeight: 'bold', color: '#ffffff',
                 align: 'left', valign: 'middle', transform: 'upper', maxLines: 2 } },
      { type: 'text', field: 'ctaStyle', fallback: 'Join now',
        rect: { x: 240, y: 1420, w: 600, h: 110 },
        coverColor: '#4ec8d2', coverRadius: 55,
        style: { fontSize: 38, fontWeight: 'bold', color: '#0a0a0f',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 1 } }
    ]
  },

  /* ---- Template 04 — "Key Messaging Hero" -------------- */
  {
    id: '4', file: 'templates/4.png',
    title: 'Template 04 — Key Messaging Hero',
    canvaUrl: 'https://www.canva.com/d/ys9Kv05QQhlhxpK',
    slots: [
      { type: 'text', field: 'promise', fallback: 'Key messaging',
        rect: { x: 60, y: 180, w: 480, h: 110 },
        coverColor: '#4ec8d2', coverRadius: 10,
        style: { fontSize: 38, fontWeight: 'bold', color: '#0a0a0f',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 1 } },
      { type: 'text', field: 'biggestPain', fallback: 'Key messaging headline',
        rect: { x: 40, y: 380, w: 600, h: 460 },
        coverColor: '#000000',
        style: { fontSize: 90, fontWeight: 'bold', color: '#ffffff',
                 align: 'left', valign: 'middle', transform: 'upper', maxLines: 3 } },
      { type: 'text', field: 'ctaStyle', fallback: 'Offer/Promotion',
        rect: { x: 40, y: 920, w: 500, h: 220 },
        coverColor: '#4ec8d2', coverRadius: 40,
        style: { fontSize: 44, fontWeight: 'bold', color: '#0a0a0f',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 2 } },
      { type: 'image', field: 'logo_url',
        rect: { x: 70, y: 1300, w: 180, h: 180 },
        coverColor: '#ffffff' }
    ]
  },

  /* ---- Template 05 — "Instagram Mockup" ---------------- */
  {
    id: '5',  file: 'templates/5.png',
    title: 'Template 05 — Instagram Mockup',
    canvaUrl: 'https://www.canva.com/d/RhbwKVq3c6NcZvI',
    slots: [
      { type: 'image', field: 'photo_url',
        rect: { x: 80, y: 480, w: 460, h: 580 },
        coverColor: '#1a1a22' },
      { type: 'text', field: 'handle', fallback: '@yourbrand',
        rect: { x: 175, y: 405, w: 340, h: 60 },
        coverColor: '#ffffff',
        style: { fontSize: 32, fontWeight: 'bold', color: '#1a1a2e',
                 align: 'left', valign: 'middle', maxLines: 1 } },
      { type: 'text', field: 'promise', fallback: 'Key messaging here',
        rect: { x: 600, y: 480, w: 430, h: 290 },
        coverColor: null,
        style: { fontSize: 72, fontWeight: '900', color: '#1a1a2e',
                 align: 'left', valign: 'top', transform: 'upper', maxLines: 4 } },
      { type: 'text', field: 'ctaStyle', fallback: 'JOIN NOW',
        rect: { x: 600, y: 820, w: 430, h: 110 },
        coverColor: null,
        style: { fontSize: 64, fontWeight: '900', color: '#1a1a2e',
                 align: 'left', valign: 'top', transform: 'upper', maxLines: 1 } }
    ]
  },

  /* ---- Template 06 — "Promotion / Food" --------------- */
  {
    id: '6', file: 'templates/6.png',
    title: 'Template 06 — Promotion / Food',
    canvaUrl: 'https://www.canva.com/d/d4v1j6DRZjFLnWf',
    slots: [
      { type: 'text', field: 'promise', fallback: 'Key messaging',
        rect: { x: 200, y: 280, w: 680, h: 90 },
        coverColor: '#3d4d4f',
        style: { fontSize: 36, fontWeight: 'bold', color: '#4ec8d2',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 1 } },
      { type: 'text', field: 'ctaStyle', fallback: 'Promotion here',
        rect: { x: 60, y: 920, w: 960, h: 260 },
        coverColor: '#0d2b30',
        style: { fontSize: 90, fontWeight: 'bold', color: '#ffffff',
                 align: 'left', valign: 'middle', transform: 'upper', maxLines: 2 } },
      { type: 'image', field: 'logo_url',
        rect: { x: 460, y: 1300, w: 160, h: 160 },
        coverColor: '#ffffff' }
    ]
  },

  /* ---- Template 07 — "Features List" ------------------ */
  {
    id: '7', file: 'templates/7.png',
    title: 'Template 07 — Features List',
    canvaUrl: 'https://www.canva.com/d/KZILjAM8Gr6fxEC',
    slots: [
      { type: 'text', field: 'ctaStyle', fallback: 'Promotion/Offer',
        rect: { x: 540, y: 280, w: 500, h: 220 },
        coverColor: '#1a1a1a',
        style: { fontSize: 58, fontWeight: 'bold', color: '#ffffff',
                 align: 'left', valign: 'middle', transform: 'upper', maxLines: 2 } },
      { type: 'text', field: 'feature.0', fallback: 'Feature one',
        rect: { x: 620, y: 620, w: 400, h: 100 },
        coverColor: '#4ec8d2', coverRadius: 50,
        style: { fontSize: 32, fontWeight: 'bold', color: '#0a0a0f',
                 align: 'left', valign: 'middle', maxLines: 1 } },
      { type: 'text', field: 'feature.1', fallback: 'Feature two',
        rect: { x: 620, y: 780, w: 400, h: 100 },
        coverColor: '#4ec8d2', coverRadius: 50,
        style: { fontSize: 32, fontWeight: 'bold', color: '#0a0a0f',
                 align: 'left', valign: 'middle', maxLines: 1 } },
      { type: 'text', field: 'feature.2', fallback: 'Feature three',
        rect: { x: 620, y: 940, w: 400, h: 100 },
        coverColor: '#4ec8d2', coverRadius: 50,
        style: { fontSize: 32, fontWeight: 'bold', color: '#0a0a0f',
                 align: 'left', valign: 'middle', maxLines: 1 } },
      { type: 'image', field: 'logo_url',
        rect: { x: 770, y: 1110, w: 120, h: 120 },
        coverColor: '#ffffff' }
    ]
  },

  /* ---- Template 08 — "Them vs Us" --------------------- */
  {
    id: '8', file: 'templates/8.png',
    title: 'Template 08 — Them vs Us',
    canvaUrl: 'https://www.canva.com/d/GTkK_1qU__WaoMa',
    slots: [
      { type: 'text', field: 'feature.0', fallback: 'Customized plans',
        rect: { x: 560, y: 480, w: 460, h: 120 },
        coverColor: '#4ec8d2', coverRadius: 20,
        style: { fontSize: 28, fontWeight: 'bold', color: '#ffffff',
                 align: 'center', valign: 'middle', maxLines: 2 } },
      { type: 'text', field: 'feature.1', fallback: 'Supportive community',
        rect: { x: 560, y: 660, w: 460, h: 120 },
        coverColor: '#4ec8d2', coverRadius: 20,
        style: { fontSize: 28, fontWeight: 'bold', color: '#ffffff',
                 align: 'center', valign: 'middle', maxLines: 2 } },
      { type: 'text', field: 'feature.2', fallback: 'In-app tracking',
        rect: { x: 560, y: 840, w: 460, h: 120 },
        coverColor: '#4ec8d2', coverRadius: 20,
        style: { fontSize: 28, fontWeight: 'bold', color: '#ffffff',
                 align: 'center', valign: 'middle', maxLines: 2 } },
      { type: 'text', field: 'feature.3', fallback: 'Proven results',
        rect: { x: 560, y: 1020, w: 460, h: 120 },
        coverColor: '#4ec8d2', coverRadius: 20,
        style: { fontSize: 28, fontWeight: 'bold', color: '#ffffff',
                 align: 'center', valign: 'middle', maxLines: 2 } },
      { type: 'image', field: 'logo_url',
        rect: { x: 470, y: 1390, w: 140, h: 140 },
        coverColor: '#ffffff' }
    ]
  },

  /* ---- Template 09 — "App Screenshot Promo" ----------- */
  {
    id: '9', file: 'templates/9.png',
    title: 'Template 09 — App Screenshot Promo',
    canvaUrl: 'https://www.canva.com/d/cQgw_jvdebzUw7I',
    slots: [
      { type: 'image', field: 'logo_url',
        rect: { x: 60, y: 200, w: 140, h: 140 },
        coverColor: '#ffffff' },
      { type: 'text', field: 'ctaStyle', fallback: 'Offer / Promotion',
        rect: { x: 80, y: 440, w: 920, h: 280 },
        coverColor: '#1a1a1a',
        style: { fontSize: 80, fontWeight: 'bold', color: '#ffffff',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 2 } },
      { type: 'text', field: 'promise', fallback: 'Key messaging',
        rect: { x: 240, y: 760, w: 600, h: 90 },
        coverColor: '#2a2a2a', coverRadius: 10,
        style: { fontSize: 38, fontWeight: 'bold', color: '#ffffff',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 1 } },
      { type: 'image', field: 'app_url',
        rect: { x: 360, y: 1020, w: 380, h: 580 },
        coverColor: '#e8f4fd' }
    ]
  },

  /* ---- Template 10 — "Customer Review" ---------------- */
  {
    id: '10', file: 'templates/10.png',
    title: 'Template 10 — Customer Review',
    canvaUrl: 'https://www.canva.com/d/dfzLdn3hHua9GIh',
    slots: [
      { type: 'text', field: 'promise', fallback: 'Insert amazing review here',
        rect: { x: 100, y: 1100, w: 880, h: 200 },
        coverColor: '#4ec8d2', coverRadius: 30,
        style: { fontSize: 36, fontWeight: 'bold', color: '#ffffff',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 3 } },
      { type: 'text', field: 'ctaStyle', fallback: 'Join now',
        rect: { x: 240, y: 1400, w: 600, h: 130 },
        coverColor: '#0a0a0f', coverRadius: 65,
        style: { fontSize: 44, fontWeight: 'bold', color: '#ffffff',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 1 } }
    ]
  },

  /* ---- Template 11 — "AirDrop Promo" ------------------ */
  {
    id: '11', file: 'templates/11.png',
    title: 'Template 11 — AirDrop Promo',
    canvaUrl: 'https://www.canva.com/d/0WG_iW3mYEc2m4-',
    slots: [
      { type: 'text', field: 'ctaStyle', fallback: 'Promotion',
        rect: { x: 80, y: 280, w: 920, h: 160 },
        coverColor: '#4ec8d2',
        style: { fontSize: 90, fontWeight: 'bold', color: '#ffffff',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 1 } },
      { type: 'text', field: 'biggestPain', fallback: 'send you a pain point',
        rect: { x: 180, y: 700, w: 720, h: 160 },
        coverColor: '#e8e8ea',
        style: { fontSize: 38, fontWeight: 'normal', color: '#1a1a2e',
                 align: 'center', valign: 'middle', maxLines: 2 } }
    ]
  },

  /* ---- Template 12 — "iMessage Plan" ------------------ */
  {
    id: '12', file: 'templates/12.png',
    title: 'Template 12 — iMessage Plan',
    canvaUrl: 'https://www.canva.com/d/7gM9u42cCTsgynw',
    slots: [
      { type: 'image', field: 'logo_url',
        rect: { x: 460, y: 240, w: 160, h: 160 },
        coverColor: '#0a0a0f' },
      { type: 'text', field: 'biggestPain', fallback: 'solve pain point',
        rect: { x: 360, y: 540, w: 580, h: 100 },
        coverColor: '#2a82e4', coverRadius: 40,
        style: { fontSize: 30, fontWeight: 'normal', color: '#ffffff',
                 align: 'center', valign: 'middle', maxLines: 1 } },
      { type: 'text', field: 'promise', fallback: 'Key messaging',
        rect: { x: 60, y: 1000, w: 960, h: 140 },
        coverColor: '#0a0a0f',
        style: { fontSize: 64, fontWeight: 'bold', color: '#ffffff',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 1 } },
      { type: 'text', field: 'biggestPain', fallback: 'Pain point',
        rect: { x: 200, y: 1160, w: 680, h: 100 },
        coverColor: '#0a0a0f',
        style: { fontSize: 40, fontWeight: 'bold', color: '#ffffff',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 1 } },
      { type: 'text', field: 'ctaStyle', fallback: 'Offer',
        rect: { x: 320, y: 1340, w: 440, h: 120 },
        coverColor: '#4ec8d2', coverRadius: 60,
        style: { fontSize: 42, fontWeight: 'bold', color: '#ffffff',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 1 } }
    ]
  },

  /* ---- Template 13 — "Pain Point + Features" --------- */
  {
    id: '13', file: 'templates/13.png',
    title: 'Template 13 — Pain Point + Features',
    canvaUrl: 'https://www.canva.com/d/4SCDbGFknwIuleo',
    slots: [
      { type: 'text', field: 'biggestPain', fallback: 'Solve their biggest pain',
        rect: { x: 80, y: 540, w: 920, h: 280 },
        coverColor: '#000000',
        style: { fontSize: 130, fontWeight: '900', color: '#ffffff',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 3 } },
      { type: 'text', field: 'promise', fallback: 'Key messaging',
        rect: { x: 200, y: 820, w: 680, h: 80 },
        coverColor: '#000000',
        style: { fontSize: 44, fontWeight: 'bold', color: '#ffffff',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 1 } },
      { type: 'text', field: 'feature.0', fallback: 'Feature one',
        rect: { x: 40, y: 1040, w: 380, h: 90 },
        coverColor: '#4ec8d2', coverRadius: 50,
        style: { fontSize: 34, fontWeight: 'bold', color: '#ffffff',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 2 } },
      { type: 'text', field: 'feature.1', fallback: 'Feature two',
        rect: { x: 660, y: 1300, w: 380, h: 90 },
        coverColor: '#4ec8d2', coverRadius: 50,
        style: { fontSize: 34, fontWeight: 'bold', color: '#ffffff',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 2 } },
      { type: 'text', field: 'feature.2', fallback: 'Feature three',
        rect: { x: 40, y: 1560, w: 380, h: 90 },
        coverColor: '#4ec8d2', coverRadius: 50,
        style: { fontSize: 34, fontWeight: 'bold', color: '#ffffff',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 2 } },
      { type: 'text', field: 'ctaStyle', fallback: 'JOIN NOW',
        rect: { x: 290, y: 1740, w: 500, h: 100 },
        coverColor: '#ffffff', coverRadius: 50,
        style: { fontSize: 44, fontWeight: '900', color: '#000000',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 1 } }
    ]
  },

  /* ---- Template 14 — "XX% Off Sale" ------------------- */
  {
    id: '14', file: 'templates/14.png',
    title: 'Template 14 — XX% Off Sale',
    canvaUrl: 'https://www.canva.com/d/fN7csU6LmxXE7Cx',
    slots: [
      { type: 'text', field: 'challengeName', fallback: 'Product',
        rect: { x: 100, y: 420, w: 880, h: 110 },
        coverColor: '#000000',
        style: { fontSize: 42, fontWeight: 'bold', color: '#4ec8d2',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 1 } },
      { type: 'text', field: 'promise', fallback: 'Key messaging',
        rect: { x: 180, y: 600, w: 720, h: 90 },
        coverColor: '#000000',
        style: { fontSize: 32, fontWeight: 'normal', color: '#ffffff',
                 align: 'center', valign: 'middle', maxLines: 1 } },
      { type: 'text', field: 'ctaStyle', fallback: 'Offer',
        rect: { x: 300, y: 740, w: 480, h: 110 },
        coverColor: '#ff5a5f', coverRadius: 55,
        style: { fontSize: 38, fontWeight: 'bold', color: '#ffffff',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 1 } }
    ]
  },

  /* ---- Template 15 — "Testimonial Quote" -------------- */
  {
    id: '15', file: 'templates/15.png',
    title: 'Template 15 — Testimonial Quote',
    canvaUrl: 'https://www.canva.com/d/P8lQptO41j4dDjF',
    slots: [
      { type: 'text', field: 'biggestPain', fallback: 'Solve pain point',
        rect: { x: 140, y: 820, w: 800, h: 240 },
        coverColor: '#f0f0f2',
        style: { fontSize: 60, fontWeight: 'bold', color: '#1a1a2e',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 2 } },
      { type: 'text', field: 'promise', fallback: 'Review',
        rect: { x: 160, y: 1080, w: 500, h: 80 },
        coverColor: '#f0f0f2',
        style: { fontSize: 28, fontWeight: 'normal', color: '#5a5a6a',
                 align: 'left', valign: 'middle', maxLines: 1 } },
      { type: 'text', field: 'ctaStyle', fallback: 'Offer',
        rect: { x: 200, y: 1340, w: 640, h: 120 },
        coverColor: '#1f3a5f', coverRadius: 60,
        style: { fontSize: 38, fontWeight: 'bold', color: '#ffffff',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 1 } }
    ]
  },

  /* ---- Template 16 — "Goals vs Solution" ------------- */
  {
    id: '16', file: 'templates/16.png',
    title: 'Template 16 — Goals vs Solution',
    canvaUrl: 'https://www.canva.com/d/B0mFUJAXFe8xqyd',
    slots: [
      { type: 'image', field: 'logo_url',
        rect: { x: 470, y: 300, w: 140, h: 140 },
        coverColor: '#ffffff' },
      { type: 'text', field: 'feature.0', fallback: 'Pain point 1',
        rect: { x: 70, y: 700, w: 420, h: 90 },
        coverColor: '#ffffff', coverRadius: 50,
        style: { fontSize: 34, fontWeight: 'bold', color: '#1a1a2e',
                 align: 'center', valign: 'middle', maxLines: 2 } },
      { type: 'text', field: 'feature.1', fallback: 'Pain point 2',
        rect: { x: 70, y: 820, w: 420, h: 90 },
        coverColor: '#ffffff', coverRadius: 50,
        style: { fontSize: 34, fontWeight: 'bold', color: '#1a1a2e',
                 align: 'center', valign: 'middle', maxLines: 2 } },
      { type: 'text', field: 'feature.2', fallback: 'Pain point 3',
        rect: { x: 70, y: 940, w: 420, h: 90 },
        coverColor: '#ffffff', coverRadius: 50,
        style: { fontSize: 34, fontWeight: 'bold', color: '#1a1a2e',
                 align: 'center', valign: 'middle', maxLines: 2 } },
      { type: 'text', field: 'feature.3', fallback: 'Pain point 4',
        rect: { x: 70, y: 1060, w: 420, h: 90 },
        coverColor: '#ffffff', coverRadius: 50,
        style: { fontSize: 34, fontWeight: 'bold', color: '#1a1a2e',
                 align: 'center', valign: 'middle', maxLines: 2 } },
      { type: 'text', field: 'feature.4', fallback: 'Pain point 5',
        rect: { x: 70, y: 1180, w: 420, h: 90 },
        coverColor: '#ffffff', coverRadius: 50,
        style: { fontSize: 34, fontWeight: 'bold', color: '#1a1a2e',
                 align: 'center', valign: 'middle', maxLines: 2 } },
      { type: 'image', field: 'app_url',
        rect: { x: 620, y: 720, w: 340, h: 600 },
        coverColor: '#e8f4fd' },
      { type: 'text', field: 'challengeName', fallback: 'Your Product',
        rect: { x: 620, y: 1380, w: 340, h: 90 },
        coverColor: '#a8e0ff', coverRadius: 50,
        style: { fontSize: 32, fontWeight: 'bold', color: '#1a1a2e',
                 align: 'center', valign: 'middle', maxLines: 2 } },
      { type: 'text', field: 'ctaStyle', fallback: 'Join now',
        rect: { x: 80, y: 1560, w: 920, h: 100 },
        coverColor: '#a8e0ff', coverRadius: 50,
        style: { fontSize: 48, fontWeight: '900', color: '#1a1a2e',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 1 } }
    ]
  },

  /* ---- Template 17 — "Limited Offer XX% Off" ---------- */
  {
    id: '17', file: 'templates/17.png',
    title: 'Template 17 — Limited Offer XX% Off',
    canvaUrl: 'https://www.canva.com/d/xouRVwfIVRvlg5s',
    slots: [
      { type: 'image', field: 'logo_url',
        rect: { x: 460, y: 200, w: 160, h: 160 },
        coverColor: '#ffffff' },
      { type: 'text', field: 'challengeName', fallback: 'Product',
        rect: { x: 80, y: 880, w: 920, h: 120 },
        coverColor: '#0a0a0f',
        style: { fontSize: 60, fontWeight: 'bold', color: '#ffffff',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 1 } },
      { type: 'text', field: 'biggestPain', fallback: 'Pain point',
        rect: { x: 80, y: 1020, w: 920, h: 120 },
        coverColor: '#0a0a0f',
        style: { fontSize: 56, fontWeight: 'bold', color: '#ffffff',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 1 } },
      { type: 'text', field: 'ctaStyle', fallback: 'Claim offer',
        rect: { x: 200, y: 1200, w: 680, h: 120 },
        coverColor: '#4ec8d2', coverRadius: 60,
        style: { fontSize: 42, fontWeight: 'bold', color: '#0a0a0f',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 1 } },
      { type: 'text', field: 'promise', fallback: 'Key messaging',
        rect: { x: 180, y: 1360, w: 720, h: 90 },
        coverColor: '#0a0a0f',
        style: { fontSize: 34, fontWeight: 'bold', color: '#ffffff',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 1 } },
      { type: 'image', field: 'logo_url',
        rect: { x: 460, y: 1700, w: 160, h: 160 },
        coverColor: '#ffffff' }
    ]
  },

  /* ---- Template 18 — "Notes Myth-Busting" ------------ */
  {
    id: '18', file: 'templates/18.png',
    title: 'Template 18 — Notes Myth-Busting',
    canvaUrl: 'https://www.canva.com/d/7j7Krke3YVDLQAL',
    slots: [
      { type: 'text', field: 'biggestPain', fallback: 'Address pain point',
        rect: { x: 100, y: 200, w: 880, h: 130 },
        coverColor: '#fafafa',
        style: { fontSize: 48, fontWeight: 'bold', color: '#1a1a2e',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 1 } },
      { type: 'text', field: 'feature.0', fallback: 'Myth 1',
        rect: { x: 100, y: 480, w: 500, h: 80 },
        coverColor: '#fafafa',
        style: { fontSize: 30, fontWeight: 'normal', color: '#1a1a2e',
                 align: 'left', valign: 'middle', maxLines: 1 } },
      { type: 'text', field: 'feature.1', fallback: 'Myth 2',
        rect: { x: 100, y: 580, w: 500, h: 80 },
        coverColor: '#fafafa',
        style: { fontSize: 30, fontWeight: 'normal', color: '#1a1a2e',
                 align: 'left', valign: 'middle', maxLines: 1 } },
      { type: 'text', field: 'feature.2', fallback: 'Myth 3',
        rect: { x: 100, y: 680, w: 500, h: 80 },
        coverColor: '#fafafa',
        style: { fontSize: 30, fontWeight: 'normal', color: '#1a1a2e',
                 align: 'left', valign: 'middle', maxLines: 1 } },
      { type: 'text', field: 'feature.3', fallback: 'Myth 4',
        rect: { x: 100, y: 780, w: 500, h: 80 },
        coverColor: '#fafafa',
        style: { fontSize: 30, fontWeight: 'normal', color: '#1a1a2e',
                 align: 'left', valign: 'middle', maxLines: 1 } },
      { type: 'text', field: 'challengeName', fallback: 'Product',
        rect: { x: 100, y: 1020, w: 360, h: 110 },
        coverColor: '#fafafa', coverRadius: 55,
        style: { fontSize: 32, fontWeight: 'bold', color: '#1a1a2e',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 1 } },
      { type: 'image', field: 'app_url',
        rect: { x: 520, y: 1040, w: 220, h: 360 },
        coverColor: '#ffffff' },
      { type: 'image', field: 'app_url',
        rect: { x: 760, y: 1040, w: 220, h: 360 },
        coverColor: '#ffffff' },
      { type: 'text', field: 'ctaStyle', fallback: 'Offer / Solution',
        rect: { x: 80, y: 1500, w: 920, h: 130 },
        coverColor: '#1f3a5f', coverRadius: 65,
        style: { fontSize: 40, fontWeight: 'bold', color: '#ffffff',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 1 } }
    ]
  },

  /* ---- Template 19 — "The Search" --------------------- */
  {
    id: '19', file: 'templates/19.png',
    title: 'Template 19 — The Search',
    canvaUrl: 'https://www.canva.com/d/I7ySElLPd9jXOly',
    slots: [
      { type: 'text', field: 'biggestPain', fallback: 'pain point of ideal customer',
        rect: { x: 160, y: 580, w: 800, h: 90 },
        coverColor: '#ffffff', coverRadius: 45,
        style: { fontSize: 36, fontWeight: 'bold', color: '#1a1a2e',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 1 } },
      { type: 'image', field: 'app_url',
        rect: { x: 180, y: 990, w: 300, h: 470 },
        coverColor: '#e8f4fd' },
      { type: 'image', field: 'app_url',
        rect: { x: 600, y: 940, w: 300, h: 470 },
        coverColor: '#e8f4fd' },
      { type: 'text', field: 'ctaStyle', fallback: 'Join now',
        rect: { x: 320, y: 1540, w: 440, h: 90 },
        coverColor: '#1a3a4d', coverRadius: 50,
        style: { fontSize: 38, fontWeight: 'bold', color: '#ffffff',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 1 } }
    ]
  },

  /* ---- Template 20 — "Sale Banner" --------------------- */
  {
    id: '20', file: 'templates/20.png',
    title: 'Template 20 — Sale Banner',
    canvaUrl: 'https://www.canva.com/d/xyL0bA4iwxnjMRr',
    slots: [
      { type: 'text', field: 'challengeName', fallback: 'Sale name',
        rect: { x: 100, y: 1020, w: 880, h: 130 },
        coverColor: '#f0f0f2',
        style: { fontSize: 48, fontWeight: 'bold', color: '#1a1a2e',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 1 } },
      { type: 'text', field: 'ctaStyle', fallback: 'Offer X% off',
        rect: { x: 200, y: 1180, w: 680, h: 110 },
        coverColor: '#d94343',
        style: { fontSize: 40, fontWeight: 'bold', color: '#ffffff',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 1 } }
    ]
  },

  /* ---- Template 21 — "Sale" --------------------------- */
  {
    id: '21', file: 'templates/21.png',
    title: 'Template 21 — Sale',
    canvaUrl: 'https://www.canva.com/d/Wz4w97BpH9K3EXA',
    slots: [
      { type: 'image', field: 'app_url',
        rect: { x: 300, y: 620, w: 230, h: 420 },
        coverColor: '#e8f4fd' },
      { type: 'image', field: 'app_url',
        rect: { x: 560, y: 620, w: 230, h: 420 },
        coverColor: '#e8f4fd' },
      { type: 'text', field: 'challengeName', fallback: 'Your launch',
        rect: { x: 130, y: 1180, w: 820, h: 110 },
        coverColor: '#0a0a0f',
        style: { fontSize: 60, fontWeight: '900', color: '#ffffff',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 1 } },
      { type: 'text', field: 'ctaStyle', fallback: 'Sale ends soon',
        rect: { x: 230, y: 1310, w: 620, h: 90 },
        coverColor: '#d94343',
        style: { fontSize: 44, fontWeight: '900', color: '#ffffff',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 1 } }
    ]
  }
];
