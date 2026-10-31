// لوحة المسؤول (تفتح من الرابط: الموقع/#admin)
const Admin = {
  tab: 'students', users: [], filter: { q: '', g: '', sort: 'points' }, qf: { cat: '', g: '' },

  async render() {
    nav.innerHTML = '';
    if (!(await API.isAdmin())) return this.login();
    nav.innerHTML = `<button class="ghost" id="aout">خروج المسؤول</button>`;
    $('#aout').onclick = async () => { await API.logout(); location.hash = ''; };
    app.innerHTML = `<section class="card" style="display:grid;gap:12px">
        <div class="row" style="justify-content:space-between"><h1 style="font-size:1.4rem">لوحة المسؤول</h1>
          <span class="chip">${API.live ? 'متصل بقاعدة البيانات' : 'وضع تجريبي'}</span></div>
        <div class="tabs"><button data-t="students">الطلاب</button><button data-t="questions">الأسئلة</button><button data-t="summary">ملخص</button></div>
      </section><div id="ab"></div>`;
    app.querySelector('.tabs').onclick = e => { const t = e.target.dataset.t; if (t) { this.tab = t; this.show(); } };
    this.show();
  },

  login() {
    app.innerHTML = `<section class="card form"><h1 style="font-size:1.4rem">دخول المسؤول</h1>
      <form class="form" id="alf">
        <label class="f">البريد الإلكتروني<input id="ae1" autocomplete="username" required ${API.live ? 'type="email"' : 'placeholder="admin"'}></label>
        <label class="f">كلمة المرور<input id="ap1" type="password" autocomplete="current-password" required></label>
        <div class="err" id="aer"></div><button class="btn">دخول</button>
      </form>
      ${API.live ? '' : '<p class="small muted" style="margin:0">في الوضع التجريبي: admin / admin123</p>'}
      <button class="link" onclick="location.hash=''">رجوع لصفحة الطلاب</button></section>`;
    $('#alf').onsubmit = async e => {
      e.preventDefault();
      try { await API.adminLogin($('#ae1').value, $('#ap1').value); this.render(); }
      catch (x) { $('#aer').textContent = x.message; }
    };
  },

  show() {
    app.querySelectorAll('.tabs button').forEach(b => b.classList.toggle('on', b.dataset.t === this.tab));
    ({ students: () => this.students(), questions: () => this.questions(), summary: () => this.summary() })[this.tab]();
  },

  async loadUsers() { this.users = await API.users(); return this.users; },

  async students() {
    const ab = $('#ab'); ab.innerHTML = '<p class="muted">جارٍ التحميل…</p>';
    await this.loadUsers();
    const f = this.filter;
    ab.innerHTML = `<section class="card" style="display:grid;gap:12px">
      <div class="row">
        <input id="fq" class="grow" placeholder="ابحث بالاسم" value="${esc(f.q)}" style="flex:2 1 160px">
        <select id="fg" style="flex:1 1 110px"><option value="">كل الصفوف</option>${GRADE_NAMES.slice(1).map((n, i) => `<option value="${i + 1}" ${+f.g === i + 1 ? 'selected' : ''}>الصف ${n}</option>`).join('')}</select>
        <select id="fs" style="flex:1 1 120px"><option value="points">الأعلى نقاطًا</option><option value="lastLogin">آخر دخول</option><option value="name">الاسم</option></select>
        <button class="ghost" id="csv">تصدير CSV</button>
      </div>
      <div class="tablewrap"><table><thead><tr><th>الطالب</th><th class="num">الصف</th><th class="num">النقاط</th><th class="num">الجولات</th><th class="num">الدقة</th><th>آخر دخول</th><th class="num">مرات الدخول</th></tr></thead><tbody id="tb"></tbody></table></div>
      <p class="small muted" style="margin:0" id="cnt"></p></section><div id="det"></div>`;
    $('#fs').value = f.sort;
    const draw = () => {
      let L = this.users.filter(u => (!f.q || u.name.includes(f.q)) && (!f.g || u.grade === +f.g));
      L.sort((a, b) => f.sort === 'name' ? a.name.localeCompare(b.name, 'ar') : (b[f.sort] || 0) - (a[f.sort] || 0));
      $('#tb').innerHTML = L.map(u => `<tr data-u="${u.uid}"><td>${esc(u.avatar)} ${esc(u.name)}</td><td class="num">${u.grade}</td><td class="num">${u.points}</td><td class="num">${u.games}</td>
        <td class="num">${u.answered ? Math.round(u.correct / u.answered * 100) + '%' : '—'}</td><td>${fmtTime(u.lastLogin)}</td><td class="num">${u.logins || 0}</td></tr>`).join('') || '<tr><td colspan="7" class="muted">لا يوجد طلاب بعد.</td></tr>';
      $('#cnt').textContent = `${L.length} طالب`;
      this.visible = L;
    };
    $('#fq').oninput = e => { f.q = e.target.value.trim(); draw(); };
    $('#fg').onchange = e => { f.g = e.target.value; draw(); };
    $('#fs').onchange = e => { f.sort = e.target.value; draw(); };
    $('#tb').onclick = e => { const r = e.target.closest('[data-u]'); if (r) this.detail(r.dataset.u); };
    $('#csv').onclick = () => {
      const rows = [['الاسم', 'الصف', 'النقاط', 'الجولات', 'الإجابات الصحيحة', 'عدد الأسئلة', 'آخر دخول', 'مرات الدخول', 'تاريخ التسجيل'],
        ...this.visible.map(u => [u.name, u.grade, u.points, u.games, u.correct, u.answered, fmtTime(u.lastLogin), u.logins, fmtTime(u.createdAt)])];
      const csv = '﻿' + rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'students.csv'; a.click();
    };
    draw();
  },

  async detail(uid) {
    const u = this.users.find(x => x.uid === uid), det = $('#det');
    det.innerHTML = `<section class="card" style="display:grid;gap:12px">
      <div class="row"><div class="av">${esc(u.avatar)}</div><div class="grow"><h2 style="font-size:1.2rem">${esc(u.name)}</h2>
        <span class="small muted">${rankOf(u.points).name} · سُجّل ${fmtTime(u.createdAt)}</span></div><button class="ghost" id="dx">إغلاق</button></div>
      <div class="stats">
        <div class="stat"><span class="small muted">النقاط</span><b>${u.points}</b></div>
        <div class="stat"><span class="small muted">الجولات</span><b>${u.games}</b></div>
        <div class="stat"><span class="small muted">الشارات</span><b>${(u.badges || []).length}</b></div>
        <div class="stat"><span class="small muted">مرات الدخول</span><b>${u.logins || 0}</b></div>
      </div>
      <div class="small">${CATS.map(c => `${c.name}: <b>${u.cats?.[c.id]?.pts || 0}</b>`).join(' · ')}</div>
      <div class="row"><label class="f grow">تغيير الصف<select id="dg">${GRADE_NAMES.slice(1).map((n, i) => `<option value="${i + 1}" ${i + 1 === u.grade ? 'selected' : ''}>الصف ${n}</option>`).join('')}</select></label>
        <button class="btn green" id="dgs" style="align-self:end">حفظ</button>
        <button class="ghost" id="ddel" style="align-self:end;color:var(--bad)">حذف الطالب</button></div>
      <div id="dconf"></div>
      <h3 style="font-size:1rem">السجل</h3><div class="tablewrap"><table><thead><tr><th>الوقت</th><th>النشاط</th><th>الفئة</th><th class="num">النتيجة</th></tr></thead><tbody id="dlog"><tr><td colspan="4" class="muted">جارٍ التحميل…</td></tr></tbody></table></div>
    </section>`;
    det.scrollIntoView({ behavior: 'smooth' });
    $('#dx').onclick = () => det.innerHTML = '';
    $('#dgs').onclick = async () => { await API.adminUpdate(uid, { grade: +$('#dg').value }); this.students(); };
    $('#ddel').onclick = () => {
      $('#dconf').innerHTML = `<div class="row" style="background:var(--plaster);padding:10px;border-radius:10px"><span class="grow">حذف «${esc(u.name)}» وكل نقاطه؟ لا يمكن التراجع.</span><button class="btn" id="dyes">نعم، احذف</button><button class="ghost" id="dno">إلغاء</button></div>`;
      $('#dno').onclick = () => $('#dconf').innerHTML = '';
      $('#dyes').onclick = async () => { await API.deleteUser(uid); this.students(); };
    };
    const log = await API.activity(uid, 100);
    $('#dlog').innerHTML = log.map(a => `<tr><td>${fmtTime(a.at)}</td><td>${a.type === 'login' ? 'دخول' : 'جولة'}</td><td>${a.cat ? catOf(a.cat).name : '—'}</td><td class="num">${a.type === 'game' ? `${a.correct}/${a.total} · +${a.score}` : ''}</td></tr>`).join('') || '<tr><td colspan="4" class="muted">لا يوجد نشاط.</td></tr>';
  },

  async questions() {
    const ab = $('#ab'), f = this.qf;
    ab.innerHTML = '<p class="muted">جارٍ التحميل…</p>';
    const dbCount = await API.dbQuestionCount();
    const needSeed = API.live && dbCount === 0;
    API._qcache = null;
    const all = await API.questions();
    ab.innerHTML = `
      ${needSeed ? `<section class="card" style="display:grid;gap:10px;border-color:var(--gold)"><b>قاعدة الأسئلة فارغة</b>
        <p class="small muted" style="margin:0">الطلاب يلعبون الآن من البنك المدمج (${SEED.length} سؤالًا). ارفعه إلى قاعدة البيانات لتتمكن من تعديله والإضافة عليه.</p>
        <button class="btn green" id="seed">رفع البنك الأولي</button></section>` : ''}
      <section class="card form" id="qform"></section>
      <section class="card" style="display:grid;gap:10px">
        <div class="row"><select id="qc" style="flex:1 1 140px"><option value="">كل الفئات</option>${CATS.map(c => `<option value="${c.id}" ${f.cat === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}</select>
          <select id="qg" style="flex:1 1 120px"><option value="">كل الصفوف</option>${GRADE_NAMES.slice(1).map((n, i) => `<option value="${i + 1}" ${+f.g === i + 1 ? 'selected' : ''}>الصف ${n}</option>`).join('')}</select></div>
        <p class="small muted" style="margin:0">أسئلة الرياضيات وسلاسل الذكاء تتولّد تلقائيًا لكل صف، والأسئلة هنا تُضاف إليها.</p>
        <div id="ql"></div></section>`;
    $('#seed')?.addEventListener('click', async e => { e.target.disabled = true; e.target.textContent = 'جارٍ الرفع…'; await API.seed(); this.questions(); });
    const draw = () => {
      const L = all.filter(q => (!f.cat || q.cat === f.cat) && (!f.g || (q.gmin <= +f.g && +f.g <= q.gmax)));
      $('#ql').innerHTML = `<p class="small">${L.length} سؤال</p>` + L.map(q => `<div class="qitem" style="${q.active === false ? 'opacity:.5' : ''}">
        <div class="row small"><span class="chip">${catOf(q.cat).name}</span><span class="chip">ص ${q.gmin}–${q.gmax}</span><span class="chip">مستوى ${q.lvl || 1}</span>${q.active === false ? '<span class="chip">موقوف</span>' : ''}</div>
        ${q.passage ? `<div class="small muted">نص: ${esc(q.passage.slice(0, 70))}…</div>` : ''}
        <b>${esc(q.q)}</b>
        <div class="small">${q.opts.map((o, i) => i === (q.a || 0) ? `<span class="ans">✓ ${esc(o)}</span>` : esc(o)).join(' · ')}</div>
        ${needSeed ? '' : `<div class="row"><button class="link" data-e="${q.id}">تعديل</button><button class="link" data-t="${q.id}">${q.active === false ? 'تفعيل' : 'إيقاف'}</button><button class="link" data-d="${q.id}" style="color:var(--bad)">حذف</button></div>`}
      </div>`).join('');
    };
    $('#qc').onchange = e => { f.cat = e.target.value; draw(); };
    $('#qg').onchange = e => { f.g = e.target.value; draw(); };
    $('#ql').onclick = async e => {
      const b = e.target.closest('button'); if (!b) return;
      const q = all.find(x => x.id === (b.dataset.e || b.dataset.t || b.dataset.d));
      if (b.dataset.e) { this.form(q); $('#qform').scrollIntoView({ behavior: 'smooth' }); }
      if (b.dataset.t) { await API.saveQuestion({ ...q, active: q.active === false }); this.questions(); }
      if (b.dataset.d) {
        if (b.textContent !== 'تأكيد الحذف') { b.textContent = 'تأكيد الحذف'; return; }
        await API.deleteQuestion(q.id); this.questions();
      }
    };
    needSeed ? $('#qform').remove() : this.form();
    draw();
  },

  form(q = { cat: 'oman', gmin: 1, gmax: 3, lvl: 1, q: '', opts: ['', '', '', ''], a: 0, passage: '', active: true }) {
    const gsel = (id, v) => `<select id="${id}">${[...Array(12)].map((_, i) => `<option ${i + 1 === v ? 'selected' : ''}>${i + 1}</option>`).join('')}</select>`;
    $('#qform').innerHTML = `<h2 style="font-size:1.15rem">${q.id ? 'تعديل سؤال' : 'إضافة سؤال'}</h2>
      <div class="row"><label class="f grow">الفئة<select id="fc">${CATS.map(c => `<option value="${c.id}" ${q.cat === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}</select></label>
        <label class="f">من صف${gsel('f1', q.gmin)}</label><label class="f">إلى صف${gsel('f2', q.gmax)}</label>
        <label class="f">المستوى<select id="fl">${[1, 2, 3, 4, 5].map(l => `<option ${l === (q.lvl || 1) ? 'selected' : ''}>${l}</option>`).join('')}</select></label></div>
      <label class="f">نص للقراءة (اختياري)<textarea id="fp" placeholder="للأسئلة التي تعتمد على قطعة قراءة">${esc(q.passage)}</textarea></label>
      <label class="f">السؤال<input id="fq2" value="${esc(q.q)}" required></label>
      <div class="f"><span>الخيارات (اختر الصحيحة)</span>${q.opts.map((o, i) => `<div class="row"><input type="radio" name="fa" value="${i}" ${i === (q.a || 0) ? 'checked' : ''} style="width:auto" aria-label="الإجابة الصحيحة"><input class="grow" id="fo${i}" value="${esc(o)}" placeholder="الخيار ${i + 1}"></div>`).join('')}</div>
      <div class="err" id="fe"></div>
      <div class="row"><button class="btn green" id="fsave">${q.id ? 'حفظ التعديل' : 'إضافة السؤال'}</button>${q.id ? '<button class="ghost" id="fcancel">إلغاء</button>' : ''}</div>`;
    $('#fcancel')?.addEventListener('click', () => this.form());
    $('#fsave').onclick = async () => {
      const opts = [0, 1, 2, 3].map(i => $('#fo' + i).value.trim()), gmin = +$('#f1').value, gmax = +$('#f2').value;
      if (!$('#fq2').value.trim() || opts.some(o => !o)) return $('#fe').textContent = 'اكتب السؤال والخيارات الأربعة.';
      if (gmin > gmax) return $('#fe').textContent = '«من صف» يجب أن يكون أصغر من أو يساوي «إلى صف».';
      await API.saveQuestion({ id: q.id, cat: $('#fc').value, gmin, gmax, lvl: +$('#fl').value, passage: $('#fp').value.trim(), q: $('#fq2').value.trim(), opts, a: +document.querySelector('[name=fa]:checked').value, active: q.active !== false });
      this.questions();
    };
  },

  async summary() {
    const ab = $('#ab'); ab.innerHTML = '<p class="muted">جارٍ التحميل…</p>';
    const U = await this.loadUsers(), day = 864e5, now = Date.now();
    const byGrade = GRADE_NAMES.slice(1).map((_, i) => U.filter(u => u.grade === i + 1).length);
    const max = Math.max(1, ...byGrade);
    ab.innerHTML = `<section class="card" style="display:grid;gap:14px">
      <div class="stats">
        <div class="stat"><span class="small muted">عدد الطلاب</span><b>${U.length}</b></div>
        <div class="stat"><span class="small muted">دخلوا اليوم</span><b>${U.filter(u => now - u.lastLogin < day).length}</b></div>
        <div class="stat"><span class="small muted">نشطون هذا الأسبوع</span><b>${U.filter(u => now - u.lastLogin < 7 * day).length}</b></div>
        <div class="stat"><span class="small muted">مجموع الجولات</span><b>${U.reduce((s, u) => s + (u.games || 0), 0)}</b></div>
      </div>
      <h3 style="font-size:1rem">الطلاب حسب الصف</h3>
      <div style="display:grid;gap:6px">${byGrade.map((n, i) => `<div class="row small"><span style="width:4.5em;white-space:nowrap">الصف ${i + 1}</span><div class="bar grow"><i style="width:${n / max * 100}%"></i></div><span class="num" style="width:2em">${n}</span></div>`).join('')}</div>
      <h3 style="font-size:1rem">أعلى 10 طلاب</h3>
      <div class="lb"><ol>${[...U].sort((a, b) => b.points - a.points).slice(0, 10).map((u, i) => `<li><span>${i + 1}</span><span>${esc(u.avatar)}</span><span>${esc(u.name)} <span class="small muted">· ص${u.grade}</span></span><span class="num">${u.points}</span></li>`).join('')}</ol></div>
    </section>`;
  }
};
