// واجهة الطالب
const $ = s => document.querySelector(s);
const app = $('#app'), nav = $('#nav'), modalEl = $('#modal');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const fmtTime = t => t ? new Date(t).toLocaleString('ar-OM', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
const today = () => new Date().toISOString().slice(0, 10);
const AVATARS = ['🐪', '🦅', '🐢', '🐎', '🐬', '🦌', '🌴', '⛵', '🏰', '🌙', '📚', '⭐'];
const GRADE_NAMES = ['', 'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر', 'الحادي عشر', 'الثاني عشر'];

const ICON = {
  mathc: '<rect x="6" y="4" width="20" height="24" rx="3" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M10 10h12M11 16h2M15 16h2M19 16h2M11 21h2M15 21h2M19 21h2" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
  physics: '<circle cx="16" cy="16" r="2.6" fill="currentColor"/><ellipse cx="16" cy="16" rx="12" ry="5" fill="none" stroke="currentColor" stroke-width="2"/><ellipse cx="16" cy="16" rx="12" ry="5" transform="rotate(60 16 16)" fill="none" stroke="currentColor" stroke-width="2"/><ellipse cx="16" cy="16" rx="12" ry="5" transform="rotate(-60 16 16)" fill="none" stroke="currentColor" stroke-width="2"/>',
  chemistry: '<path d="M12 4h8M13 4v9L6 26a2 2 0 0 0 2 3h16a2 2 0 0 0 2-3l-7-13V4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><circle cx="13" cy="22" r="1.6" fill="currentColor"/><circle cx="19" cy="24" r="1.6" fill="currentColor"/><circle cx="17" cy="19" r="1.2" fill="currentColor"/>',
  biology: '<path d="M10 4c0 6 12 6 12 12s-12 6-12 12M22 4c0 6-12 6-12 12s12 6 12 12M11 9h10M11 23h10M13 16h6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
  envsci: '<circle cx="16" cy="16" r="11" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M10 20c0-6 5-10 12-10-1 7-5 11-12 10zM10 20l6-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>',
  arabic: '<text x="16" y="25" text-anchor="middle" font-size="24" font-weight="700" fill="currentColor" font-family="Reem Kufi, sans-serif">ض</text>',
  islamic: '<path d="M20 5a11 11 0 1 0 7 19A9 9 0 1 1 20 5z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M22 12l1 3h3l-2.5 2 1 3-2.5-2-2.5 2 1-3-2.5-2h3z" fill="currentColor"/>',
  social: '<circle cx="16" cy="16" r="11" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M5 16h22M16 5c4 4 4 18 0 22M16 5c-4 4-4 18 0 22" fill="none" stroke="currentColor" stroke-width="2"/>',
  english: '<path d="M5 26L11 6h2l6 20M7.5 19h9" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 13h6M21 19h5M21 25h6M21 13v12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
  science: '<path d="M12 4h8M13 4v9L6 26a2 2 0 0 0 2 3h16a2 2 0 0 0 2-3l-7-13V4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M9 21h14" stroke="currentColor" stroke-width="2.4"/>',
  reading: '<path d="M4 7c4-2 8-2 12 1 4-3 8-3 12-1v18c-4-2-8-2-12 1-4-3-8-3-12-1z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M16 8v18" stroke="currentColor" stroke-width="2.4"/>',
  iq: '<circle cx="16" cy="13" r="8" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M12 24h8M13 28h6M16 9v4l3 2" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
  math: '<path d="M6 10h8M10 6v8M19 10h8M6 22l7 7M13 22l-7 7M19 23h8M19 28h8" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>',
  oman: '<path d="M5 29V13h4v-3h3v3h3V7h-1V4h4v3h-1v6h3v-3h3v3h4v16h-8v-6a3 3 0 0 0-6 0v6z" fill="currentColor"/>',
  arab: '<path d="M16 30V14M16 14c-3-6-9-6-12-3 4-1 8 0 12 3zm0 0c3-6 9-6 12-3-4-1-8 0-12 3zm0 0c-1-6-6-9-10-8 4 1 7 4 10 8zm0 0c1-6 6-9 10-8-4 1-7 4-10 8z" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>',
  islam: '<path d="M20 5a11 11 0 1 0 7 19A9 9 0 1 1 20 5z" fill="currentColor"/><path d="M23 10l1 2.5 2.6.2-2 1.7.7 2.6-2.3-1.4-2.3 1.4.6-2.6-2-1.7 2.7-.2z" fill="currentColor"/>'
};
const CATS = [
  { id: 'reading', name: 'بطل القراءة', c: '#8A5A12', t: 50 },
  { id: 'iq', name: 'الذكاء وتمرين المخ', c: '#5B3FA0', t: 40 },
  { id: 'math', name: 'تحدي الأرقام', c: '#1F5FA8', t: 45 }, // أسئلة حساب مولّدة تلقائيًا (غير المنهج)
  { id: 'oman', name: 'تاريخ عُمان', c: '#A8161F', t: 30 },
  { id: 'arab', name: 'العرب', c: '#155C3E', t: 30 },
  { id: 'islam', name: 'ديننا الإسلامي', c: '#0E7C86', t: 30 },
  { id: 'science', name: 'العلوم', c: '#B4530A', t: 40, curr: true, grades: [1, 10] }, // من المنهج: الفصل الأول والثاني منفصلان
  // الصفان 11 و12: العلوم مقسّمة إلى مواد منفصلة كما في كتب الوزارة
  { id: 'physics', name: 'الفيزياء', c: '#1D4ED8', t: 50, curr: true, grades: [11, 12] },
  { id: 'chemistry', name: 'الكيمياء', c: '#B4530A', t: 50, curr: true, grades: [11, 12] },
  { id: 'biology', name: 'الأحياء', c: '#15803D', t: 45, curr: true, grades: [11, 12] },
  { id: 'envsci', name: 'العلوم البيئية', c: '#0E7490', t: 45, curr: true, grades: [11, 12] },
  { id: 'mathc', name: 'الرياضيات', c: '#2563EB', t: 60, curr: true }, // رياضيات المنهج من كتب الوزارة
  { id: 'arabic', name: 'اللغة العربية', c: '#7A3E9D', t: 40, curr: true },
  { id: 'islamic', name: 'التربية الإسلامية', c: '#0F766E', t: 35, curr: true },
  { id: 'social', name: 'الدراسات الاجتماعية', c: '#9A6B00', t: 35, curr: true },
  { id: 'english', name: 'اللغة الإنجليزية', c: '#B91C1C', t: 40, curr: true }
];
const forGrade = (c, g) => !c.grades || (g >= c.grades[0] && g <= c.grades[1]);
const qid = q => q.gen ? 'g:' + q.q : q.id;
// وحدات المادة في الفصل مرتبة برقم الوحدة، مع عدد الأسئلة الكلي والمتبقي للطالب
async function unitsInfo(cat, sem) {
  const g = S.p.grade, done = new Set(S.p.done || []);
  const inSem = (await API.questions()).filter(q => q.cat === cat && q.active !== false && q.gmin <= g && g <= q.gmax && (!q.sem || q.sem === sem) && q.unit);
  const num = u => +(u.match(/الوحد(?:ة|ات|تان) (\d+)/) || [])[1] || 0;
  return [...new Set(inSem.map(q => q.unit))].sort((a, b) => num(a) - num(b) || a.localeCompare(b, 'ar'))
    .map(u => { const qs = inSem.filter(q => q.unit === u); return { u, n: num(u), total: qs.length, left: qs.filter(q => !done.has(q.id)).length }; });
}
const catOf = id => CATS.find(c => c.id === id) || { name: id, c: '#666' };
const icon = (id, size = 36) => `<svg viewBox="0 0 32 32" width="${size}" height="${size}" aria-hidden="true">${ICON[id] || ''}</svg>`;

// ختم الشارة: نجمة ثمانية بطابع الزخرفة العُمانية
function seal(label, color = 'var(--gold)', cls = 'seal') {
  return `<svg class="${cls}" viewBox="0 0 100 100" aria-hidden="true">
    <g fill="${color}"><rect x="18" y="18" width="64" height="64" rx="6"/><rect x="18" y="18" width="64" height="64" rx="6" transform="rotate(45 50 50)"/></g>
    <circle cx="50" cy="50" r="27" fill="var(--card)"/><circle cx="50" cy="50" r="23" fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="3 3"/>
    <text x="50" y="58" text-anchor="middle" font-family="Reem Kufi, sans-serif" font-size="30" fill="${color}">${esc(label)}</text></svg>`;
}
const badgeColor = id => id.startsWith('rank') ? 'var(--red)' : (CATS.find(c => c.id === id)?.c || 'var(--gold)');

const rankOf = pts => { let r = RANKS[0], next = null; for (const x of RANKS) { if (pts >= x[0]) r = x; else { next = x; break; } } return { name: r[1], from: r[0], next }; };
// 5 مراحل لكل فئة؛ المرحلة = مستوى الأسئلة (1 سهل … 5 الأصعب)
const LVL_EDGES = [0, 60, 150, 300, 500];
const MAX_LVL = 5;
const catLevel = pts => Math.min(MAX_LVL, LVL_EDGES.filter(e => pts >= e).length);

// مؤثرات صوتية مولّدة بالمتصفح (بدون ملفات)، مع زر كتم يُحفظ في الجهاز
const SFX = (() => {
  let ctx = null, on = true;
  try { on = localStorage.getItem('bm_sound') !== 'off'; } catch {}
  const tone = (f, t0, d, type = 'sine', v = .18) => {
    const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + t0;
    o.type = type; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .01); g.gain.exponentialRampToValueAtTime(.001, t + d);
    o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + d + .02);
  };
  const play = notes => { if (!on) return; try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); notes.forEach(n => tone(...n)); } catch {} };
  return {
    get on() { return on; },
    toggle() { on = !on; try { localStorage.setItem('bm_sound', on ? 'on' : 'off'); } catch {} return on; },
    ok: () => play([[660, 0, .12], [990, .1, .2]]),
    bad: () => play([[220, 0, .25, 'triangle'], [165, .15, .3, 'triangle']]),
    help: () => play([[880, 0, .08, 'triangle', .12]]),
    tick: () => play([[1200, 0, .05, 'square', .05]]),
    win: () => play([[523, 0, .15], [659, .12, .15], [784, .24, .15], [1047, .36, .4]])
  };
})();

