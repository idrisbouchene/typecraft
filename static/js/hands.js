/* ═══════════════════════════════════════════════════════════
   TypeCraft — hands.js  (v4 — Overlay Style like reference image)

   Design: Semi-transparent thin-stroke SVG hands
   ✅ Placed ABOVE keyboard (position:absolute overlay)
   ✅ Thin gray outlines — not cartoonish
   ✅ Active finger turns blue (neon)
   ✅ Fingers move toward target key
   ✅ Press animation
   ✅ pointer-events:none — keyboard stays clickable
   ✅ LTR always — no RTL on keyboard
═══════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────
   FINGER → KEY POSITION MAP
   Maps each finger to its column index in the keyboard row.
   Used to calculate translateX offset for movement.
   
   Keyboard column indices (0-based from left):
   Row 1 (top):  Tab=0, q=1, w=2, e=3, r=4, t=5, y=6, u=7, i=8, o=9, p=10
   Row 2 (home): Caps=0, a=1, s=2, d=3, f=4, g=5, h=6, j=7, k=8, l=9
   Row 3 (bot):  Shift=0, z=1, x=2, c=3, v=4, b=5, n=6, m=7
───────────────────────────────────────────────────────── */

/* Physical column positions of home-row resting fingers (% of keyboard width) */
const HOME_POSITIONS = {
  'pinky-l':  10.5,   // A key
  'ring-l':   17.5,   // S key
  'middle-l': 24.5,   // D key
  'index-l':  31.5,   // F key
  'thumb':    50.0,   // Space
  'index-r':  55.5,   // J key
  'middle-r': 62.5,   // K key
  'ring-r':   69.5,   // L key
  'pinky-r':  76.5,   // ; key
};

/* Key → finger mapping for all 3 layouts */
const KEY_FINGER_MAP = {
  en: {
    // Numbers row
    '`':'-','1':'pinky-l','2':'ring-l','3':'middle-l','4':'index-l','5':'index-l',
    '6':'index-r','7':'index-r','8':'middle-r','9':'ring-r','0':'pinky-r',
    '-':'pinky-r','=':'pinky-r',
    // Top row
    'q':'pinky-l','w':'ring-l','e':'middle-l','r':'index-l','t':'index-l',
    'y':'index-r','u':'index-r','i':'middle-r','o':'ring-r','p':'pinky-r',
    '[':'pinky-r',']':'pinky-r','\\':'pinky-r',
    // Home row
    'a':'pinky-l','s':'ring-l','d':'middle-l','f':'index-l','g':'index-l',
    'h':'index-r','j':'index-r','k':'middle-r','l':'ring-r',';':'pinky-r',"'":'pinky-r',
    // Bottom row
    'z':'pinky-l','x':'ring-l','c':'middle-l','v':'index-l','b':'index-l',
    'n':'index-r','m':'index-r',',':'middle-r','.':'ring-r','/':'pinky-r',
    // Space
    ' ': 'thumb',
  },
  fr: {
    // Numbers
    '&':'pinky-l','é':'ring-l','"':'middle-l',"'":'index-l','(':'index-l',
    '-':'index-r','è':'index-r','_':'middle-r','ç':'ring-r','à':'pinky-r',
    ')':'pinky-r','=':'pinky-r',
    // Top (AZERTY)
    'a':'pinky-l','z':'ring-l','e':'middle-l','r':'index-l','t':'index-l',
    'y':'index-r','u':'index-r','i':'middle-r','o':'ring-r','p':'pinky-r',
    '^':'pinky-r','$':'pinky-r',
    // Home
    'q':'pinky-l','s':'ring-l','d':'middle-l','f':'index-l','g':'index-l',
    'h':'index-r','j':'index-r','k':'middle-r','l':'ring-r','m':'pinky-r','ù':'pinky-r',
    // Bottom
    'w':'ring-l','x':'middle-l','c':'index-l','v':'index-l','b':'index-r',
    'n':'index-r',',':'middle-r',';':'ring-r',':':'ring-r','!':'pinky-r',
    ' ': 'thumb',
  },
  ar: {
    // Arabic home row → same physical fingers as QWERTY
    'ش':'pinky-l','س':'ring-l','ي':'middle-l','ب':'index-l','ل':'index-l',
    'ا':'index-r','ت':'index-r','ن':'middle-r','م':'ring-r','ك':'pinky-r','ط':'pinky-r',
    // Arabic top row
    'ض':'pinky-l','ص':'ring-l','ث':'middle-l','ق':'index-l','ف':'index-l',
    'غ':'index-r','ع':'index-r','ه':'middle-r','خ':'ring-r','ح':'pinky-r','ج':'pinky-r','د':'pinky-r',
    // Arabic bottom row
    'ئ':'pinky-l','ء':'ring-l','ؤ':'middle-l','ر':'index-l','ى':'index-l',
    'ة':'index-r','و':'index-r','ز':'middle-r','ظ':'ring-r',
    // Arabic numbers
    '١':'pinky-l','٢':'ring-l','٣':'middle-l','٤':'index-l','٥':'index-l',
    '٦':'index-r','٧':'index-r','٨':'middle-r','٩':'ring-r','٠':'pinky-r',
    ' ': 'thumb',
  },
};

