/* ═══════════════════════════════════════════════════════════
   TypeCraft — app.js  (v3 — integrates keyboard.js, hands.js, rtl.js)
   All UI in English. Arabic lessons supported with RTL fixes.
   Modules:
     1. Utilities
     2. Dashboard
     3. TypingEngine (RTL-aware)
     4. Session save + Results modal
     5. Lesson page init (orchestrates all modules)
     6. Level System
     7. Global init
═══════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════
   1. UTILITIES
══════════════════════════════════════════════════════════ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/* ══════════════════════════════════════════════════════════
   2. DASHBOARD
══════════════════════════════════════════════════════════ */
function initDashboard() {
  const tabs   = $$('.lang-tab');
  const panels = $$('.lang-panel');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const lang = tab.dataset.lang;
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => { p.style.display = p.dataset.lang === lang ? 'block' : 'none'; });
      tab.classList.add('active');
      localStorage.setItem('tc_last_lang', lang);
    });
  });

  const saved  = localStorage.getItem('tc_last_lang') || tabs[0]?.dataset.lang;
  const target = tabs.find(t => t.dataset.lang === saved) || tabs[0];
  if (target) target.click();
}

function animateXPBar() {
  const bar = document.querySelector('.xp-bar__fill');
  if (!bar) return;
  const target = parseFloat(bar.dataset.target || 0);
  bar.style.width = '0%';
  setTimeout(() => { bar.style.width = target + '%'; }, 300);
}

/* ══════════════════════════════════════════════════════════
   3. TYPING ENGINE  (RTL-aware)
══════════════════════════════════════════════════════════ */
class TypingEngine {
  constructor(opts) {
    this.text        = opts.text.trim();
    this.lessonId    = opts.lessonId;
    this.language    = opts.language;
    this.displayEl   = opts.displayEl;
    this.captureEl   = opts.captureEl;
    this.progressBar = opts.progressBar;
    this.onComplete  = opts.onComplete || (() => {});
    this.rtl         = opts.rtlHandler || null;

    this.chars    = [];
    this.typed    = '';
    this.errors   = 0;
    this.errorSet = new Set();
    this.started  = false;
    this.finished = false;
    this.startTime   = null;
    this.elapsed     = 0;
    this.timerHandle = null;
    this.wpm      = 0;
    this.accuracy = 100;

    this._render();
    this._bindEvents();
  }

  /* ── Render ─────────────────────────────────────────────── */
  _render() {
    this.displayEl.innerHTML = '';

    if (this.rtl && this.rtl.isAR) {
      // Use RTL-aware character wrapping
      const spans = this.rtl.wrapChars(this.text);
      spans.forEach((span, i) => {
        if (i === 0) span.classList.add('current');
        else span.classList.remove('current');
        this.displayEl.appendChild(span);
      });
      this.chars = spans;
      this.rtl.fixAfterRender(this.displayEl);
    } else {
      this.chars = [...this.text].map((ch, i) => {
        const span = document.createElement('span');
        span.textContent = ch;
        span.className   = i === 0 ? 'char current' : 'char pending';
        this.displayEl.appendChild(span);
        return span;
      });
    }
  }

  /* ── Events ─────────────────────────────────────────────── */
  _bindEvents() {
    this.captureEl.setAttribute('tabindex', '0');
    this.captureEl.addEventListener('click',   () => this.captureEl.focus());
    this.captureEl.addEventListener('focus',   () => this.captureEl.classList.add('focused'));
    this.captureEl.addEventListener('blur',    () => this.captureEl.classList.remove('focused'));
    this.captureEl.addEventListener('keydown', (e) => this._handleKey(e));
  }

  _handleKey(e) {
    if (this.finished) return;

    const IGNORE = ['Shift','Control','Alt','Meta','CapsLock','Tab','Escape',
      'ArrowLeft','ArrowRight','ArrowUp','ArrowDown',
      'F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12'];
    if (IGNORE.includes(e.key)) return;
    e.preventDefault();

    if (!this.started) this._start();

    const idx = this.typed.length;

    /* Backspace */
    if (e.key === 'Backspace') {
      if (this.typed.length > 0) {
        const prev = this.typed.length - 1;
        this.typed = this.typed.slice(0, -1);
        this._updateChar(prev, 'pending');
        this._setCurrent(prev);
        this._updateLiveMetrics();
        this._updateProgress();
      }
      return;
    }

    if (idx >= this.text.length) return;

    const expected = this.text[idx];
    // Normalize input for Arabic
    const actual = this.rtl ? this.rtl.normalizeInput(e.key) : e.key;
    this.typed += actual;

    /* Check match — punctuation-aware for Arabic */
    const isMatch = this.rtl
      ? this.rtl.isPunctuationMatch(expected, actual)
      : expected === actual;

    if (isMatch) {
      this._updateChar(idx, 'correct');
    } else {
      this._updateChar(idx, 'wrong');
      if (!this.errorSet.has(idx)) { this.errorSet.add(idx); this.errors++; }
      this.displayEl.classList.add('shake');
      setTimeout(() => this.displayEl.classList.remove('shake'), 320);
    }

    /* Advance cursor */
    if (idx + 1 < this.chars.length) this._setCurrent(idx + 1);
    else this._clearCurrent();

    /* RTL post-render fix */
    if (this.rtl) this.rtl.fixAfterRender(this.displayEl);

    this._updateLiveMetrics();
    this._updateProgress();
    if (this.typed.length >= this.text.length) this._finish();
  }