const S = { uid: null, p: null };

function setNav() {
  nav.innerHTML = S.p ? `<button class="ghost" data-go="home">الرئيسية</button><button class="ghost" data-go="profile">ملفي</button><button class="ghost" data-go="logout">خروج</button>` : '';
  if (S.p) nav.insertAdjacentHTML('afterbegin', `<button class="ghost" data-go="sound" aria-label="الصوت">${SFX.on ? '🔊' : '🔇'}</button>`);
}
nav.onclick = async e => {
  const g = e.target.closest('[data-go]')?.dataset.go; if (!g) return;
  if (g === 'sound') { SFX.toggle(); return setNav(); }
  if (g === 'logout') { await API.logout(); S.uid = S.p = null; return Student.auth(); }
  Student[g]();
};
$('.logo').onclick = () => { if (location.hash === '#admin') return; S.p ? Student.home() : Student.auth(); };
$('.logo').style.cursor = 'pointer';

// إعلان في أعلى الصفحة الرئيسية؛ يُخفى عند الإغلاق في هذا الجهاز
const NEWS_ID = 'curr2';
function newsHTML() {
  try { if (localStorage.getItem('bm_news') === NEWS_ID) return ''; } catch {}
  return `<section class="card news" style="display:grid;gap:8px;border-color:var(--gold);background:color-mix(in srgb, var(--gold) 10%, var(--card))">
    <div class="row" style="justify-content:space-between"><b>🎉 أخيرًا! صارت المناهج الدراسية في الموقع</b><button class="ghost" onclick="try{localStorage.setItem('bm_news','${NEWS_ID}')}catch{};this.closest('.news').remove()" aria-label="إغلاق">✕</button></div>
    <p style="margin:0">صارت كل موادك هنا: <b>العلوم، الرياضيات، اللغة العربية، التربية الإسلامية، الدراسات الاجتماعية، اللغة الإنجليزية</b>. الأسئلة من دروس كتابك المدرسي، و<b>الفصل الأول والفصل الثاني منفصلان</b>. العلوم جاهزة الآن، والمواد اللي عليها «قريبًا» تنضاف أسئلتها تباعًا.</p>
  </section>`;
}