/* Which row each key lives on (0=numbers,1=top,2=home,3=bottom,4=space) */
const KEY_ROW_MAP = {
  en: {
    '`':0,'1':0,'2':0,'3':0,'4':0,'5':0,'6':0,'7':0,'8':0,'9':0,'0':0,'-':0,'=':0,
    'q':1,'w':1,'e':1,'r':1,'t':1,'y':1,'u':1,'i':1,'o':1,'p':1,'[':1,']':1,'\\':1,
    'a':2,'s':2,'d':2,'f':2,'g':2,'h':2,'j':2,'k':2,'l':2,';':2,"'":2,
    'z':3,'x':3,'c':3,'v':3,'b':3,'n':3,'m':3,',':3,'.':3,'/':3,
    ' ':4,
  },
  fr: {
    '&':0,'é':0,'"':0,"'":0,'(':0,'-':0,'è':0,'_':0,'ç':0,'à':0,')':0,'=':0,
    'a':1,'z':1,'e':1,'r':1,'t':1,'y':1,'u':1,'i':1,'o':1,'p':1,'^':1,'$':1,
    'q':2,'s':2,'d':2,'f':2,'g':2,'h':2,'j':2,'k':2,'l':2,'m':2,'ù':2,
    'w':3,'x':3,'c':3,'v':3,'b':3,'n':3,',':3,';':3,':':3,'!':3,
    ' ':4,
  },
  ar: {
    '١':0,'٢':0,'٣':0,'٤':0,'٥':0,'٦':0,'٧':0,'٨':0,'٩':0,'٠':0,
    'ض':1,'ص':1,'ث':1,'ق':1,'ف':1,'غ':1,'ع':1,'ه':1,'خ':1,'ح':1,'ج':1,'د':1,
    'ش':2,'س':2,'ي':2,'ب':2,'ل':2,'ا':2,'ت':2,'ن':2,'م':2,'ك':2,'ط':2,
    'ئ':3,'ء':3,'ؤ':3,'ر':3,'ى':3,'ة':3,'و':3,'ز':3,'ظ':3,
    ' ':4,
  },
};

