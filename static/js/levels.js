/* ═══════════════════════════════════════════════════════════════
   TYPECRAFT — levels.js
   نظام المستويات المحسَّن — مستقل تماماً
   ═══════════════════════════════════════════════════════════════
   الميزات الجديدة:
   1. تصنيف الدروس ضمن مجموعات (Category Groups)
   2. شريط تقدم لكل فئة
   3. واجهة بصرية تشبه TypingClub
   4. معلومات تفصيلية لكل مستوى (نوع الأصابع المستخدمة)
   5. أفضل نتيجة مخزَّنة محلياً
   ═══════════════════════════════════════════════════════════════ */

/* ─── تعريف الفئات ──────────────────────────────────────────── */
const LEVEL_CATEGORIES = {
  en: [
    {
      id: 'foundation',
      title: 'Foundation',
      title_ar: 'الأساسيات',
      icon: '🏠',
      color: '#7c6aff',
      desc: 'Master the home position',
      levels: [1, 2, 3],
      fingers: ['Home Row', 'Top Row', 'Bottom Row'],
    },
    {
      id: 'words',
      title: 'Words',
      title_ar: 'كلمات',
      icon: '📝',
      color: '#00d4aa',
      desc: 'Build vocabulary speed',
      levels: [4, 5],
      fingers: ['All Fingers'],
    },
    {
      id: 'fluency',
      title: 'Fluency',
      title_ar: 'الطلاقة',
      icon: '⚡',
      color: '#fb923c',
      desc: 'Sentences and texts',
      levels: [6, 7, 8],
      fingers: ['Full Keyboard'],
    },
    {
      id: 'mastery',
      title: 'Mastery',
      title_ar: 'الإتقان',
      icon: '🏆',
      color: '#f5c842',
      desc: 'Speed and precision',
      levels: [9, 10],
      fingers: ['Advanced'],
    },
  ],
  fr: [
    {
      id: 'fondation', title: 'Fondation', icon: '🏠', color: '#7c6aff',
      desc: 'Maîtrisez la position de base', levels: [1, 2, 3], fingers: ['Rangée centrale', 'Rangée sup.', 'Rangée inf.'],
    },
    {
      id: 'mots', title: 'Mots', icon: '📝', color: '#00d4aa',
      desc: 'Vitesse de vocabulaire', levels: [4, 5], fingers: ['Tous les doigts'],
    },
    {
      id: 'fluidite', title: 'Fluidité', icon: '⚡', color: '#fb923c',
      desc: 'Phrases et textes', levels: [6, 7, 8], fingers: ['Clavier complet'],
    },
    {
      id: 'maitrise', title: 'Maîtrise', icon: '🏆', color: '#f5c842',
      desc: 'Vitesse et précision', levels: [9, 10], fingers: ['Avancé'],
    },
  ],
  ar: [
    {
      id: 'asas', title: 'الأساسيات', icon: '🏠', color: '#7c6aff',
      desc: 'إتقان الوضع الأساسي', levels: [1, 2, 3], fingers: ['الصف الأوسط', 'الصف العلوي', 'الصف السفلي'],
    },
    {
      id: 'kalimat', title: 'الكلمات', icon: '📝', color: '#00d4aa',
      desc: 'بناء سرعة المفردات', levels: [3, 4, 5], fingers: ['جميع الأصابع'],
    },
    {
      id: 'talaqa', title: 'الطلاقة', icon: '⚡', color: '#fb923c',
      desc: 'الجمل والنصوص', levels: [5, 6, 7, 8], fingers: ['لوحة كاملة'],
    },
    {
      id: 'itqan', title: 'الإتقان', icon: '🏆', color: '#f5c842',
      desc: 'السرعة والدقة', levels: [9, 10], fingers: ['متقدم'],
    },
  ],
};

