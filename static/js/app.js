/* ═══════════════════════════════════════════════════════════════
   TYPECRAFT — Main Application JS
   Modular design: State → Actions → Render
═══════════════════════════════════════════════════════════════ */

// ─── STATE ────────────────────────────────────────────────────
const STATE = {
  user: null,
  currentLang: 'en',
  currentLevel: null,
  currentLesson: null,
  practice: {
    started: false,
    startTime: null,
    timerInterval: null,
    charIndex: 0,
    errors: 0,
    totalChars: 0,
    typed: '',
  }
};

// ─── LANG META ────────────────────────────────────────────────
const LANG_META = {
  en: { flag: '🇺🇸', name: 'English', dir: 'ltr', sub: 'Select your lesson — LTR Layout' },
  ar: { flag: '🇸🇦', name: 'العربية', dir: 'rtl', sub: 'اختر درسك — تخطيط RTL' },
  fr: { flag: '🇫🇷', name: 'Français', dir: 'ltr', sub: 'Choisissez votre leçon — Clavier AZERTY' },
};

const BADGES_INFO = [
  { id: 'first_lesson',  icon: '🎯', name: 'First Step' },
  { id: 'speed_50',      icon: '⚡', name: 'Speed Typer' },
  { id: 'accuracy_95',   icon: '🏹', name: 'Precision Master' },
  { id: 'streak_7',      icon: '🔥', name: 'Week Warrior' },
  { id: 'trilingual',    icon: '🌍', name: 'Polyglot' },
  { id: 'xp_1000',       icon: '⭐', name: 'XP Master' },
];

// ─── KEYBOARD LAYOUTS ─────────────────────────────────────────
const KB_ROWS = {
  en: [
    ['`','1','2','3','4','5','6','7','8','9','0','-','=','⌫'],
    ['q','w','e','r','t','y','u','i','o','p','[',']','\\'],
    ['a','s','d','f','g','h','j','k','l',';',"'",'↵'],
    ['z','x','c','v','b','n','m',',','.','/','⇧'],
  ],
  fr: [
    ['²','&','é','"',"'",'(','-','è','_','ç','à',')','=','⌫'],
    ['a','z','e','r','t','y','u','i','o','p','^','$'],
    ['q','s','d','f','g','h','j','k','l','m','ù','*','↵'],
    ['w','x','c','v','b','n',',',';',':','!','⇧'],
  ],
  ar: [
    ['ذ','١','٢','٣','٤','٥','٦','٧','٨','٩','٠','-','=','⌫'],
    ['ض','ص','ث','ق','ف','غ','ع','ه','خ','ح','ج','د'],
    ['ش','س','ي','ب','ل','ا','ت','ن','م','ك','ط','↵'],
    ['ئ','ء','ؤ','ر','لا','ى','ة','و','ز','ظ','⇧'],
  ],
};

const HOME_ROW = { en: ['a','s','d','f','j','k','l',';'], fr: ['q','s','d','f','j','k','l','m'], ar: ['ش','س','ي','ب','ل','ا','ت','ن'] };

// ═══════════════════════════════════════════════════════════════
// SCREEN NAVIGATION
// ═══════════════════════════════════════════════════════════════

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.classList.add('hidden');
  });
  const target = document.getElementById(`screen-${name}`);
  if (target) {
    target.classList.remove('hidden');
    target.classList.add('active');
  }
  if (name === 'profile') loadProfile();
}

// ═══════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════

function showModal(type) {
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('modal-login').classList.add('hidden');
  document.getElementById('modal-register').classList.add('hidden');
  document.getElementById(`modal-${type}`).classList.remove('hidden');
}

function closeModal(e) {
  if (!e || e.target === document.getElementById('modal-overlay')) {
    document.getElementById('modal-overlay').classList.add('hidden');
  }
}