/* Horizontal column position (% of keyboard width) for each key */
const KEY_COL_PCT = {
  en: {
    '`':2.5,'1':6,'2':10,'3':14,'4':18,'5':22,'6':26,'7':30,'8':34,'9':38,'0':42,'-':46,'=':50,
    'q':5,'w':9,'e':13,'r':17,'t':21,'y':25,'u':29,'i':33,'o':37,'p':41,'[':45,']':49,'\\':54,
    'a':6,'s':10,'d':14,'f':18,'g':22,'h':26,'j':30,'k':34,'l':38,';':42,"'":46,
    'z':8,'x':12,'c':16,'v':20,'b':24,'n':28,'m':32,',':36,'.':40,'/':44,
    ' ':50,
  },
  fr: {
    '&':6,'é':10,'"':14,"'":18,'(':22,'-':26,'è':30,'_':34,'ç':38,'à':42,')':46,'=':50,
    'a':5,'z':9,'e':13,'r':17,'t':21,'y':25,'u':29,'i':33,'o':37,'p':41,'^':45,'$':49,
    'q':6,'s':10,'d':14,'f':18,'g':22,'h':26,'j':30,'k':34,'l':38,'m':42,'ù':46,
    'w':8,'x':12,'c':16,'v':20,'b':24,'n':28,',':32,';':36,':':40,'!':44,
    ' ':50,
  },
  ar: {
    '١':6,'٢':10,'٣':14,'٤':18,'٥':22,'٦':26,'٧':30,'٨':34,'٩':38,'٠':42,
    'ض':5,'ص':9,'ث':13,'ق':17,'ف':21,'غ':25,'ع':29,'ه':33,'خ':37,'ح':41,'ج':45,'د':49,
    'ش':6,'س':10,'ي':14,'ب':18,'ل':22,'ا':26,'ت':30,'ن':34,'م':38,'ك':42,'ط':46,
    'ئ':8,'ء':12,'ؤ':16,'ر':20,'ى':24,'ة':28,'و':32,'ز':36,'ظ':40,
    ' ':50,
  },
};

/* Row vertical offset in SVG units from home row (hands viewBox is 0-100% of keyboard height) */
const ROW_Y_OFFSET = { 0: -3.2, 1: -2.1, 2: 0, 3: 2.1, 4: 3.4 };

