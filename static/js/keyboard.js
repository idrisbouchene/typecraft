/* ═══════════════════════════════════════════════════════════════
   TYPECRAFT — keyboard.js
   ملف مستقل تماماً — لا يُعدِّل أي كود موجود، فقط يُضيف
   ═══════════════════════════════════════════════════════════════
   الميزات الجديدة:
   1. لوحة مفاتيح تفاعلية كاملة (EN/FR/AR) مع Shift layer
   2. إبراز المفتاح التالي المطلوب (next-key highlight)
   3. إبراز أصابع اليدين المسؤولة عن كل مفتاح
   4. تأثير نبض عند الكتابة الصحيحة
   5. Tooltip يظهر اسم الإصبع عند التحويم
   ═══════════════════════════════════════════════════════════════ */

/* ─── تعريف تخطيطات لوحات المفاتيح الكاملة ─────────────────── */
const KB_LAYOUTS = {

  /* ══════════ ENGLISH — QWERTY ══════════ */
  en: {
    rows: [
      // [normal, shifted, finger, hand]
      // finger: 0=pinky,1=ring,2=middle,3=index,4=index(stretch),5=thumb
      // hand: L/R
      { keys: [
        { n:'`', s:'~',  f:0, h:'L' }, { n:'1', s:'!',  f:0, h:'L' },
        { n:'2', s:'@',  f:1, h:'L' }, { n:'3', s:'#',  f:2, h:'L' },
        { n:'4', s:'$',  f:3, h:'L' }, { n:'5', s:'%',  f:4, h:'L' },
        { n:'6', s:'^',  f:4, h:'R' }, { n:'7', s:'&',  f:3, h:'R' },
        { n:'8', s:'*',  f:2, h:'R' }, { n:'9', s:'(',  f:1, h:'R' },
        { n:'0', s:')',  f:0, h:'R' }, { n:'-', s:'_',  f:0, h:'R' },
        { n:'=', s:'+',  f:0, h:'R' }, { n:'⌫', s:'⌫',  f:0, h:'R', wide:true },
      ]},
      { keys: [
        { n:'⇥', s:'⇥',  f:0, h:'L', wide:true },
        { n:'q', s:'Q',  f:0, h:'L' }, { n:'w', s:'W',  f:1, h:'L' },
        { n:'e', s:'E',  f:2, h:'L' }, { n:'r', s:'R',  f:3, h:'L' },
        { n:'t', s:'T',  f:4, h:'L' }, { n:'y', s:'Y',  f:4, h:'R' },
        { n:'u', s:'U',  f:3, h:'R' }, { n:'i', s:'I',  f:2, h:'R' },
        { n:'o', s:'O',  f:1, h:'R' }, { n:'p', s:'P',  f:0, h:'R' },
        { n:'[', s:'{',  f:0, h:'R' }, { n:']', s:'}',  f:0, h:'R' },
        { n:'\\', s:'|', f:0, h:'R' },
      ]},
      { keys: [
        { n:'⇪', s:'⇪',  f:0, h:'L', wide:true, special:'caps' },
        { n:'a', s:'A',  f:0, h:'L', home:true }, { n:'s', s:'S',  f:1, h:'L', home:true },
        { n:'d', s:'D',  f:2, h:'L', home:true }, { n:'f', s:'F',  f:3, h:'L', home:true },
        { n:'g', s:'G',  f:4, h:'L' }, { n:'h', s:'H',  f:4, h:'R' },
        { n:'j', s:'J',  f:3, h:'R', home:true }, { n:'k', s:'K',  f:2, h:'R', home:true },
        { n:'l', s:'L',  f:1, h:'R', home:true }, { n:';', s:':',  f:0, h:'R', home:true },
        { n:"'", s:'"',  f:0, h:'R' },
        { n:'↵', s:'↵',  f:0, h:'R', wide:true },
      ]},
      { keys: [
        { n:'⇧', s:'⇧',  f:0, h:'L', wide:true, special:'shift' },
        { n:'z', s:'Z',  f:0, h:'L' }, { n:'x', s:'X',  f:1, h:'L' },
        { n:'c', s:'C',  f:2, h:'L' }, { n:'v', s:'V',  f:3, h:'L' },
        { n:'b', s:'B',  f:4, h:'L' }, { n:'n', s:'N',  f:4, h:'R' },
        { n:'m', s:'M',  f:3, h:'R' }, { n:',', s:'<',  f:2, h:'R' },
        { n:'.', s:'>',  f:1, h:'R' }, { n:'/', s:'?',  f:0, h:'R' },
        { n:'⇧', s:'⇧',  f:0, h:'R', wide:true, special:'shift' },
      ]},
      { keys: [
        { n:'', s:'',    f:5, h:'L', wide:true, special:'space-l' },
        { n:'⎵', s:'⎵',  f:5, h:'L', wide:'space', special:'space' },
        { n:'', s:'',    f:5, h:'R', wide:true, special:'space-r' },
      ]},
    ],
    homeRow: ['a','s','d','f','j','k','l',';'],
    name: 'QWERTY',
  },

  /* ══════════ FRENCH — AZERTY ══════════ */
  fr: {
    rows: [
      { keys: [
        { n:'²', s:'',   f:0, h:'L' }, { n:'&', s:'1',  f:0, h:'L' },
        { n:'é', s:'2',  f:1, h:'L' }, { n:'"', s:'3',  f:2, h:'L' },
        { n:"'", s:'4',  f:3, h:'L' }, { n:'(', s:'5',  f:4, h:'L' },
        { n:'-', s:'6',  f:4, h:'R' }, { n:'è', s:'7',  f:3, h:'R' },
        { n:'_', s:'8',  f:2, h:'R' }, { n:'ç', s:'9',  f:1, h:'R' },
        { n:'à', s:'0',  f:0, h:'R' }, { n:')', s:'°',  f:0, h:'R' },
        { n:'=', s:'+',  f:0, h:'R' }, { n:'⌫', s:'⌫',  f:0, h:'R', wide:true },
      ]},
      { keys: [
        { n:'⇥', s:'⇥',  f:0, h:'L', wide:true },
        { n:'a', s:'A',  f:0, h:'L' }, { n:'z', s:'Z',  f:1, h:'L' },
        { n:'e', s:'E',  f:2, h:'L' }, { n:'r', s:'R',  f:3, h:'L' },
        { n:'t', s:'T',  f:4, h:'L' }, { n:'y', s:'Y',  f:4, h:'R' },
        { n:'u', s:'U',  f:3, h:'R' }, { n:'i', s:'I',  f:2, h:'R' },
        { n:'o', s:'O',  f:1, h:'R' }, { n:'p', s:'P',  f:0, h:'R' },
        { n:'^', s:'¨',  f:0, h:'R' }, { n:'$', s:'£',  f:0, h:'R' },
      ]},
      { keys: [
        { n:'⇪', s:'⇪',  f:0, h:'L', wide:true, special:'caps' },
        { n:'q', s:'Q',  f:0, h:'L', home:true }, { n:'s', s:'S',  f:1, h:'L', home:true },
        { n:'d', s:'D',  f:2, h:'L', home:true }, { n:'f', s:'F',  f:3, h:'L', home:true },
        { n:'g', s:'G',  f:4, h:'L' }, { n:'h', s:'H',  f:4, h:'R' },
        { n:'j', s:'J',  f:3, h:'R', home:true }, { n:'k', s:'K',  f:2, h:'R', home:true },
        { n:'l', s:'L',  f:1, h:'R', home:true }, { n:'m', s:'M',  f:0, h:'R', home:true },
        { n:'ù', s:'%',  f:0, h:'R' }, { n:'*', s:'µ',  f:0, h:'R' },
        { n:'↵', s:'↵',  f:0, h:'R', wide:true },
      ]},
      { keys: [
        { n:'⇧', s:'⇧',  f:0, h:'L', wide:true, special:'shift' },
        { n:'<', s:'>',  f:0, h:'L' },
        { n:'w', s:'W',  f:0, h:'L' }, { n:'x', s:'X',  f:1, h:'L' },
        { n:'c', s:'C',  f:2, h:'L' }, { n:'v', s:'V',  f:3, h:'L' },
        { n:'b', s:'B',  f:4, h:'L' }, { n:'n', s:'N',  f:4, h:'R' },
        { n:',', s:'?',  f:3, h:'R' }, { n:';', s:'.',  f:2, h:'R' },
        { n:':', s:'/', f:1, h:'R' }, { n:'!', s:'§',  f:0, h:'R' },
        { n:'⇧', s:'⇧',  f:0, h:'R', wide:true, special:'shift' },
      ]},
      { keys: [
        { n:'', s:'',    f:5, h:'L', wide:true, special:'space-l' },
        { n:'⎵', s:'⎵',  f:5, h:'L', wide:'space', special:'space' },
        { n:'', s:'',    f:5, h:'R', wide:true, special:'space-r' },
      ]},
    ],
    homeRow: ['q','s','d','f','j','k','l','m'],
    name: 'AZERTY',
  },

  /* ══════════ ARABIC ══════════ */
  ar: {
    rows: [
      { keys: [
        { n:'ذ', s:'~',  f:0, h:'R' }, { n:'١', s:'!',  f:0, h:'R' },
        { n:'٢', s:'@',  f:1, h:'R' }, { n:'٣', s:'#',  f:2, h:'R' },
        { n:'٤', s:'$',  f:3, h:'R' }, { n:'٥', s:'%',  f:4, h:'R' },
        { n:'٦', s:'^',  f:4, h:'L' }, { n:'٧', s:'&',  f:3, h:'L' },
        { n:'٨', s:'*',  f:2, h:'L' }, { n:'٩', s:'(',  f:1, h:'L' },
        { n:'٠', s:')',  f:0, h:'L' }, { n:'-', s:'_',  f:0, h:'L' },
        { n:'=', s:'+',  f:0, h:'L' }, { n:'⌫', s:'⌫',  f:0, h:'L', wide:true },
      ]},
      { keys: [
        { n:'⇥', s:'⇥',  f:0, h:'R', wide:true },
        { n:'ض', s:'',   f:0, h:'R' }, { n:'ص', s:'',   f:1, h:'R' },
        { n:'ث', s:'',   f:2, h:'R' }, { n:'ق', s:'',   f:3, h:'R' },
        { n:'ف', s:'',   f:4, h:'R' }, { n:'غ', s:'',   f:4, h:'L' },
        { n:'ع', s:'',   f:3, h:'L' }, { n:'ه', s:'',   f:2, h:'L' },
        { n:'خ', s:'',   f:1, h:'L' }, { n:'ح', s:'',   f:0, h:'L' },
        { n:'ج', s:'',   f:0, h:'L' }, { n:'د', s:'',   f:0, h:'L' },
      ]},
      { keys: [
        { n:'⇪', s:'⇪',  f:0, h:'R', wide:true, special:'caps' },
        { n:'ش', s:'',   f:0, h:'R', home:true }, { n:'س', s:'',   f:1, h:'R', home:true },
        { n:'ي', s:'',   f:2, h:'R', home:true }, { n:'ب', s:'',   f:3, h:'R', home:true },
        { n:'ل', s:'',   f:4, h:'R' }, { n:'ا', s:'آ',  f:4, h:'L' },
        { n:'ت', s:'',   f:3, h:'L', home:true }, { n:'ن', s:'',   f:2, h:'L', home:true },
        { n:'م', s:'',   f:1, h:'L', home:true }, { n:'ك', s:'',   f:0, h:'L', home:true },
        { n:'ط', s:'',   f:0, h:'L' },
        { n:'↵', s:'↵',  f:0, h:'L', wide:true },
      ]},
      { keys: [
        { n:'⇧', s:'⇧',  f:0, h:'R', wide:true, special:'shift' },
        { n:'ئ', s:'',   f:0, h:'R' }, { n:'ء', s:'',   f:1, h:'R' },
        { n:'ؤ', s:'',   f:2, h:'R' }, { n:'ر', s:'',   f:3, h:'R' },
        { n:'لا', s:'',  f:4, h:'R' }, { n:'ى', s:'',   f:4, h:'L' },
        { n:'ة', s:'',   f:3, h:'L' }, { n:'و', s:'',   f:2, h:'L' },
        { n:'ز', s:'',   f:1, h:'L' }, { n:'ظ', s:'',   f:0, h:'L' },
        { n:'⇧', s:'⇧',  f:0, h:'L', wide:true, special:'shift' },
      ]},
      { keys: [
        { n:'', s:'',    f:5, h:'R', wide:true, special:'space-l' },
        { n:'⎵', s:'⎵',  f:5, h:'R', wide:'space', special:'space' },
        { n:'', s:'',    f:5, h:'L', wide:true, special:'space-r' },
      ]},
    ],
    homeRow: ['ش','س','ي','ب','ت','ن','م','ك'],
    name: 'عربي',
    rtl: true,
  },
};