/* ─── معرفة خصائص كل level ─────────────────────────────────── */
const LEVEL_DETAILS = {
  en: {
    1: { fingers: ['L-Pinky','L-Ring','L-Middle','L-Index','R-Index','R-Middle','R-Ring','R-Pinky'], label: 'Home Row Only' },
    2: { fingers: ['All Left', 'All Right'], label: 'Top Row + Home' },
    3: { fingers: ['All Fingers'], label: 'Full Alpha' },
    4: { fingers: ['All'], label: '100 Common Words' },
    5: { fingers: ['All'], label: 'Simple Sentences' },
    6: { fingers: ['All'], label: 'Pangrams' },
    7: { fingers: ['All + Nums'], label: 'Symbols & Numbers' },
    8: { fingers: ['All'], label: 'Quotes' },
    9: { fingers: ['All'], label: 'Long Text' },
    10: { fingers: ['All'], label: 'Speed Run' },
  },
};

/* ─── بيانات أفضل النتائج المحلية ──────────────────────────── */
const LOCAL_BESTS_KEY = 'tc_bests';

function getLocalBests() {
  try { return JSON.parse(localStorage.getItem(LOCAL_BESTS_KEY) || '{}'); } catch { return {}; }
}

function saveLocalBest(lang, levelId, wpm, accuracy) {
  const bests = getLocalBests();
  const key = `${lang}_${levelId}`;
  const current = bests[key] || { wpm: 0, accuracy: 0 };
  if (wpm > current.wpm || (wpm === current.wpm && accuracy > current.accuracy)) {
    bests[key] = { wpm: Math.round(wpm), accuracy: Math.round(accuracy), date: new Date().toLocaleDateString() };
    try { localStorage.setItem(LOCAL_BESTS_KEY, JSON.stringify(bests)); } catch {}
  }
  return bests[key];
}

function getLocalBest(lang, levelId) {
  const bests = getLocalBests();
  return bests[`${lang}_${levelId}`] || null;
}