async function doLogin() {
  const username = document.getElementById('login-user').value.trim();
  const password = document.getElementById('login-pass').value;
  const errEl = document.getElementById('login-error');
  errEl.classList.add('hidden');

  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.error) {
      errEl.textContent = data.error;
      errEl.classList.remove('hidden');
    } else {
      STATE.user = { username: data.username };
      updateNavUser();
      closeModal();
    }
  } catch { errEl.textContent = 'Connection error'; errEl.classList.remove('hidden'); }
}

async function doRegister() {
  const username = document.getElementById('reg-user').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-pass').value;
  const errEl = document.getElementById('reg-error');
  errEl.classList.add('hidden');

  try {
    const res = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    const data = await res.json();
    if (data.error) {
      errEl.textContent = data.error;
      errEl.classList.remove('hidden');
    } else {
      STATE.user = { username: data.username };
      updateNavUser();
      closeModal();
    }
  } catch { errEl.textContent = 'Connection error'; errEl.classList.remove('hidden'); }
}

async function logoutUser() {
  await fetch('/logout');
  STATE.user = null;
  document.getElementById('nav-user').classList.add('hidden');
  document.getElementById('nav-guest').classList.remove('hidden');
  showScreen('home');
}

function updateNavUser() {
  if (STATE.user) {
    document.getElementById('nav-guest').classList.add('hidden');
    document.getElementById('nav-user').classList.remove('hidden');
    loadNavStats();
  }
}

async function loadNavStats() {
  try {
    const res = await fetch('/api/profile');
    const data = await res.json();
    if (!data.error) {
      document.getElementById('nav-xp').textContent = `${data.xp} XP`;
      document.getElementById('nav-streak').textContent = data.streak;
    }
  } catch {}
}

// ═══════════════════════════════════════════════════════════════
// LANGUAGE & LEVELS
// ═══════════════════════════════════════════════════════════════

function selectLanguage(lang) {
  STATE.currentLang = lang;
  const meta = LANG_META[lang];

  document.getElementById('lang-icon').textContent = meta.flag;
  document.getElementById('lang-title').textContent = meta.name;
  document.getElementById('lang-sub').textContent = meta.sub;

  loadLevels(lang);
  showScreen('levels');
}

async function loadLevels(lang) {
  const grid = document.getElementById('levels-grid');
  grid.innerHTML = '<div style="color:var(--text-3);padding:2rem;text-align:center;">Loading...</div>';

  try {
    const res = await fetch(`/api/lessons/${lang}`);
    const lessons = await res.json();
    renderLevels(lessons);
  } catch {
    grid.innerHTML = '<div style="color:var(--accent-2)">Failed to load lessons</div>';
  }
}

function renderLevels(lessons) {
  const grid = document.getElementById('levels-grid');
  grid.innerHTML = '';

  lessons.forEach(lesson => {
    const card = document.createElement('div');
    card.className = `level-card ${lesson.locked ? 'locked' : ''} ${lesson.completed ? 'completed' : ''}`;

    const typeClass = `type-${lesson.type}`;
    card.innerHTML = `
      <div class="level-num">LEVEL ${lesson.id}</div>
      <div class="level-title">${lesson.title}</div>
      <div class="level-desc">${lesson.description}</div>
      <div class="level-type-badge ${typeClass}">${lesson.type.toUpperCase()}</div>
      ${lesson.locked ? '<div class="locked-overlay">🔒</div>' : ''}
    `;

    if (!lesson.locked) {
      card.onclick = () => startLesson(lesson.id);
    }

    grid.appendChild(card);
  });
}

// ═══════════════════════════════════════════════════════════════
// PRACTICE ENGINE
// ═══════════════════════════════════════════════════════════════

async function startLesson(levelId) {
  try {
    const res = await fetch(`/api/lesson/${STATE.currentLang}/${levelId}`);
    const lesson = await res.json();
    if (lesson.error) { alert(lesson.error); return; }

    STATE.currentLevel = levelId;
    STATE.currentLesson = lesson;
    setupPracticeScreen(lesson);
    showScreen('practice');
  } catch { alert('Failed to load lesson'); }
}

