/* ═══════════════════════════════════════════════════════════
   TypeCraft — app.js  (version finale complète)
   Modules:
     1. Utilities
     2. Dashboard
     3. TypingEngine
     4. Session save + Results modal
     5. VirtualKeyboard (3 langues)
     6. LevelSystem
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
   3. TYPING ENGINE
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

    this.chars = []; this.typed = ''; this.errors = 0;
    this.errorSet = new Set();
    this.started = false; this.finished = false;
    this.startTime = null; this.elapsed = 0; this.timerHandle = null;
    this.wpm = 0; this.accuracy = 100;

    this._render();
    this._bindEvents();
  }

  _render() {
    this.displayEl.innerHTML = '';
    this.chars = [...this.text].map((ch, i) => {
      const span = document.createElement('span');
      span.textContent = ch;
      span.className = i === 0 ? 'char current' : 'char pending';
      this.displayEl.appendChild(span);
      return span;
    });
  }

  _bindEvents() {
    this.captureEl.setAttribute('tabindex', '0');
    this.captureEl.addEventListener('click',  () => this.captureEl.focus());
    this.captureEl.addEventListener('focus',  () => this.captureEl.classList.add('focused'));
    this.captureEl.addEventListener('blur',   () => this.captureEl.classList.remove('focused'));
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

    if (e.key === 'Backspace') {
      if (this.typed.length > 0) {
        const prev = this.typed.length - 1;
        this.typed = this.typed.slice(0, -1);
        this._updateChar(prev, 'pending');
        if (prev < this.chars.length) this._setCurrent(prev);
        this._updateLiveMetrics();
        this._updateProgress();
      }
      return;
    }

    if (idx >= this.text.length) return;
    const expected = this.text[idx];
    const actual   = e.key;
    this.typed    += actual;

    if (actual === expected) {
      this._updateChar(idx, 'correct');
    } else {
      this._updateChar(idx, 'wrong');
      if (!this.errorSet.has(idx)) { this.errorSet.add(idx); this.errors++; }
      this.displayEl.classList.add('shake');
      setTimeout(() => this.displayEl.classList.remove('shake'), 300);
    }

    if (idx + 1 < this.chars.length) this._setCurrent(idx + 1);
    else this._clearCurrent();

    this._updateLiveMetrics();
    this._updateProgress();
    if (this.typed.length >= this.text.length) this._finish();
  }

  _updateChar(i, cls) { if (this.chars[i]) this.chars[i].className = `char ${cls}`; }
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
    const correct = [...this.typed].filter((ch, i) => ch === this.text[i]).length;
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
    const els = { wpm:'0', acc:'100%', err:'0', time:'00:00' };
    for (const [id, val] of Object.entries(els)) {
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
  setText('res-level', `Niveau ${data.new_level}`);
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
   5. VIRTUAL KEYBOARD
══════════════════════════════════════════════════════════ */
const KB_LAYOUTS = {
  en: [
    [{key:'`',alt:'~',finger:'pinky-l'},{key:'1',alt:'!',finger:'pinky-l'},{key:'2',alt:'@',finger:'ring-l'},{key:'3',alt:'#',finger:'middle-l'},{key:'4',alt:'$',finger:'index-l'},{key:'5',alt:'%',finger:'index-l'},{key:'6',alt:'^',finger:'index-r'},{key:'7',alt:'&',finger:'index-r'},{key:'8',alt:'*',finger:'middle-r'},{key:'9',alt:'(',finger:'ring-r'},{key:'0',alt:')',finger:'pinky-r'},{key:'-',alt:'_',finger:'pinky-r'},{key:'=',alt:'+',finger:'pinky-r'},{key:'⌫',cls:'vkey--backspace',finger:'pinky-r'}],
    [{key:'Tab',xl:true,finger:'pinky-l'},{key:'q',finger:'pinky-l'},{key:'w',finger:'ring-l'},{key:'e',finger:'middle-l'},{key:'r',finger:'index-l'},{key:'t',finger:'index-l'},{key:'y',finger:'index-r'},{key:'u',finger:'index-r'},{key:'i',finger:'middle-r'},{key:'o',finger:'ring-r'},{key:'p',finger:'pinky-r'},{key:'[',alt:'{',finger:'pinky-r'},{key:']',alt:'}',finger:'pinky-r'},{key:'\\',alt:'|',wide:true,finger:'pinky-r'}],
    [{key:'Caps',xl:true,finger:'pinky-l'},{key:'a',home:true,finger:'pinky-l'},{key:'s',home:true,finger:'ring-l'},{key:'d',home:true,finger:'middle-l'},{key:'f',home:true,guide:true,finger:'index-l'},{key:'g',home:true,finger:'index-l'},{key:'h',home:true,finger:'index-r'},{key:'j',home:true,guide:true,finger:'index-r'},{key:'k',home:true,finger:'middle-r'},{key:'l',home:true,finger:'ring-r'},{key:';',alt:':',home:true,finger:'pinky-r'},{key:"'",alt:'"',finger:'pinky-r'},{key:'↵',xl:true,finger:'pinky-r'}],
    [{key:'⇧',xl:true,finger:'pinky-l'},{key:'z',finger:'pinky-l'},{key:'x',finger:'ring-l'},{key:'c',finger:'middle-l'},{key:'v',finger:'index-l'},{key:'b',finger:'index-l'},{key:'n',finger:'index-r'},{key:'m',finger:'index-r'},{key:',',alt:'<',finger:'middle-r'},{key:'.',alt:'>',finger:'ring-r'},{key:'/',alt:'?',finger:'pinky-r'},{key:'⇧',xl:true,finger:'pinky-r'}],
    [{key:'Ctrl',wide:true,finger:'pinky-l'},{key:'Alt',wide:true,finger:'thumb'},{key:' ',space:true,finger:'thumb'},{key:'Alt',wide:true,finger:'thumb'},{key:'Ctrl',wide:true,finger:'pinky-r'}]
  ],
  fr: [
    [{key:'²',finger:'pinky-l'},{key:'&',alt:'1',finger:'pinky-l'},{key:'é',alt:'2',finger:'ring-l'},{key:'"',alt:'3',finger:'middle-l'},{key:"'",alt:'4',finger:'index-l'},{key:'(',alt:'5',finger:'index-l'},{key:'-',alt:'6',finger:'index-r'},{key:'è',alt:'7',finger:'index-r'},{key:'_',alt:'8',finger:'middle-r'},{key:'ç',alt:'9',finger:'ring-r'},{key:'à',alt:'0',finger:'pinky-r'},{key:')',alt:'°',finger:'pinky-r'},{key:'=',alt:'+',finger:'pinky-r'},{key:'⌫',cls:'vkey--backspace',finger:'pinky-r'}],
    [{key:'Tab',xl:true,finger:'pinky-l'},{key:'a',finger:'pinky-l'},{key:'z',finger:'ring-l'},{key:'e',finger:'middle-l'},{key:'r',finger:'index-l'},{key:'t',finger:'index-l'},{key:'y',finger:'index-r'},{key:'u',finger:'index-r'},{key:'i',finger:'middle-r'},{key:'o',finger:'ring-r'},{key:'p',finger:'pinky-r'},{key:'^',alt:'¨',finger:'pinky-r'},{key:'$',alt:'£',finger:'pinky-r'},{key:'*',alt:'µ',wide:true,finger:'pinky-r'}],
    [{key:'Caps',xl:true,finger:'pinky-l'},{key:'q',home:true,finger:'pinky-l'},{key:'s',home:true,finger:'ring-l'},{key:'d',home:true,finger:'middle-l'},{key:'f',home:true,guide:true,finger:'index-l'},{key:'g',home:true,finger:'index-l'},{key:'h',home:true,finger:'index-r'},{key:'j',home:true,guide:true,finger:'index-r'},{key:'k',home:true,finger:'middle-r'},{key:'l',home:true,finger:'ring-r'},{key:'m',home:true,finger:'pinky-r'},{key:'ù',alt:'%',finger:'pinky-r'},{key:'↵',xl:true,finger:'pinky-r'}],
    [{key:'⇧',xl:true,finger:'pinky-l'},{key:'<',alt:'>',finger:'pinky-l'},{key:'w',finger:'ring-l'},{key:'x',finger:'middle-l'},{key:'c',finger:'index-l'},{key:'v',finger:'index-l'},{key:'b',finger:'index-r'},{key:'n',finger:'index-r'},{key:',',alt:'?',finger:'middle-r'},{key:';',alt:'.',finger:'ring-r'},{key:':',alt:'/',finger:'ring-r'},{key:'!',alt:'§',finger:'pinky-r'},{key:'⇧',xl:true,finger:'pinky-r'}],
    [{key:'Ctrl',wide:true,finger:'pinky-l'},{key:'Alt',wide:true,finger:'thumb'},{key:' ',space:true,finger:'thumb'},{key:'AltGr',wide:true,finger:'thumb'},{key:'Ctrl',wide:true,finger:'pinky-r'}]
  ],
  ar: [
    [{key:'ذ',finger:'pinky-r'},{key:'١',alt:'!',finger:'pinky-r'},{key:'٢',alt:'@',finger:'ring-r'},{key:'٣',alt:'#',finger:'middle-r'},{key:'٤',alt:'$',finger:'index-r'},{key:'٥',alt:'%',finger:'index-r'},{key:'٦',alt:'^',finger:'index-l'},{key:'٧',alt:'&',finger:'index-l'},{key:'٨',alt:'*',finger:'middle-l'},{key:'٩',alt:'(',finger:'ring-l'},{key:'٠',alt:')',finger:'pinky-l'},{key:'-',alt:'_',finger:'pinky-l'},{key:'=',alt:'+',finger:'pinky-l'},{key:'⌫',cls:'vkey--backspace',finger:'pinky-l'}],
    [{key:'Tab',xl:true,finger:'pinky-r'},{key:'ض',finger:'pinky-r'},{key:'ص',finger:'ring-r'},{key:'ث',finger:'middle-r'},{key:'ق',finger:'index-r'},{key:'ف',finger:'index-r'},{key:'غ',finger:'index-l'},{key:'ع',finger:'index-l'},{key:'ه',finger:'middle-l'},{key:'خ',finger:'ring-l'},{key:'ح',finger:'pinky-l'},{key:'ج',finger:'pinky-l'},{key:'د',finger:'pinky-l'},{key:'\\',wide:true,finger:'pinky-l'}],
    [{key:'Caps',xl:true,finger:'pinky-r'},{key:'ش',home:true,finger:'pinky-r'},{key:'س',home:true,finger:'ring-r'},{key:'ي',home:true,finger:'middle-r'},{key:'ب',home:true,guide:true,finger:'index-r'},{key:'ل',home:true,finger:'index-r'},{key:'ا',home:true,finger:'index-l'},{key:'ت',home:true,guide:true,finger:'index-l'},{key:'ن',home:true,finger:'middle-l'},{key:'م',home:true,finger:'ring-l'},{key:'ك',home:true,finger:'pinky-l'},{key:'ط',finger:'pinky-l'},{key:'↵',xl:true,finger:'pinky-l'}],
    [{key:'⇧',xl:true,finger:'pinky-r'},{key:'ئ',finger:'pinky-r'},{key:'ء',finger:'ring-r'},{key:'ؤ',finger:'middle-r'},{key:'ر',finger:'index-r'},{key:'ى',finger:'index-r'},{key:'ة',finger:'index-l'},{key:'و',finger:'index-l'},{key:'ز',finger:'middle-l'},{key:'ظ',finger:'ring-l'},{key:'ذ',finger:'pinky-l'},{key:'⇧',xl:true,finger:'pinky-l'}],
    [{key:'Ctrl',wide:true,finger:'pinky-r'},{key:'Alt',wide:true,finger:'thumb'},{key:' ',space:true,finger:'thumb'},{key:'Alt',wide:true,finger:'thumb'},{key:'Ctrl',wide:true,finger:'pinky-l'}]
  ]
};