  _updateChar(i, cls) {
    if (!this.chars[i]) return;
    // Preserve AR-specific classes
    const base = this.chars[i].className.replace(/\b(correct|wrong|pending|current)\b/g, '').trim();
    this.chars[i].className = `${base} char ${cls}`.replace(/\s+/g, ' ').trim();
  }

  _setCurrent(i) {
    this.chars.forEach(c => c.classList.remove('current'));
    if (this.chars[i]) this.chars[i].classList.add('current');
  }

  _clearCurrent() { this.chars.forEach(c => c.classList.remove('current')); }

  _start() {
    this.started = true; this.startTime = Date.now();
    this.timerHandle = setInterval(() => {
      this.elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      this._updateLiveMetrics();
      const el = document.getElementById('metric-time');
      if (el) el.textContent = formatTime(this.elapsed);
    }, 500);
  }

  _finish() {
    this.finished = true;
    clearInterval(this.timerHandle);
    this.elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    this._updateLiveMetrics();
    this.onComplete(this._buildResult());
  }

  _updateLiveMetrics() {
    const mins    = Math.max(this.elapsed, 1) / 60;
    const correct = [...this.typed].filter((ch, i) => {
      if (this.rtl) return this.rtl.isPunctuationMatch(this.text[i] || '', ch);
      return ch === this.text[i];
    }).length;
    this.wpm      = Math.round((correct / 5) / mins);
    const total   = this.typed.length || 1;
    this.accuracy = Math.round((correct / total) * 100);

    const wEl = document.getElementById('metric-wpm');
    const aEl = document.getElementById('metric-acc');
    const eEl = document.getElementById('metric-err');
    if (wEl) wEl.textContent = this.wpm;
    if (aEl) aEl.textContent = this.accuracy + '%';
    if (eEl) eEl.textContent = this.errors;
  }

  _updateProgress() {
    const pct = (this.typed.length / this.text.length) * 100;
    if (this.progressBar) this.progressBar.style.width = pct + '%';
  }

  _buildResult() {
    return { lesson_id: this.lessonId, language: this.language,
             wpm: this.wpm, accuracy: this.accuracy, errors: this.errors,
             duration: this.elapsed, completed: 1 };
  }

  restart() {
    clearInterval(this.timerHandle);
    this.typed = ''; this.errors = 0; this.errorSet = new Set();
    this.started = false; this.finished = false;
    this.startTime = null; this.elapsed = 0; this.wpm = 0; this.accuracy = 100;
    this._render(); this._updateProgress();
    const resets = { wpm:'0', acc:'100%', err:'0', time:'00:00' };
    for (const [id, val] of Object.entries(resets)) {
      const el = document.getElementById(`metric-${id}`);
      if (el) el.textContent = val;
    }
    if (this.progressBar) this.progressBar.style.width = '0%';
    this.captureEl.focus();
  }
}

/* ══════════════════════════════════════════════════════════
   4. SESSION SAVE + RESULTS MODAL
══════════════════════════════════════════════════════════ */
async function saveSession(result) {
  try {
    const res  = await fetch('/api/save_session', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    });
    const data = await res.json();
    if (data.success) showResults(result, data);
  } catch (err) {
    console.error('Save error:', err);
    showResults(result, { xp_earned: 0, new_level: 1, new_badges: [] });
  }
}

function showResults(result, data) {
  const modal = document.getElementById('results-modal');
  if (!modal) return;
  setText('res-wpm',   result.wpm);
  setText('res-acc',   result.accuracy + '%');
  setText('res-err',   result.errors);
  setText('res-time',  formatTime(result.duration));
  setText('res-xp',    `+${data.xp_earned} XP`);
  setText('res-level', `Level ${data.new_level}`);

  const badgesEl = document.getElementById('res-badges');
  if (badgesEl && data.new_badges?.length) {
    badgesEl.innerHTML = data.new_badges.map(b =>
      `<div class="badge-item earned"><span class="badge-icon">${b.icon}</span><span class="badge-name">${b.name}</span></div>`
    ).join('');
    badgesEl.style.display = 'flex';
  } else if (badgesEl) { badgesEl.style.display = 'none'; }
  modal.classList.add('show');
}