function setupPracticeScreen(lesson) {
  // Update nav info
  document.getElementById('practice-level-badge').textContent = `Level ${lesson.id}`;
  document.getElementById('practice-title-nav').textContent = lesson.title;

  // Apply direction
  const isRTL = STATE.currentLang === 'ar';
  const textDisplay = document.getElementById('text-display');
  const typingInput = document.getElementById('typing-input');

  if (isRTL) {
    textDisplay.classList.add('rtl-mode');
    typingInput.classList.add('rtl-mode');
    typingInput.setAttribute('dir', 'rtl');
    textDisplay.setAttribute('dir', 'rtl');
  } else {
    textDisplay.classList.remove('rtl-mode');
    typingInput.classList.remove('rtl-mode');
    typingInput.setAttribute('dir', 'ltr');
    textDisplay.setAttribute('dir', 'ltr');
  }

  // Render text
  renderTextDisplay(lesson.content);

  // Build keyboard
  buildKeyboard(STATE.currentLang);

  // Reset state
  resetPracticeState();

  // Focus input
  setTimeout(() => document.getElementById('typing-input').focus(), 300);
}

function renderTextDisplay(text) {
  const display = document.getElementById('text-display');
  display.innerHTML = '';
  [...text].forEach((ch, i) => {
    const span = document.createElement('span');
    span.className = `char pending`;
    span.dataset.index = i;
    span.textContent = ch;
    if (i === 0) span.classList.add('cursor');
    display.appendChild(span);
  });
  STATE.practice.totalChars = text.length;
}

function resetPracticeState() {
  const p = STATE.practice;
  p.started = false;
  p.startTime = null;
  p.charIndex = 0;
  p.errors = 0;
  p.typed = '';

  if (p.timerInterval) { clearInterval(p.timerInterval); p.timerInterval = null; }

  document.getElementById('typing-input').value = '';
  updateStats(0, 100, 0, 0);
  document.getElementById('progress-fill').style.width = '0%';

  // Reset all chars to pending
  document.querySelectorAll('.char').forEach((ch, i) => {
    ch.className = 'char pending';
    if (i === 0) ch.classList.add('cursor');
  });
}

function resetPractice() {
  resetPracticeState();
  document.getElementById('typing-input').focus();
}

function buildKeyboard(lang) {
  const rows = KB_ROWS[lang] || KB_ROWS.en;
  const homeRow = HOME_ROW[lang] || [];
  const rowIds = ['kb-row-1','kb-row-2','kb-row-3','kb-row-4'];

  rows.forEach((row, ri) => {
    const el = document.getElementById(rowIds[ri]);
    el.innerHTML = '';
    row.forEach(key => {
      const k = document.createElement('div');
      k.className = 'kb-key';
      if (homeRow.includes(key)) k.classList.add('home-row');
      if (key === ' ') k.classList.add('space');
      k.textContent = key;
      k.dataset.key = key;
      el.appendChild(k);
    });

    // Space bar on last row
    if (ri === 3) {
      const sp = document.createElement('div');
      sp.className = 'kb-key space'; sp.textContent = '⎵';
      sp.dataset.key = ' ';
      el.appendChild(sp);
    }
  });
}

function highlightKey(char) {
  document.querySelectorAll('.kb-key').forEach(k => k.classList.remove('active'));
  const key = document.querySelector(`[data-key="${char.toLowerCase()}"]`);
  if (key) key.classList.add('active');
}

// ═══════════════════════════════════════════════════════════════
// TYPING INPUT HANDLER
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('typing-input');

  input.addEventListener('input', handleTypingInput);
  input.addEventListener('keydown', e => {
    if (e.key === 'Tab') { e.preventDefault(); return; }
  });

  // Click anywhere on practice to focus input
  document.getElementById('screen-practice').addEventListener('click', () => {
    document.getElementById('typing-input').focus();
  });

  // Keyboard press highlight
  document.addEventListener('keydown', e => {
    highlightKey(e.key);
  });

  document.addEventListener('keyup', () => {
    document.querySelectorAll('.kb-key').forEach(k => k.classList.remove('active'));
  });

  // Check if already logged in
  fetch('/api/profile').then(r => r.json()).then(data => {
    if (!data.error) {
      STATE.user = { username: data.username };
      updateNavUser();
    }
  }).catch(() => {});
});