class VirtualKeyboard {
  constructor(containerId, language, engine) {
    this.container   = document.getElementById(containerId);
    this.language    = KB_LAYOUTS[language] ? language : 'en';
    this.engine      = engine;
    this.showFingers = false;
    this.showNext    = true;
    this.keyMap      = {};
    this.flashTimers = {};
    if (!this.container) return;
    this._build();
    this._bindToEngine();
  }

  _build() {
    const layout = KB_LAYOUTS[this.language];
    const isAR   = this.language === 'ar';
    this.container.innerHTML = `
      <div class="vkb" id="vkb-root">
        <div class="vkb__header">
          <span class="vkb__label">⌨️ ${isAR ? 'لوحة المفاتيح' : 'Clavier virtuel'} · ${this.language.toUpperCase()}</span>
          <div style="display:flex;gap:.5rem;flex-wrap:wrap">
            <button class="vkb__toggle" id="vkb-toggle-fingers">${isAR ? 'ألوان الأصابع' : 'Couleur doigts'}</button>
            <button class="vkb__toggle" id="vkb-toggle-next">${isAR ? 'المفتاح التالي' : 'Touche suivante'}</button>
          </div>
        </div>
        <div class="vkb__rows" id="vkb-rows" ${isAR ? 'dir="rtl"' : ''}></div>
        <div class="vkb__hands">
          <div class="vkb__hand"><div class="hand-icon">🤚</div><div>${isAR ? 'اليسار' : 'Main G.'}</div></div>
          <div class="vkb__hand"><div class="hand-icon">🖐️</div><div>${isAR ? 'اليمين' : 'Main D.'}</div></div>
        </div>
      </div>`;

    const rowsEl = document.getElementById('vkb-rows');
    layout.forEach(row => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'vkb__row';
      row.forEach(k => {
        const el   = this._makeKey(k);
        const mapK = k.key === ' ' ? 'space' : k.key.toLowerCase();
        this.keyMap[mapK] = el;
        if (k.alt) this.keyMap[k.alt.toLowerCase()] = el;
        rowDiv.appendChild(el);
      });
      rowsEl.appendChild(rowDiv);
    });

