/* ═══════════════════════════════════════════════════════════
   TypeCraft — keyboard.js  (v3 — LTR keyboard for all langs)
   
   KEY PRINCIPLE:
   ✅ Keyboard container is ALWAYS LTR (physical layout)
   ✅ Arabic characters displayed on normal physical positions
   ✅ RTL only applies to the TEXT/TYPING area (handled by rtl.js)
   ✅ Q stays left, Backspace stays right — always

   Supports: QWERTY (EN) · AZERTY (FR) · Arabic on QWERTY (AR)
═══════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────
   FINGER COLOR MAP
───────────────────────────────────────────────────────── */
const FINGER_COLORS = {
  'pinky-l':  '#e879f9',
  'ring-l':   '#818cf8',
  'middle-l': '#38bdf8',
  'index-l':  '#34d399',
  'thumb':    '#94a3b8',
  'index-r':  '#fb923c',
  'middle-r': '#38bdf8',
  'ring-r':   '#818cf8',
  'pinky-r':  '#e879f9',
};

/* ─────────────────────────────────────────────────────────
   KEYBOARD LAYOUTS
   
   IMPORTANT: ALL layouts use dir:'ltr' — the keyboard is
   always rendered left-to-right like a physical keyboard.
   Arabic layout maps Arabic characters to the same physical
   positions as a standard Arabic keyboard (Windows layout).

   Each key:
   { key, alt?, finger, hand, wide?, xl?, space?, home?, guide?, cls? }
───────────────────────────────────────────────────────── */
const KB_LAYOUTS = {

  /* ══════════════════════════════════════════════════════
     QWERTY — English
     Standard US keyboard layout
  ══════════════════════════════════════════════════════ */
  en: {
    dir: 'ltr',   // ← always ltr
    rows: [
      // Row 0: Numbers
      [
        {key:'`',  alt:'~',  finger:'pinky-l',  hand:'left'},
        {key:'1',  alt:'!',  finger:'pinky-l',  hand:'left'},
        {key:'2',  alt:'@',  finger:'ring-l',   hand:'left'},
        {key:'3',  alt:'#',  finger:'middle-l', hand:'left'},
        {key:'4',  alt:'$',  finger:'index-l',  hand:'left'},
        {key:'5',  alt:'%',  finger:'index-l',  hand:'left'},
        {key:'6',  alt:'^',  finger:'index-r',  hand:'right'},
        {key:'7',  alt:'&',  finger:'index-r',  hand:'right'},
        {key:'8',  alt:'*',  finger:'middle-r', hand:'right'},
        {key:'9',  alt:'(',  finger:'ring-r',   hand:'right'},
        {key:'0',  alt:')',  finger:'pinky-r',  hand:'right'},
        {key:'-',  alt:'_',  finger:'pinky-r',  hand:'right'},
        {key:'=',  alt:'+',  finger:'pinky-r',  hand:'right'},
        {key:'Backspace', cls:'vkey--backspace', finger:'pinky-r', hand:'right'},
      ],
      // Row 1: Top
      [
        {key:'Tab', xl:true,  finger:'pinky-l',  hand:'left'},
        {key:'q',             finger:'pinky-l',  hand:'left'},
        {key:'w',             finger:'ring-l',   hand:'left'},
        {key:'e',             finger:'middle-l', hand:'left'},
        {key:'r',             finger:'index-l',  hand:'left'},
        {key:'t',             finger:'index-l',  hand:'left'},
        {key:'y',             finger:'index-r',  hand:'right'},
        {key:'u',             finger:'index-r',  hand:'right'},
        {key:'i',             finger:'middle-r', hand:'right'},
        {key:'o',             finger:'ring-r',   hand:'right'},
        {key:'p',             finger:'pinky-r',  hand:'right'},
        {key:'[', alt:'{',    finger:'pinky-r',  hand:'right'},
        {key:']', alt:'}',    finger:'pinky-r',  hand:'right'},
        {key:'\\',alt:'|', wide:true, finger:'pinky-r', hand:'right'},
      ],
      // Row 2: Home
      [
        {key:'Caps', xl:true, finger:'pinky-l',  hand:'left'},
        {key:'a', home:true,  finger:'pinky-l',  hand:'left'},
        {key:'s', home:true,  finger:'ring-l',   hand:'left'},
        {key:'d', home:true,  finger:'middle-l', hand:'left'},
        {key:'f', home:true, guide:true, finger:'index-l', hand:'left'},
        {key:'g', home:true,  finger:'index-l',  hand:'left'},
        {key:'h', home:true,  finger:'index-r',  hand:'right'},
        {key:'j', home:true, guide:true, finger:'index-r', hand:'right'},
        {key:'k', home:true,  finger:'middle-r', hand:'right'},
        {key:'l', home:true,  finger:'ring-r',   hand:'right'},
        {key:';', alt:':', home:true, finger:'pinky-r', hand:'right'},
        {key:"'", alt:'"',    finger:'pinky-r',  hand:'right'},
        {key:'Enter', xl:true, finger:'pinky-r', hand:'right'},
      ],
      // Row 3: Bottom
      [
        {key:'Shift', xl:true, finger:'pinky-l', hand:'left'},
        {key:'z',              finger:'pinky-l', hand:'left'},
        {key:'x',              finger:'ring-l',  hand:'left'},
        {key:'c',              finger:'middle-l',hand:'left'},
        {key:'v',              finger:'index-l', hand:'left'},
        {key:'b',              finger:'index-l', hand:'left'},
        {key:'n',              finger:'index-r', hand:'right'},
        {key:'m',              finger:'index-r', hand:'right'},
        {key:',', alt:'<',     finger:'middle-r',hand:'right'},
        {key:'.', alt:'>',     finger:'ring-r',  hand:'right'},
        {key:'/', alt:'?',     finger:'pinky-r', hand:'right'},
        {key:'Shift', xl:true, finger:'pinky-r', hand:'right'},
      ],
      // Row 4: Space
      [
        {key:'Ctrl', wide:true, finger:'pinky-l', hand:'left'},
        {key:'Alt',  wide:true, finger:'thumb',   hand:'left'},
        {key:' ', space:true,   finger:'thumb',   hand:'left'},
        {key:'Alt',  wide:true, finger:'thumb',   hand:'right'},
        {key:'Ctrl', wide:true, finger:'pinky-r', hand:'right'},
      ],
    ],
  },

  /* ══════════════════════════════════════════════════════
     AZERTY — French
     Standard French keyboard layout
  ══════════════════════════════════════════════════════ */
  fr: {
    dir: 'ltr',
    rows: [
      [
        {key:'²',              finger:'pinky-l',  hand:'left'},
        {key:'&',  alt:'1',    finger:'pinky-l',  hand:'left'},
        {key:'é',  alt:'2',    finger:'ring-l',   hand:'left'},
        {key:'"',  alt:'3',    finger:'middle-l', hand:'left'},
        {key:"'",  alt:'4',    finger:'index-l',  hand:'left'},
        {key:'(',  alt:'5',    finger:'index-l',  hand:'left'},
        {key:'-',  alt:'6',    finger:'index-r',  hand:'right'},
        {key:'è',  alt:'7',    finger:'index-r',  hand:'right'},
        {key:'_',  alt:'8',    finger:'middle-r', hand:'right'},
        {key:'ç',  alt:'9',    finger:'ring-r',   hand:'right'},
        {key:'à',  alt:'0',    finger:'pinky-r',  hand:'right'},
        {key:')',  alt:'°',    finger:'pinky-r',  hand:'right'},
        {key:'=',  alt:'+',    finger:'pinky-r',  hand:'right'},
        {key:'Backspace', cls:'vkey--backspace', finger:'pinky-r', hand:'right'},
      ],
      [
        {key:'Tab', xl:true,   finger:'pinky-l',  hand:'left'},
        {key:'a',              finger:'pinky-l',  hand:'left'},
        {key:'z',              finger:'ring-l',   hand:'left'},
        {key:'e',              finger:'middle-l', hand:'left'},
        {key:'r',              finger:'index-l',  hand:'left'},
        {key:'t',              finger:'index-l',  hand:'left'},
        {key:'y',              finger:'index-r',  hand:'right'},
        {key:'u',              finger:'index-r',  hand:'right'},
        {key:'i',              finger:'middle-r', hand:'right'},
        {key:'o',              finger:'ring-r',   hand:'right'},
        {key:'p',              finger:'pinky-r',  hand:'right'},
        {key:'^',  alt:'¨',    finger:'pinky-r',  hand:'right'},
        {key:'$',  alt:'£',    finger:'pinky-r',  hand:'right'},
        {key:'*',  alt:'µ', wide:true, finger:'pinky-r', hand:'right'},
      ],
      [
        {key:'Caps', xl:true,  finger:'pinky-l',  hand:'left'},
        {key:'q', home:true,   finger:'pinky-l',  hand:'left'},
        {key:'s', home:true,   finger:'ring-l',   hand:'left'},
        {key:'d', home:true,   finger:'middle-l', hand:'left'},
        {key:'f', home:true, guide:true, finger:'index-l', hand:'left'},
        {key:'g', home:true,   finger:'index-l',  hand:'left'},
        {key:'h', home:true,   finger:'index-r',  hand:'right'},
        {key:'j', home:true, guide:true, finger:'index-r', hand:'right'},
        {key:'k', home:true,   finger:'middle-r', hand:'right'},
        {key:'l', home:true,   finger:'ring-r',   hand:'right'},
        {key:'m', home:true,   finger:'pinky-r',  hand:'right'},
        {key:'ù',  alt:'%',    finger:'pinky-r',  hand:'right'},
        {key:'Enter', xl:true, finger:'pinky-r',  hand:'right'},
      ],
      [
        {key:'Shift', xl:true, finger:'pinky-l',  hand:'left'},
        {key:'<',  alt:'>',    finger:'pinky-l',  hand:'left'},
        {key:'w',              finger:'ring-l',   hand:'left'},
        {key:'x',              finger:'middle-l', hand:'left'},
        {key:'c',              finger:'index-l',  hand:'left'},
        {key:'v',              finger:'index-l',  hand:'left'},
        {key:'b',              finger:'index-r',  hand:'right'},
        {key:'n',              finger:'index-r',  hand:'right'},
        {key:',',  alt:'?',    finger:'middle-r', hand:'right'},
        {key:';',  alt:'.',    finger:'ring-r',   hand:'right'},
        {key:':',  alt:'/',    finger:'ring-r',   hand:'right'},
        {key:'!',  alt:'§',    finger:'pinky-r',  hand:'right'},
        {key:'Shift', xl:true, finger:'pinky-r',  hand:'right'},
      ],
      [
        {key:'Ctrl',  wide:true, finger:'pinky-l', hand:'left'},
        {key:'Alt',   wide:true, finger:'thumb',   hand:'left'},
        {key:' ', space:true,    finger:'thumb',   hand:'left'},
        {key:'AltGr', wide:true, finger:'thumb',   hand:'right'},
        {key:'Ctrl',  wide:true, finger:'pinky-r', hand:'right'},
      ],
    ],
  },

  /* ══════════════════════════════════════════════════════
     ARABIC — Standard Windows Arabic keyboard
     
     ⚠️  CRITICAL: dir is ALWAYS 'ltr' — keyboard rows go
         left → right like a real physical keyboard.
         We only change the CHARACTER LABELS on the keys.
         Physical positions are identical to QWERTY.
     
     Mapping (physical position → Arabic character):
       Row 0 (numbers):  same numbers + Arabic symbols
       Row 1 (top):      ض ص ث ق ف غ ع ه خ ح ج د ذ
       Row 2 (home):     ش س ي ب ل ا ت ن م ك ط
       Row 3 (bottom):   ئ ء ؤ ر ى ة و ز ظ
  ══════════════════════════════════════════════════════ */
  ar: {
    dir: 'ltr',   // ← ALWAYS LTR — keyboard never reverses
    rows: [
      // Row 0: Numbers row — same positions as QWERTY
      [
        {key:'ذ',              finger:'pinky-l',  hand:'left'},   // ` position
        {key:'١',  alt:'!',    finger:'pinky-l',  hand:'left'},   // 1 position
        {key:'٢',  alt:'@',    finger:'ring-l',   hand:'left'},   // 2 position
        {key:'٣',  alt:'#',    finger:'middle-l', hand:'left'},   // 3 position
        {key:'٤',  alt:'$',    finger:'index-l',  hand:'left'},   // 4 position
        {key:'٥',  alt:'%',    finger:'index-l',  hand:'left'},   // 5 position
        {key:'٦',  alt:'^',    finger:'index-r',  hand:'right'},  // 6 position
        {key:'٧',  alt:'&',    finger:'index-r',  hand:'right'},  // 7 position
        {key:'٨',  alt:'*',    finger:'middle-r', hand:'right'},  // 8 position
        {key:'٩',  alt:'(',    finger:'ring-r',   hand:'right'},  // 9 position
        {key:'٠',  alt:')',    finger:'pinky-r',  hand:'right'},  // 0 position
        {key:'-',  alt:'_',    finger:'pinky-r',  hand:'right'},  // - position
        {key:'=',  alt:'+',    finger:'pinky-r',  hand:'right'},  // = position
        {key:'Backspace', cls:'vkey--backspace', finger:'pinky-r', hand:'right'},
      ],
      // Row 1: Top row — ض ص ث ق ف غ ع ه خ ح ج د
      [
        {key:'Tab', xl:true,   finger:'pinky-l',  hand:'left'},
        {key:'ض',              finger:'pinky-l',  hand:'left'},   // Q
        {key:'ص',              finger:'ring-l',   hand:'left'},   // W
        {key:'ث',              finger:'middle-l', hand:'left'},   // E
        {key:'ق',              finger:'index-l',  hand:'left'},   // R
        {key:'ف',              finger:'index-l',  hand:'left'},   // T
        {key:'غ',              finger:'index-r',  hand:'right'},  // Y
        {key:'ع',              finger:'index-r',  hand:'right'},  // U
        {key:'ه',              finger:'middle-r', hand:'right'},  // I
        {key:'خ',              finger:'ring-r',   hand:'right'},  // O
        {key:'ح',              finger:'pinky-r',  hand:'right'},  // P
        {key:'ج',  alt:'ة',    finger:'pinky-r',  hand:'right'},  // [
        {key:'د',  alt:'إ',    finger:'pinky-r',  hand:'right'},  // ]
        {key:'\\', alt:'|', wide:true, finger:'pinky-r', hand:'right'},
      ],
      // Row 2: Home row — ش س ي ب ل ا ت ن م ك ط
      [
        {key:'Caps', xl:true,  finger:'pinky-l',  hand:'left'},
        {key:'ش', home:true,   finger:'pinky-l',  hand:'left'},   // A
        {key:'س', home:true,   finger:'ring-l',   hand:'left'},   // S
        {key:'ي', home:true,   finger:'middle-l', hand:'left'},   // D
        {key:'ب', home:true, guide:true, finger:'index-l', hand:'left'},  // F
        {key:'ل', home:true,   finger:'index-l',  hand:'left'},   // G
        {key:'ا', home:true,   finger:'index-r',  hand:'right'},  // H
        {key:'ت', home:true, guide:true, finger:'index-r', hand:'right'}, // J
        {key:'ن', home:true,   finger:'middle-r', hand:'right'},  // K
        {key:'م', home:true,   finger:'ring-r',   hand:'right'},  // L
        {key:'ك', alt:'؛', home:true, finger:'pinky-r', hand:'right'}, // ;
        {key:'ط',  alt:'\'',   finger:'pinky-r',  hand:'right'},  // '
        {key:'Enter', xl:true, finger:'pinky-r',  hand:'right'},
      ],
      // Row 3: Bottom row — ئ ء ؤ ر ى ة و ز ظ
      [
        {key:'Shift', xl:true, finger:'pinky-l',  hand:'left'},
        {key:'ئ',              finger:'pinky-l',  hand:'left'},   // Z
        {key:'ء',              finger:'ring-l',   hand:'left'},   // X
        {key:'ؤ',              finger:'middle-l', hand:'left'},   // C
        {key:'ر',              finger:'index-l',  hand:'left'},   // V
        {key:'ى',              finger:'index-l',  hand:'left'},   // B
        {key:'ة',              finger:'index-r',  hand:'right'},  // N
        {key:'و',              finger:'index-r',  hand:'right'},  // M
        {key:'ز',  alt:'،',    finger:'middle-r', hand:'right'},  // ,
        {key:'ظ',  alt:'.',    finger:'ring-r',   hand:'right'},  // .
        {key:'؟',  alt:'/',    finger:'pinky-r',  hand:'right'},  // /
        {key:'Shift', xl:true, finger:'pinky-r',  hand:'right'},
      ],
      // Row 4: Space row — unchanged
      [
        {key:'Ctrl', wide:true, finger:'pinky-l', hand:'left'},
        {key:'Alt',  wide:true, finger:'thumb',   hand:'left'},
        {key:' ', space:true,   finger:'thumb',   hand:'left'},
        {key:'Alt',  wide:true, finger:'thumb',   hand:'right'},
        {key:'Ctrl', wide:true, finger:'pinky-r', hand:'right'},
      ],
    ],
  },
};