function handleTypingInput(e) {
  const input = e.target;
  const typed = input.value;
  const p = STATE.practice;
  const lesson = STATE.currentLesson;
  if (!lesson) return;

  const text = lesson.content;

  // Start timer on first keystroke
  if (!p.started && typed.length > 0) {
    p.started = true;
    p.startTime = Date.now();
    p.timerInterval = setInterval(updateTimerDisplay, 500);
  }

  // Update char display
  const chars = document.querySelectorAll('.char');
  let errors = 0;

  [...text].forEach((ch, i) => {
    const span = chars[i];
    span.className = 'char';

    if (i < typed.length) {
      if (typed[i] === ch) {
        span.classList.add('correct');
      } else {
        span.classList.add('incorrect');
        errors++;
      }
    } else if (i === typed.length) {
      span.classList.add('cursor');
      if (STATE.currentLang === 'ar') span.classList.add('rtl-cursor');
    } else {
      span.classList.add('pending');
    }
  });

  p.charIndex = typed.length;
  p.errors = errors;

  // Progress
  const progress = Math.min((typed.length / text.length) * 100, 100);
  document.getElementById('progress-fill').style.width = `${progress}%`;

  // WPM
  const elapsed = p.started ? (Date.now() - p.startTime) / 60000 : 0;
  const wpm = elapsed > 0 ? Math.round((typed.length / 5) / elapsed) : 0;

  // Accuracy
  const correct = typed.length - errors;
  const accuracy = typed.length > 0 ? Math.round((correct / typed.length) * 100) : 100;

  updateStats(wpm, accuracy, errors, 0);

  // Error sound
  if (typed.length > 0 && typed[typed.length - 1] !== text[typed.length - 1]) {
    playError();
  }

  // Check completion
  if (typed.length >= text.length) {
    finishLesson(wpm, accuracy, errors, elapsed);
  }
}

function updateTimerDisplay() {
  if (!STATE.practice.startTime) return;
  const elapsed = Math.round((Date.now() - STATE.practice.startTime) / 1000);
  document.getElementById('stat-time').textContent = `${elapsed}s`;
}

function updateStats(wpm, accuracy, errors, time) {
  document.getElementById('stat-wpm').textContent = wpm;
  document.getElementById('stat-acc').textContent = `${accuracy}%`;
  document.getElementById('stat-errors').textContent = errors;

  // Color coding
  const wpmEl = document.getElementById('stat-wpm');
  if (wpm >= 60) wpmEl.style.color = 'var(--green)';
  else if (wpm >= 40) wpmEl.style.color = 'var(--accent)';
  else wpmEl.style.color = 'var(--text)';

  const accEl = document.getElementById('stat-acc');
  if (accuracy >= 95) accEl.style.color = 'var(--green)';
  else if (accuracy >= 80) accEl.style.color = 'var(--accent)';
  else accEl.style.color = 'var(--accent-2)';
}

// ═══════════════════════════════════════════════════════════════
// LESSON COMPLETION
// ═══════════════════════════════════════════════════════════════