    document.getElementById('vkb-toggle-fingers')?.addEventListener('click', () => {
      this.showFingers = !this.showFingers;
      document.getElementById('vkb-root').classList.toggle('show-fingers', this.showFingers);
    });
    document.getElementById('vkb-toggle-next')?.addEventListener('click', () => {
      this.showNext = !this.showNext;
      if (!this.showNext) $$('.vkey.next-key', this.container).forEach(k => k.classList.remove('next-key'));
      else this._highlightNextKey();
    });
  }

  _makeKey(k) {
    const el = document.createElement('div');
    const c  = ['vkey'];
    if (k.home)  c.push('vkey--home');
    if (k.guide) c.push('vkey--guide');
    if (k.wide)  c.push('vkey--wide');
    if (k.xl)    c.push('vkey--xl');
    if (k.space) c.push('vkey--space');
    if (k.cls)   c.push(k.cls);
    el.className = c.join(' ');
    if (k.finger) el.dataset.finger = k.finger;
    el.textContent = k.key === ' ' ? '' : k.key;
    if (k.alt) {
      const alt = document.createElement('span');
      alt.className = 'vkey__alt'; alt.textContent = k.alt;
      el.appendChild(alt);
    }
    return el;
  }

  _bindToEngine() {
    if (!this.engine) return;
    const cap = this.engine.captureEl;
    cap.addEventListener('keydown', (e) => {
      const key = e.key === ' ' ? 'space' : e.key.toLowerCase();
      this._pressKey(key, true);
      requestAnimationFrame(() => {
        const idx    = this.engine.typed.length - 1;
        const expect = this.engine.text[idx] ?? '';
        const typed  = this.engine.typed[idx] ?? '';
        if (typed) {
          this._flashKey(key, typed === expect ? 'correct-flash' : 'error-flash');
          if (this.showNext) this._highlightNextKey();
        }
      });
    });
    cap.addEventListener('keyup', (e) => {
      this._pressKey(e.key === ' ' ? 'space' : e.key.toLowerCase(), false);
    });
    setTimeout(() => this._highlightNextKey(), 400);
  }

  _pressKey(key, down) {
    const el = this.keyMap[key] || this.keyMap[key.toLowerCase()];
    if (el) el.classList.toggle('pressed', down);
  }

  _flashKey(key, cls) {
    const el = this.keyMap[key] || this.keyMap[key.toLowerCase()];
    if (!el) return;
    clearTimeout(this.flashTimers[key]);
    el.classList.remove('correct-flash', 'error-flash');
    el.classList.add(cls);
    this.flashTimers[key] = setTimeout(() => el.classList.remove(cls), 320);
  }

  _highlightNextKey() {
    $$('.vkey.next-key', this.container).forEach(k => k.classList.remove('next-key'));
    if (!this.showNext) return;
    const idx    = this.engine.typed.length;
    const nextCh = this.engine.text[idx] ?? '';
    if (!nextCh) return;
    const el = this.keyMap[nextCh === ' ' ? 'space' : nextCh.toLowerCase()];
    if (el) el.classList.add('next-key');
  }
}