/* ─────────────────────────────────────────────────────────
   CLASS: VirtualKeyboard
   Renders and controls the interactive keyboard display.
   The keyboard container is ALWAYS LTR regardless of language.
───────────────────────────────────────────────────────── */
class VirtualKeyboard {
  /**
   * @param {string}       containerId  — host div id
   * @param {string}       language     — 'en' | 'fr' | 'ar'
   * @param {TypingEngine} engine       — typing engine reference
   * @param {HandsDisplay} hands        — optional animated hands
   */
  constructor(containerId, language, engine, hands = null) {
    this.container   = document.getElementById(containerId);
    this.language    = KB_LAYOUTS[language] ? language : 'en';
    this.engine      = engine;
    this.hands       = hands;
    this.showFingers = false;
    this.showNext    = true;
    this.keyMap      = {};
    this.flashTimers = {};

    if (!this.container) return;
    this._build();
    this._bindToEngine();
  }

  /* ── Build DOM ─────────────────────────────────────────── */
  _build() {
    const layout = KB_LAYOUTS[this.language];
    const langLabel = { en: 'EN — QWERTY', fr: 'FR — AZERTY', ar: 'AR — Arabic' };

    this.container.innerHTML = `
      <div class="vkb" id="vkb-root" data-lang="${this.language}" style="position:relative">
        <div class="vkb__header">
          <div class="vkb__title-group">
            <span class="vkb__icon">⌨️</span>
            <span class="vkb__label">Virtual Keyboard</span>
            <span class="vkb__lang-pill">${langLabel[this.language] || this.language.toUpperCase()}</span>
          </div>
          <div class="vkb__controls">
            <button class="vkb__toggle" id="vkb-toggle-fingers" title="Toggle finger colors">
              🎨 Finger Colors
            </button>
            <button class="vkb__toggle vkb__toggle--active" id="vkb-toggle-next" title="Highlight next key">
              💡 Next Key
            </button>
          </div>
        </div>
        <div class="vkb__rows" id="vkb-rows"></div>
        <!-- Hands overlay is injected here by HandsOverlay -->
      </div>`;

    /* CRITICAL: vkb__rows is ALWAYS dir="ltr" — no exception */
    const rowsEl = document.getElementById('vkb-rows');
    rowsEl.setAttribute('dir', 'ltr');
    rowsEl.style.direction = 'ltr';

    /* Build each row */
    layout.rows.forEach(row => {
      const rowDiv = document.createElement('div');
      rowDiv.className     = 'vkb__row';
      rowDiv.style.direction = 'ltr';   // enforce LTR on every row
      rowDiv.setAttribute('dir', 'ltr');

      row.forEach(k => {
        const el = this._makeKey(k);
        this._registerKey(k, el);
        rowDiv.appendChild(el);
      });

      rowsEl.appendChild(rowDiv);
    });

    /* Toggle: finger colors */
    document.getElementById('vkb-toggle-fingers')?.addEventListener('click', (e) => {
      this.showFingers = !this.showFingers;
      document.getElementById('vkb-root').classList.toggle('show-fingers', this.showFingers);
      e.currentTarget.classList.toggle('vkb__toggle--active', this.showFingers);
    });

    /* Toggle: next key */
    document.getElementById('vkb-toggle-next')?.addEventListener('click', (e) => {
      this.showNext = !this.showNext;
      e.currentTarget.classList.toggle('vkb__toggle--active', this.showNext);
      if (!this.showNext) {
        this.container.querySelectorAll('.vkey.next-key')
          .forEach(k => k.classList.remove('next-key'));
      } else {
        this._highlightNextKey();
      }
    });
  }

