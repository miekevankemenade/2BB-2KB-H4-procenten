/* =========================================================
   PROFESSOR PI PLUIS – spellaag voor de oefenapp
   ---------------------------------------------------------
   Dit bestand haakt aan op de bestaande app. De code in
   index.html blijft zoals hij is. Haal je de regel
   <script src="pipluis.js"></script> weg, dan is de app weer
   precies de oude.

   Wat het doet:
   - Pi Pluis staat in beeld en reageert op goed, fout en hints.
   - Elk tabblad met opdrachten is een level met 1 tot 3 sterren.
   - Leerlingen verdienen munten, reeksen en badges.
   - In de winkel kopen ze kunstjes, tovereffecten en kaders.
   Alles wordt bewaard in S.game en gaat dus mee met de
   leerlingcode (localStorage en Supabase).
   De oefentoets blijft een toets: Pi Pluis verklapt daar niets.
   ========================================================= */
(function(){
"use strict";
if (typeof ITEMS === 'undefined' || typeof render !== 'function') return;

/* ---------- instellingen (pas gerust aan) ---------- */
const MAP = 'pipluis/';
const MUNTEN = {ineens: 10, tweede: 5, daarna: 2, reeksBonus: 5, perSter: 10};
const STER3 = 0.85, STER2 = 0.6;            // deel van de punten voor 3 en 2 sterren
const LEVELS = SECTIES.filter(s => !s.toets);
const levelsNu = () => LEVELS.filter(l => !window.lesSecActief || window.lesSecActief(l));

const WINKEL = [
  {id: 'k-juichen',  soort: 'kunstje', naam: 'Juichsprong',     prijs: 30, pose: 'juichen',  tekst: 'Pi Pluis springt als je het goed hebt.'},
  {id: 'k-knipoog',  soort: 'kunstje', naam: 'Knipoog',         prijs: 40, pose: 'knipoog',  tekst: 'Pi Pluis geeft je een knipoog.'},
  {id: 'k-strooien', soort: 'kunstje', naam: 'Sterrenstrooier', prijs: 60, pose: 'strooien', tekst: 'Pi Pluis strooit met sterren.'},
  {id: 'k-toveren',  soort: 'kunstje', naam: 'Toverstaf',       prijs: 90, pose: 'toveren',  tekst: 'Pi Pluis tovert met zijn staf.'},
  {id: 'e-som',      soort: 'effect',  naam: 'Plus en min',     prijs: 20, tekens: ['➕', '➖', '✖️', '➗'], tekst: 'Rekentekens in plaats van sterren.'},
  {id: 'e-confetti', soort: 'effect',  naam: 'Confetti',        prijs: 40, tekens: ['🟣', '🔵', '🟡', '🩷', '🟢'], tekst: 'Gekleurde confetti.'},
  {id: 'e-pi',       soort: 'effect',  naam: 'Pi-regen',        prijs: 60, tekens: ['π', 'π', '✨'], tekst: 'Het regent π.'},
  {id: 'r-roze',     soort: 'kader',   naam: 'Roze kader',      prijs: 15, kleur: '#E924D5', tekst: 'Een roze rand om Pi Pluis.'},
  {id: 'r-cyaan',    soort: 'kader',   naam: 'Blauw kader',     prijs: 15, kleur: '#45EDFF', tekst: 'Een lichtblauwe rand om Pi Pluis.'},
  {id: 'r-goud',     soort: 'kader',   naam: 'Gouden kader',    prijs: 70, kleur: '#F2B90E', tekst: 'Een gouden rand om Pi Pluis.'},
  {id: 'r-regen',    soort: 'kader',   naam: 'Regenboogkader',  prijs: 120, kleur: 'regenboog', tekst: 'Een rand in alle kleuren.'}
];
const STANDAARD = {kunstje: {naam: 'Blij', pose: 'blij'}, effect: {naam: 'Sterren', tekens: ['⭐', '✨']}, kader: {naam: 'Paars kader', kleur: '#5E0696'}};

const BADGES = [
  {id: 'eerste',   icoon: '⭐', naam: 'Eerste ster',    tekst: 'Je eerste opdracht goed.'},
  {id: 'ineens5',  icoon: '🎯', naam: 'In één keer',    tekst: '5 opdrachten in één keer goed.'},
  {id: 'reeks3',   icoon: '🔥', naam: 'Reeks van 3',    tekst: '3 keer achter elkaar in één keer goed.'},
  {id: 'reeks5',   icoon: '🚀', naam: 'Reeks van 5',    tekst: '5 keer achter elkaar in één keer goed.'},
  {id: 'doorzet',  icoon: '💪', naam: 'Doorzetter',     tekst: 'Goed na 3 of meer foute pogingen.'},
  {id: 'uitleg',   icoon: '👀', naam: 'Goed opgelet',   tekst: 'Een uitleg helemaal bekeken.'},
  {id: 'reken',    icoon: '✏️', naam: 'Nette rekenaar', tekst: '5 keer je berekening opgeschreven.'},
  {id: 'level',    icoon: '🏁', naam: 'Level gehaald',  tekst: 'Je eerste level af.'},
  {id: 'zonder',   icoon: '🧠', naam: 'Zonder hint',    tekst: 'Een heel level zonder hint.'},
  {id: 'ster3',    icoon: '🌟', naam: 'Drie sterren',   tekst: 'Een level met 3 sterren.'},
  {id: 'spaar',    icoon: '🪙', naam: 'Spaarder',       tekst: '100 munten verdiend.'},
  {id: 'alles',    icoon: '🏆', naam: 'Alles af',       tekst: 'Alle levels gehaald.'},
  {id: 'toets',    icoon: '🎓', naam: 'Toetsklaar',     tekst: 'De eindtoets ingeleverd.'}
];

const ZEG = {
  welkom:  ['Hoi! Ik ben Pi Pluis. Ik help je met oefenen.'],
  terug:   ['Fijn dat je er weer bent!'],
  nieuw:   ['Nieuwe opdracht. Lees eerst goed.', 'Deze kun jij. Lees rustig.', 'Welke getallen heb je nodig?'],
  goed2:   ['Top! In één keer goed.', 'Wauw, meteen raak!', 'Knap gedaan!', 'Yes! Dat is hem.'],
  goed1:   ['Goed zo! Je gaf niet op.', 'Mooi, nu klopt het.', 'Goed gedaan!'],
  goed0:   ['Het is gelukt. Doorzetten loont!', 'Goed dat je bleef proberen.'],
  fout:    ['Nog niet goed. Kijk nog eens.', 'Bijna. Probeer het nog een keer.', 'Hmm, dat klopt nog niet.'],
  fout2:   ['Zit je vast? Klik op Hint.'],
  leeg:    ['Vul eerst een antwoord in.'],
  hint:    ['Hier is een hint. Lees hem rustig.', 'Ik help je een stukje op weg.'],
  hulp:    ['Kijk, ik laat het stap voor stap zien.'],
  vast:    ['Neem de tijd. Lukt het niet? Klik op Hint.'],
  pepper:  ['Jij kunt dit!', 'Fouten maken mag. Zo leer je.', 'Stap voor stap kom je er.', 'Ik denk met je mee.'],
  toets:   ['Dit is de eindtoets. Succes! Ik help nu niet.'],
  toetsOk: ['Opgeslagen. Door naar de volgende.'],
  einde:   ['Goed gewerkt! Tot de volgende keer.'],
  gekocht: ['Dank je! Die is mooi.'],
  al:      ['Deze had je al goed.']
};
const kies = a => a[Math.floor(Math.random() * a.length)];
const stil = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- bewaarde spelstand ---------- */
function G(){
  if (!S.game) S.game = {};
  const g = S.game;
  if (typeof g.munten !== 'number') g.munten = 0;
  if (typeof g.verdiend !== 'number') g.verdiend = 0;
  if (typeof g.reeks !== 'number') g.reeks = 0;
  if (typeof g.beste !== 'number') g.beste = 0;
  if (!g.beloond) g.beloond = {};
  if (!g.badges) g.badges = {};
  if (!g.levels) g.levels = {};
  if (!g.gekocht) g.gekocht = [];
  if (!g.aan) g.aan = {};
  return g;
}
const heeft = id => G().gekocht.includes(id);
function actief(soort){ const id = G().aan[soort]; const w = id && heeft(id) && WINKEL.find(x => x.id === id); return w || STANDAARD[soort]; }
function besteKunstje(){ const k = WINKEL.filter(w => w.soort === 'kunstje' && heeft(w.id)); return k.length ? k[k.length - 1].pose : 'juichen'; }
function opgelost(it){ const s = S.items[it.id]; return !!(s && s.opgelost); }
function levelStand(sec){
  const v = sec.items.filter(i => !i.theorie && (!window.lesActief || window.lesActief(i)));
  const af = v.filter(opgelost).length;
  const pnt = v.reduce((a, i) => a + (opgelost(i) ? puntenVan(S.items[i.id]) : 0), 0);
  const klaar = v.length > 0 && af === v.length;
  const deel = v.length ? pnt / (2 * v.length) : 0;
  const sterren = !klaar ? 0 : deel >= STER3 ? 3 : deel >= STER2 ? 2 : 1;
  const hints = v.some(i => S.items[i.id] && S.items[i.id].hint);
  return {aantal: v.length, af, klaar, sterren, hints};
}
const sterTekst = n => '★'.repeat(n) + '☆'.repeat(3 - n);

/* ---------- opmaak ---------- */
const css = document.createElement('style');
css.textContent = `
.pp{position:fixed;right:max(12px,env(safe-area-inset-right));bottom:calc(72px + env(safe-area-inset-bottom));z-index:40;display:flex;flex-direction:column;align-items:flex-end;gap:8px;pointer-events:none;font-family:var(--font)}
.pp>*{pointer-events:auto}
.pp-bol{position:relative;width:132px;height:132px;border-radius:50%;background:#F6F1E7;border:4px solid var(--pp-rand,#5E0696);padding:0;cursor:pointer;box-shadow:0 6px 18px rgba(42,10,70,.25);overflow:visible}
.pp-bol.regenboog{border-color:transparent;background:linear-gradient(#F6F1E7,#F6F1E7) padding-box,conic-gradient(#E924D5,#F2B90E,#16965A,#45EDFF,#5E0696,#E924D5) border-box}
.pp-lijf{position:absolute;inset:-10px -6px 2px;display:block;transform-origin:50% 100%}
.pp-lijf img{width:100%;height:100%;object-fit:contain;object-position:center bottom;display:block;transform-origin:50% 90%}
.pp-klein .pp-bol{width:64px;height:64px;border-width:3px}
.pp-klein .pp-lijf{inset:-4px -2px 1px}
.pp-wissel{position:absolute;left:-6px;top:-6px;width:26px;height:26px;border-radius:50%;border:2px solid var(--paars);background:#fff;color:var(--paars);font-weight:800;font-size:14px;line-height:1;cursor:pointer;padding:0}
.pp-ballon{max-width:230px;background:#fff;color:var(--tekst);border:3px solid var(--paars);border-radius:16px 16px 4px 16px;padding:9px 12px;font-weight:700;font-size:14px;line-height:1.35;box-shadow:0 6px 18px rgba(42,10,70,.18)}
.pp-ballon.goed{border-color:var(--goed)} .pp-ballon.fout{border-color:var(--fout)} .pp-ballon.hint{border-color:var(--roze)}
.pp-ballon .pp-plus{display:block;color:var(--paars);font-weight:800;margin-top:2px}
.pp-lijf.pop{animation:pp-pop .45s cubic-bezier(.3,1.5,.5,1)}
.pp-lijf.wiebel{animation:pp-wiebel .6s ease}
.pp img[data-pose=blij]{animation:pp-zwaai 2.2s ease-in-out infinite}
.pp img[data-pose=vraag]{animation:pp-toon 2.6s ease-in-out infinite}
.pp img[data-pose=denken]{animation:pp-adem 3.4s ease-in-out infinite}
.pp img[data-pose=verward]{animation:pp-schud 2.8s ease-in-out infinite}
.pp img[data-pose=juichen]{animation:pp-spring .75s cubic-bezier(.3,0,.4,1) infinite}
.pp img[data-pose=strooien]{animation:pp-zweef 2.4s ease-in-out infinite}
.pp img[data-pose=toveren]{animation:pp-zwaai 1.8s ease-in-out infinite}
.pp img[data-pose=knipoog]{animation:pp-toon 1.6s ease-in-out infinite}
@keyframes pp-pop{from{transform:scale(.8) translateY(14px);opacity:.3}to{transform:none;opacity:1}}
@keyframes pp-wiebel{0%,100%{transform:rotate(0)}25%{transform:rotate(-7deg) translateY(-6px)}60%{transform:rotate(6deg)}}
@keyframes pp-zwaai{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(3deg) translateY(-4px)}}
@keyframes pp-toon{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px) rotate(2deg)}}
@keyframes pp-adem{0%,100%{transform:scale(1,1) rotate(-1deg)}50%{transform:scale(1.02,.975) rotate(1.5deg)}}
@keyframes pp-schud{0%,45%,100%{transform:rotate(0)}8%{transform:rotate(-5deg)}16%{transform:rotate(5deg)}24%{transform:rotate(-4deg)}32%{transform:rotate(3deg)}}
@keyframes pp-spring{0%,100%{transform:translateY(0) scale(1.05,.93)}50%{transform:translateY(-16px) scale(1,1) rotate(3deg)}}
@keyframes pp-zweef{0%,100%{transform:translate(0,0) rotate(-2deg)}50%{transform:translate(4px,-8px) rotate(2deg)}}
.pp-ster{position:fixed;z-index:60;pointer-events:none;font-size:22px;color:var(--paars);font-weight:800;animation:pp-ster 1.2s ease-out forwards}
@keyframes pp-ster{from{transform:translate(0,0) scale(.4) rotate(0);opacity:1}to{transform:translate(var(--dx),var(--dy)) scale(1.2) rotate(200deg);opacity:0}}
.pp-hud{background:var(--cyaan)!important;color:var(--paars)!important;font-weight:800!important;white-space:nowrap}
.tab .pp-st{margin-left:6px;letter-spacing:1px;font-size:12px}
.pp-ov{position:fixed;inset:0;z-index:70;background:rgba(42,10,70,.55);display:flex;align-items:center;justify-content:center;padding:16px;font-family:var(--font)}
.pp-doos{background:var(--vlak);color:var(--tekst);border-radius:18px;border-top:6px solid var(--roze);width:min(640px,100%);max-height:calc(100dvh - 32px);overflow:auto;padding:18px 20px 20px;font-size:15px}
.pp-doos h2{margin:0;font-size:20px;font-weight:800;color:var(--paars)}
.pp-kop{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.pp-kop .pp-x{margin-left:auto;border:0;background:var(--paars-licht);color:var(--paars);font-weight:800;border-radius:50%;width:36px;height:36px;font-size:16px;cursor:pointer}
.pp-stand{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}
.pp-stand span{background:var(--paars-licht);border-radius:999px;padding:5px 12px;font-weight:700}
.pp-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
.pp-tabs button{border:2px solid var(--paars);background:var(--vlak);color:var(--paars);font-weight:700;border-radius:999px;padding:6px 14px;cursor:pointer}
.pp-tabs button[aria-selected=true]{background:var(--paars);color:#fff}
.pp-lijst{display:grid;gap:8px}
.pp-rij{display:flex;gap:12px;align-items:center;border:1px solid var(--lijn);border-radius:12px;padding:10px 12px;min-width:0}
.pp-rij .pp-ic{font-size:26px;width:36px;text-align:center;flex:none}
.pp-rij .pp-t{flex:1;min-width:0}
.pp-rij b{display:block}
.pp-rij small{color:var(--zacht);font-size:13px}
.pp-rij.dicht{opacity:.55}
.pp-rij .pp-sterren{font-size:20px;color:var(--roze);letter-spacing:2px;white-space:nowrap}
.pp-rij button{flex:none;border:0;border-radius:10px;padding:8px 12px;font-weight:800;cursor:pointer;background:var(--roze);color:#fff}
.pp-rij button.aan{background:var(--goed)}
.pp-rij button.kies{background:var(--paars)}
.pp-rij button:disabled{background:var(--lijn);color:var(--zacht);cursor:default}
.pp-balk{height:8px;border-radius:4px;background:var(--paars-licht);overflow:hidden;margin-top:6px}
.pp-balk i{display:block;height:100%;background:var(--roze)}
.pp-soort{font-weight:800;color:var(--paars);margin:12px 0 2px;text-transform:uppercase;letter-spacing:.06em;font-size:12px}
.pp-feest{text-align:center}
.pp-feest img{width:220px;max-width:70%;height:auto}
.pp-feest .pp-groot{font-size:44px;color:var(--roze);letter-spacing:6px;line-height:1.1}
.pp-feest .knop{margin-top:12px}
.pp :focus-visible,.pp-ov :focus-visible{outline:3px solid var(--cyaan);outline-offset:2px}
@media (max-width:860px){
  .pp-bol{width:68px;height:68px;border-width:3px}
  .pp-lijf{inset:-5px -3px 1px}
  .pp-ballon{max-width:190px;font-size:13px}
}
@media (min-width:861px){ body.pp-groot #main #feedback,body.pp-groot #main #hintvak{margin-right:150px} }
@media (max-width:860px){ #main .rechts{padding-bottom:110px} }
@media (prefers-reduced-motion:reduce){ .pp img,.pp-lijf.pop,.pp-lijf.wiebel{animation:none!important} .pp-ster{display:none} }
@media print{ .pp,.pp-ov{display:none!important} }
`;
document.head.appendChild(css);

/* ---------- Pi Pluis in beeld ---------- */
const pp = document.createElement('div');
pp.className = 'pp';
pp.innerHTML = `<div class="pp-ballon" id="ppBallon" role="status" aria-live="polite" hidden></div>
<div style="position:relative">
  <button class="pp-bol" id="ppBol" type="button" aria-label="Pi Pluis. Klik voor een oppepper.">
    <span class="pp-lijf" id="ppLijf"><img id="ppImg" data-pose="blij" src="${MAP}blij.webp" alt=""></span>
  </button>
  <button class="pp-wissel" id="ppWissel" type="button"></button>
</div>`;
document.body.appendChild(pp);
const ppImg = pp.querySelector('#ppImg'), ppLijf = pp.querySelector('#ppLijf'), ppBallon = pp.querySelector('#ppBallon'), ppBol = pp.querySelector('#ppBol'), wissel = pp.querySelector('#ppWissel');
['blij', 'vraag', 'denken', 'verward', 'juichen', 'strooien', 'toveren', 'knipoog'].forEach(n => { new Image().src = MAP + n + '.webp'; });

let ballonTimer = null, vastTimer = null;
function zeg(pose, tekst, soort, extra){
  if (ppImg.dataset.pose !== pose){
    ppImg.src = MAP + pose + '.webp'; ppImg.dataset.pose = pose;
    ppLijf.classList.remove('pop', 'wiebel'); void ppLijf.offsetWidth; ppLijf.classList.add('pop');
  }
  if (tekst){
    ppBallon.className = 'pp-ballon' + (soort ? ' ' + soort : '');
    ppBallon.textContent = tekst;
    if (extra){ const e = document.createElement('span'); e.className = 'pp-plus'; e.textContent = extra; ppBallon.appendChild(e); }
    ppBallon.hidden = false;
    clearTimeout(ballonTimer); ballonTimer = setTimeout(() => { ppBallon.hidden = true; }, extra ? 9000 : 7000);
  }
}
function effect(n){
  if (stil()) return;
  const tekens = actief('effect').tekens; const r = ppBol.getBoundingClientRect();
  for (let i = 0; i < n; i++){
    const s = document.createElement('span'); s.className = 'pp-ster'; s.setAttribute('aria-hidden', 'true'); s.textContent = tekens[i % tekens.length];
    s.style.left = (r.left + r.width * (.2 + Math.random() * .6)) + 'px'; s.style.top = (r.top + r.height * (.2 + Math.random() * .4)) + 'px';
    s.style.setProperty('--dx', (Math.random() * 260 - 200) + 'px'); s.style.setProperty('--dy', (-60 - Math.random() * 160) + 'px');
    s.style.animationDelay = (i * 45) + 'ms';
    document.body.appendChild(s); setTimeout(() => s.remove(), 1900);
  }
}
function zetUiterlijk(){
  const g = G(); const k = actief('kader');
  pp.classList.toggle('pp-klein', !!g.klein);
  document.body.classList.toggle('pp-groot', !g.klein);
  ppBol.classList.toggle('regenboog', k.kleur === 'regenboog');
  ppBol.style.setProperty('--pp-rand', k.kleur === 'regenboog' ? 'transparent' : k.kleur);
  wissel.textContent = g.klein ? '+' : '–';
  wissel.setAttribute('aria-label', g.klein ? 'Maak Pi Pluis groter' : 'Maak Pi Pluis kleiner');
}
wissel.onclick = () => { const g = G(); g.klein = !g.klein; bewaar(); zetUiterlijk(); };
ppBol.onclick = () => {
  ppLijf.classList.remove('pop', 'wiebel'); void ppLijf.offsetWidth; ppLijf.classList.add('wiebel');
  const it = ITEMS[S.huidig]; const inToets = S.gestart && !S.klaar && it && it.toets && !S.toetsKlaar;
  ppBallon.className = 'pp-ballon'; ppBallon.textContent = inToets ? 'Succes met de toets!' : kies(ZEG.pepper); ppBallon.hidden = false;
  clearTimeout(ballonTimer); ballonTimer = setTimeout(() => { ppBallon.hidden = true; }, 5000);
  effect(4);
};

/* ---------- badges, munten, levels ---------- */
function geefBadge(id, nieuw){ const g = G(); if (g.badges[id]) return; g.badges[id] = new Date().toISOString(); nieuw.push(BADGES.find(b => b.id === id)); }
function geefMunten(n){ const g = G(); g.munten += n; g.verdiend += n; }

function beloon(it, s){
  const g = G(); if (g.beloond[it.id] != null) return;
  const p = puntenVan(s); const nieuw = [];
  let munten = p === 2 ? MUNTEN.ineens : p === 1 ? MUNTEN.tweede : MUNTEN.daarna;
  let extra = '';
  if (p === 2){ g.reeks++; g.beste = Math.max(g.beste, g.reeks); if (g.reeks % 3 === 0){ munten += MUNTEN.reeksBonus; extra = ` · reeks van ${g.reeks}!`; } }
  else g.reeks = 0;
  g.beloond[it.id] = munten; geefMunten(munten);
  geefBadge('eerste', nieuw);
  if (VRAGEN.filter(v => opgelost(v) && puntenVan(S.items[v.id]) === 2).length >= 5) geefBadge('ineens5', nieuw);
  if (g.reeks >= 3) geefBadge('reeks3', nieuw);
  if (g.reeks >= 5) geefBadge('reeks5', nieuw);
  if (s.pogingen.filter(x => !x.goed).length >= 3) geefBadge('doorzet', nieuw);
  if (VRAGEN.filter(v => opgelost(v) && S.items[v.id].ber).length >= 5) geefBadge('reken', nieuw);
  if (g.verdiend >= 100) geefBadge('spaar', nieuw);

  // level gehaald?
  const sec = LEVELS.find(x => x.id === it.sectie); let feest = null;
  if (sec && g.levels[sec.id] == null){
    const st = levelStand(sec);
    if (st.klaar){
      g.levels[sec.id] = st.sterren; const bonus = st.sterren * MUNTEN.perSter; geefMunten(bonus);
      geefBadge('level', nieuw); if (!st.hints) geefBadge('zonder', nieuw); if (st.sterren === 3) geefBadge('ster3', nieuw);
      if (levelsNu().every(l => g.levels[l.id] != null)) geefBadge('alles', nieuw);
      if (g.verdiend >= 100) geefBadge('spaar', nieuw);
      feest = {sec, sterren: st.sterren, bonus};
    }
  }
  bewaar();
  const pose = p === 2 ? actief('kunstje').pose : 'blij';
  zeg(pose, kies(ZEG['goed' + p]), 'goed', `+${munten} munten${extra}`);
  effect(p === 2 ? 12 : 6);
  toonHud();
  if (feest) setTimeout(() => levelFeest(feest, nieuw), 900);
  else if (nieuw.length) setTimeout(() => badgeMelding(nieuw), 1600);
}
function badgeMelding(nieuw){
  if (!nieuw.length) return;
  const b = nieuw[0];
  zeg(ppImg.dataset.pose, `Nieuwe badge: ${b.icoon} ${b.naam}`, 'hint', nieuw.length > 1 ? `en nog ${nieuw.length - 1} meer` : '');
  effect(6);
}

/* ---------- vensters ---------- */
let ov = null;
function sluit(){ if (ov){ ov.remove(); ov = null; } }
function venster(html){
  sluit();
  ov = document.createElement('div'); ov.className = 'pp-ov';
  ov.innerHTML = `<div class="pp-doos" role="dialog" aria-modal="true" aria-label="Professor Pi Pluis">${html}</div>`;
  ov.addEventListener('click', e => { if (e.target === ov) sluit(); });
  ov.addEventListener('keydown', e => { if (e.key === 'Escape') sluit(); });
  document.body.appendChild(ov);
  return ov.querySelector('.pp-doos');
}
function levelFeest(f, nieuw){
  const nr = levelsNu().indexOf(f.sec) + 1;
  const d = venster(`<div class="pp-feest">
    <img src="${MAP}${besteKunstje()}.webp" alt="">
    <h2>Level ${nr} gehaald!</h2>
    <div class="pp-groot" aria-label="${f.sterren} van 3 sterren">${sterTekst(f.sterren)}</div>
    <p><b>+${f.bonus} munten</b> voor je sterren.${f.sterren < 3 ? '<br>Wil je 3 sterren? Dan moet bijna alles in één keer goed.' : '<br>Meer kan niet. Super!'}</p>
    ${nieuw.length ? `<p>Nieuwe ${nieuw.length === 1 ? 'badge' : 'badges'}: ${nieuw.map(b => `${b.icoon} <b>${esc(b.naam)}</b>`).join(' · ')}</p>` : ''}
    <button class="knop hoofd" id="ppVerder">Verder</button> <button class="knop paars" id="ppWinkel">Naar de winkel</button>
  </div>`);
  d.querySelector('#ppVerder').onclick = sluit;
  d.querySelector('#ppWinkel').onclick = () => paneel('winkel');
  d.querySelector('#ppVerder').focus();
  effect(16); render();
}
let paneelTab = 'levels';
function paneel(tab){
  if (tab) paneelTab = tab;
  const g = G();
  const kop = `<div class="pp-kop"><h2>Professor Pi Pluis</h2><button class="pp-x" id="ppX" aria-label="Sluiten">✕</button></div>
    <div class="pp-stand"><span>🪙 ${g.munten} munten</span><span>🔥 reeks ${g.reeks}</span><span>🏅 ${Object.keys(g.badges).length} van ${BADGES.length} badges</span></div>
    <div class="pp-tabs" role="tablist">${[['levels', 'Levels'], ['badges', 'Badges'], ['winkel', 'Winkel']].map(([id, n]) => `<button role="tab" data-tab="${id}" aria-selected="${paneelTab === id}">${n}</button>`).join('')}</div>`;
  let inhoud = '';
  if (paneelTab === 'levels'){
    inhoud = '<div class="pp-lijst">' + levelsNu().map((sec, k) => { const st = levelStand(sec);
      return `<div class="pp-rij"><div class="pp-ic">${st.klaar ? '🏁' : k + 1}</div><div class="pp-t"><b>Level ${k + 1} · ${esc(sec.titel)}</b><small>${st.af} van ${st.aantal} opdrachten af</small><div class="pp-balk"><i style="width:${st.aantal ? Math.round(100 * st.af / st.aantal) : 0}%"></i></div></div><div class="pp-sterren" aria-label="${st.sterren} van 3 sterren">${sterTekst(st.sterren)}</div></div>`; }).join('')
      + `</div><p style="color:var(--zacht);font-size:13px;margin-bottom:0">Sterren krijg je als een level af is. In één keer goed geeft de meeste sterren en munten.</p>`;
  } else if (paneelTab === 'badges'){
    inhoud = '<div class="pp-lijst">' + BADGES.map(b => { const h = !!g.badges[b.id];
      return `<div class="pp-rij ${h ? '' : 'dicht'}"><div class="pp-ic">${h ? b.icoon : '🔒'}</div><div class="pp-t"><b>${esc(b.naam)}</b><small>${esc(b.tekst)}</small></div>${h ? '<small>gehaald</small>' : ''}</div>`; }).join('') + '</div>';
  } else {
    const soorten = [['kunstje', 'Kunstjes: dit doet Pi Pluis als je het in één keer goed hebt'], ['effect', 'Tovereffecten'], ['kader', 'Kaders']];
    inhoud = soorten.map(([soort, titel]) => {
      const std = STANDAARD[soort]; const aanId = (g.aan[soort] && heeft(g.aan[soort])) ? g.aan[soort] : '';
      const rij = (id, naam, tekst, prijs) => { const mijn = !id || heeft(id); const aan = aanId === id;
        const knop = aan ? '<button class="aan" disabled>In gebruik</button>' : mijn ? `<button class="kies" data-kies="${soort}:${id}">Gebruik</button>` : `<button data-koop="${id}" ${g.munten < prijs ? 'disabled' : ''}>🪙 ${prijs}</button>`;
        return `<div class="pp-rij"><div class="pp-t"><b>${esc(naam)}</b><small>${esc(tekst)}${!mijn && g.munten < prijs ? ` Nog ${prijs - g.munten} munten sparen.` : ''}</small></div>${knop}</div>`; };
      return `<div class="pp-soort">${titel}</div><div class="pp-lijst">${rij('', std.naam, 'Deze heb je al.', 0)}${WINKEL.filter(w => w.soort === soort).map(w => rij(w.id, w.naam, w.tekst, w.prijs)).join('')}</div>`;
    }).join('');
  }
  const d = venster(kop + inhoud);
  d.querySelector('#ppX').onclick = sluit;
  d.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => paneel(b.dataset.tab));
  d.querySelectorAll('[data-koop]').forEach(b => b.onclick = () => {
    const w = WINKEL.find(x => x.id === b.dataset.koop); const g2 = G(); if (!w || heeft(w.id) || g2.munten < w.prijs) return;
    g2.munten -= w.prijs; g2.gekocht.push(w.id); g2.aan[w.soort] = w.id; bewaar();
    zetUiterlijk(); toonHud(); paneel('winkel');
    zeg(w.pose || 'blij', kies(ZEG.gekocht), 'goed'); effect(8);
  });
  d.querySelectorAll('[data-kies]').forEach(b => b.onclick = () => { const [soort, id] = b.dataset.kies.split(':'); G().aan[soort] = id; bewaar(); zetUiterlijk(); paneel('winkel'); effect(4); });
  d.querySelector('#ppX').focus();
}

/* ---------- munten in de kop, sterren op de tabbladen ---------- */
function toonHud(){
  const kop = document.querySelector('#app header .kop-rechts'); if (!kop) return;
  let b = document.getElementById('ppHud');
  if (!b){ b = document.createElement('button'); b.className = 'knop-klein pp-hud'; b.id = 'ppHud'; b.title = 'Jouw munten, levels, badges en de winkel'; b.onclick = () => paneel(); kop.prepend(b); }
  const g = G(); b.textContent = `🪙 ${g.munten}${g.reeks >= 2 ? ' · 🔥 ' + g.reeks : ''}`;
  b.setAttribute('aria-label', `${g.munten} munten. Open levels, badges en winkel.`);
}
function toonTabSterren(){
  document.querySelectorAll('#app .tab[data-sec]').forEach(t => {
    const sec = LEVELS.find(s => s.id === t.dataset.sec); if (!sec || t.querySelector('.pp-st')) return;
    const st = levelStand(sec); if (!st.klaar) return;
    const sp = document.createElement('span'); sp.className = 'pp-st'; sp.textContent = sterTekst(st.sterren); sp.setAttribute('aria-label', `${st.sterren} van 3 sterren`); t.appendChild(sp);
  });
}

/* ---------- aanhaken op de app ---------- */
let laatsteId = null, scherm = '';
function startVast(it){
  clearTimeout(vastTimer);
  vastTimer = setTimeout(() => { if (ITEMS[S.huidig] === it && !opgelost(it) && !it.toets && S.gestart && !S.klaar) zeg('denken', kies(ZEG.vast)); }, 45000);
}
function naRender(){
  zetUiterlijk();
  if (!S.gestart){ if (scherm !== 'start'){ scherm = 'start'; laatsteId = null; zeg('blij', kies(S.naam ? ZEG.terug : ZEG.welkom)); } return; }
  if (S.klaar){ if (scherm !== 'eind'){ scherm = 'eind'; zeg(besteKunstje(), kies(ZEG.einde), 'goed'); effect(10); } return; }
  if (S.toetsScherm){
    if (scherm !== 'toets'){ scherm = 'toets'; const nieuw = []; geefBadge('toets', nieuw); if (nieuw.length) bewaar(); zeg('knipoog', 'De toets is ingeleverd. Goed gedaan!', 'goed', nieuw.length ? `Nieuwe badge: ${nieuw[0].icoon} ${nieuw[0].naam}` : ''); effect(10); }
    return;
  }
  scherm = 'werk';
  toonHud(); toonTabSterren();
  const it = ITEMS[S.huidig]; if (!it || it.id === laatsteId) return;
  laatsteId = it.id;
  if (it.theorie) return;   // de uitleg regelt les.js
  if (it.toets && !S.toetsKlaar) return zeg('blij', kies(ZEG.toets));
  if (opgelost(it)) return zeg('blij', kies(ZEG.al));
  zeg('vraag', kies(ZEG.nieuw)); startVast(it);
}

const _render = render;
render = function(){ const r = _render.apply(this, arguments); try { naRender(); } catch (e) { console.error('Pi Pluis:', e); } return r; };

const _controleer = controleer;
controleer = function(it){
  const s = st(it.id); const was = s.opgelost; const n = s.pogingen.length;
  const r = _controleer.apply(this, arguments);
  try {
    const s2 = st(it.id);
    if (it.toets && !S.toetsKlaar){ if (!was && s2.opgelost) zeg('blij', kies(ZEG.toetsOk)); }
    else if (it.toets){ /* nakijken na de toets: geen munten */ }
    else if (!was && s2.opgelost) beloon(it, s2);
    else if (s2.pogingen.length > n){
      const g = G(); g.reeks = 0; bewaar(); toonHud();
      const fouten = s2.pogingen.filter(x => !x.goed).length;
      if (!document.getElementById('overlay').hidden) zeg('toveren', kies(ZEG.hulp), 'hint');
      else zeg('verward', fouten >= 2 && !s2.hint ? kies(ZEG.fout2) : kies(ZEG.fout), 'fout');
      startVast(it);
    } else if (!was){ const fb = document.getElementById('feedback'); zeg('denken', (fb && fb.innerText.split('\n')[0].trim()) || kies(ZEG.leeg)); }
  } catch (e) { console.error('Pi Pluis:', e); }
  return r;
};

const _toonHint = toonHint;
toonHint = function(it){
  const r = _toonHint.apply(this, arguments);
  try { if (!opgelost(it)){ zeg('denken', kies(ZEG.hint), 'hint'); effect(4); startVast(it); } } catch (e) { console.error('Pi Pluis:', e); }
  return r;
};

/* voor les.js: Pi Pluis laten praten en een badge geven */
window.PiPluis = {zeg, effect, kies,
  badge(id){ const nieuw = []; geefBadge(id, nieuw); if (nieuw.length){ bewaar(); setTimeout(() => badgeMelding(nieuw), 1800); } },
  kunstje: () => actief('kunstje').pose};

naRender();
})();