/* ══════════════════════════════════════════════════════════
   6. LEVEL SYSTEM
══════════════════════════════════════════════════════════ */
const LEVEL_LABELS = {
  en: { 1:'Home Row', 2:'Top & Bottom Row', 3:'Full Keyboard', 4:'Advanced Texts' },
  fr: { 1:'Rangée centrale', 2:'Rangées Haut/Bas', 3:'Clavier complet', 4:'Textes avancés' },
  ar: { 1:'الصف الأوسط', 2:'الصفوف العلوية والسفلية', 3:'لوحة كاملة', 4:'نصوص متقدمة' }
};

class LevelSystem {
  constructor(currentLevel, language) {
    this.level = currentLevel; this.language = language;
    this._renderBadge(); this._renderRoadmap();
  }

  _renderBadge() {
    const el = document.getElementById('lesson-level-badge');
    if (!el) return;
    const labels = LEVEL_LABELS[this.language] || LEVEL_LABELS.en;
    el.textContent = `Niveau ${this.level} — ${labels[this.level] || ''}`;
    el.className   = `lesson-level-badge level-badge-${Math.min(this.level, 4)}`;
  }

  _renderRoadmap() {
    const el = document.getElementById('level-roadmap');
    if (!el) return;
    const labels = LEVEL_LABELS[this.language] || LEVEL_LABELS.en;
    let html = '<div class="levels-roadmap">';
    for (let i = 1; i <= 4; i++) {
      const state = i < this.level ? 'done' : i === this.level ? 'active' : 'locked';
      const pct   = state === 'done' ? 100 : state === 'active' ? 40 : 0;
      html += `<div class="level-row">
        <div class="level-dot ${state}">${state==='done'?'✓':i}</div>
        <div class="level-row__info">
          <div class="level-row__title">${labels[i]||'Niveau '+i}</div>
          <div class="level-row__bar"><div class="level-row__bar-fill" style="width:${pct}%"></div></div>
        </div></div>`;
    }
    el.innerHTML = html + '</div>';
  }