/* ─── أسماء الأصابع ─────────────────────────────────────────── */
const FINGER_NAMES = {
  en: { 0:'Pinky', 1:'Ring', 2:'Middle', 3:'Index', 4:'Index', 5:'Thumb' },
  fr: { 0:'Auriculaire', 1:'Annulaire', 2:'Majeur', 3:'Index', 4:'Index', 5:'Pouce' },
  ar: { 0:'الخنصر', 1:'البنصر', 2:'الوسطى', 3:'السبابة', 4:'السبابة', 5:'الإبهام' },
};

const HAND_NAMES = {
  en: { L:'Left', R:'Right' },
  fr: { L:'Gauche', R:'Droite' },
  ar: { L:'يسار', R:'يمين' },
};

/* ─── خريطة المفاتيح المسطحة للبحث السريع ─────────────────── */
let _keyMap = {};   // key_char → { el, keyDef }
let _shiftActive = false;
let _currentNextChar = null;

/* ═══════════════════════════════════════════════════════════════
   البناء الرئيسي للوحة المفاتيح
═══════════════════════════════════════════════════════════════ */
function buildEnhancedKeyboard(lang) {
  const layout = KB_LAYOUTS[lang];
  if (!layout) return;

  const container = document.getElementById('keyboard-display');
  if (!container) return;

  container.innerHTML = '';
  container.className = 'keyboard-display enhanced-kb';
  if (layout.rtl) container.classList.add('kb-rtl');

  _keyMap = {};

  /* ── رأس لوحة المفاتيح: اسم التخطيط + مبدّل الطبقة ──── */
  const header = document.createElement('div');
  header.className = 'kb-header';
  header.innerHTML = `
    <div class="kb-layout-badge">
      <span class="kb-layout-icon">${lang === 'ar' ? '🔤' : '⌨'}</span>
      <span class="kb-layout-name">${layout.name}</span>
    </div>
    <div class="kb-legend">
      <span class="kb-legend-item home-row-legend">■ Home Row</span>
      <span class="kb-legend-item next-key-legend">■ Next Key</span>
    </div>
  `;
  container.appendChild(header);

  /* ── بناء كل صف ──────────────────────────────────────── */
  layout.rows.forEach((rowDef, rowIndex) => {
    const rowEl = document.createElement('div');
    rowEl.className = `kb-row kb-row-${rowIndex}`;
    if (layout.rtl) rowEl.style.direction = 'ltr'; // مفاتيح تُبنى LTR دائماً

    rowDef.keys.forEach(keyDef => {
      const keyEl = document.createElement('div');
      keyEl.className = 'kb-key enhanced';

      /* classes بناءً على خصائص المفتاح */
      if (keyDef.home)    keyEl.classList.add('home-row');
      if (keyDef.wide)    keyEl.classList.add(keyDef.wide === 'space' ? 'kb-space' : 'kb-wide');
      if (keyDef.special) keyEl.classList.add(`kb-${keyDef.special}`);

      /* لون الإصبع */
      if (keyDef.f !== undefined && keyDef.h) {
        keyEl.classList.add(`finger-${keyDef.h.toLowerCase()}${keyDef.f}`);
        keyEl.dataset.finger = keyDef.f;
        keyEl.dataset.hand = keyDef.h;
      }

      /* المحتوى الداخلي */
      if (keyDef.special === 'space') {
        keyEl.innerHTML = '<span class="kb-key-main">SPACE</span>';
      } else if (keyDef.special && ['space-l','space-r'].includes(keyDef.special)) {
        keyEl.style.flex = '1';
        keyEl.style.visibility = 'hidden';
      } else {
        const shifted = keyDef.s && keyDef.s !== keyDef.n ? `<span class="kb-key-shift">${keyDef.s}</span>` : '';
        keyEl.innerHTML = `${shifted}<span class="kb-key-main">${keyDef.n}</span>`;
      }

      /* tooltip */
      if (keyDef.f !== undefined && keyDef.h && !keyDef.special) {
        const fn = FINGER_NAMES[lang]?.[keyDef.f] || '';
        const hn = HAND_NAMES[lang]?.[keyDef.h] || '';
        keyEl.title = `${hn} ${fn}`;
      }

      /* dataset للبحث */
      keyEl.dataset.key = keyDef.n;
      keyEl.dataset.shifted = keyDef.s || '';

      /* تسجيل في الخريطة */
      const keyLower = keyDef.n.toLowerCase();
      _keyMap[keyLower] = { el: keyEl, def: keyDef };
      if (keyDef.s) _keyMap[keyDef.s] = { el: keyEl, def: keyDef };

      rowEl.appendChild(keyEl);
    });

    container.appendChild(rowEl);
  });

  /* ── إصبع اليد SVG ───────────────────────────────────── */
  _buildHandDiagram(container, lang);
}

