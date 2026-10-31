// طبقة البيانات: Firebase عند تعبئة config.js، وإلا وضع تجريبي محفوظ في هذا المتصفح فقط
const API = (() => {
  const cfg = window.FIREBASE_CONFIG || {};
  const live = !!cfg.apiKey;
  let fb = null;

  const norm = s => s.trim().replace(/\s+/g, ' ').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').toLowerCase();
  async function sha(s) {
    const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
    return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
  }
  // Firebase يحتاج بريدًا؛ نحوّل الاسم العربي إلى بريد ثابت مخفي عن الطالب
  const nameEmail = async n => 's' + (await sha(norm(n))).slice(0, 32) + '@batal-almaarifa.app';

  const newProfile = (name, grade, avatar) => ({
    name, grade, avatar, points: 0, games: 0, correct: 0, answered: 0, perfects: 0, bestStreak: 0,
    cats: {}, badges: [], days: [], createdAt: Date.now(), lastLogin: Date.now(), logins: 1
  });

  // ───── وضع تجريبي ─────
  const KEY = 'bm_demo_v1';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; } };
  let mem = load();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch {} };
  if (!live && !mem) {
    mem = { users: {}, pass: {}, act: {}, questions: null, session: null };
    // طلاب أمثلة حتى لا تظهر لوحة المسؤول فارغة (يمكن حذفهم)
    const ex = [['سالم (مثال)', 4, '🐪', 240], ['مريم (مثال)', 2, '🐢', 120], ['خالد (مثال)', 8, '🦅', 610], ['شيخة (مثال)', 11, '⛵', 980]];
    ex.forEach(([n, g, av, pts], i) => {
      const uid = 'ex' + i, p = newProfile(n, g, av), t = Date.now() - i * 864e5;
      Object.assign(p, { points: pts, games: Math.round(pts / 60), correct: Math.round(pts / 12), answered: Math.round(pts / 9), lastLogin: t, logins: 3 + i, cats: { oman: { pts: pts / 2, correct: 5, answered: 7 }, math: { pts: pts / 2, correct: 5, answered: 8 } } });
      mem.users[uid] = p;
      mem.act[uid] = [{ type: 'game', cat: 'oman', score: 60, correct: 6, total: 8, at: t }, { type: 'login', at: t - 6e4 }];
    });
    save();
  }

  async function boot() {
    if (!live) return;
    const b = 'https://www.gstatic.com/firebasejs/10.12.2/';
    const [app, A, F] = await Promise.all([import(b + 'firebase-app.js'), import(b + 'firebase-auth.js'), import(b + 'firebase-firestore.js')]);
    const a = app.initializeApp(cfg);
    fb = { auth: A.getAuth(a), db: F.getFirestore(a), A, F };
    await new Promise(r => { const u = A.onAuthStateChanged(fb.auth, () => { u(); r(); }); });
  }

  const d = (...p) => fb.F.doc(fb.db, ...p);
  const lbDoc = p => ({ name: p.name, grade: p.grade, avatar: p.avatar, points: p.points });
  const authErr = e => {
    const c = e.code || '';
    if (c.includes('email-already-in-use')) return 'هذا الاسم مستخدم. أضف اسم العائلة أو رقمًا مميزًا.';
    if (c.includes('invalid-credential') || c.includes('wrong-password') || c.includes('user-not-found')) return 'الاسم أو الرمز غير صحيح.';
    if (c.includes('weak-password')) return 'الرمز يجب أن يكون 6 خانات على الأقل.';
    if (c.includes('network')) return 'لا يوجد اتصال بالإنترنت.';
    return e.message || 'حدث خطأ، حاول مرة أخرى.';
  };

  return {
    live, boot,

    me() { return live ? fb.auth.currentUser?.uid || null : (mem.session !== 'admin' ? mem.session : null); },

    async register(name, pass, grade, avatar) {
      if (name.trim().length < 2) throw new Error('اكتب اسمك الكامل.');
      if (pass.length < 6) throw new Error('الرمز يجب أن يكون 6 خانات على الأقل.');
      const p = newProfile(name.trim(), grade, avatar);
      if (!live) {
        const key = norm(name);
        if (Object.values(mem.users).some(u => norm(u.name) === key)) throw new Error('هذا الاسم مستخدم. أضف اسم العائلة أو رقمًا مميزًا.');
        const uid = 'u' + Date.now();
        mem.users[uid] = p; mem.pass[uid] = await sha(pass); mem.act[uid] = [{ type: 'login', at: Date.now() }]; mem.session = uid; save();
        return uid;
      }
      try {
        const cr = await fb.A.createUserWithEmailAndPassword(fb.auth, await nameEmail(name), pass);
        const uid = cr.user.uid;
        await fb.F.setDoc(d('users', uid), p);
        await fb.F.setDoc(d('leaderboard', uid), lbDoc(p));
        await this.log(uid, { type: 'login' });
        return uid;
      } catch (e) { throw new Error(authErr(e)); }
    },

    async login(name, pass) {
      if (!live) {
        const key = norm(name), h = await sha(pass);
        const uid = Object.keys(mem.users).find(id => norm(mem.users[id].name) === key && mem.pass[id] === h);
        if (!uid) throw new Error('الاسم أو الرمز غير صحيح.');
        mem.session = uid; save();
      } else {
        try { await fb.A.signInWithEmailAndPassword(fb.auth, await nameEmail(name), pass); }
        catch (e) { throw new Error(authErr(e)); }
      }
      const uid = this.me(), p = await this.profile(uid);
      await this.update(uid, { lastLogin: Date.now(), logins: (p.logins || 0) + 1 });
      await this.log(uid, { type: 'login' });
      return uid;
    },

    async logout() { if (live) await fb.A.signOut(fb.auth); else { mem.session = null; save(); } },

    async profile(uid) {
      if (!live) return mem.users[uid] ? structuredClone(mem.users[uid]) : null;
      const s = await fb.F.getDoc(d('users', uid)); return s.exists() ? s.data() : null;
    },

    async update(uid, patch) {
      if (!live) { Object.assign(mem.users[uid], patch); save(); return; }
      await fb.F.updateDoc(d('users', uid), patch);
      const p = await this.profile(uid);
      await fb.F.setDoc(d('leaderboard', uid), lbDoc(p));
    },

    async log(uid, entry) {
      const e = { ...entry, at: Date.now() };
      if (!live) { (mem.act[uid] ||= []).unshift(e); save(); return; }
      await fb.F.addDoc(fb.F.collection(fb.db, 'users', uid, 'activity'), e);
    },

    async activity(uid, n = 100) {
      if (!live) return (mem.act[uid] || []).slice(0, n);
      const q = fb.F.query(fb.F.collection(fb.db, 'users', uid, 'activity'), fb.F.orderBy('at', 'desc'), fb.F.limit(n));
      return (await fb.F.getDocs(q)).docs.map(x => x.data());
    },

    async leaderboard() {
      if (!live) return Object.entries(mem.users).map(([uid, u]) => ({ uid, ...lbDoc(u) })).sort((a, b) => b.points - a.points).slice(0, 200);
      const q = fb.F.query(fb.F.collection(fb.db, 'leaderboard'), fb.F.orderBy('points', 'desc'), fb.F.limit(200));
      return (await fb.F.getDocs(q)).docs.map(x => ({ uid: x.id, ...x.data() }));
    },

    // الأسئلة: من قاعدة البيانات، وإن كانت فارغة نستخدم البنك الأولي المدمج
    _qcache: null,
    async questions() {
      if (this._qcache) return this._qcache;
      let list;
      if (!live) list = mem.questions || SEED;
      else {
        try { list = (await fb.F.getDocs(fb.F.collection(fb.db, 'questions'))).docs.map(x => ({ ...x.data(), id: x.id })); }
        catch { list = []; }
        if (!list.length) list = SEED;
      }
      return (this._qcache = list);
    },

    // ───── المسؤول ─────
    async adminLogin(email, pass) {
      if (!live) {
        if (email.trim() !== 'admin' || pass !== 'admin123') throw new Error('بيانات المسؤول غير صحيحة. (في الوضع التجريبي: admin / admin123)');
        mem.session = 'admin'; save(); return;
      }
      try { await fb.A.signInWithEmailAndPassword(fb.auth, email.trim(), pass); }
      catch (e) { throw new Error('البريد أو كلمة المرور غير صحيحة.'); }
      if (!(await this.isAdmin())) { await this.logout(); throw new Error('هذا الحساب ليس حساب مسؤول. أضِف معرّفه في مجموعة admins.'); }
    },

    async isAdmin() {
      if (!live) return mem.session === 'admin';
      const u = fb.auth.currentUser; if (!u) return false;
      try { return (await fb.F.getDoc(d('admins', u.uid))).exists(); } catch { return false; }
    },

    async users() {
      if (!live) return Object.entries(mem.users).map(([uid, u]) => ({ uid, ...u }));
      return (await fb.F.getDocs(fb.F.collection(fb.db, 'users'))).docs.map(x => ({ uid: x.id, ...x.data() }));
    },

    async adminUpdate(uid, patch) { return this.update(uid, patch); },

    async deleteUser(uid) {
      if (!live) { delete mem.users[uid]; delete mem.pass[uid]; delete mem.act[uid]; save(); return; }
      // حساب الدخول نفسه يُحذف من لوحة Firebase > Authentication
      await fb.F.deleteDoc(d('users', uid));
      await fb.F.deleteDoc(d('leaderboard', uid));
    },

    async saveQuestion(q) {
      this._qcache = null;
      const { id, gen, ...data } = q;
      if (!live) {
        mem.questions ||= structuredClone(SEED);
        const i = mem.questions.findIndex(x => x.id === id);
        if (i >= 0) mem.questions[i] = { id, ...data }; else mem.questions.push({ id: 'q' + Date.now(), ...data });
        save(); return;
      }
      if (id && !id.startsWith('s')) await fb.F.setDoc(d('questions', id), data);
      else await fb.F.addDoc(fb.F.collection(fb.db, 'questions'), data);
    },

    async deleteQuestion(id) {
      this._qcache = null;
      if (!live) { mem.questions ||= structuredClone(SEED); mem.questions = mem.questions.filter(x => x.id !== id); save(); return; }
      await fb.F.deleteDoc(d('questions', id));
    },

    // رفع البنك الأولي إلى قاعدة البيانات (مرة واحدة)
    async seed() {
      this._qcache = null;
      if (!live) { mem.questions = structuredClone(SEED); save(); return SEED.length; }
      for (let i = 0; i < SEED.length; i += 400) {
        const b = fb.F.writeBatch(fb.db);
        SEED.slice(i, i + 400).forEach(({ id, ...q }) => b.set(fb.F.doc(fb.F.collection(fb.db, 'questions')), q));
        await b.commit();
      }
      return SEED.length;
    },

    async dbQuestionCount() {
      if (!live) return (mem.questions || SEED).length;
      return (await fb.F.getDocs(fb.F.collection(fb.db, 'questions'))).size;
    }
  };
})();