  static showLevelUp(newLevel, language) {
    const banner = document.getElementById('level-up-banner');
    if (!banner) return;
    const labels = LEVEL_LABELS[language] || LEVEL_LABELS.en;
    banner.innerHTML = `<span class="lu-icon">🎉</span> Niveau ${newLevel} débloqué — ${labels[newLevel]||''} <span class="lu-icon">⬆️</span>`;
    banner.classList.add('show');
    setTimeout(() => banner.classList.remove('show'), 3500);
  }
}

/* ══════════════════════════════════════════════════════════
   7. LESSON PAGE INIT
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

  if (language === 'ar') {
    displayEl.classList.add('ar-text');
    displayEl.setAttribute('dir', 'rtl');
  }

  /* Engine */
  const engine = new TypingEngine({
    text: lessonText, lessonId, language, displayEl, captureEl, progressBar,
    onComplete: async (result) => { await saveSession(result); }
  });
  window.__tcEngine = engine;

  /* Level System */
  new LevelSystem(lessonLevel, language);

  /* Virtual Keyboard */
  if (document.getElementById('vkb-container')) {
    new VirtualKeyboard('vkb-container', language, engine);
  }

  /* Controls */
  restartBtn?.addEventListener('click', () => { hideModal(); engine.restart(); });
  skipBtn?.addEventListener('click',   () => { window.location.href = '/dashboard'; });
  modal?.addEventListener('click',     (e) => { if (e.target === modal) hideModal(); });

  setTimeout(() => captureEl.focus(), 200);
}

/* ══════════════════════════════════════════════════════════
   8. GLOBAL INIT
══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
  initLesson();
  animateXPBar();
  $$('.flash').forEach(el => {
    setTimeout(() => {
      el.style.opacity = '0'; el.style.transition = 'opacity .5s';
      setTimeout(() => el.remove(), 500);
    }, 4000);
  });
});
