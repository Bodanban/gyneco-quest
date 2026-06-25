/* ===========================================================
   GYNECO-QUEST — moteur de jeu
   Répétition espacée (Leitner) + XP/niveaux + combos + dopamine
   =========================================================== */
const Game = (() => {
  const DATA = window.GYNECO;
  const CARDS = DATA.cards;
  const CATS = DATA.categories;
  const CAT_BY_ID = Object.fromEntries(CATS.map(c => [c.id, c]));
  const KEY = "gynecoquest.v1";
  const DAILY_GOAL = 30;

  // Leitner : intervalles par boîte (ms). Court car l'examen est ce week-end.
  const BOX_MS = [0, 60e3, 20*60e3, 4*3600e3, 24*3600e3, 48*3600e3]; // index = boîte 1..5
  const MASTER_BOX = 4;
  const TITLES = ["Externe curieux","Interne débutant","Interne motivé","Interne aguerri","Chef de clinique",
                  "Assistant","Praticien","Spécialiste","Expert gynéco","Professeur agrégé","Légende du CHU"];

  const BADGES = [
    { id:"first",  ico:"🐣", name:"Premiers pas",   desc:"1ʳᵉ carte répondue",      test:s=>s.stats.answered>=1 },
    { id:"ten",    ico:"🔟", name:"Échauffement",    desc:"10 cartes",               test:s=>s.stats.answered>=10 },
    { id:"fifty",  ico:"💪", name:"Sérieux",         desc:"50 cartes",               test:s=>s.stats.answered>=50 },
    { id:"hundred",ico:"🚀", name:"Marathonien",     desc:"150 cartes",              test:s=>s.stats.answered>=150 },
    { id:"streak10",ico:"🔥",name:"En feu",          desc:"Série de 10",             test:s=>s.stats.bestStreak>=10 },
    { id:"streak25",ico:"⚡",name:"Imparable",       desc:"Série de 25",             test:s=>s.stats.bestStreak>=25 },
    { id:"lvl5",   ico:"⭐", name:"Chef de clinique",desc:"Niveau 5",                test:s=>levelFromXp(s.xp)>=5 },
    { id:"cat1",   ico:"👑", name:"Premier boss",    desc:"1 chapitre maîtrisé",     test:s=>masteredCats(s)>=1 },
    { id:"cat5",   ico:"🏆", name:"Demi-CHU",        desc:"5 chapitres maîtrisés",   test:s=>masteredCats(s)>=5 },
    { id:"allmast",ico:"💎", name:"Sans faute",      desc:"Tout le CHU maîtrisé",    test:s=>masteredCats(s)>=CATS.length },
    { id:"daily",  ico:"🎯", name:"Objectif atteint",desc:"Objectif du jour rempli", test:s=>s.daily.count>=DAILY_GOAL },
    { id:"night",  ico:"🦉", name:"Chouette",        desc:"Révision après minuit",   test:s=>s.flags.night }
  ];

  /* ---------------- STATE ---------------- */
  let S = load();
  let session = null; // état de la partie en cours
  let audioCtx = null;

  function todayStr(){ return new Date().toISOString().slice(0,10); }

  function freshState(){
    const cards = {};
    CARDS.forEach(c => cards[c.id] = { box:1, due:0, seen:0, ok:0 });
    return {
      xp:0, cards,
      stats:{ answered:0, correct:0, bestStreak:0 },
      daily:{ date:todayStr(), count:0 },
      badges:[], flags:{night:false}
    };
  }
  function load(){
    try{
      const raw = JSON.parse(localStorage.getItem(KEY));
      if(!raw) return freshState();
      // fusionne les nouvelles cartes éventuelles
      CARDS.forEach(c => { if(!raw.cards[c.id]) raw.cards[c.id]={box:1,due:0,seen:0,ok:0}; });
      if(raw.daily.date !== todayStr()){ raw.daily = {date:todayStr(), count:0}; }
      raw.flags = raw.flags || {night:false};
      return raw;
    }catch(e){ return freshState(); }
  }
  function save(){ localStorage.setItem(KEY, JSON.stringify(S)); }

  /* ---------------- XP / NIVEAUX ---------------- */
  function levelFromXp(xp){ return Math.floor(Math.sqrt(xp/50)) + 1; }
  function xpForLevel(L){ return 50*(L-1)*(L-1); }
  function masteredCount(){ return CARDS.filter(c => S.cards[c.id].box >= MASTER_BOX).length; }
  function seenCount(){ return CARDS.filter(c => S.cards[c.id].seen > 0).length; }
  function catCards(catId){ return CARDS.filter(c => c.cat === catId); }
  function catPct(catId){
    const cc = catCards(catId);
    const m = cc.filter(c => S.cards[c.id].box >= MASTER_BOX).length;
    return Math.round(100 * m / cc.length);
  }
  function masteredCats(s){ return CATS.filter(c => {
    const cc = CARDS.filter(x=>x.cat===c.id);
    return cc.every(x => (s.cards[x.id]||{box:1}).box >= MASTER_BOX);
  }).length; }
  function dueCards(){
    const now = Date.now();
    return CARDS.filter(c => S.cards[c.id].due <= now);
  }

  /* ---------------- NAVIGATION ---------------- */
  function go(id){
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
    window.scrollTo(0,0);
    if(id==="home") renderHome();
    if(id==="cats") renderCats();
    if(id==="plan") renderPlan();
    if(id==="badges") renderBadges();
  }

  /* ---------------- HOME ---------------- */
  function renderHome(){
    const L = levelFromXp(S.xp);
    const cur = xpForLevel(L), next = xpForLevel(L+1);
    const prog = (S.xp - cur) / (next - cur);
    document.getElementById("tb-level").textContent = L;
    document.getElementById("tb-streak").textContent = S.stats.bestStreak;
    document.getElementById("homeLevel").textContent = L;
    document.getElementById("homeTitle").textContent = TITLES[Math.min(L-1, TITLES.length-1)];
    document.getElementById("homeXp").textContent = S.xp;
    document.getElementById("homeXpNext").textContent = (next - S.xp);
    document.getElementById("xpRing").style.strokeDashoffset = 327*(1-prog);
    document.getElementById("homeMastered").textContent = masteredCount();
    document.getElementById("homeSeen").textContent = seenCount();
    document.getElementById("homeTotal").textContent = CARDS.length;
    document.getElementById("dueCount").textContent = dueCards().length;
    // daily
    const dc = Math.min(S.daily.count, DAILY_GOAL);
    document.getElementById("dailyCount").textContent = `${S.daily.count} / ${DAILY_GOAL}`;
    document.getElementById("dailyBar").style.width = (100*dc/DAILY_GOAL)+"%";
    document.getElementById("dailyMsg").textContent = S.daily.count>=DAILY_GOAL
      ? "🎉 Objectif atteint ! Chaque carte en plus, c'est du bonus."
      : `Réponds à ${DAILY_GOAL-S.daily.count} cartes de plus pour valider ta journée 🔥`;
  }

  /* ---------------- CATEGORIES ---------------- */
  function renderCats(){
    const box = document.getElementById("catList");
    box.innerHTML = "";
    CATS.forEach(c => {
      const pct = catPct(c.id);
      const total = catCards(c.id).length;
      const won = pct===100;
      const el = document.createElement("div");
      el.className = "cat-card";
      el.onclick = () => startReview("cat", c.id);
      el.innerHTML = `
        <div class="cat-emoji" style="background:${c.color}22">${c.emoji}</div>
        <div class="cat-mid">
          <div class="cat-name">${c.name} ${won?'<span class="crown">👑</span>':''}</div>
          <div class="cat-meta">${total} cartes • ${c.blurb}</div>
          <div class="cat-bar"><i style="width:${pct}%;background:${c.color}"></i></div>
        </div>
        <div class="cat-pct" style="color:${c.color}">${pct}%</div>`;
      box.appendChild(el);
    });
  }

  /* ---------------- SESSION / REVIEW (flashcards) ---------------- */
  function startReview(kind, catId){
    let pool;
    if(kind==="cat"){ pool = catCards(catId).slice(); }
    else { // 'due'
      pool = dueCards();
      if(pool.length===0) pool = CARDS.slice(); // tout est à jour → révision libre
    }
    // priorité : moins maîtrisées d'abord, puis interleaving aléatoire
    shuffle(pool);
    pool.sort((a,b) => S.cards[a.id].box - S.cards[b.id].box);
    pool = pool.slice(0, kind==="cat" ? pool.length : Math.min(pool.length, 25));
    if(pool.length===0){ toast("Rien à réviser ✨"); return; }
    session = { mode:"review", queue:pool, idx:0, total:pool.length, correct:0, xp:0, streak:0, combo:1, catId };
    go("play");
    showCard();
  }

  function showCard(){
    const s = session;
    if(s.idx >= s.queue.length){ return finish(); }
    const card = s.queue[s.idx];
    const cat = CAT_BY_ID[card.cat];
    document.getElementById("fcCat").textContent = `${cat.emoji} ${cat.name}`;
    document.getElementById("fcCat").style.color = cat.color;
    document.getElementById("fcQ").textContent = card.q;
    document.getElementById("fcABody").textContent = card.a;
    const mn = document.getElementById("fcMnemo");
    if(card.mnemo){ mn.hidden=false; mn.textContent = card.mnemo; } else mn.hidden=true;
    document.getElementById("fcA").hidden = true;
    document.getElementById("fcTap").hidden = false;
    document.getElementById("gradeRow").hidden = true;
    document.getElementById("revealBtn").hidden = false;
    document.getElementById("playBar").style.width = (100*s.idx/s.total)+"%";
    updateCombo("comboBox", s.combo);
  }
  function reveal(){
    document.getElementById("fcA").hidden = false;
    document.getElementById("fcTap").hidden = true;
    document.getElementById("revealBtn").hidden = true;
    document.getElementById("gradeRow").hidden = false;
    beep("flip");
  }
  // grade : 0 raté, 1 presque, 2 su
  function grade(g){
    const s = session;
    const card = s.queue[s.idx];
    const cs = S.cards[card.id];
    cs.seen++;
    if(g===2){
      cs.box = Math.min(5, cs.box+1); cs.ok++;
      cs.due = Date.now() + BOX_MS[cs.box];
      s.correct++; s.streak++; s.combo = comboMult(s.streak);
      S.stats.correct++;
      gainXp(s, Math.round(10*s.combo));
      fxGood(s.streak);
    } else if(g===1){
      cs.box = Math.max(1, cs.box); // reste dans sa boîte
      cs.due = Date.now() + BOX_MS[2];
      gainXp(s, 4); beep("flip");
    } else {
      cs.box = 1; cs.due = Date.now() + BOX_MS[1];
      s.streak = 0; s.combo = 1;
      gainXp(s, 1); fxFail();
    }
    S.stats.answered++;
    S.stats.bestStreak = Math.max(S.stats.bestStreak, s.streak);
    bumpDaily();
    checkNight();
    save();
    s.idx++;
    setTimeout(showCard, 180);
  }

  /* ---------------- QUIZ / BLITZ (QCM auto) ---------------- */
  function startQuiz(){ launchMcq({ mode:"quiz", total:12 }); }
  function startBlitz(){ launchMcq({ mode:"blitz", time:60 }); }

  function launchMcq(opts){
    const pool = CARDS.slice(); shuffle(pool);
    session = Object.assign({ queue:pool, idx:0, correct:0, xp:0, streak:0, combo:1, answered:0 }, opts);
    go("quiz");
    if(opts.mode==="blitz"){
      session.endAt = Date.now() + opts.time*1000;
      session.timer = setInterval(tickBlitz, 250);
    }
    showMcq();
  }
  function tickBlitz(){
    const left = Math.max(0, session.endAt - Date.now());
    document.getElementById("quizBar").style.width = (100*left/(session.time*1000))+"%";
    if(left<=0){ clearInterval(session.timer); finish(); }
  }
  function showMcq(){
    const s = session;
    if(s.mode==="quiz" && s.idx >= s.total){ return finish(); }
    const card = s.queue[s.idx % s.queue.length];
    s.current = card;
    // options : 1 bonne réponse + 3 leurres (1ʳᵉ ligne d'autres réponses)
    const firstLine = a => { const l=a.split("\n")[0].replace(/^[•\-\s]+/,""); return l.length>92?l.slice(0,90)+"…":l; };
    let distract = CARDS.filter(c => c.id!==card.id);
    // priorité aux leurres de la même catégorie (plus difficile, plus formateur)
    const same = distract.filter(c=>c.cat===card.cat); shuffle(same);
    const other = distract.filter(c=>c.cat!==card.cat); shuffle(other);
    const picks = (same.concat(other)).slice(0,3);
    let opts = picks.map(c => ({txt:firstLine(c.a), ok:false}));
    opts.push({txt:firstLine(card.a), ok:true});
    shuffle(opts);
    const cat = CAT_BY_ID[card.cat];
    document.getElementById("quizPrompt").innerHTML =
      `<small style="color:${cat.color}">${cat.emoji} ${cat.name}</small>${escapeHtml(card.q)}`;
    const box = document.getElementById("quizOptions"); box.innerHTML="";
    opts.forEach(o => {
      const b = document.createElement("button");
      b.className="qopt"; b.textContent = o.txt;
      b.onclick = () => answerMcq(b, o.ok, box, card);
      box.appendChild(b);
    });
    if(s.mode==="quiz") document.getElementById("quizBar").style.width = (100*s.idx/s.total)+"%";
    updateCombo("quizCombo", s.combo);
  }
  function answerMcq(btn, ok, box, card){
    [...box.children].forEach(b=>b.onclick=null);
    const cs = S.cards[card.id]; cs.seen++;
    if(ok){
      btn.classList.add("correct");
      session.correct++; session.streak++; session.combo = comboMult(session.streak);
      cs.box = Math.min(5, cs.box+1); cs.ok++; cs.due = Date.now()+BOX_MS[cs.box];
      S.stats.correct++;
      gainXp(session, Math.round(8*session.combo));
      fxGood(session.streak);
    } else {
      btn.classList.add("wrong");
      [...box.children].forEach(b=>{ if(b.textContent===firstLineOf(card.a)) b.classList.add("correct"); });
      session.streak=0; session.combo=1;
      cs.box=1; cs.due=Date.now()+BOX_MS[1];
      gainXp(session,1); fxFail();
    }
    [...box.children].forEach(b=>{ if(!b.classList.contains("correct")&&!b.classList.contains("wrong")) b.classList.add("dim"); });
    S.stats.answered++; session.answered++;
    S.stats.bestStreak = Math.max(S.stats.bestStreak, session.streak);
    bumpDaily(); checkNight(); save();
    session.idx++;
    setTimeout(showMcq, 850);
  }
  function firstLineOf(a){ const l=a.split("\n")[0].replace(/^[•\-\s]+/,""); return l.length>92?l.slice(0,90)+"…":l; }

  /* ---------------- COMBO / XP helpers ---------------- */
  function comboMult(streak){ return Math.min(1 + Math.floor(streak/3)*0.5, 4); }
  function gainXp(s, n){ s.xp += n; const before=levelFromXp(S.xp); S.xp += n; const after=levelFromXp(S.xp);
    if(after>before) levelUp(after); }
  function updateCombo(id, combo){
    const el = document.getElementById(id);
    el.textContent = `🔥 ×${combo}`;
    el.classList.toggle("hot", combo>=2);
  }
  function bumpDaily(){
    if(S.daily.date!==todayStr()) S.daily={date:todayStr(),count:0};
    S.daily.count++;
    if(S.daily.count===DAILY_GOAL){ toast("🎯 Objectif du jour atteint ! +50 XP"); S.xp+=50; confetti(60); beep("level"); }
  }
  function checkNight(){ const h=new Date().getHours(); if(h>=0&&h<5) S.flags.night=true; }

  /* ---------------- FINISH ---------------- */
  function finish(){
    if(session && session.timer) clearInterval(session.timer);
    const s = session;
    const got = s.correct||0;
    const tot = s.mode==="blitz" ? (s.answered||0) : (s.total|| s.answered || s.queue.length);
    document.getElementById("sumCorrect").textContent = got;
    document.getElementById("sumXp").textContent = "+"+(s.xp||0);
    document.getElementById("sumStreak").textContent = S.stats.bestStreak;
    const ratio = tot? got/tot : 0;
    let emoji="💪", title="Bien joué !", msg="Continue, la répétition c'est la clé.";
    if(s.mode==="blitz"){ emoji="⏱️"; title=`${got} bonnes réponses !`; msg="Reviens battre ton score."; }
    else if(ratio>=0.9){ emoji="🏆"; title="Parfait ou presque !"; msg="Tu domines cette série, passe à la suivante."; confetti(80); }
    else if(ratio>=0.6){ emoji="🎉"; title="Solide !"; msg="Encore quelques tours et c'est gravé."; }
    else { emoji="🌱"; title="C'est en forgeant…"; msg="Ces cartes reviendront bientôt. Tu vas les avoir."; }
    document.getElementById("sumEmoji").textContent = emoji;
    document.getElementById("sumTitle").textContent = title;
    document.getElementById("sumMsg").textContent = msg;
    // boss vaincu ?
    if(s.mode==="review" && s.catId && catPct(s.catId)===100){
      const c = CAT_BY_ID[s.catId];
      document.getElementById("sumMsg").textContent = `👑 Boss vaincu : ${c.name} maîtrisé à 100 % !`;
      confetti(120);
    }
    awardBadges();
    save();
    go("summary");
  }
  function quitPlay(){ if(session && session.timer) clearInterval(session.timer); session=null; go("home"); }

  /* ---------------- BADGES ---------------- */
  function awardBadges(){
    BADGES.forEach(b => {
      if(!S.badges.includes(b.id) && b.test(S)){
        S.badges.push(b.id);
        toast(`🏅 Trophée débloqué : ${b.name}`);
        beep("level");
      }
    });
  }
  function renderBadges(){
    const box = document.getElementById("badgeList"); box.innerHTML="";
    BADGES.forEach(b => {
      const got = S.badges.includes(b.id);
      const el = document.createElement("div");
      el.className = "badge"+(got?"":" locked");
      el.innerHTML = `<div class="b-ico">${got?b.ico:"🔒"}</div>
        <div class="b-name">${b.name}</div><div class="b-desc">${b.desc}</div>`;
      box.appendChild(el);
    });
  }

  /* ---------------- PLAN ---------------- */
  function renderPlan(){
    document.getElementById("planContent").innerHTML = `
      <div class="plan-tip">🧠 <b>La méthode qui marche</b> : ne relis pas tes cours passivement. <b>Teste-toi</b> (rappel actif), espace les révisions, et mélange les chapitres. C'est exactement ce que fait ce jeu.</div>
      <div class="plan-day">
        <h3>📅 Jour 1 — Les fondations</h3>
        <ul>
          <li>📖 <b>Définitions clés</b> + 🤰 <b>Accouchement & mécanique</b></li>
          <li>Objectif : 2 sessions de <b>Révision intelligente</b> (matin + soir)</li>
          <li>Apprends les acronymes : <b>IRI PTDR</b> (contractions), repères des présentations</li>
          <li>Termine par un <b>Quiz éclair</b> pour ancrer.</li>
        </ul>
      </div>
      <div class="plan-day">
        <h3>📅 Jour 2 — Les urgences (haut rendement)</h3>
        <ul>
          <li>🩸 <b>Urgences hémorragiques</b> + ⚡ <b>Prééclampsie/HTA</b> + 🍼 <b>Post-partum</b></li>
          <li>Maîtrise les protocoles chiffrés : <b>sulfate de Mg</b>, CAT HRP, hémorragie de la délivrance</li>
          <li>Mnémos : <b>Utérus de BOIS</b> (HRP), <b>BANDL-FROMMEL</b>, <b>HAATOP</b> (drépano)</li>
          <li>Refais le Jour 1 en <b>Blitz 60 s</b> (la répétition espacée fait son travail).</li>
        </ul>
      </div>
      <div class="plan-day">
        <h3>📅 Jour 3 — Le reste & consolidation</h3>
        <ul>
          <li>🔄 Présentations • 💔 Avortement • 🔪 Césarienne • 🦠 Infections • 💊 Contraception</li>
          <li>🎗️ Cancers • 🌸 Gynéco médicale • 🏥 Santé publique • 🧬 Terrains</li>
          <li>Vise <b>100 %</b> sur chaque chapitre (boss 👑) dans l'onglet <b>Par chapitre</b></li>
          <li>Finis par une grosse <b>Révision intelligente</b> : elle te ressort exactement ce que tu oublies.</li>
        </ul>
      </div>
      <div class="plan-tip">⚡ <b>Astuce dopamine</b> : fixe-toi de petites sessions de 10 min, garde ta <b>flamme 🔥</b> quotidienne, et vise les <b>trophées</b>. Le cerveau retient mieux ce qui est récompensé immédiatement.</div>
    `;
  }

  /* ---------------- FX : confetti / son / toast / level-up ---------------- */
  function fxGood(streak){
    beep("good");
    if(streak>0 && streak%5===0){ confetti(50); toast(`🔥 Série de ${streak} !`); }
  }
  function fxFail(){ beep("bad"); }
  function confetti(n){
    const box = document.getElementById("confetti");
    const colors=["#a855f7","#ec4899","#fbbf24","#22c55e","#6366f1","#06b6d4"];
    for(let i=0;i<n;i++){
      const d=document.createElement("div");
      d.className="conf";
      d.style.left=Math.random()*100+"vw";
      d.style.background=colors[i%colors.length];
      d.style.animation=`fall ${1+Math.random()*1.5}s ${Math.random()*0.3}s ease-in forwards`;
      d.style.transform=`rotate(${Math.random()*360}deg)`;
      box.appendChild(d);
      setTimeout(()=>d.remove(), 2800);
    }
  }
  let toastT;
  function toast(msg){
    const t=document.getElementById("toast");
    t.textContent=msg; t.classList.add("show");
    clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove("show"),1900);
  }
  function levelUp(L){
    document.getElementById("luLevel").textContent=L;
    document.getElementById("luSub").textContent = TITLES[Math.min(L-1,TITLES.length-1)];
    const el=document.getElementById("levelup"); el.classList.add("show");
    confetti(120); beep("level");
    setTimeout(()=>el.classList.remove("show"),2200);
  }
  function beep(type){
    try{
      audioCtx = audioCtx || new (window.AudioContext||window.webkitAudioContext)();
      const seqs={ good:[[660,0,.08],[880,.08,.12]], flip:[[440,0,.06]],
        bad:[[200,0,.18]], level:[[523,0,.1],[659,.1,.1],[784,.2,.1],[1046,.3,.18]] };
      (seqs[type]||seqs.flip).forEach(([f,t,d])=>{
        const o=audioCtx.createOscillator(), g=audioCtx.createGain();
        o.type= type==="bad"?"sawtooth":"sine"; o.frequency.value=f;
        g.gain.setValueAtTime(0.0001, audioCtx.currentTime+t);
        g.gain.exponentialRampToValueAtTime(0.18, audioCtx.currentTime+t+0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime+t+d);
        o.connect(g); g.connect(audioCtx.destination);
        o.start(audioCtx.currentTime+t); o.stop(audioCtx.currentTime+t+d+0.02);
      });
    }catch(e){}
  }

  /* ---------------- UTILS ---------------- */
  function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
  function escapeHtml(s){ return s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
  function resetConfirm(){ if(confirm("Effacer toute ta progression ? (XP, niveaux, trophées)")){ S=freshState(); save(); toast("Progression réinitialisée"); go("home"); } }

  // tap sur la carte = révéler
  document.addEventListener("DOMContentLoaded", ()=>{
    document.getElementById("flash").addEventListener("click", ()=>{
      if(session && session.mode==="review" && document.getElementById("fcA").hidden) reveal();
    });
    go("home");
    if("serviceWorker" in navigator){
      navigator.serviceWorker.register("sw.js").catch(()=>{});
    }
  });

  return { go, startReview, startQuiz, startBlitz, reveal, grade, quitPlay, resetConfirm };
})();