function showModal(html) {
  return new Promise(res => {
    SFX.win();
    modalEl.innerHTML = `<div class="modal" role="dialog" aria-modal="true"><div class="card">${html}<button class="btn" id="mclose">رائع!</button></div></div>`;
    const b = $('#mclose'); b.focus();
    b.onclick = () => { modalEl.innerHTML = ''; res(); };
  });
}

const Student = {
  auth(mode = 'login') {
    setNav();
    app.innerHTML = `
      <section class="card" style="display:grid;gap:16px">
        <div><h1 style="font-size:1.7rem">أهلًا بك في رحلة المعرفة</h1>
        <p class="muted" style="margin:6px 0 0">أسئلة في القراءة والذكاء والرياضيات وتاريخ عُمان والعرب وديننا الإسلامي، من الصف الأول إلى الثاني عشر.</p></div>
        <div class="tabs" role="tablist">
          <button data-m="login" class="${mode === 'login' ? 'on' : ''}">دخول</button>
          <button data-m="reg" class="${mode === 'reg' ? 'on' : ''}">حساب جديد</button>
        </div>
        <form class="form" id="af">
          <label class="f">اسمك<input id="an" autocomplete="username" required placeholder="مثال: سالم بن خالد"></label>
          <label class="f">الرمز السري<input id="ap" type="password" autocomplete="${mode === 'reg' ? 'new-password' : 'current-password'}" required minlength="6" placeholder="6 خانات على الأقل"></label>
          ${mode === 'reg' ? `
            <div class="f"><span>صفّك الدراسي</span><div class="grades" id="ag">${[...Array(12)].map((_, i) => `<button type="button" data-g="${i + 1}">${i + 1}</button>`).join('')}</div></div>
            <div class="f"><span>اختر صورتك</span><div class="avatars" id="aa">${AVATARS.map((a, i) => `<button type="button" class="${i ? '' : 'on'}" data-a="${a}" aria-label="صورة ${i + 1}">${a}</button>`).join('')}</div></div>` : ''}
          <div class="err" id="ae"></div>
          <button class="btn block">${mode === 'reg' ? 'ابدأ الرحلة' : 'دخول'}</button>
        </form>
        ${API.live ? '' : '<p class="small muted" style="margin:0">الوضع التجريبي: البيانات تُحفظ في هذا الجهاز فقط حتى يُربط الموقع بقاعدة البيانات.</p>'}
      </section>
      <p class="foot"><button class="link" onclick="location.hash='admin'">دخول المسؤول</button></p>`;
    app.querySelector('.tabs').onclick = e => { const m = e.target.dataset.m; if (m) Student.auth(m); };
    let grade = 0, avatar = AVATARS[0];
    $('#ag')?.addEventListener('click', e => { const b = e.target.closest('[data-g]'); if (!b) return; grade = +b.dataset.g; [...$('#ag').children].forEach(x => x.classList.toggle('on', x === b)); });
    $('#aa')?.addEventListener('click', e => { const b = e.target.closest('[data-a]'); if (!b) return; avatar = b.dataset.a; [...$('#aa').children].forEach(x => x.classList.toggle('on', x === b)); });
    $('#af').onsubmit = async e => {
      e.preventDefault(); const er = $('#ae'); er.textContent = '';
      const btn = e.submitter; btn.disabled = true;
      try {
        if (mode === 'reg' && !grade) throw new Error('اختر صفّك الدراسي.');
        S.uid = mode === 'reg' ? await API.register($('#an').value, $('#ap').value, grade, avatar) : await API.login($('#an').value, $('#ap').value);
        S.p = await API.profile(S.uid);
        Student.home();
      } catch (x) { er.textContent = x.message; btn.disabled = false; }
    };
  },

  heroHTML() {
    const p = S.p, r = rankOf(p.points);
    const pct = r.next ? Math.round((p.points - r.from) / (r.next[0] - r.from) * 100) : 100;
    return `<section class="card" style="display:grid;gap:12px">
      <div class="hero"><div class="av">${esc(p.avatar)}</div>
        <div class="row" style="justify-content:space-between">
          <div class="grow"><h2>${esc(p.name)}</h2><div class="small"><span class="rank">${r.name}</span> · <span class="muted">الصف ${GRADE_NAMES[p.grade]}</span></div></div>
          <div style="text-align:left"><div class="pts">${p.points}</div><div class="small muted">نقطة</div></div>
        </div></div>
      <div class="bar" aria-label="التقدم إلى اللقب التالي"><i style="width:${pct}%"></i></div>
      <div class="small muted">${r.next ? `باقي ${r.next[0] - p.points} نقطة للقب «${r.next[1]}»` : 'وصلت أعلى لقب! أنت أسطورة.'}</div>
    </section>`;
  },

  async home() {
    setNav(); scrollTo(0, 0);
    const p = S.p;
    let bank = []; try { bank = await API.questions(); } catch {}
    const ready = id => id === 'math' || id === 'iq' || bank.some(q => q.cat === id && q.active !== false && q.gmin <= p.grade && p.grade <= q.gmax);
    app.innerHTML = `${newsHTML()}${this.heroHTML()}
      <section style="display:grid;gap:12px"><h2 style="font-size:1.25rem">اختر ميدانك</h2>
        <div class="cats">${CATS.filter(c => forGrade(c, p.grade)).map(c => {
          const pts = p.cats?.[c.id]?.pts || 0, l = catLevel(pts), pct = l === MAX_LVL ? 100 : Math.round((pts - LVL_EDGES[l - 1]) / (LVL_EDGES[l] - LVL_EDGES[l - 1]) * 100);
          return `<button class="cat" style="--c:${c.c}" data-c="${c.id}">${icon(c.id)}<b>${c.name}</b>
            <span class="small">${!ready(c.id) ? '<span class="chip">قريبًا</span> ' : c.curr ? '<span class="chip">من منهجك</span> ' : ''}المرحلة ${l} من ${MAX_LVL} · ${pts} نقطة</span><div class="bar"><i style="width:${pct}%"></i></div></button>`;
        }).join('')}</div></section>
      <section class="card lb" id="lb"><h2 style="font-size:1.15rem">لوحة الأبطال</h2><p class="muted small">جارٍ التحميل…</p></section>`;
    app.querySelector('.cats').onclick = e => { const b = e.target.closest('[data-c]'); if (b) Student.play(b.dataset.c); };
    this.leaderboard('grade');
  },

  async leaderboard(scope) {
    const el = $('#lb'); if (!el) return;
    let list = []; try { list = await API.leaderboard(); } catch {}
    if (scope === 'grade') list = list.filter(x => x.grade === S.p.grade);
    const myIdx = list.findIndex(x => x.uid === S.uid);
    el.innerHTML = `<div class="row" style="justify-content:space-between"><h2 style="font-size:1.15rem">لوحة الأبطال</h2>
      <div class="tabs" style="width:auto"><button data-s="grade" class="${scope === 'grade' ? 'on' : ''}">صفّي</button><button data-s="all" class="${scope === 'all' ? 'on' : ''}">الكل</button></div></div>
      <ol>${list.slice(0, 10).map((x, i) => `<li class="${x.uid === S.uid ? 'me' : ''}"><span class="num">${i + 1}</span><span>${esc(x.avatar)}</span><span>${esc(x.name)} <span class="small muted">· ص${x.grade}</span></span><span class="num">${x.points}</span></li>`).join('') || '<li class="muted">لا يوجد أبطال بعد. كن الأول!</li>'}</ol>
      ${myIdx >= 10 ? `<p class="small">ترتيبك: <b>${myIdx + 1}</b></p>` : ''}`;
    el.querySelector('.tabs').onclick = e => { const s = e.target.dataset.s; if (s) Student.leaderboard(s); };
  },

  async buildRound(cat, sem, unit) {
    const g = S.p.grade, lvl = catLevel(S.p.cats?.[cat]?.pts || 0), N = 8;
    // كل سؤال يُجاب مرة واحدة فقط؛ الأسئلة المُجابة محفوظة في حساب الطالب (done) فلا تعود ولا تتكرر نقاطها
    const done = new Set(S.p.done || []);
    const all = (await API.questions()).filter(q => q.cat === cat && q.active !== false && q.gmin <= g && g <= q.gmax && (!sem || !q.sem || q.sem === sem) && (!unit || unit === '*' || q.unit === unit));
    const bank = all.filter(q => !done.has(q.id));
    // المستوى الحالي أولًا، ثم الأسهل
    const score = q => ((q.lvl || 1) > lvl ? 20 : 0) + Math.abs(lvl - (q.lvl || 1)) + Math.random();
    let pool = bank.sort((a, b) => score(a) - score(b));
    const genN = cat === 'math' ? N - Math.min(2, pool.length) : cat === 'iq' ? N - Math.min(4, pool.length) : 0;
    let qs = pool.slice(0, N - genN);
    for (let i = 0; i < genN; i++) {  // أسئلة مولّدة لا تتكرر مع ما أُجيب سابقًا أو في الجولة نفسها
      let q, t = 0; do { q = cat === 'math' ? mathQ(g, lvl) : iqQ(g, lvl); } while ((done.has(qid(q)) || qs.some(x => x.q === q.q)) && ++t < 30);
      qs.push(q);
    }
    if (cat === 'reading') qs.sort((a, b) => (a.passage || '').localeCompare(b.passage || '')); // أسئلة النص الواحد متتالية
    else qs = shuffle(qs);
    return { qs, total: all.length };
  },

  async play(cat, sem, unit) {
    const c = catOf(cat);
    if (c.curr && sem && !unit) {  // اختيار الوحدة من كتاب الطالب
      const info = await unitsInfo(cat, sem), units = info.map(x => x.u);
      if (units.length) {
        app.innerHTML = `<section class="card" style="display:grid;gap:12px;--c:${c.c}">
          <div class="row" style="color:${c.c}">${icon(cat, 28)}<h2 style="font-size:1.25rem">${c.name} · الفصل ${sem === 1 ? 'الأول' : 'الثاني'}</h2></div>
          <p class="muted" style="margin:0">اختر الوحدة من كتابك، أو العب أسئلة كل الوحدات.</p>
          <div id="units" style="display:grid;gap:8px">${info.map((x, i) => `<button class="opt row" data-u="${i}" style="justify-content:space-between;${x.left ? '' : 'opacity:.6'}"><span>${x.left ? '' : '✅ '}${esc(x.u)}</span><span class="chip">${x.left ? `باقي ${x.left} من ${x.total}` : 'مكتملة'}</span></button>`).join('')}
            <button class="btn" data-u="*">كل الوحدات</button></div>
          <button class="ghost" onclick="Student.play('${cat}')">رجوع</button></section>`;
        $('#units').onclick = e => { const b = e.target.closest('[data-u]'); if (b) Student.play(cat, sem, b.dataset.u === '*' ? '*' : units[+b.dataset.u]); };
        return;
      }
    }
    if (c.curr && !sem) {  // مواد المنهج: يختار الطالب الفصل الدراسي
      app.innerHTML = `<section class="card" style="display:grid;gap:14px;--c:${c.c}">
        <div class="row" style="color:${c.c}">${icon(cat, 28)}<h2 style="font-size:1.25rem">${c.name}</h2></div>
        <p class="muted" style="margin:0">اختر الفصل الدراسي، والأسئلة تكون من دروس منهجك لصفّك.</p>
        <div class="row" id="sems" style="gap:10px"><button class="btn" data-s="1" style="flex:1">الفصل الأول</button><button class="btn green" data-s="2" style="flex:1">الفصل الثاني</button></div>
        <button class="ghost" onclick="Student.home()">رجوع</button></section>`;
      $('#sems').onclick = e => { const s = e.target.closest('[data-s]'); if (s) Student.play(cat, +s.dataset.s); };
      return;
    }
    app.innerHTML = `<section class="card"><p class="muted">جارٍ تجهيز الأسئلة…</p></section>`;
    const { qs, total } = await this.buildRound(cat, sem, unit);
    if (!qs.length && total) {  // انتهت الأسئلة: ننتقل للوحدة التالية
      const info = c.curr && sem ? await unitsInfo(cat, sem) : [], nextU = unit && unit !== '*' ? info.find(x => x.left && x.n > (info.find(y => y.u === unit)?.n ?? -1)) || info.find(x => x.left) : null;
      app.innerHTML = `<section class="card result" style="display:grid;gap:12px;--c:${c.c}">
        <div class="big">🏅</div>
        <h2>${unit && unit !== '*' ? `أكملت «${esc(unit)}»!` : `أنهيت كل أسئلة ${c.name}${sem ? ` للفصل ${sem === 1 ? 'الأول' : 'الثاني'}` : ''} المتاحة لصفّك!`}</h2>
        <p class="muted" style="margin:0">${nextU ? `الوحدة التالية: <b>${esc(nextU.u)}</b> (${nextU.left} ${nextU.left > 2 ? 'أسئلة' : 'سؤال'})` : 'ستُضاف أسئلة جديدة قريبًا، جرّب مادة أخرى.'}</p>
        <div class="row" style="justify-content:center">${nextU ? '<button class="btn green" id="nu">ابدأ الوحدة التالية</button>' : ''}<button class="ghost" onclick="Student.home()">الرئيسية</button></div></section>`;
      if (nextU) $('#nu').onclick = () => Student.play(cat, sem, nextU.u);
      return;
    }
    if (!qs.length) { app.innerHTML = `<section class="card"><p>⏳ أسئلة ${c.name} لصفّك ${sem ? `في الفصل ${sem === 1 ? 'الأول' : 'الثاني'} ` : ''}قيد الإعداد من كتابك المدرسي، وتنضاف قريبًا إن شاء الله.</p><button class="btn" onclick="Student.home()">رجوع</button></section>`; return; }
    const R = { cat, sem, unit, i: 0, score: 0, correct: 0, streak: 0, best: 0, hint: false, cut: false };
    let timer = null;
    const next = () => {
      clearInterval(timer);
      if (R.i >= qs.length) return this.finish(R, qs);
      const q = qs[R.i], opts = shuffle(q.opts.map((t, k) => ({ t, ok: k === (q.a || 0) })));
      const T = c.t; let left = T;
      app.innerHTML = `<section class="card" style="display:grid;gap:14px;--c:${c.c}">
        <div class="qtop"><span class="row" style="color:${c.c}">${icon(cat, 24)}<b>${c.name}</b></span>
          <span class="small"><span class="streak">${R.streak >= 3 ? '🔥 ' + R.streak : ''}</span> سؤال ${R.i + 1} من ${qs.length} · <b>${R.score}</b> نقطة</span></div>
        <div class="timer" id="tm"><i></i></div>
        ${q.passage ? `<div class="passage">${esc(q.passage)}</div>` : ''}
        <div class="qtext" ${/^[\d\s+\-−×÷=؟.\/()]+$/.test(q.q) ? 'dir="ltr" style="text-align:right"' : ''}>${esc(q.q)}</div>
        <div class="opts">${opts.map((o, k) => `<button class="opt" data-k="${k}">${esc(o.t)}</button>`).join('')}</div>
        <div class="row" style="gap:8px;flex-wrap:wrap">
          <button class="ghost" id="hh" ${R.hint ? 'disabled' : ''}>💡 تلميح${R.hint ? ' (استُخدم)' : ''}</button>
          <button class="ghost" id="cut" ${R.cut ? 'disabled' : ''}>✂️ حذف إجابتين${R.cut ? ' (استُخدم)' : ''}</button>
        </div>
        <div class="passage" id="ht" hidden></div>
        <div class="feedback" id="fb"></div>
        <div class="passage" id="ex" hidden></div>
        <button class="btn green" id="nx" hidden>${R.i + 1 < qs.length ? 'السؤال التالي' : 'النتيجة'}</button>
      </section>`;
      const bar = $('#tm i'), tm = $('#tm');
      timer = setInterval(() => {
        left -= .25; bar.style.width = (left / T * 100) + '%'; tm.classList.toggle('low', left < T * .25);
        if (left <= 0) answer(-1); else if (left <= 3 && left % 1 === 0) SFX.tick();
      }, 250);
      // مساعدات: كل واحدة مرة في الجولة، بدون خصم نقاط
      $('#hh').onclick = () => { SFX.help(); R.hint = true; $('#hh').disabled = true; const h = $('#ht'); h.textContent = '💡 ' + hintFor(q); h.hidden = false; };
      $('#cut').onclick = () => {
        SFX.help(); R.cut = true; $('#cut').disabled = true;
        const btns = [...app.querySelectorAll('.opt')], wrong = shuffle(btns.filter((b, j) => !opts[j].ok && !b.disabled));
        wrong.slice(0, Math.min(2, wrong.length - 1)).forEach(b => { b.disabled = true; b.hidden = true; });
      };
      const answer = k => {
        clearInterval(timer);
        $('#hh').disabled = $('#cut').disabled = true;
        const ok = k >= 0 && opts[k].ok;
        app.querySelectorAll('.opt').forEach((b, j) => { b.disabled = true; if (opts[j].ok) b.classList.add('ok'); else if (j === k) b.classList.add('bad'); });
        const fb = $('#fb');
        if (ok) {
          R.streak++; R.best = Math.max(R.best, R.streak); R.correct++;
          const pts = 10 + Math.ceil(left / T * 5) + (R.streak >= 3 ? 2 : 0);
          R.score += pts; fb.className = 'feedback ok'; SFX.ok();
          fb.textContent = `أحسنت! +${pts}` + (R.streak >= 3 ? ` (سلسلة ${R.streak})` : '');
        } else {
          R.streak = 0; fb.className = 'feedback bad'; SFX.bad();
          fb.textContent = k < 0 ? 'انتهى الوقت. الإجابة الصحيحة مظلّلة بالأخضر.' : 'ليست هذه. تعلّم الإجابة الصحيحة المظلّلة بالأخضر.';
        }
        if (q.exp) { const ex = $('#ex'); ex.textContent = '📘 الشرح: ' + q.exp; ex.hidden = false; }
        R.i++; const nx = $('#nx'); nx.hidden = false; nx.focus(); nx.onclick = next;
      };
      app.querySelector('.opts').onclick = e => { const b = e.target.closest('[data-k]'); if (b && !b.disabled) answer(+b.dataset.k); };
    };
    next();
  },

  async finish(R, qs) {
    const p = S.p, total = qs.length;
    const oldRank = rankOf(p.points).name;
    const cs = p.cats?.[R.cat] || { pts: 0, correct: 0, answered: 0 };
    const days = [...new Set([...(p.days || []), today()])].slice(-60);
    const np = {
      ...p, points: p.points + R.score, games: p.games + 1, correct: p.correct + R.correct, answered: p.answered + total,
      perfects: (p.perfects || 0) + (R.correct === total ? 1 : 0), hints: (p.hints || 0) + (R.hint ? 1 : 0), cuts: (p.cuts || 0) + (R.cut ? 1 : 0), bestStreak: Math.max(p.bestStreak || 0, R.best), days,
      cats: { ...p.cats, [R.cat]: { pts: cs.pts + R.score, correct: cs.correct + R.correct, answered: cs.answered + total } },
      done: [...new Set([...(p.done || []), ...qs.map(qid)])]
    };
    const fresh = BADGES.filter(([id, , , ok]) => ok(np) && !(p.badges || []).includes(id));
    np.badges = [...(p.badges || []), ...fresh.map(b => b[0])];
    const { name, grade, avatar, createdAt, lastLogin, logins, ...patch } = np;
    try { await API.update(S.uid, patch); await API.log(S.uid, { type: 'game', cat: R.cat, score: R.score, correct: R.correct, total, hint: R.hint, cut: R.cut }); }
    catch { /* يبقى العرض حتى لو فشل الحفظ */ }
    S.p = np;
    const stars = R.correct === total ? 3 : R.correct >= total * .7 ? 2 : R.correct >= total * .4 ? 1 : 0;
    const msg = ['حاول مرة أخرى، كل محاولة تعلّمك شيئًا جديدًا.', 'بداية جيدة! واصل التدريب.', 'رائع! أنت قريب من القمة.', 'علامة كاملة! أنت بطل حقيقي.'][stars];
    app.innerHTML = `<section class="card result">
      <div class="eyebrow">${catOf(R.cat).name}</div>
      <div class="stars" aria-label="${stars} نجوم">${'★'.repeat(stars)}<span style="opacity:.25">${'★'.repeat(3 - stars)}</span></div>
      <div class="big">+${R.score}</div>
      <p style="margin:0">${R.correct} إجابات صحيحة من ${total}${R.best >= 3 ? ` · أفضل سلسلة ${R.best}` : ''}</p>
      <p class="muted" style="margin:0">${msg}</p>
      <div class="row" style="justify-content:center"><button class="btn" id="again">جولة جديدة</button><button class="ghost" onclick="Student.home()">الرئيسية</button></div>
    </section>`;
    $('#again').onclick = () => Student.play(R.cat, R.sem, R.unit);
    const oldL = catLevel(cs.pts), newL = catLevel(cs.pts + R.score);
    if (newL > oldL) await showModal(`<div class="eyebrow">🎉 مبروك!</div>${seal(String(newL), catOf(R.cat).c)}
      <h2>انتقلت إلى المرحلة ${newL} في ${catOf(R.cat).name}</h2>
      <p class="muted" style="margin:0">${newL === MAX_LVL ? 'وصلت لأعلى مرحلة! أنت من أبطال هذا الميدان.' : 'الأسئلة القادمة أصعب قليلًا. أنت قدّها!'}</p>`);
    for (const [id, bn, desc] of fresh) {
      await showModal(`<div class="eyebrow">شارة جديدة</div>${seal(bn[0], badgeColor(id))}
        <h2>${esc(bn)}</h2><p class="muted" style="margin:0">${esc(desc)}</p><p class="quote">${esc(QUOTES[Math.random() * QUOTES.length | 0])}</p>`);
    }
    const nr = rankOf(np.points).name;
    if (nr !== oldRank && !fresh.some(b => b[0].startsWith('rank'))) await showModal(`<div class="eyebrow">لقب جديد</div><h2>${nr}</h2><p class="quote">${esc(QUOTES[0])}</p>`);
  },

  async profile() {
    setNav(); scrollTo(0, 0);
    const p = S.p = await API.profile(S.uid);
    const acc = p.answered ? Math.round(p.correct / p.answered * 100) : 0;
    app.innerHTML = `${this.heroHTML()}
      <section class="card" style="display:grid;gap:12px"><h2 style="font-size:1.15rem">إحصاءاتي</h2>
        <div class="stats">
          <div class="stat"><span class="small muted">الجولات</span><b>${p.games}</b></div>
          <div class="stat"><span class="small muted">الدقة</span><b>${acc}%</b></div>
          <div class="stat"><span class="small muted">أفضل سلسلة</span><b>${p.bestStreak || 0}</b></div>
          <div class="stat"><span class="small muted">أيام اللعب</span><b>${(p.days || []).length}</b></div>
        </div>
        ${CATS.filter(c => forGrade(c, p.grade) || p.cats?.[c.id]).map(c => { const s = p.cats?.[c.id] || { pts: 0, correct: 0, answered: 0 };
          return `<div class="row"><span style="color:${c.c}">${icon(c.id, 22)}</span><span class="grow">${c.name}</span><span class="small muted">${s.answered ? Math.round(s.correct / s.answered * 100) + '% دقة · ' : ''}${s.pts} نقطة</span></div>`; }).join('')}
      </section>
      <section class="card" style="display:grid;gap:12px"><h2 style="font-size:1.15rem">شاراتي <span class="small muted">(${(p.badges || []).length} من ${BADGES.length})</span></h2>
        <div class="badges">${BADGES.map(([id, n, d]) => `<div class="badge ${(p.badges || []).includes(id) ? '' : 'locked'}">${seal(n[0], badgeColor(id))}<b>${esc(n)}</b><span>${esc(d)}</span></div>`).join('')}</div>
      </section>
      <section class="card" style="display:grid;gap:10px"><h2 style="font-size:1.15rem">آخر جولاتي</h2><div id="hist" class="small muted">جارٍ التحميل…</div></section>
      <section class="card form"><h2 style="font-size:1.15rem">تعديل ملفي</h2>
        <div class="f"><span>صورتي</span><div class="avatars" id="pa">${AVATARS.map(a => `<button type="button" class="${a === p.avatar ? 'on' : ''}" data-a="${a}">${a}</button>`).join('')}</div></div>
        <label class="f">صفّي<select id="pg">${GRADE_NAMES.slice(1).map((n, i) => `<option value="${i + 1}" ${i + 1 === p.grade ? 'selected' : ''}>الصف ${n}</option>`).join('')}</select></label>
        <button class="btn green" id="ps">حفظ</button><div class="small" id="pm"></div>
      </section>`;
    let av = p.avatar;
    $('#pa').onclick = e => { const b = e.target.closest('[data-a]'); if (!b) return; av = b.dataset.a; [...$('#pa').children].forEach(x => x.classList.toggle('on', x === b)); };
    $('#ps').onclick = async () => { await API.update(S.uid, { avatar: av, grade: +$('#pg').value }); S.p = await API.profile(S.uid); $('#pm').textContent = 'تم الحفظ.'; };
    const games = (await API.activity(S.uid, 40)).filter(a => a.type === 'game').slice(0, 10);
    $('#hist').innerHTML = games.length ? games.map(a => `<div class="row" style="padding:6px 0;border-bottom:1px solid var(--line)"><span class="grow" style="color:var(--ink)">${catOf(a.cat).name}</span><span>${a.correct}/${a.total}</span><b style="color:var(--gold)">+${a.score}</b><span>${fmtTime(a.at)}</span></div>`).join('') : 'لم تلعب أي جولة بعد.';
  }
};

