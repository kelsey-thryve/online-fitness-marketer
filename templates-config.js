/* ============================================================
   TRAINER LAUNCH — Ad Template Manifest
   The 21 wireframe-style Canva templates available to subscribers.

   slots[] drives the "with your branding" personalized preview
   (see templates-renderer.js). Coordinates are in 1080x1920
   canvas space. Templates without a slots[] config just show
   the original PNG with no overlay.
   ============================================================ */

export const AD_TEMPLATES = [

  /* ---- Template 01 — "Reminder Card" -------------------- */
  {
    id: '1',  file: 'templates/1.png',
    title: 'Template 01 — Reminder Card',
    canvaUrl: 'https://www.canva.com/d/EnObVYAyRVU_N0_',
    slots: [
      // [WEBSITE] tag in top-right of card
      { type: 'text', field: 'handle', fallback: '@yourbrand',
        rect: { x: 600, y: 470, w: 320, h: 60 },
        coverColor: '#4ec8d2',
        style: { fontSize: 30, fontWeight: 'bold', color: '#1a1a2e',
                 align: 'right', valign: 'middle', maxLines: 1 } },
      // Big "25% OFF" headline
      { type: 'text', field: 'ctaStyle', fallback: '25% OFF',
        rect: { x: 130, y: 620, w: 820, h: 160 },
        coverColor: '#4ec8d2',
        style: { fontSize: 130, fontWeight: '900', color: '#1a1a2e',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 1 } },
      // Subtext under headline
      { type: 'text', field: 'promise', fallback: 'Custom Training & Nutrition Programs',
        rect: { x: 130, y: 790, w: 820, h: 200 },
        coverColor: '#4ec8d2',
        style: { fontSize: 56, fontWeight: 'bold', color: '#1a1a2e',
                 align: 'center', valign: 'middle', maxLines: 2 } }
    ]
  },

  /* ---- Template 02 ------------------------------------- */
  { id: '2',  file: 'templates/2.png',
    title: 'Template 02', canvaUrl: 'https://www.canva.com/d/DxDxIoYuL0WqI_Y', slots: [] },

  /* ---- Template 03 ------------------------------------- */
  { id: '3',  file: 'templates/3.png',
    title: 'Template 03', canvaUrl: 'https://www.canva.com/d/uPH6J1ySpDAtOle', slots: [] },

  /* ---- Template 04 ------------------------------------- */
  { id: '4',  file: 'templates/4.png',
    title: 'Template 04', canvaUrl: 'https://www.canva.com/d/ys9Kv05QQhlhxpK', slots: [] },

  /* ---- Template 05 — "Instagram Mockup" ---------------- */
  {
    id: '5',  file: 'templates/5.png',
    title: 'Template 05 — Instagram Mockup',
    canvaUrl: 'https://www.canva.com/d/RhbwKVq3c6NcZvI',
    slots: [
      // Profile photo in mock IG post
      { type: 'image', field: 'photo_url',
        rect: { x: 80, y: 480, w: 460, h: 580 },
        coverColor: '#1a1a22' },
      // @handle text above photo
      { type: 'text', field: 'handle', fallback: '@yourbrand',
        rect: { x: 175, y: 405, w: 340, h: 60 },
        coverColor: '#ffffff',
        style: { fontSize: 32, fontWeight: 'bold', color: '#1a1a2e',
                 align: 'left', valign: 'middle', maxLines: 1 } },
      // KEY MESSAGING — right side
      { type: 'text', field: 'promise', fallback: 'Key messaging here',
        rect: { x: 600, y: 480, w: 430, h: 290 },
        coverColor: null,
        style: { fontSize: 72, fontWeight: '900', color: '#1a1a2e',
                 align: 'left', valign: 'top', transform: 'upper', maxLines: 4 } },
      // OFFER — right side, below messaging
      { type: 'text', field: 'ctaStyle', fallback: 'JOIN NOW',
        rect: { x: 600, y: 820, w: 430, h: 110 },
        coverColor: null,
        style: { fontSize: 64, fontWeight: '900', color: '#1a1a2e',
                 align: 'left', valign: 'top', transform: 'upper', maxLines: 1 } }
    ]
  },

  /* ---- Template 06 ------------------------------------- */
  { id: '6',  file: 'templates/6.png',
    title: 'Template 06', canvaUrl: 'https://www.canva.com/d/d4v1j6DRZjFLnWf', slots: [] },

  /* ---- Template 07 ------------------------------------- */
  { id: '7',  file: 'templates/7.png',
    title: 'Template 07', canvaUrl: 'https://www.canva.com/d/KZILjAM8Gr6fxEC', slots: [] },

  /* ---- Template 08 ------------------------------------- */
  { id: '8',  file: 'templates/8.png',
    title: 'Template 08', canvaUrl: 'https://www.canva.com/d/GTkK_1qU__WaoMa', slots: [] },

  /* ---- Template 09 ------------------------------------- */
  { id: '9',  file: 'templates/9.png',
    title: 'Template 09', canvaUrl: 'https://www.canva.com/d/cQgw_jvdebzUw7I', slots: [] },

  /* ---- Template 10 ------------------------------------ */
  { id: '10', file: 'templates/10.png',
    title: 'Template 10', canvaUrl: 'https://www.canva.com/d/dfzLdn3hHua9GIh', slots: [] },

  /* ---- Template 11 ------------------------------------ */
  { id: '11', file: 'templates/11.png',
    title: 'Template 11', canvaUrl: 'https://www.canva.com/d/0WG_iW3mYEc2m4-', slots: [] },

  /* ---- Template 12 ------------------------------------ */
  { id: '12', file: 'templates/12.png',
    title: 'Template 12', canvaUrl: 'https://www.canva.com/d/7gM9u42cCTsgynw', slots: [] },

  /* ---- Template 13 — "Pain Point + Features" --------- */
  {
    id: '13', file: 'templates/13.png',
    title: 'Template 13 — Pain Point + Features',
    canvaUrl: 'https://www.canva.com/d/4SCDbGFknwIuleo',
    slots: [
      // Big white "[SOLVE PAIN POINT]" title at top
      { type: 'text', field: 'biggestPain', fallback: 'Solve their biggest pain',
        rect: { x: 80, y: 540, w: 920, h: 280 },
        coverColor: '#000000',
        style: { fontSize: 130, fontWeight: '900', color: '#ffffff',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 3 } },
      // "[KEY MESSAGING]" subhead
      { type: 'text', field: 'promise', fallback: 'Key messaging',
        rect: { x: 200, y: 820, w: 680, h: 80 },
        coverColor: '#000000',
        style: { fontSize: 44, fontWeight: 'bold', color: '#ffffff',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 1 } },
      // Left FEATURE pill
      { type: 'text', field: 'feature.0', fallback: 'Feature one',
        rect: { x: 40, y: 1040, w: 380, h: 90 },
        coverColor: '#4ec8d2', coverRadius: 50,
        style: { fontSize: 34, fontWeight: 'bold', color: '#ffffff',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 2 } },
      // Right FEATURE pill (higher up)
      { type: 'text', field: 'feature.1', fallback: 'Feature two',
        rect: { x: 660, y: 1300, w: 380, h: 90 },
        coverColor: '#4ec8d2', coverRadius: 50,
        style: { fontSize: 34, fontWeight: 'bold', color: '#ffffff',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 2 } },
      // Bottom-left FEATURE pill
      { type: 'text', field: 'feature.2', fallback: 'Feature three',
        rect: { x: 40, y: 1560, w: 380, h: 90 },
        coverColor: '#4ec8d2', coverRadius: 50,
        style: { fontSize: 34, fontWeight: 'bold', color: '#ffffff',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 2 } },
      // OFFER pill bottom-centre
      { type: 'text', field: 'ctaStyle', fallback: 'JOIN NOW',
        rect: { x: 290, y: 1740, w: 500, h: 100 },
        coverColor: '#ffffff', coverRadius: 50,
        style: { fontSize: 44, fontWeight: '900', color: '#000000',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 1 } }
    ]
  },

  /* ---- Template 14 ------------------------------------ */
  { id: '14', file: 'templates/14.png',
    title: 'Template 14', canvaUrl: 'https://www.canva.com/d/fN7csU6LmxXE7Cx', slots: [] },

  /* ---- Template 15 ------------------------------------ */
  { id: '15', file: 'templates/15.png',
    title: 'Template 15', canvaUrl: 'https://www.canva.com/d/P8lQptO41j4dDjF', slots: [] },

  /* ---- Template 16 — "Goals vs Solution" ------------- */
  {
    id: '16', file: 'templates/16.png',
    title: 'Template 16 — Goals vs Solution',
    canvaUrl: 'https://www.canva.com/d/B0mFUJAXFe8xqyd',
    slots: [
      // Centre logo
      { type: 'image', field: 'logo_url',
        rect: { x: 470, y: 300, w: 140, h: 140 },
        coverColor: '#ffffff' },
      // 5 pain-point pills on the left
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
      // App screenshot inside phone mockup on the right
      { type: 'image', field: 'app_url',
        rect: { x: 620, y: 720, w: 340, h: 600 },
        coverColor: '#e8f4fd' },
      // [YOUR PRODUCT] pill under phone
      { type: 'text', field: 'challengeName', fallback: 'Your Product',
        rect: { x: 620, y: 1380, w: 340, h: 90 },
        coverColor: '#a8e0ff', coverRadius: 50,
        style: { fontSize: 32, fontWeight: 'bold', color: '#1a1a2e',
                 align: 'center', valign: 'middle', maxLines: 2 } },
      // Full-width [OFFER] pill at bottom
      { type: 'text', field: 'ctaStyle', fallback: 'Join now',
        rect: { x: 80, y: 1560, w: 920, h: 100 },
        coverColor: '#a8e0ff', coverRadius: 50,
        style: { fontSize: 48, fontWeight: '900', color: '#1a1a2e',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 1 } }
    ]
  },

  /* ---- Template 17 ------------------------------------ */
  { id: '17', file: 'templates/17.png',
    title: 'Template 17', canvaUrl: 'https://www.canva.com/d/xouRVwfIVRvlg5s', slots: [] },

  /* ---- Template 18 ------------------------------------ */
  { id: '18', file: 'templates/18.png',
    title: 'Template 18', canvaUrl: 'https://www.canva.com/d/7j7Krke3YVDLQAL', slots: [] },

  /* ---- Template 19 — "The Search" --------------------- */
  {
    id: '19', file: 'templates/19.png',
    title: 'Template 19 — The Search',
    canvaUrl: 'https://www.canva.com/d/I7ySElLPd9jXOly',
    slots: [
      // Pain point in the white search bar
      { type: 'text', field: 'biggestPain', fallback: 'pain point of ideal customer',
        rect: { x: 160, y: 580, w: 800, h: 90 },
        coverColor: '#ffffff', coverRadius: 45,
        style: { fontSize: 36, fontWeight: 'bold', color: '#1a1a2e',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 1 } },
      // Left phone app screenshot
      { type: 'image', field: 'app_url',
        rect: { x: 180, y: 990, w: 300, h: 470 },
        coverColor: '#e8f4fd' },
      // Right phone app screenshot
      { type: 'image', field: 'app_url',
        rect: { x: 600, y: 940, w: 300, h: 470 },
        coverColor: '#e8f4fd' },
      // OFFER pill at the bottom
      { type: 'text', field: 'ctaStyle', fallback: 'Join now',
        rect: { x: 320, y: 1540, w: 440, h: 90 },
        coverColor: '#1a3a4d', coverRadius: 50,
        style: { fontSize: 38, fontWeight: 'bold', color: '#ffffff',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 1 } }
    ]
  },

  /* ---- Template 20 ------------------------------------ */
  { id: '20', file: 'templates/20.png',
    title: 'Template 20', canvaUrl: 'https://www.canva.com/d/xyL0bA4iwxnjMRr', slots: [] },

  /* ---- Template 21 — "SALE" --------------------------- */
  {
    id: '21', file: 'templates/21.png',
    title: 'Template 21 — Sale',
    canvaUrl: 'https://www.canva.com/d/Wz4w97BpH9K3EXA',
    slots: [
      // Left phone app screenshot
      { type: 'image', field: 'app_url',
        rect: { x: 300, y: 620, w: 230, h: 420 },
        coverColor: '#e8f4fd' },
      // Right phone app screenshot
      { type: 'image', field: 'app_url',
        rect: { x: 560, y: 620, w: 230, h: 420 },
        coverColor: '#e8f4fd' },
      // [SALE NAME] white text
      { type: 'text', field: 'challengeName', fallback: 'Your launch',
        rect: { x: 130, y: 1180, w: 820, h: 110 },
        coverColor: '#0a0a0f',
        style: { fontSize: 60, fontWeight: '900', color: '#ffffff',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 1 } },
      // [OFFER X% OFF] red pill
      { type: 'text', field: 'ctaStyle', fallback: 'Sale ends soon',
        rect: { x: 230, y: 1310, w: 620, h: 90 },
        coverColor: '#d94343',
        style: { fontSize: 44, fontWeight: '900', color: '#ffffff',
                 align: 'center', valign: 'middle', transform: 'upper', maxLines: 1 } }
    ]
  }
];