async function finishLesson(wpm, accuracy, errors, durationMin) {
  const p = STATE.practice;
  if (p.timerInterval) { clearInterval(p.timerInterval); p.timerInterval = null; }

  const duration = Math.round(durationMin * 60);

  // Determine rank emoji
  let rank = '🥉';
  if (wpm >= 60 && accuracy >= 95) rank = '🏆';
  else if (wpm >= 40 && accuracy >= 85) rank = '🥇';
  else if (wpm >= 25 && accuracy >= 75) rank = '🥈';

  // Fill results UI
  document.getElementById('results-rank').textContent = rank;
  document.getElementById('results-subtitle').textContent = `Level ${STATE.currentLevel} — ${STATE.currentLesson.title}`;
  document.getElementById('res-wpm').textContent = Math.round(wpm);
  document.getElementById('res-acc').textContent = `${Math.round(accuracy)}%`;
  document.getElementById('res-err').textContent = errors;

  // Submit to server
  let xpEarned = 0;
  let newBadges = [];
  let levelUp = false;

  if (STATE.user) {
    try {
      const res = await fetch('/api/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: STATE.currentLang,
          level_id: STATE.currentLevel,
          wpm: Math.round(wpm),
          accuracy: Math.round(accuracy),
          errors,
          duration
        })
      });
      const data = await res.json();
      xpEarned = data.xp_earned || 0;
      newBadges = data.new_badges || [];
      levelUp = data.level_up;
      document.getElementById('nav-xp').textContent = `${data.total_xp} XP`;
      document.getElementById('nav-streak').textContent = data.streak;
    } catch {}
  } else {
    // Guest: estimate XP
    xpEarned = Math.round(STATE.currentLevel * 10 + wpm / 2);
  }

  document.getElementById('res-xp').textContent = `+${xpEarned}`;

  // Badges
  if (newBadges.length > 0) {
    const list = document.getElementById('badges-list');
    list.innerHTML = '';
    newBadges.forEach(b => {
      list.innerHTML += `<div class="badge-item"><div class="badge-icon">${b.icon}</div><div class="badge-name">${b.name}</div></div>`;
    });
    document.getElementById('badges-earned').classList.remove('hidden');
  } else {
    document.getElementById('badges-earned').classList.add('hidden');
  }

  // Level up
  if (levelUp) {
    document.getElementById('level-up-msg').classList.remove('hidden');
  } else {
    document.getElementById('level-up-msg').classList.add('hidden');
  }

  showScreen('results');
}

function retryLesson() {
  setupPracticeScreen(STATE.currentLesson);
  showScreen('practice');
}

function goNextLevel() {
  const nextId = STATE.currentLevel + 1;
  showScreen('levels');
  setTimeout(() => startLesson(nextId), 300);
}

// ═══════════════════════════════════════════════════════════════
// DAILY CHALLENGE
// ═══════════════════════════════════════════════════════════════

async function startDailyChallenge() {
  try {
    const res = await fetch('/api/daily_challenge');
    const data = await res.json();
    STATE.currentLang = data.language;
    STATE.currentLevel = data.lesson.id;
    STATE.currentLesson = data.lesson;
    setupPracticeScreen(data.lesson);
    showScreen('practice');
  } catch { alert('Failed to load daily challenge'); }
}

// ═══════════════════════════════════════════════════════════════
// PROFILE
// ═══════════════════════════════════════════════════════════════

async function loadProfile() {
  if (!STATE.user) {
    showModal('login');
    showScreen('home');
    return;
  }

  try {
    const res = await fetch('/api/profile');
    const data = await res.json();
    if (data.error) return;

    document.getElementById('profile-initial').textContent = data.username[0].toUpperCase();
    document.getElementById('profile-username').textContent = data.username;
    document.getElementById('profile-xp-display').textContent = `${data.xp} XP`;
    document.getElementById('profile-streak-val').textContent = data.streak;
    document.getElementById('prof-best-wpm').textContent = data.best_wpm;
    document.getElementById('prof-avg-acc').textContent = `${data.avg_accuracy}%`;
    document.getElementById('prof-sessions').textContent = data.total_sessions;

    renderLangProgress(data.progress);
    renderAllBadges(data.badges);
    renderProgressChart(data.chart_data);
  } catch {}
}