/* ─── رسم يدين توضيحيتين ────────────────────────────────────── */
function _buildHandDiagram(container, lang) {
  const hands = document.createElement('div');
  hands.className = 'kb-hands';
  hands.id = 'kb-hands';

  const fingerLabels = FINGER_NAMES[lang] || FINGER_NAMES.en;

  ['L','R'].forEach(hand => {
    const handEl = document.createElement('div');
    handEl.className = `kb-hand kb-hand-${hand.toLowerCase()}`;

    const fingers = hand === 'L'
      ? [0,1,2,3,4]   // pinky→index
      : [4,3,2,1,0];  // index→pinky

    fingers.forEach(f => {
      const fingerEl = document.createElement('div');
      fingerEl.className = `kb-finger kb-finger-${hand.toLowerCase()}${f}`;
      fingerEl.id = `finger-${hand}-${f}`;
      fingerEl.innerHTML = `<span class="finger-tip"></span><span class="finger-label">${fingerLabels[f][0]}</span>`;
      handEl.appendChild(fingerEl);
    });

    // إبهام
    const thumbEl = document.createElement('div');
    thumbEl.className = `kb-finger kb-thumb kb-finger-${hand.toLowerCase()}5`;
    thumbEl.id = `finger-${hand}-5`;
    thumbEl.innerHTML = `<span class="finger-tip"></span><span class="finger-label">${fingerLabels[5][0]}</span>`;
    handEl.appendChild(thumbEl);

    hands.appendChild(handEl);
  });

  container.appendChild(hands);
}