  /* ── Register key in lookup map ────────────────────────── */
  _registerKey(k, el) {
    if (k.space) {
      this.keyMap['space'] = el;
      this.keyMap[' ']    = el;
      return;
    }
    const FUNCTIONAL = ['Backspace','Tab','Caps','Enter','Shift','Ctrl','Alt','AltGr'];
    if (FUNCTIONAL.includes(k.key)) {
      this.keyMap[k.key.toLowerCase()] = el;
      return;
    }
    /* Register both the key and its lowercase */
    this.keyMap[k.key] = el;
    this.keyMap[k.key.toLowerCase()] = el;
    /* Register alt character too */
    if (k.alt) {
      this.keyMap[k.alt] = el;
      this.keyMap[k.alt.toLowerCase()] = el;
    }
  }

  /* ── Build a single key element ────────────────────────── */
  _makeKey(k) {
    const el      = document.createElement('div');
    const classes = ['vkey'];

    if (k.home)  classes.push('vkey--home');
    if (k.guide) classes.push('vkey--guide');
    if (k.wide)  classes.push('vkey--wide');
    if (k.xl)    classes.push('vkey--xl');
    if (k.space) classes.push('vkey--space');
    if (k.cls)   classes.push(k.cls);

    el.className = classes.join(' ');

    /* Finger data */
    if (k.finger) {
      el.dataset.finger = k.finger;
      el.dataset.hand   = k.hand || 'right';
      el.style.setProperty('--finger-color', FINGER_COLORS[k.finger] || '#fff');
    }

    /* Key label — force LTR rendering on Arabic characters */
    const FUNCTIONAL = ['Backspace','Tab','Caps','Enter','Shift','Ctrl','Alt','AltGr'];
    const isFunctional = FUNCTIONAL.includes(k.key);
    const label = k.space ? '' : k.key;

    el.textContent = label;

    /* Force LTR on the key element itself — critical for Arabic */
    el.setAttribute('dir', 'ltr');
    el.style.direction = 'ltr';

    /* Alt character (shift layer) */
    if (k.alt && !isFunctional) {
      const altSpan       = document.createElement('span');
      altSpan.className   = 'vkey__alt';
      altSpan.textContent = k.alt;
      altSpan.setAttribute('dir', 'ltr');
      el.appendChild(altSpan);
    }

    /* Home position bump indicator (F and J-equivalent keys) */
    if (k.guide) {
      const bump       = document.createElement('span');
      bump.className   = 'vkey__guide-bump';
      el.appendChild(bump);
    }

    return el;
  }