// تلميح تلقائي يستبعد خيارًا خاطئًا على الأقل؛ يستخدم q.hint إن كتبه المسؤول
function hintFor(q) {
  if (q.hint) return q.hint;
  const right = String(q.opts[q.a || 0]), wrong = q.opts.filter((_, k) => k !== (q.a || 0)).map(String);
  const num = t => /^-?\d+(\.\d+)?$/.test(t.trim()) ? +t : NaN;
  if (!isNaN(num(right)) && wrong.every(w => !isNaN(num(w)))) {
    const r = num(right), lo = wrong.map(num).filter(w => w < r), hi = wrong.map(num).filter(w => w > r);
    return lo.length >= hi.length ? `الجواب أكبر من ${Math.max(...lo)}` : `الجواب أصغر من ${Math.min(...hi)}`;
  }
  for (let n = 1; n < right.length; n++) {
    const pre = right.slice(0, n);
    if (pre.trim() && !wrong.some(w => w.startsWith(pre))) return `الإجابة الصحيحة تبدأ بـ «${pre}…»`;
  }
  return `الإجابة الصحيحة ليست «${wrong[0]}»`;
}

async function route() {
  if (location.hash === '#admin') return Admin.render();
  S.uid = API.me();
  S.p = S.uid ? await API.profile(S.uid) : null;
  if (S.p && !(await API.isAdmin())) Student.home(); else { S.p = null; Student.auth(); }
}
addEventListener('hashchange', route);
API.boot().then(route).catch(e => { app.innerHTML = `<section class="card"><p class="err">تعذّر الاتصال بقاعدة البيانات: ${esc(e.message)}</p></section>`; });