function renderLangProgress(progress) {
  const container = document.getElementById('lang-progress-cards');
  container.innerHTML = '';

  const langs = { en: '🇺🇸 English', ar: '🇸🇦 العربية', fr: '🇫🇷 Français' };

  Object.entries(langs).forEach(([code, label]) => {
    const prog = progress[code] || { max_level: 1, total_sessions: 0, avg_wpm: 0 };
    const pct = ((prog.max_level - 1) / 10) * 100;

    container.innerHTML += `
      <div class="lang-prog-item">
        <div class="lang-prog-name">${label}</div>
        <div class="lang-prog-bar"><div class="lang-prog-fill" style="width:${pct}%"></div></div>
        <div class="lang-prog-lvl">Lv.${prog.max_level}/10</div>
      </div>
    `;
  });
}

function renderAllBadges(earnedBadgeIds) {
  const container = document.getElementById('all-badges');
  container.innerHTML = '';

  BADGES_INFO.forEach(b => {
    const earned = earnedBadgeIds.includes(b.id);
    container.innerHTML += `
      <div class="badge-display ${earned ? 'earned' : ''}">
        <div class="badge-icon">${b.icon}</div>
        <div class="badge-name">${b.name}</div>
      </div>
    `;
  });
}

function renderProgressChart(chartData) {
  const canvas = document.getElementById('progressChart');
  if (!canvas) return;

  // Destroy existing chart
  if (window._progressChart) window._progressChart.destroy();

  if (!chartData || chartData.length === 0) {
    canvas.parentElement.innerHTML += '<p style="color:var(--text-3);text-align:center;font-size:.9rem">No data yet. Complete some lessons!</p>';
    return;
  }

  window._progressChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: chartData.map(d => d.date),
      datasets: [
        {
          label: 'WPM',
          data: chartData.map(d => d.wpm),
          borderColor: '#7c6aff',
          backgroundColor: 'rgba(124,106,255,0.1)',
          fill: true, tension: 0.4,
          pointBackgroundColor: '#7c6aff',
          pointRadius: 4,
        },
        {
          label: 'Accuracy %',
          data: chartData.map(d => d.accuracy),
          borderColor: '#00d4aa',
          backgroundColor: 'rgba(0,212,170,0.05)',
          fill: false, tension: 0.4,
          pointBackgroundColor: '#00d4aa',
          pointRadius: 4,
          yAxisID: 'y2',
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#a0a0b8', font: { family: 'Syne' } } }
      },
      scales: {
        x: { ticks: { color: '#606078' }, grid: { color: '#2a2a3a' } },
        y: { ticks: { color: '#606078' }, grid: { color: '#2a2a3a' }, title: { display: true, text: 'WPM', color: '#7c6aff' } },
        y2: { position: 'right', ticks: { color: '#606078' }, grid: { display: false }, title: { display: true, text: 'Accuracy %', color: '#00d4aa' }, min: 0, max: 100 }
      }
    }
  });
}

// ═══════════════════════════════════════════════════════════════
// SOUND EFFECTS
// ═══════════════════════════════════════════════════════════════

let audioCtx = null;

function playError() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(200, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.15);
  } catch {}
}

// ═══════════════════════════════════════════════════════════════
// ENTER KEY in modals
// ═══════════════════════════════════════════════════════════════

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
  if (e.key === 'Enter') {
    const overlay = document.getElementById('modal-overlay');
    if (!overlay.classList.contains('hidden')) {
      const loginActive = !document.getElementById('modal-login').classList.contains('hidden');
      if (loginActive) doLogin();
      else doRegister();
    }
  }
});

/* ═══════════════════════════════════════════════════════════════
   INTEGRATION HOOKS — ربط keyboard.js + levels.js
   مُضاف في نهاية app.js — لا يُعدِّل أي كود موجود
═══════════════════════════════════════════════════════════════ */

