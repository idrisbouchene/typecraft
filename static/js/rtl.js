/* ═══════════════════════════════════════════════════════════
   TypeCraft — rtl.js
   Arabic RTL fixes for professional touch typing experience
   - Proper RTL caret positioning
   - No cursor jumping
   - Correct Arabic punctuation handling
   - Mixed RTL/LTR prevention
   - Arabic character normalization
═══════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────
   ARABIC CHARACTER SETS
───────────────────────────────────────────────────────── */
const AR = {
  /* Arabic letters range */
  isLetter: (ch) => /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(ch),

  /* Arabic punctuation that should NOT trigger LTR */
  punctuation: new Set(['،', '؛', '؟', '!', '.', '،', '…', '«', '»', '(', ')', '-', '–']),

  /* Arabic digits */
  isDigit: (ch) => /[٠-٩0-9]/.test(ch),

  /* Diacritics (harakat) — should not shift cursor */
  isDiacritic: (ch) => /[\u064B-\u065F\u0670]/.test(ch),

  /* Tatweel (kashida) */
  isTatweel: (ch) => ch === '\u0640',

  /* Normalize common keyboard Arabic input */
  normalize: (ch) => {
    const map = {
      'أ': 'ا', 'إ': 'ا', 'آ': 'ا',   // Alef forms → base Alef
      'ى': 'ى',                           // Alef maqsura (keep)
      'ة': 'ة',                           // Taa marbuta (keep)
    };
    return map[ch] || ch;
  },
};

/* ─────────────────────────────────────────────────────────
   CLASS: RTLHandler
   Manages all Arabic-specific rendering and input logic
───────────────────────────────────────────────────────── */
class RTLHandler {
  /**
   * @param {HTMLElement} displayEl   — the text-display div
   * @param {HTMLElement} captureEl   — the invisible capture div
   * @param {string}      language    — 'ar' | 'en' | 'fr'
   */
  constructor(displayEl, captureEl, language) {
    this.displayEl = displayEl;
    this.captureEl = captureEl;
    this.language  = language;
    this.isAR      = language === 'ar';
    this._applied  = false;

    if (this.isAR) this._apply();
  }

  /* ── Apply all Arabic fixes ─────────────────────────────── */
  _apply() {
    if (this._applied) return;
    this._applied = true;

    const d = this.displayEl;
    const c = this.captureEl;

    /* Text display: force RTL */
    d.setAttribute('dir', 'rtl');
    d.setAttribute('lang', 'ar');
    d.style.direction   = 'rtl';
    d.style.textAlign   = 'right';
    d.style.fontFamily  = "'Cairo', 'Noto Naskh Arabic', 'Arabic Typesetting', serif";
    d.style.fontSize    = '1.4rem';
    d.style.lineHeight  = '2.2';
    d.style.letterSpacing = '0.02em';
    d.style.unicodeBidi = 'embed';

    /* Capture div: RTL input context */
    c.setAttribute('dir', 'rtl');
    c.setAttribute('lang', 'ar');
    c.style.direction   = 'rtl';
    c.style.textAlign   = 'right';
    c.style.unicodeBidi = 'bidi-override';

    /* Prevent browser from auto-switching direction */
    document.documentElement.style.setProperty('--ar-active', '1');
  }

  /* ── Text segmentation for RTL display ──────────────────── */
  /**
   * Wraps each character in a span with correct bidi attributes
   * Critical for Arabic where browser can misrender sequences
   */
  wrapChars(text) {
    return [...text].map((ch, i) => {
      const span = document.createElement('span');
      span.textContent = ch;

      if (this.isAR) {
        if (AR.isLetter(ch) || AR.isDiacritic(ch)) {
          span.className = 'char pending ar-char';
          span.setAttribute('dir', 'rtl');
        } else if (ch === ' ') {
          span.className = 'char pending ar-space';
        } else if (AR.isDigit(ch)) {
          span.className = 'char pending ar-digit';
          span.setAttribute('dir', 'ltr');
          span.style.unicodeBidi = 'embed';
        } else {
          span.className = 'char pending';
        }
      } else {
        span.className = i === 0 ? 'char current' : 'char pending';
      }

      return span;
    });
  }

  /* ── Input normalization ─────────────────────────────────── */
  /**
   * Normalize Arabic keyboard input
   * Handles OS-level differences between Arabic keyboard layouts
   */
  normalizeInput(key) {
    if (!this.isAR) return key;
    return AR.normalize(key);
  }

  /* ── Cursor positioning ──────────────────────────────────── */
  /**
   * Fix cursor always appearing at wrong position in RTL
   * Returns corrected cursor index
   */
  fixCursorPosition(typedLength, textLength) {
    if (!this.isAR) return typedLength;
    // In RTL, the visual cursor moves right-to-left
    // but logically our index still goes 0→n
    return typedLength;
  }

  /* ── Punctuation validation ──────────────────────────────── */
  /**
   * Arabic punctuation rules:
   * - Arabic question mark ؟ not ?
   * - Arabic comma ، not ,
   * - We accept both forms in lenient mode
   */
  isPunctuationMatch(expected, actual) {
    if (!this.isAR) return expected === actual;

    const arabicMap = {
      '?': '؟', ',': '،', ';': '؛',
      '؟': '?', '،': ',', '؛': ';',
    };

    return expected === actual ||
           arabicMap[expected] === actual ||
           arabicMap[actual]   === expected;
  }

  /* ── Current char marker ────────────────────────────────── */
  /**
   * Apply the 'current' class to the correct character span
   * Handles RTL so the visual cursor appears correctly
   */
  applyCurrent(chars, index) {
    chars.forEach(c => c.classList.remove('current'));
    if (index < chars.length) {
      chars[index].classList.add('current');
    }
  }

  /* ── Post-render fix ────────────────────────────────────── */
  /**
   * Called after each character render to fix any bidi issues
   * Prevents cursor jumping by forcing stable text rendering
   */
  fixAfterRender(displayEl) {
    if (!this.isAR) return;
    // Re-apply direction attributes that browsers sometimes strip
    displayEl.setAttribute('dir', 'rtl');
    displayEl.style.direction = 'rtl';
  }
}

/* ─────────────────────────────────────────────────────────
   ARABIC INPUT HELPER
   Additional utilities for Arabic typing experience
───────────────────────────────────────────────────────── */
const ArabicInput = {
  /**
   * Filter keydown events for Arabic:
   * Prevent browser default RTL cursor movement interference
   */
  filterKey(e, isAR) {
    if (!isAR) return false;
    // Allow these through
    const allowed = ['Backspace', 'Enter', 'Tab', 'Escape'];
    if (allowed.includes(e.key)) return false;
    // Block direction-switching shortcuts
    if ((e.ctrlKey || e.metaKey) && ['ArrowLeft','ArrowRight'].includes(e.key)) {
      e.preventDefault(); return true;
    }
    return false;
  },

  /**
   * Convert Arabic-Indic digits to Western digits for WPM calculation
   */
  normalizeDigits(text) {
    const map = { '٠':'0','١':'1','٢':'2','٣':'3','٤':'4','٥':'5','٦':'6','٧':'7','٨':'8','٩':'9' };
    return text.replace(/[٠-٩]/g, d => map[d] || d);
  },

  /**
   * Count Arabic words (space-delimited, handles diacritics)
   */
  countWords(text) {
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  },
};