/* ─────────────────────────────────────────────────────────
   HAND SVG BUILDER
   Generates thin-stroke semi-transparent hand SVG
   that matches the reference image style
───────────────────────────────────────────────────────── */
function buildOverlayHandSVG(side) {
  const isLeft = side === 'left';
  /* 
    ViewBox: 0 0 200 280
    Hand positioned so fingertips align with keyboard rows.
    All elements use stroke-only with very low fill opacity.
  */

  /* Finger definitions: [id, tipX, tipY, ctrlX1, ctrlY1, ctrlX2, ctrlY2, baseX, baseY] 
     Each finger is a thin curved shape using path */
  const fingers = isLeft ? [
    // [suffix, tipX, tipY, w, knuckleY, baseY, rot-deg]
    { id:'pinky',  tx:28,  ty:28, w:14, ky:120, by:165, r:-18 },
    { id:'ring',   tx:60,  ty:14, w:16, ky:118, by:162, r:-8  },
    { id:'middle', tx:92,  ty:8,  w:17, ky:116, by:160, r:-1  },
    { id:'index',  tx:122, ty:16, w:16, ky:118, by:163, r: 9  },
    { id:'thumb',  tx:158, ty:90, w:19, ky:148, by:178, r: 46 },
  ] : [
    { id:'index',  tx:42,  ty:16, w:16, ky:118, by:163, r:-9  },
    { id:'middle', tx:72,  ty:8,  w:17, ky:116, by:160, r: 1  },
    { id:'ring',   tx:104, ty:14, w:16, ky:118, by:162, r: 8  },
    { id:'pinky',  tx:136, ty:28, w:14, ky:120, by:165, r:18  },
    { id:'thumb',  tx:18,  ty:90, w:19, ky:148, by:178, r:-46 },
  ];

  const svgFingers = fingers.map(f => {
    const hx = f.tx, hy = f.ty;
    const hw = f.w, hr = f.r;
    const fid = `${side[0]}h-${f.id}`;
    const cx  = hx + hw / 2;
    const halfW = hw / 2;
    const fullH = f.by - f.ty;

    /* Curved finger shape: two bezier curves for sides */
    const path = `
      M ${cx - halfW},${f.by}
      C ${cx - halfW},${f.ky} ${cx - halfW + 1},${hy + fullH * .32} ${cx - halfW * .6},${hy + fullH * .08}
      Q ${cx},${hy - 2} ${cx + halfW * .6},${hy + fullH * .08}
      C ${cx + halfW - 1},${hy + fullH * .32} ${cx + halfW},${f.ky} ${cx + halfW},${f.by}
      Z`;

    /* Knuckle lines */
    const k1y = f.ky - 20;
    const k2y = f.ky + 10;

    return `
    <g id="${fid}" class="ohf" data-finger="${
      side === 'left'
        ? (f.id === 'thumb' ? 'thumb' : `${f.id}-l`)
        : (f.id === 'thumb' ? 'thumb' : `${f.id}-r`)
    }"
       style="transform-origin:${cx}px ${f.by}px; transform:rotate(${hr}deg)">
      <!-- Finger body -->
      <path d="${path}" class="ohf-body"/>
      <!-- Knuckle lines -->
      <line x1="${cx - halfW + 2}" y1="${k1y}" x2="${cx + halfW - 2}" y2="${k1y}" class="ohf-knuckle"/>
      <line x1="${cx - halfW + 2}" y1="${k2y}" x2="${cx + halfW - 2}" y2="${k2y}" class="ohf-knuckle"/>
      <!-- Fingertip cap -->
      <ellipse cx="${cx}" cy="${hy + 5}" rx="${halfW}" ry="${halfW * .8}" class="ohf-tip"/>
      <!-- Active glow circle (hidden by default) -->
      <ellipse cx="${cx}" cy="${hy + 5}" rx="${halfW + 3}" ry="${halfW + 3}" class="ohf-glow"/>
    </g>`;
  }).join('');

  /* Palm shape */
  const palm = isLeft
    ? `<path d="M 22,165 Q 18,210 24,235 Q 40,248 80,250 Q 120,250 148,242
               Q 160,230 162,208 Q 164,185 158,165 Q 140,150 118,148
               L 95,146 Q 68,148 45,146 L 28,150 Q 20,155 22,165 Z"
           class="ohf-palm"/>`
    : `<path d="M 18,165 Q 12,185 12,208 Q 14,230 26,242 Q 54,250 94,250
               Q 134,248 150,235 Q 156,210 152,165 Q 146,150 130,148
               L 107,146 Q 82,148 58,146 L 38,150 Q 22,155 18,165 Z"
           class="ohf-palm"/>`;

  return `
<svg id="ohf-svg-${side}" viewBox="0 0 180 260"
     class="overlay-hand-svg overlay-hand-${side}"
     xmlns="http://www.w3.org/2000/svg"
     style="pointer-events:none">
  <defs>
    <filter id="ohf-glow-${side}" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <!-- Palm -->
  ${palm}
  <!-- Fingers -->
  ${svgFingers}
</svg>`;
}

/* ─────────────────────────────────────────────────────────
   CLASS: HandsOverlay
   Renders SVG hands ABOVE the keyboard (absolute overlay)
───────────────────────────────────────────────────────── */
class HandsOverlay {
  /**
   * @param {string} keyboardContainerId  — the .vkb container id
   * @param {string} language
   * @param {object} engine               — TypingEngine reference
   */
  constructor(keyboardContainerId, language, engine) {
    this.kbContainer  = document.getElementById(keyboardContainerId);
    this.language     = language;
    this.engine       = engine;
    this._timers      = [];
    this._activeFinger = null;
    this._visible     = true;

    if (!this.kbContainer) return;
    this._build();
    this._bindToEngine();
  }