/* ── 1. تحديث شريط "المفتاح التالي" مرئياً ──────────────────── */
function updateNextKeyBar(char, lang) {
  const bar = document.getElementById('next-key-bar');
  const charEl = document.getElementById('hint-char-display');
  const fingerEl = document.getElementById('hint-finger-display');
  if (!bar || !charEl) return;

  if (!char || char === ' ') {
    bar.style.display = 'none';
    return;
  }

  bar.style.display = 'flex';
  charEl.textContent = char;

  /* البحث عن اسم الإصبع من KB_LAYOUTS */
  if (typeof KB_LAYOUTS !== 'undefined') {
    const layout = KB_LAYOUTS[lang] || KB_LAYOUTS.en;
    let fingerName = '';
    outer:
    for (const row of layout.rows) {
      for (const key of row.keys) {
        if (key.n === char || key.n === char.toLowerCase() ||
            key.s === char) {
          const fn = (typeof FINGER_NAMES !== 'undefined')
            ? (FINGER_NAMES[lang] || FINGER_NAMES.en)[key.f] || ''
            : '';
          const hn = (typeof HAND_NAMES !== 'undefined')
            ? (HAND_NAMES[lang] || HAND_NAMES.en)[key.h] || ''
            : '';
          fingerName = hn && fn ? `${hn} ${fn}` : (fn || '');
          break outer;
        }
      }
    }
    fingerEl.textContent = fingerName ? `← ${fingerName}` : '';
  }
}

/* ── 2. Override لـ handleTypingInput لدمج الميزات الجديدة ───── */
(function enhanceTypingInput() {
  /* ننتظر حتى يتأكد تحميل كل شيء */
  const _tryPatch = () => {
    const inputEl = document.getElementById('typing-input');
    if (!inputEl) { setTimeout(_tryPatch, 200); return; }

    inputEl.addEventListener('input', function(e) {
      const typed = this.value;
      const lang = (typeof STATE !== 'undefined') ? STATE.currentLang : 'en';

      /* تحديث next-key highlight في لوحة المفاتيح */
      if (typeof updateNextKeyHighlight === 'function') {
        updateNextKeyHighlight(typed.length);
      }

      /* تحديث الشريط المرئي */
      const chars = document.querySelectorAll('.char');
      const cursor = chars[typed.length];
      if (cursor) {
        const ch = cursor.textContent;
        updateNextKeyBar(ch, lang);
        if (typeof highlightNextKey === 'function') highlightNextKey(ch);
      } else {
        updateNextKeyBar(null, lang);
        if (typeof highlightNextKey === 'function') highlightNextKey(null);
      }
    }, true); /* useCapture=true يجعله يعمل قبل handler الآخر */
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _tryPatch);
  } else {
    _tryPatch();
  }
})();

/* ── 3. تهيئة لوحة المفاتيح عند فتح شاشة التمرين ───────────── */
(function hookPracticeScreen() {
  const _origShowScreen = window.showScreen;
  if (typeof _origShowScreen === 'function') {
    window.showScreen = function(name) {
      _origShowScreen(name);
      if (name === 'practice') {
        const lang = (typeof STATE !== 'undefined') ? STATE.currentLang : 'en';
        if (typeof initEnhancedKeyboard === 'function') {
          setTimeout(() => initEnhancedKeyboard(lang), 50);
        }
        /* تحديث lang في شريط next-key */
        const bar = document.getElementById('next-key-bar');
        if (bar) bar.style.display = 'none';
      }
    };
  }
})();

/* ── 4. حفظ أفضل نتيجة محلياً بعد كل درس ──────────────────── */
(function hookFinishLesson() {
  const _origFinish = window.finishLesson;
  if (typeof _origFinish === 'function') {
    window.finishLesson = function(wpm, accuracy, errors, durationMin) {
      const lang = (typeof STATE !== 'undefined') ? STATE.currentLang : 'en';
      const lvl  = (typeof STATE !== 'undefined') ? STATE.currentLevel : 1;
      if (typeof onLessonFinished === 'function') {
        onLessonFinished(lang, lvl, wpm, accuracy);
      }
      _origFinish(wpm, accuracy, errors, durationMin);
    };
  }
})();