  /* ── Bind to typing engine events ──────────────────────── */
  _bindToEngine() {
    if (!this.engine) return;
    const cap = this.engine.captureEl;

    cap.addEventListener('keydown', (e) => {
      const key = this._normalizeKey(e.key);
      this._pressKey(key, true);

      requestAnimationFrame(() => {
        const idx    = this.engine.typed.length - 1;
        const expect = this.engine.text[idx] ?? '';
        const actual = this.engine.typed[idx] ?? '';

        if (actual !== undefined && actual !== '') {
          const correct = (actual === expect);
          this._flashKey(key, correct ? 'correct-flash' : 'error-flash');
          if (this.showNext) this._highlightNextKey();

          /* Notify hands display */
          if (this.hands) {
            const keyData = this._getKeyData(expect);
            if (keyData) this.hands.onKeyPress(keyData, correct);
          }
        }
      });
    });

    cap.addEventListener('keyup', (e) => {
      this._pressKey(this._normalizeKey(e.key), false);
    });

    /* Initial state: highlight first key + update hands */
    setTimeout(() => {
      this._highlightNextKey();
      this._notifyHandsNextKey();
    }, 500);
  }

  /* ── Key helpers ────────────────────────────────────────── */
  _normalizeKey(k) {
    if (k === ' ')         return 'space';
    if (k === 'Backspace') return 'backspace';
    return k;
  }