/* ═══════════════════════════════════════════════════════════════
   الدالة الرئيسية: رسم شبكة المستويات المحسَّنة
═══════════════════════════════════════════════════════════════ */
function renderEnhancedLevels(lessons, lang) {
  const grid = document.getElementById('levels-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const categories = LEVEL_CATEGORIES[lang] || LEVEL_CATEGORIES.en;
  const isRTL = lang === 'ar';

  /* ── إضافة شريط التقدم الكلي في الأعلى ─────────────────── */
  const completedCount = lessons.filter(l => l.completed).length;
  const totalCount = lessons.length;
  const overallPct = Math.round((completedCount / totalCount) * 100);

  const overallBar = document.createElement('div');
  overallBar.className = 'levels-overall-progress';
  overallBar.innerHTML = `
    <div class="overall-progress-text" dir="${isRTL ? 'rtl' : 'ltr'}">
      <span>${isRTL ? 'التقدم الكلي' : (lang === 'fr' ? 'Progression totale' : 'Overall Progress')}</span>
      <span class="overall-pct">${completedCount}/${totalCount} — ${overallPct}%</span>
    </div>
    <div class="overall-progress-bar">
      <div class="overall-progress-fill" style="width:${overallPct}%"></div>
    </div>
  `;
  grid.appendChild(overallBar);

  /* ── بناء كل فئة ─────────────────────────────────────────── */
  categories.forEach(cat => {
    const catLessons = lessons.filter(l => cat.levels.includes(l.id));
    if (catLessons.length === 0) return;

    const catCompleted = catLessons.filter(l => l.completed).length;
    const catPct = Math.round((catCompleted / catLessons.length) * 100);
    const catLocked = catLessons.every(l => l.locked);

    /* ── بطاقة الفئة ─────────────────────────────────────── */
    const catSection = document.createElement('div');
    catSection.className = `level-category ${catLocked ? 'cat-locked' : ''}`;
    catSection.style.setProperty('--cat-color', cat.color);

    catSection.innerHTML = `
      <div class="cat-header" dir="${isRTL ? 'rtl' : 'ltr'}">
        <div class="cat-icon-wrap" style="background:${cat.color}20;border-color:${cat.color}40">
          <span class="cat-icon">${cat.icon}</span>
        </div>
        <div class="cat-info">
          <div class="cat-title" style="color:${cat.color}">${cat.title}</div>
          <div class="cat-desc">${cat.desc}</div>
        </div>
        <div class="cat-progress-wrap">
          <div class="cat-progress-bar">
            <div class="cat-progress-fill" style="width:${catPct}%;background:${cat.color}"></div>
          </div>
          <div class="cat-progress-label">${catCompleted}/${catLessons.length}</div>
        </div>
      </div>
      <div class="cat-levels-row" id="cat-levels-${cat.id}"></div>
    `;

    grid.appendChild(catSection);

    /* ── بناء بطاقات الدروس داخل الفئة ──────────────────── */
    const catLevelsRow = catSection.querySelector(`#cat-levels-${cat.id}`);
    catLessons.forEach(lesson => {
      const best = getLocalBest(lang, lesson.id);
      const card = _buildLevelCard(lesson, cat, best, lang, isRTL);
      catLevelsRow.appendChild(card);
    });
  });
}

/* ─── بناء بطاقة مستوى واحد ────────────────────────────────── */
function _buildLevelCard(lesson, cat, best, lang, isRTL) {
  const card = document.createElement('div');
  card.className = [
    'level-card enhanced-card',
    lesson.locked ? 'locked' : '',
    lesson.completed ? 'completed' : '',
    !lesson.locked && !lesson.completed ? 'available' : '',
  ].filter(Boolean).join(' ');

  card.style.setProperty('--cat-color', cat.color);

  /* نجوم بناءً على أفضل WPM */
  let stars = '☆☆☆';
  if (best) {
    if (best.wpm >= 60 && best.accuracy >= 95)      stars = '★★★';
    else if (best.wpm >= 40 && best.accuracy >= 80) stars = '★★☆';
    else if (best.wpm >= 20)                        stars = '★☆☆';
  }

  /* نوع الدرس بالألوان */
  const typeColors = {
    keys:'#7c6aff', words:'#00d4aa', sentences:'#fb923c',
    text:'#4ade80', special:'#f5c842'
  };
  const typeColor = typeColors[lesson.type] || '#a0a0b8';

  const typeLabels = {
    keys: { en:'Keys', fr:'Touches', ar:'مفاتيح' },
    words: { en:'Words', fr:'Mots', ar:'كلمات' },
    sentences: { en:'Sentences', fr:'Phrases', ar:'جمل' },
    text: { en:'Text', fr:'Texte', ar:'نص' },
    special: { en:'Special', fr:'Spécial', ar:'خاص' },
  };
  const typeLabel = typeLabels[lesson.type]?.[lang] || lesson.type.toUpperCase();

  card.innerHTML = `
    <div class="ecard-top" dir="${isRTL ? 'rtl' : 'ltr'}">
      <div class="ecard-num" style="color:${cat.color}">
        ${isRTL ? '' : 'LV.'}<span>${lesson.id}</span>${isRTL ? ' .مستوى' : ''}
      </div>
      <div class="ecard-stars">${stars}</div>
    </div>

    <div class="ecard-title" dir="${isRTL ? 'rtl' : 'ltr'}">${lesson.title}</div>
    <div class="ecard-desc" dir="${isRTL ? 'rtl' : 'ltr'}">${lesson.description}</div>

    <div class="ecard-footer" dir="${isRTL ? 'rtl' : 'ltr'}">
      <span class="ecard-type" style="color:${typeColor};border-color:${typeColor}40;background:${typeColor}12">${typeLabel}</span>
      ${best ? `<span class="ecard-best"><span class="ecard-wpm-icon">⚡</span>${best.wpm} WPM</span>` : ''}
    </div>

    ${lesson.locked ? `
      <div class="ecard-locked-overlay">
        <div class="lock-circle">🔒</div>
        <div class="lock-hint">${isRTL ? 'أكمل الدرس السابق' : (lang === 'fr' ? 'Finissez le précédent' : 'Complete previous')}</div>
      </div>
    ` : ''}

    ${lesson.completed ? '<div class="ecard-done-check">✓</div>' : ''}
  `;

  if (!lesson.locked) {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      /* تأثير ضغط */
      card.classList.add('card-press');
      setTimeout(() => card.classList.remove('card-press'), 150);
      /* استدعاء startLesson من app.js */
      if (typeof startLesson === 'function') startLesson(lesson.id);
    });

    /* hover: إظهار مستوى تفاصيل أكثر */
    card.addEventListener('mouseenter', () => _showCardTooltip(card, lesson, lang, cat));
    card.addEventListener('mouseleave', () => _hideCardTooltip());
  }

  return card;
}