  /* ── Build overlay inside keyboard container ─────────── */
  _build() {
    /* Make keyboard container relative-positioned */
    const vkbRoot = this.kbContainer.querySelector('#vkb-root') || this.kbContainer;
    vkbRoot.style.position = 'relative';

    /* Create overlay wrapper */
    const overlay = document.createElement('div');
    overlay.id        = 'hands-overlay';
    overlay.className = 'hands-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `
      ${buildOverlayHandSVG('left')}
      ${buildOverlayHandSVG('right')}`;

    /* Insert overlay INSIDE vkb after vkb__rows */
    const rowsEl = vkbRoot.querySelector('#vkb-rows');
    if (rowsEl) {
      vkbRoot.insertBefore(overlay, rowsEl.nextSibling);
    } else {
      vkbRoot.appendChild(overlay);
    }

    /* Controls row */
    const ctrl = document.createElement('div');
    ctrl.className = 'hands-ctrl-row';
    ctrl.innerHTML = `
      <span class="hands-hint-text" id="ohf-hint">
        <span class="ohf-arrow" id="ohf-arrow">↑</span>
        <span id="ohf-label">Place fingers on home row</span>
      </span>
      <button class="hands-ctrl-btn" id="ohf-toggle">Hide Hands</button>`;
    vkbRoot.appendChild(ctrl);

    document.getElementById('ohf-toggle')?.addEventListener('click', (e) => {
      this._visible = !this._visible;
      overlay.style.display = this._visible ? 'block' : 'none';
      e.target.textContent   = this._visible ? 'Hide Hands' : 'Show Hands';
    });

    /* Initial: show home row fingers */
    this._resetToHomeRow();
  }

  /* ── Bind to engine ─────────────────────────────────────── */
  _bindToEngine() {
    if (!this.engine) return;
    const cap = this.engine.captureEl;

    cap.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' || e.key.length > 1) return;
      const ch   = e.key;
      const info = this._getKeyInfo(ch);
      if (!info) return;
      requestAnimationFrame(() => {
        const idx     = this.engine.typed.length - 1;
        const correct = (this.engine.typed[idx] === this.engine.text[idx]);
        this._pressKey(info, correct);
      });
    });

    /* Preview next key */
    cap.addEventListener('keyup', () => {
      const t = setTimeout(() => this._previewNextKey(), 40);
      this._timers.push(t);
    });

    /* Initial preview */
    setTimeout(() => this._previewNextKey(), 600);
  }

  /* ── Preview next character ─────────────────────────────── */
  _previewNextKey() {
    const idx  = this.engine?.typed.length ?? 0;
    const next = this.engine?.text[idx] ?? '';
    if (!next) return;

    const info = this._getKeyInfo(next);
    if (!info) return;
    this._highlightFinger(info, 'preview');
    this._updateHint(info);
  }

  /* ── Press animation ────────────────────────────────────── */
  _pressKey(info, correct) {
    this._clearActive();
    const el = this._getFingerEl(info.finger);
    if (!el) return;

    el.classList.add(correct ? 'ohf-press' : 'ohf-error');
    el.style.setProperty('--active-color', correct ? '#3b82f6' : '#ef4444');

    const t = setTimeout(() => {
      el.classList.remove('ohf-press','ohf-error');
    }, correct ? 350 : 450);
    this._timers.push(t);

    this._updateHint(info);
    const t2 = setTimeout(() => this._previewNextKey(), 120);
    this._timers.push(t2);
  }

  /* ── Highlight finger (preview state) ──────────────────── */
  _highlightFinger(info, state) {
    this._clearActive();
    this._activeFinger = info.finger;
    const el = this._getFingerEl(info.finger);
    if (!el) return;
    el.classList.add('ohf-preview');
    el.style.setProperty('--active-color', '#3b82f6');

    /* Move finger toward target key */
    this._moveFingerToKey(el, info);
  }

  /* ── Move finger SVG toward key position ───────────────── */
  _moveFingerToKey(fingerEl, info) {
    const colPct  = KEY_COL_PCT[this.language]?.[info.key.toLowerCase()] ?? 50;
    const rowIdx  = KEY_ROW_MAP[this.language]?.[info.key.toLowerCase()] ?? 2;
    const rowDy   = ROW_Y_OFFSET[rowIdx] ?? 0;

    /* Home position of this finger */
    const homePct = HOME_POSITIONS[info.finger] ?? 50;
    const dx      = (colPct - homePct) * 1.6;   /* scale px */
    const dy      = rowDy * 8;                   /* scale px */

    fingerEl.style.transition = 'transform 0.18s cubic-bezier(.25,.8,.25,1)';
    fingerEl.style.transform  = `translate(${dx}px, ${dy}px)`;
  }

  /* ── Reset finger to home position ─────────────────────── */
  _returnFingerHome(fingerEl) {
    fingerEl.style.transition = 'transform 0.22s cubic-bezier(.4,0,.2,1)';
    fingerEl.style.transform  = '';
  }

  /* ── Clear all active states ────────────────────────────── */
  _clearActive() {
    if (this._activeFinger) {
      const el = this._getFingerEl(this._activeFinger);
      if (el) {
        el.classList.remove('ohf-preview','ohf-press','ohf-error');
        this._returnFingerHome(el);
      }
      this._activeFinger = null;
    }
    /* Also clear any stray states */
    document.querySelectorAll('.ohf.ohf-preview, .ohf.ohf-press, .ohf.ohf-error')
      .forEach(el => {
        el.classList.remove('ohf-preview','ohf-press','ohf-error');
        this._returnFingerHome(el);
      });
  }

  /* ── Reset all fingers to home row ─────────────────────── */
  _resetToHomeRow() {
    document.querySelectorAll('.ohf').forEach(el => {
      el.classList.remove('ohf-preview','ohf-press','ohf-error');
      el.style.transform = '';
    });
    this._activeFinger = null;
  }

  /* ── Update hint text ─────────────────────────────────────*/
  _updateHint(info) {
    const labels = {
      'pinky-l':'Left Pinky', 'ring-l':'Left Ring', 'middle-l':'Left Middle', 'index-l':'Left Index',
      'thumb':'Thumb',
      'index-r':'Right Index','middle-r':'Right Middle','ring-r':'Right Ring','pinky-r':'Right Pinky',
    };
    const lbl   = labels[info.finger] ?? info.finger;
    const arrow = (info.finger.endsWith('-l') || info.finger === 'thumb') ? '←' : '→';

    const labelEl = document.getElementById('ohf-label');
    const arrowEl = document.getElementById('ohf-arrow');
    if (labelEl) labelEl.textContent = `${lbl} — press "${info.key}"`;
    if (arrowEl) arrowEl.textContent = arrow;
  }

  /* ── Helpers ────────────────────────────────────────────── */
  _getKeyInfo(ch) {
    const lang   = this.language;
    const finger = KEY_FINGER_MAP[lang]?.[ch] || KEY_FINGER_MAP[lang]?.[ch.toLowerCase()];
    if (!finger) return null;
    return { key: ch, finger };
  }

  _getFingerEl(fingerName) {
    /* Map finger name to SVG element id */
    const side   = fingerName.endsWith('-l') ? 'left' : fingerName === 'thumb' ? 'left' : 'right';
    const suffix = fingerName.replace('-l','').replace('-r','');
    return document.getElementById(`${side[0]}h-${suffix}`);
  }

  /* ── Public: reset (on lesson restart) ─────────────────── */
  reset() {
    this._timers.forEach(clearTimeout);
    this._timers = [];
    this._resetToHomeRow();
    const labelEl = document.getElementById('ohf-label');
    if (labelEl) labelEl.textContent = 'Place fingers on home row';
  }

  /* ── Compatibility: old API (called from keyboard.js) ──── */
  onKeyPress(keyData, correct) {
    if (!keyData) return;
    this._pressKey({ key: keyData.key, finger: keyData.finger }, correct);
  }
  showNextKey(keyData) {
    if (!keyData) return;
    this._highlightFinger({ key: keyData.key, finger: keyData.finger }, 'preview');
    this._updateHint({ key: keyData.key, finger: keyData.finger });
  }
}

/* ── Backward compat alias ──────────────────────────────── */
const HandsDisplay = HandsOverlay;