/* ═══════════════════════════════════════════════════════════════
   تمييز المفتاح الحالي (التالي المطلوب)
═══════════════════════════════════════════════════════════════ */
function highlightNextKey(char) {
  /* أزِل التمييز القديم */
  document.querySelectorAll('.kb-key.next-key').forEach(k => k.classList.remove('next-key'));
  document.querySelectorAll('.kb-finger.active-finger').forEach(f => f.classList.remove('active-finger'));

  if (!char) return;
  _currentNextChar = char;

  const charLower = char.toLowerCase();
  const entry = _keyMap[char] || _keyMap[charLower];
  if (!entry) return;

  entry.el.classList.add('next-key');

  /* تمييز الإصبع المقابل */
  const { h, f } = entry.def;
  if (h && f !== undefined) {
    const fingerEl = document.getElementById(`finger-${h}-${f}`);
    if (fingerEl) fingerEl.classList.add('active-finger');
  }
}

/* ═══════════════════════════════════════════════════════════════
   تمييز المفتاح المضغوط حالياً
═══════════════════════════════════════════════════════════════ */
function highlightPressedKey(char) {
  document.querySelectorAll('.kb-key.pressed').forEach(k => k.classList.remove('pressed'));

  if (!char || char === ' ') {
    const spaceKey = document.querySelector('.kb-space');
    if (spaceKey) { spaceKey.classList.add('pressed'); _pulseKey(spaceKey); }
    return;
  }

  const entry = _keyMap[char] || _keyMap[char.toLowerCase()];
  if (entry) {
    entry.el.classList.add('pressed');
    _pulseKey(entry.el);
  }
}