/* ─── Tooltip مفصَّل عند التحويم ───────────────────────────── */
let _tooltipEl = null;

function _showCardTooltip(card, lesson, lang, cat) {
  _hideCardTooltip();
  const best = getLocalBest(lang, lesson.id);
  if (!best && lesson.locked) return;

  const tt = document.createElement('div');
  tt.className = 'level-tooltip';
  const isRTL = lang === 'ar';

  tt.innerHTML = `
    <div class="tt-title" dir="${isRTL ? 'rtl' : 'ltr'}">${lesson.title}</div>
    ${best ? `
      <div class="tt-row"><span>⚡</span><span>${best.wpm} WPM</span></div>
      <div class="tt-row"><span>🎯</span><span>${best.accuracy}%</span></div>
      <div class="tt-row"><span>📅</span><span>${best.date}</span></div>
    ` : `<div class="tt-no-data">${isRTL ? 'لم تُجرَّب بعد' : (lang === 'fr' ? 'Pas encore essayé' : 'Not attempted yet')}</div>`}
    <div class="tt-cta">${isRTL ? 'انقر للبدء' : (lang === 'fr' ? 'Cliquer pour commencer' : 'Click to start')}</div>
  `;

  document.body.appendChild(tt);
  _tooltipEl = tt;

  const rect = card.getBoundingClientRect();
  tt.style.top = `${rect.top + window.scrollY - tt.offsetHeight - 8}px`;
  tt.style.left = `${rect.left + rect.width / 2 - tt.offsetWidth / 2}px`;
}

function _hideCardTooltip() {
  if (_tooltipEl) { _tooltipEl.remove(); _tooltipEl = null; }
}

/* ═══════════════════════════════════════════════════════════════
   حفظ أفضل نتيجة بعد اكتمال الدرس
   — يُستدعى من finishLesson في app.js
═══════════════════════════════════════════════════════════════ */
function onLessonFinished(lang, levelId, wpm, accuracy) {
  saveLocalBest(lang, levelId, wpm, accuracy);
}

/* ═══════════════════════════════════════════════════════════════
   Monkey-patch على renderLevels الأصلية في app.js
   بدلاً من تعديل app.js مباشرة، نُعيد تعريف الدالة هنا
═══════════════════════════════════════════════════════════════ */
(function patchRenderLevels() {
  /* ننتظر تحميل app.js كاملاً */
  window.addEventListener('load', () => {
    /* احتفظ بالنسخة الأصلية للرجوع إليها */
    if (typeof renderLevels === 'function') {
      window._origRenderLevels = renderLevels;
    }

    /* استبدلها بالنسخة المحسَّنة */
    window.renderLevels = function(lessons) {
      const lang = (typeof STATE !== 'undefined') ? STATE.currentLang : 'en';
      renderEnhancedLevels(lessons, lang);
    };

    /* Patch على setupPracticeScreen لاستدعاء initEnhancedKeyboard */
    if (typeof setupPracticeScreen === 'function') {
      window._origSetupPractice = setupPracticeScreen;
      window.setupPracticeScreen = function(lesson) {
        _origSetupPractice(lesson);
        const lang = (typeof STATE !== 'undefined') ? STATE.currentLang : 'en';
        initEnhancedKeyboard(lang);
      };
    }

    /* Patch على handleTypingInput لتحديث next-key */
    if (typeof handleTypingInput === 'function') {
      window._origHandleTypingInput = handleTypingInput;
      window.handleTypingInput = function(e) {
        _origHandleTypingInput(e);
        const typed = document.getElementById('typing-input')?.value || '';
        updateNextKeyHighlight(typed.length);
      };
    }

    /* Patch على finishLesson لحفظ أفضل نتيجة */
    if (typeof finishLesson === 'function') {
      window._origFinishLesson = finishLesson;
      window.finishLesson = function(wpm, accuracy, errors, durationMin) {
        const lang = (typeof STATE !== 'undefined') ? STATE.currentLang : 'en';
        const lvl  = (typeof STATE !== 'undefined') ? STATE.currentLevel : 1;
        onLessonFinished(lang, lvl, wpm, accuracy);
        _origFinishLesson(wpm, accuracy, errors, durationMin);
      };
    }
  });
})();