function hideModal() { document.getElementById('results-modal')?.classList.remove('show'); }

/* ══════════════════════════════════════════════════════════
   5. LEVEL SYSTEM
══════════════════════════════════════════════════════════ */
const LEVEL_LABELS = {
  1: 'Home Row',
  2: 'Top & Bottom Row',
  3: 'Full Keyboard',
  4: 'Advanced Texts',
};

class LevelSystem {
  constructor(currentLevel, language) {
    this.level    = currentLevel;
    this.language = language;
    this._renderBadge();
    this._renderRoadmap();
  }

  _renderBadge() {
    const el = document.getElementById('lesson-level-badge');
    if (!el) return;
    el.textContent = `Level ${this.level} — ${LEVEL_LABELS[this.level] || ''}`;
    el.className   = `lesson-level-badge level-badge-${Math.min(this.level, 4)}`;
  }

  _renderRoadmap() {
    const el = document.getElementById('level-roadmap');
    if (!el) return;
    let html = '<div class="levels-roadmap">';
    for (let i = 1; i <= 4; i++) {
      const state = i < this.level ? 'done' : i === this.level ? 'active' : 'locked';
      const pct   = state === 'done' ? 100 : state === 'active' ? 45 : 0;
      html += `<div class="level-row">
        <div class="level-dot ${state}">${state === 'done' ? '✓' : i}</div>
        <div class="level-row__info">
          <div class="level-row__title">${LEVEL_LABELS[i] || 'Level ' + i}</div>
          <div class="level-row__bar">
            <div class="level-row__bar-fill" style="width:${pct}%"></div>
          </div>
        </div>
      </div>`;
    }
    el.innerHTML = html + '</div>';
  }

  static showLevelUp(newLevel) {
    const banner = document.getElementById('level-up-banner');
    if (!banner) return;
    banner.innerHTML = `<span class="lu-icon">🎉</span> Level ${newLevel} Unlocked — ${LEVEL_LABELS[newLevel] || ''} <span class="lu-icon">⬆️</span>`;
    banner.classList.add('show');
    setTimeout(() => banner.classList.remove('show'), 3500);
  }
}

/* ══════════════════════════════════════════════════════════
   6. LESSON PAGE INIT
      Orchestrates: RTLHandler → TypingEngine → VirtualKeyboard → HandsDisplay → LevelSystem
══════════════════════════════════════════════════════════ */
function initLesson() {
  const displayEl   = document.getElementById('text-display');
  const captureEl   = document.getElementById('typing-capture');
  const progressBar = document.getElementById('lesson-progress-fill');
  const modal       = document.getElementById('results-modal');
  const restartBtn  = document.getElementById('btn-restart');
  const skipBtn     = document.getElementById('btn-skip');

  if (!displayEl || !captureEl) return;

  const lessonId    = displayEl.dataset.lessonId;
  const language    = displayEl.dataset.language;
  const lessonText  = displayEl.dataset.text;
  const lessonLevel = parseInt(displayEl.dataset.level || '1', 10);

  /* 1 ── RTL Handler (must come first) */
  const rtlHandler = (typeof RTLHandler !== 'undefined')
    ? new RTLHandler(displayEl, captureEl, language)
    : null;

  /* 2 ── Typing Engine */
  const engine = new TypingEngine({
    text: lessonText, lessonId, language, displayEl, captureEl, progressBar,
    rtlHandler,
    onComplete: async (result) => { await saveSession(result); }
  });
  window.__tcEngine = engine;

  /* 3 ── Level System */
  new LevelSystem(lessonLevel, language);

  /* 4 ── Hands Overlay (inside keyboard container) */
  let hands = null;
  if (typeof HandsOverlay !== 'undefined') {
    hands = new HandsOverlay('vkb-container', language, engine);
  } else if (typeof HandsDisplay !== 'undefined' && document.getElementById('hands-container')) {
    hands = new HandsDisplay('hands-container', window.innerWidth < 768);
  }

  /* 5 ── Virtual Keyboard */
  if (document.getElementById('vkb-container') && typeof VirtualKeyboard !== 'undefined') {
    new VirtualKeyboard('vkb-container', language, engine, hands);
  }

  /* 6 ── Controls */
  restartBtn?.addEventListener('click', () => {
    hideModal();
    engine.restart();
    if (hands) hands.reset();
  });
  skipBtn?.addEventListener('click', () => { window.location.href = '/dashboard'; });
  modal?.addEventListener('click',   (e) => { if (e.target === modal) hideModal(); });

  /* 7 ── Focus */
  setTimeout(() => captureEl.focus(), 200);
}

/* ══════════════════════════════════════════════════════════
   7. GLOBAL INIT
══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
  initLesson();
  animateXPBar();

  $$('.flash').forEach(el => {
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transition = 'opacity .5s';
      setTimeout(() => el.remove(), 500);
    }, 4000);
  });
});