  _pressKey(key, down) {
    const el = this.keyMap[key] || this.keyMap[key.toLowerCase()];
    if (!el) return;
    el.classList.toggle('pressed', down);
  }

  _flashKey(key, cls) {
    const el = this.keyMap[key] || this.keyMap[key.toLowerCase()];
    if (!el) return;
    clearTimeout(this.flashTimers[key]);
    el.classList.remove('correct-flash', 'error-flash');
    void el.offsetWidth;   // force reflow to restart animation
    el.classList.add(cls);
    this.flashTimers[key] = setTimeout(() => el.classList.remove(cls), 380);
  }

  _highlightNextKey() {
    this.container.querySelectorAll('.vkey.next-key')
      .forEach(k => k.classList.remove('next-key'));
    if (!this.showNext || !this.engine) return;

    const idx    = this.engine.typed.length;
    const nextCh = this.engine.text[idx] ?? '';
    if (!nextCh) return;

    const key = (nextCh === ' ') ? 'space' : nextCh;
    const el  = this.keyMap[key] || this.keyMap[key.toLowerCase()];
    if (el) el.classList.add('next-key');
  }

  _notifyHandsNextKey() {
    if (!this.hands || !this.engine) return;
    const idx    = this.engine.typed.length;
    const nextCh = this.engine.text[idx] ?? '';
    if (!nextCh) return;
    const data = this._getKeyData(nextCh);
    if (data) this.hands.showNextKey(data);
  }

  /* Find key metadata by character value */
  _getKeyData(ch) {
    const layout = KB_LAYOUTS[this.language];
    for (const row of layout.rows) {
      for (const k of row) {
        if (k.key === ch || k.alt === ch) {
          return { key: ch, finger: k.finger, hand: k.hand };
        }
      }
    }
    return null;
  }
}