function _pulseKey(el) {
  el.classList.remove('kb-pulse');
  void el.offsetWidth; // reflow
  el.classList.add('kb-pulse');
  setTimeout(() => el.classList.remove('kb-pulse'), 300);
}

/* ═══════════════════════════════════════════════════════════════
   ربط مع محرك الكتابة الموجود (app.js)
   — يُستدعى من app.js عند تهيئة شاشة التمرين
═══════════════════════════════════════════════════════════════ */
function initEnhancedKeyboard(lang) {
  buildEnhancedKeyboard(lang);

  /* بعد البناء، بادئ النظرة على المفتاح الأول */
  setTimeout(() => {
    const firstChar = document.querySelector('.char.cursor');
    if (firstChar) highlightNextKey(firstChar.textContent);
  }, 100);
}

/* ─── hook مع keydown الموجود ────────────────────────────────── */
(function patchKeyboardHighlight() {
  const _origKD = document._tcKDHandler;

  document.addEventListener('keydown', function(e) {
    const screen = document.getElementById('screen-practice');
    if (!screen || screen.classList.contains('hidden')) return;
    highlightPressedKey(e.key === ' ' ? ' ' : e.key);
  });

  document.addEventListener('keyup', function() {
    /* لا نزيل next-key عند رفع المفتاح، فقط pressed */
    document.querySelectorAll('.kb-key.pressed').forEach(k => k.classList.remove('pressed'));
  });
})();

/* ═══════════════════════════════════════════════════════════════
   تحديث next-key بعد كل حرف يُكتب
   — يُستدعى من handleTypingInput في app.js (عبر monkey-patch)
═══════════════════════════════════════════════════════════════ */
function updateNextKeyHighlight(typedLength) {
  const chars = document.querySelectorAll('.char');
  const cursor = chars[typedLength];
  if (cursor) {
    highlightNextKey(cursor.textContent === ' ' ? ' ' : cursor.textContent);
  } else {
    highlightNextKey(null);
  }
}
