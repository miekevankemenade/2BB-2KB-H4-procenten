/* =========================================================
   LES-LAAG – uitleg, hulp en berekeningen
   ---------------------------------------------------------
   Dit bestand haakt aan op de app, net als pipluis.js.
   Wat het doet:
   1. Breuken: schrijf [3/4] in een tekst en je krijgt een echte breuk.
      De voorleesfunctie zegt dan "3 vierde".
   2. Uitleg met animatie: een onderdeel met  theorie: true  en  anim: {...}
      wordt een uitleg in stappen. De leerling moet alle stappen bekijken
      en een controlevraag goed hebben. Pas daarna gaan de opdrachten open.
   3. Hulp van Pi Pluis: leest de vraag voor en maakt de getallen dik
      die de leerling nodig heeft (per opdracht in te stellen met  nodig: [...]).
   4. Berekening verplicht: bij een opdracht met één antwoordvak moet de
      leerling eerst de berekening typen. Zonder berekening wordt er niet
      nagekeken (en het telt niet als fout).
   ========================================================= */
(function(){
"use strict";
if (typeof ITEMS === 'undefined' || typeof render !== 'function') return;
const PP = window.PiPluis || {zeg(){}, effect(){}, badge(){}, kies: a => a[0], kunstje: () => 'juichen'};

/* ---------- opmaak ---------- */
const css = document.createElement('style');
css.textContent = `
.breuk{display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;line-height:1.05;font-weight:700;margin:0 2px;font-size:.92em}
.breuk>span:first-child{border-bottom:2px solid currentColor;padding:0 3px 1px}
.breuk>span:last-child{padding:1px 3px 0}
.pp-nodig{background:var(--cyaan);color:var(--paars);border-radius:6px;padding:0 4px;font-weight:800;font-size:1.25em}
.breuk.pp-nodig{padding:2px 5px}
/* strook links bij een opdracht */
.bs{width:min(440px,90%);text-align:center}
.bs-kop{font-weight:800;font-size:15pt;color:var(--paars);border:3px solid var(--paars);border-bottom:0;border-radius:12px 12px 0 0;padding:8px}
.bs-rij{display:flex;border:3px solid var(--paars);border-radius:0 0 12px 12px;overflow:hidden}
.bs-rij span{flex:1;padding:14px 0;font-weight:700;color:var(--zacht);background:var(--paars-licht);border-left:2px dashed var(--paars)}
.bs-rij span:first-child{border-left:0}
.bs-voet{font-size:13px;color:var(--zacht);margin-top:6px}
.bs{position:relative}
.bs-letter{position:absolute;left:-30px;top:8px;font-weight:800;font-size:15pt;color:var(--roze)}
.links:has(.bs + .bs) .bs-kop{font-size:12pt;padding:5px}
.links:has(.bs + .bs) .bs-rij span{padding:8px 0}
/* deelvragen a, b, c op één pagina */
.pp-niv{display:inline-flex;align-items:center;gap:6px;border:2px solid var(--lijn);border-radius:10px;padding:8px 14px;font-weight:700;cursor:pointer;background:#fff}
.pp-niv:has(input:checked){border-color:var(--paars);background:var(--paars-licht);color:var(--paars)}
.pp-route{margin-left:auto;align-self:center;white-space:nowrap;background:var(--cyaan-licht);color:var(--paars);font-weight:800;font-size:13px;border-radius:999px;padding:5px 12px}
.pp-deel{display:flex;gap:10px;align-items:flex-start;margin:18px 0 6px;padding-top:12px;border-top:2px solid var(--lijn)}
.pp-deel .pp-letter{flex:none;width:30px;height:30px;border-radius:50%;background:var(--roze);color:#fff;font-weight:800;display:grid;place-items:center}
.pp-deel .pp-zinnen{flex:1;min-width:0;font-weight:600;color:var(--paars)}
.stappen .stap.formulestap{margin-left:40px}
.stappen .stap.formulestap:has(.inv.goed):not(:has(.inv.fout))::after{content:"✓";color:var(--goed);font-weight:800}
/* animatie */
.an{width:min(520px,94%);display:flex;flex-direction:column;align-items:center;gap:18px;padding:16px 0}
.an-som{font-size:17pt;font-weight:800;color:var(--paars);text-align:center}
.an-som .breuk{font-size:1.15em}
.an-som .breuk span{transition:background .4s,color .4s;border-radius:6px}
.an.s1 .an-som .breuk span:last-child,.an.s3 .an-som .breuk span:first-child{background:var(--cyaan)}
.an.s3 .an-som .breuk span:last-child{background:transparent}
.an-veld{display:flex;justify-content:center;gap:0;transition:gap .9s ease;flex-wrap:wrap}
.an.s1 .an-veld{gap:14px}
.an-grp{position:relative;display:grid;gap:5px;padding:6px;border:3px dashed transparent;border-radius:12px;transition:border-color .6s .5s,background .6s}
.an.s1 .an-grp{border-color:var(--lijn)}
.an.s2 .an-grp:first-child{border-color:var(--paars);border-style:solid}
.an.s3 .an-grp.neem{border-color:var(--roze);border-style:solid;background:var(--roze-licht)}
.an-dot{width:20px;height:20px;border-radius:50%;background:var(--paars);transition:background .5s,transform .5s}
.an.s3 .an-grp.neem .an-dot{background:var(--roze);transform:scale(1.12)}
.an-grp i{position:absolute;left:50%;bottom:-26px;transform:translateX(-50%);font-style:normal;font-weight:800;color:var(--paars);opacity:0;transition:opacity .5s .4s}
.an.s2 .an-grp i{opacity:1}
.an.s3 .an-grp:not(.neem) i{opacity:.35}
.an-regels{display:flex;flex-direction:column;gap:6px;align-items:center;margin-top:18px;min-height:112px}
.an-r{font-size:15pt;font-weight:700;background:var(--paars-licht);color:var(--paars);border-radius:10px;padding:5px 14px;opacity:0;transform:translateY(8px);transition:opacity .5s .6s,transform .5s .6s}
.an.s1 .an-r.r1,.an.s3 .an-r.r2,.an.s4 .an-r.r3{opacity:1;transform:none}
.an-r.r3{background:var(--roze);color:#fff}
/* stukken die pas bij stap 1, 2, 3 of 4 verschijnen */
.an .t1,.an .t2,.an .t3,.an .t4{opacity:0;transition:opacity .5s .4s,transform .5s .4s}
.an.s1 .t1,.an.s2 .t2,.an.s3 .t3,.an.s4 .t4{opacity:1;transform:none}
.an-r.groot{font-size:20pt;background:var(--roze);color:#fff}
/* rooster met hokjes */
.rs-blok{display:flex;flex-direction:column;align-items:center;gap:10px;width:100%}
.rs{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:2px;width:90%;background:var(--lijn);border:2px solid var(--paars);padding:2px}
.rc{background:#fff;transition:background .5s;display:block;min-width:0}
.rs.rond{background:transparent;border:0;gap:5px}
.rs.rond .rc{border-radius:50%;border:2px solid var(--lijn)}
.rc.k-paars{background:#5E0696}.rc.k-roze{background:#E924D5}.rc.k-blauw{background:#2BA7E0}.rc.k-geel{background:#F2B90E}.rc.k-groen{background:#16965A}
.an:not(.s1) .rc.op1,.an:not(.s2) .rc.op2,.an:not(.s3) .rc.op3{background:#fff}
.rs-leg{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;font-size:13px;font-weight:600;color:var(--zacht)}
.rs-leg span{display:inline-flex;align-items:center;gap:5px}
.rs-leg .rc{width:14px;height:14px;border-radius:3px;display:inline-block}
.an .rs{max-width:230px!important}
.an:has(.rs),.an:has(.hb-wrap){gap:10px;padding:6px 0}
.an:has(.rs) .an-regels{margin-top:2px;min-height:0;gap:4px}
.an:has(.rs) .an-r{font-size:13pt;padding:3px 12px}
.an:has(.rs) .an-r.groot{font-size:16pt}
.an:has(.rs) .an-som{font-size:14pt}
.rs-wrap{position:relative;width:min(230px,90%)}
.rs-wrap .rs-blok,.rs-wrap .rs{width:100%}
.rs-over{position:absolute;inset:0;display:flex;pointer-events:none}
.an.s2 .rs-over.t2{transform:none}
.rs-over span{flex:1;border:3px solid var(--roze);margin-left:-3px}
.rs-over span:first-child{margin-left:0}
/* balken voor handige percentages */
.hb-wrap{display:flex;flex-direction:column;gap:12px;width:100%}
.hb{display:grid;grid-template-columns:52px 1fr auto;gap:10px;align-items:center;font-weight:800;color:var(--paars)}
.hb-b{display:flex;height:30px;border:2px solid var(--paars);border-radius:8px;overflow:hidden}
.hb-b i{flex:1;border-left:2px dashed var(--paars);background:var(--paars-licht)}
.hb-b i:first-child{border-left:0}
.hb-b i.aan{background:var(--roze)}
.hb-r{font-size:11pt;white-space:nowrap;min-width:120px}
/* kader: verhoudingstabel */
.vt-rij{display:flex;gap:18px;flex-wrap:wrap;justify-content:center}
.vt-blok{display:flex;flex-direction:column;align-items:center;gap:4px;max-width:100%}
.vt-titel{font-weight:800;color:var(--roze)}
.vt-wrap{overflow-x:auto;max-width:100%}
table.vt{border-collapse:collapse;font-size:13pt;font-variant-numeric:tabular-nums}
table.vt th{font-style:italic;font-weight:600;color:var(--paars);text-align:left;padding:6px 12px 6px 0;white-space:nowrap}
table.vt td{min-width:64px;text-align:center;padding:6px 10px;border-left:2px solid var(--paars);font-weight:700;white-space:nowrap}
table.vt tr:first-child th,table.vt tr:first-child td{border-bottom:2px solid var(--paars)}
table.vt td.leeg{color:var(--zacht);font-weight:500}
.an table.vt .vv{display:none}
.an table.vt .vv{color:var(--roze)}
.an.s1 .vv[data-s="1"],.an.s2 .vv[data-s="2"],.an.s3 .vv[data-s="3"],.an.s4 .vv[data-s="4"]{display:inline}
.an.s1 .vp[data-s="1"],.an.s2 .vp[data-s="2"],.an.s3 .vp[data-s="3"],.an.s4 .vp[data-s="4"]{display:none}
.an .vp{color:var(--zacht);font-weight:500}
.an .st{opacity:0;transition:opacity .5s .3s}
.an.s1 .st[data-s="1"],.an.s2 .st[data-s="2"],.an.s3 .st[data-s="3"],.an.s4 .st[data-s="4"]{opacity:1}
.an-r.vis{display:inline-block}
.kbalk{display:flex;width:min(420px,96%);height:44px;border-radius:10px;overflow:hidden;border:2px solid var(--paars)}
.kb-d{display:grid;place-items:center;color:#fff;font-weight:800;font-size:12px;text-align:center;line-height:1.1;padding:0 4px}
.kb-d.k-paars{background:#5E0696}.kb-d.k-roze{background:#E924D5}
.kb-100{align-self:flex-start;margin-left:calc((100% - min(420px,96%)) / 2);border-top:3px solid var(--paars);font-size:12px;font-weight:800;color:var(--paars);text-align:center;max-width:min(420px,96%)}
.an-stip{display:flex;gap:6px;margin:10px 0}
@media (max-width:520px){ table.vt{font-size:11pt} table.vt td{min-width:40px;padding:5px 6px} table.vt th{padding-right:8px} .an-r{white-space:normal;text-align:center} .an-r.groot{font-size:15pt} .pp-route{font-size:11px;padding:4px 8px} }
.an,.vt-rij,.vt-blok{min-width:0;max-width:100%}
.an-stip span{width:26px;height:8px;border-radius:4px;background:var(--lijn)}
.an-stip span.af{background:var(--roze)}
.an-controle{border:2px solid var(--paars);border-radius:16px;padding:14px 16px;margin-top:14px}
.an-controle .opties{margin-top:8px}
@media (min-width:861px){ body.pp-groot #main #anControle{margin-right:150px} }
@media (prefers-reduced-motion:reduce){ .an *,.an-veld{transition:none!important} }
`;
document.head.appendChild(css);

/* ---------- 1. breuken ---------- */
const NOEMER = {2: 'tweede', 3: 'derde', 4: 'vierde', 5: 'vijfde', 6: 'zesde', 7: 'zevende', 8: 'achtste', 9: 'negende', 10: 'tiende', 12: 'twaalfde', 20: 'twintigste', 25: 'vijfentwintigste', 50: 'vijftigste', 100: 'honderdste'};
const breukWoord = (t, n) => (t === '1' && n === '2') ? 'de helft' : `${t} ${NOEMER[n] || n + 'de'}`;
const _fmt = fmt;
fmt = function(s){
  return _fmt(s).replace(/\[(\d+)\/(\d+)\]/g, (m, t, n) => `<span class="breuk" data-b="${t}/${n}" role="img" aria-label="${breukWoord(t, n)}"><span>${t}</span><span>${n}</span></span>`);
};
function leesTekst(el){
  const k = el.cloneNode(true);
  k.querySelectorAll('.breuk').forEach(b => { const [t, n] = b.dataset.b.split('/'); b.replaceWith(' ' + breukWoord(t, n) + ' '); });
  k.querySelectorAll('input').forEach(i => i.replaceWith(' puntje puntje '));
  return k.textContent.replace(/\s+/g, ' ').trim();
}
const _leesDelen = leesDelen;
leesDelen = function(delen){
  return _leesDelen((delen || []).map(d => (d.el && d.el.querySelector && d.el.querySelector('.breuk'))
    ? {el: d.el, tekst: (d.el.matches('.optie') ? 'Keuze ' + (+d.el.dataset.k + 1) + '. ' : '') + leesTekst(d.el)} : d));
};
const _uitspraak = uitspraak;
uitspraak = function(t){ return _uitspraak(String(t).replace(/(\d)\s*:\s*(\d)/g, '$1 gedeeld door $2')); };

/* ---------- 1b. een natuurlijkere voorleesstem ----------
   De stem komt van het apparaat van de leerling. We kiezen de beste Nederlandse stem
   die er is: eerst de 'natuurlijke' stemmen (Edge), dan Google (Chrome), dan de rest.
   Met de knop Stem kiest de leerling zelf een andere stem. */
const stemScore = x => (/natural|neural/i.test(x.name) ? 8 : 0) + (/premium|enhanced|verbeterd/i.test(x.name) ? 6 : 0) + (/online/i.test(x.name) ? 3 : 0)
  + (/google/i.test(x.name) ? 3 : 0) + (x.localService === false ? 1 : 0) + (/nl-NL/i.test(x.lang) ? 1 : 0);
const nlStemmen = () => SPRAAK ? speechSynthesis.getVoices().filter(x => /^nl/i.test(x.lang)).sort((p, q) => stemScore(q) - stemScore(p)) : [];
kiesStem = function(){
  const v = nlStemmen(); let naam = ''; try { naam = localStorage.getItem('leesStem') || ''; } catch (e) {}
  stem = v.find(x => x.name === naam) || v[0] || null;
  const k = document.getElementById('stemKnop'); if (k) k.hidden = v.length < 2;
};
if (SPRAAK){ kiesStem(); speechSynthesis.onvoiceschanged = kiesStem; }
const _leesKnoppen = leesKnoppen;
leesKnoppen = function(){
  const h = _leesKnoppen.apply(this, arguments); if (!h) return h;
  return h.replace(/<\/div>\s*$/, `<button class="tempo" id="stemKnop" type="button" aria-label="Kies een andere voorleesstem" ${nlStemmen().length < 2 ? 'hidden' : ''}>🗣 Stem</button></div>`);
};
document.addEventListener('click', e => {
  if (!e.target.closest('#stemKnop')) return;
  const v = nlStemmen(); if (v.length < 2) return;
  stem = v[(v.indexOf(stem) + 1) % v.length];
  try { localStorage.setItem('leesStem', stem.name); } catch (err) {}
  const korte = stem.name.replace(/Microsoft|Google|Online|\(Natural\)|- Dutch.*|\(.*?\)/gi, '').trim() || 'Stem';
  leesDelen([{el: null, tekst: `Hoi, ik ben Pi Pluis. Dit is stem ${v.indexOf(stem) + 1} van ${v.length}.`}]);
  PP.zeg('blij', `Stem ${v.indexOf(stem) + 1} van ${v.length}: ${korte}`);
});

/* ---------- 2. uitleg met animatie ---------- */
const TOETS_OP_SLOT = true;   // true: de eindtoets gaat pas open als alle opdrachten af zijn
const uitlegVan = sec => sec.items.find(i => i.theorie && i.anim);
const uitlegKlaar = it => !!(S.items[it.id] && S.items[it.id].uitlegKlaar);

function stappenDeel(a){
  const per = a.totaal / a.noemer, uit = per * a.teller, b = `[${a.teller}/${a.noemer}]`, een = `[1/${a.noemer}]`;
  return [
    {pose: 'vraag',   zinnen: [`Dit zijn ${a.totaal} ${a.ding}.`, `We zoeken ${b} deel van ${a.totaal}.`]},
    {pose: 'denken',  zinnen: ['Kijk naar de noemer.', `De noemer is ${a.noemer}.`, `Verdeel de ${a.ding} in ${a.noemer} gelijke groepen.`, `${a.totaal} : ${a.noemer} = ${per}`]},
    {pose: 'blij',    zinnen: [`In elke groep zitten ${per} ${a.ding}.`, `${een} deel van ${a.totaal} is dus ${per}.`]},
    {pose: 'denken',  zinnen: ['Kijk nu naar de teller.', `De teller is ${a.teller}.`, `Neem ${a.teller} groepen.`, `${per} × ${a.teller} = ${uit}`]},
    {pose: 'juichen', zinnen: [`${b} deel van ${a.totaal} is ${uit}.`, 'Onthoud: eerst delen door de noemer.', 'Daarna keer de teller.']}
  ];
}
function veldDeel(a){
  const per = a.totaal / a.noemer, kol = per <= 4 ? 2 : per <= 9 ? 3 : 4;
  return `<div class="an" id="an">
    <div class="an-som">${fmt(`[${a.teller}/${a.noemer}]`)} deel van ${a.totaal} ${esc(a.ding)}</div>
    <div class="an-veld">${Array.from({length: a.noemer}, (_, g) => `<div class="an-grp ${g < a.teller ? 'neem' : ''}" style="grid-template-columns:repeat(${kol},20px)">${'<span class="an-dot"></span>'.repeat(per)}<i>${per}</i></div>`).join('')}</div>
    <div class="an-regels"><div class="an-r r1">${a.totaal} : ${a.noemer} = ${per}</div><div class="an-r r2">${per} × ${a.teller} = ${per * a.teller}</div><div class="an-r r3">${fmt(`[${a.teller}/${a.noemer}]`)} deel van ${a.totaal} is ${per * a.teller}</div></div>
  </div>`;
}

/* --- § 4.2: procent = per honderd --- */
function stappenProcent(a){ const rest = 100 - a.n; return [
  {pose: 'vraag',  zinnen: ['Dit vierkant heeft 100 hokjes.', 'Tel maar: 10 rijen van 10.']},
  {pose: 'blij',   zinnen: [`Nu kleuren we ${a.n} hokjes ${a.naam}.`, `Dat is ${a.n} van de 100 hokjes.`]},
  {pose: 'denken', zinnen: [`${a.n} van de 100 schrijf je als breuk.`, `[${a.n}/100] deel is ${a.naam}.`]},
  {pose: 'blij',   zinnen: ['Procent betekent: per honderd.', `[${a.n}/100] deel is hetzelfde als ${a.n}%.`, 'Het teken voor procent is %.']},
  {pose: 'juichen', zinnen: ['Alles samen is 100%.', `De rest is wit: 100% − ${a.n}% = ${rest}%.`, 'Onthoud: zoveel hokjes van de 100 is zoveel procent.']}]; }
function veldProcent(a){ return `<div class="an" id="an"><div class="an-som">Hoeveel procent is ${esc(a.naam)}?</div>
  ${rooster(10, 10, [{n: a.n, kleur: a.kleur, op: 1}], {legenda: false})}
  <div class="an-regels"><div class="an-r t1">${a.n} van de 100 hokjes</div><div class="an-r t2">${fmt(`[${a.n}/100]`)} deel</div><div class="an-r t3 groot">${a.n}%</div><div class="an-r t4">wit: 100% − ${a.n}% = ${100 - a.n}%</div></div></div>`; }

/* --- § 4.3: handige percentages --- */
const HANDIG = [[50, 2, 'de helft'], [25, 4, 'een kwart'], [20, 5, 'een vijfde'], [10, 10, 'een tiende']];
const nl = x => String(x).replace('.', ',');
function stappenHandig(a){ return [{pose: 'vraag', zinnen: [`Dit is ${a.totaal} ${a.eenheid}.`, 'Dat is alles: 100%.', 'Met sommige percentages reken je heel makkelijk.']}]
  .concat(HANDIG.map(([p, d, w], k) => ({pose: k === 3 ? 'juichen' : k % 2 ? 'blij' : 'denken', zinnen: [`${p}% is ${w}.`, `Je deelt door ${d}.`, `${p}% van ${a.totaal} ${a.eenheid} is ${a.totaal} : ${d} = ${nl(a.totaal / d)} ${a.eenheid}.`].concat(k === 3 ? ['Onthoud: 50% is delen door 2, 25% door 4, 20% door 5 en 10% door 10.'] : [])}))); }
function veldHandig(a){ return `<div class="an" id="an"><div class="an-som">100% = ${a.totaal} ${esc(a.eenheid)}</div>
  <div class="hb-wrap"><div class="hb"><span class="hb-l">100%</span><div class="hb-b"><i class="aan"></i></div><span class="hb-r">${a.totaal}</span></div>
  ${HANDIG.map(([p, d], k) => `<div class="hb t${k + 1}"><span class="hb-l">${p}%</span><div class="hb-b">${'<i></i>'.repeat(d).replace('<i>', '<i class="aan">')}</div><span class="hb-r">${a.totaal} : ${d} = ${nl(a.totaal / d)}</span></div>`).join('')}</div></div>`; }

/* --- § 4.4: van procent naar breuk en terug --- */
function stappenOmzet(a){ const deler = 100 / a.noemer; return [
  {pose: 'vraag',  zinnen: [`In dit vierkant is ${a.p}% paars.`, `Dat zijn ${a.p} van de 100 hokjes.`]},
  {pose: 'denken', zinnen: ['Een percentage kun je als breuk schrijven.', `${a.p}% = [${a.p}/100] deel.`]},
  {pose: 'blij',   zinnen: ['Die breuk kan kleiner.', `Deel de teller en de noemer door ${deler}.`, `[${a.p}/100] = [1/${a.noemer}]`, `Kijk: het paarse stuk past ${a.noemer} keer in het vierkant.`]},
  {pose: 'denken', zinnen: ['Het kan ook andersom: van breuk naar procent.', 'Maak de noemer 100.', '[3/25] = [12/100]', 'De teller en de noemer doe je allebei keer 4.']},
  {pose: 'juichen', zinnen: ['[12/100] deel is 12%.', 'Onthoud: procent is per honderd.', 'Staat er 100 in de noemer? Dan zie je het percentage meteen.']}]; }
function veldOmzet(a){ return `<div class="an" id="an"><div class="an-som">${a.p}% als breuk</div>
  <div class="rs-wrap">${rooster(10, 10, [{n: a.p, kleur: 'paars'}], {legenda: false})}<div class="rs-over t2">${'<span></span>'.repeat(a.noemer)}</div></div>
  <div class="an-regels"><div class="an-r t1">${a.p}% = ${fmt(`[${a.p}/100]`)}</div><div class="an-r t2">${fmt(`[${a.p}/100]`)} = ${fmt(`[1/${a.noemer}]`)}</div><div class="an-r t3">${fmt('[3/25]')} = ${fmt('[12/100]')}</div><div class="an-r t4 groot">${fmt('[12/100]')} = 12%</div></div></div>`; }

/* --- § 4.5: eerst 1 procent --- */
function stappenEen(a){ const een = a.totaal / 100, uit = een * a.p; return [
  {pose: 'vraag',  zinnen: [`We zoeken ${a.p}% van ${a.totaal} ${a.eenheid}.`, `Het hele vierkant is ${a.totaal} ${a.eenheid}. Dat is 100%.`]},
  {pose: 'denken', zinnen: [`Verdeel ${a.totaal} ${a.eenheid} over de 100 hokjes.`, `${a.totaal} : 100 = ${nl(een)}`]},
  {pose: 'blij',   zinnen: ['Eén hokje is 1%.', `1% is dus ${nl(een)} ${a.eenheid}.`]},
  {pose: 'denken', zinnen: [`We willen ${a.p}%. Dat zijn ${a.p} hokjes.`, `${nl(een)} × ${a.p} = ${nl(uit)}`]},
  {pose: 'juichen', zinnen: [`${a.p}% van ${a.totaal} ${a.eenheid} is ${nl(uit)} ${a.eenheid}.`, 'Onthoud: eerst 1% uitrekenen. Je deelt door 100.', 'Daarna keer het percentage.']}]; }
function veldEen(a){ const een = a.totaal / 100; return `<div class="an" id="an"><div class="an-som">${a.p}% van ${a.totaal} ${esc(a.eenheid)}</div>
  ${rooster(10, 10, [{n: 1, kleur: 'paars', op: 2}, {n: a.p - 1, kleur: 'roze', op: 3}], {legenda: false})}
  <div class="an-regels"><div class="an-r t1">${a.totaal} : 100 = ${nl(een)}</div><div class="an-r t2">1% = ${nl(een)} ${esc(a.eenheid)}</div><div class="an-r t3">${nl(een)} × ${a.p} = ${nl(een * a.p)}</div><div class="an-r t4 groot">${a.p}% = ${nl(een * a.p)} ${esc(a.eenheid)}</div></div></div>`; }

/* --- kader: verhoudingstabel, stap voor stap --- */
const VB = {
  k1: {som: 'Hoeveel procent korting?', tabellen: [{kop: EUR, boven: [[60, 1], [1, 2], [12, 3]], onder: [[100, 1], ['100 : 60', 2], [20, 3]]}],
    regels: [[3, '100 : 60 × 12 = 20'], [4, '20% korting', 1]],
    stappen: [{pose: 'vraag', zinnen: ['Sem koopt een jas van € 60.', 'Hij krijgt € 12 korting.', 'Hoeveel procent korting is dat?']},
      {pose: 'denken', zinnen: ['Maak een verhoudingstabel.', 'De hele prijs zet je boven 100%.', '€ 60 hoort bij 100%.']},
      {pose: 'blij', zinnen: ['Ga eerst naar 1.', 'Boven: 60 : 60 = 1.', 'Wat je boven doet, doe je ook onder: 100 : 60.']},
      {pose: 'denken', zinnen: ['Ga nu naar 12.', 'Boven: 1 × 12 = 12.', 'Onder: 100 : 60 × 12 = 20.']},
      {pose: 'juichen', zinnen: ['Sem krijgt 20% korting.', 'Onthoud: het totaal staat boven 100%.', 'Je rekent: 100 : totaal × aantal.']}]},
  k2: {som: 'Welke klas deed het beter?', tabellen: [
      {titel: 'Klas A', kop: ['aantal leerlingen', 'procenten'], boven: [[24, 0], [1, 2], [18, 2]], onder: [[100, 0], ['100 : 24', 2], [75, 2]]},
      {titel: 'Klas B', kop: ['aantal leerlingen', 'procenten'], boven: [[30, 0], [1, 3], [21, 3]], onder: [[100, 0], ['100 : 30', 3], [70, 3]]}],
    regels: [[2, 'Klas A: 75%'], [3, 'Klas B: 70%'], [4, 'Klas A deed het beter', 1]],
    stappen: [{pose: 'vraag', zinnen: ['In klas A hebben 18 van de 24 leerlingen een voldoende.', 'In klas B hebben 21 van de 30 leerlingen een voldoende.', 'Welke klas deed het naar verhouding beter?']},
      {pose: 'denken', zinnen: ['Klas B heeft meer voldoendes: 21.', 'Maar klas B is ook groter.', 'Daarom reken je allebei om naar procenten.']},
      {pose: 'blij', zinnen: ['Klas A: 100 : 24 × 18 = 75.', 'In klas A heeft 75% een voldoende.']},
      {pose: 'blij', zinnen: ['Klas B: 100 : 30 × 21 = 70.', 'In klas B heeft 70% een voldoende.']},
      {pose: 'juichen', zinnen: ['75% is meer dan 70%.', 'Klas A deed het naar verhouding beter.', 'Onthoud: vergelijk de percentages, niet de aantallen.']}]},
  k3: {som: 'Breuken en korting', tabellen: [{kop: EUR, boven: [[90, 2], ['90 : 100', 3], [63, 4]], onder: [[100, 2], [1, 3], [70, 3]]}],
    balk: [[70, 'je betaalt 70%', 'paars', 3], [30, 'korting 30%', 'roze', 2]],
    regels: [[1, '[3/8] = 3 : 8 = 0,375'], [1, '0,375 × 100 = 37,5%'], [4, 'nieuwe prijs € 63', 1]],
    stappen: [{pose: 'vraag', zinnen: ['Een breuk kun je ook als percentage schrijven.', 'Neem [3/8] deel.']},
      {pose: 'denken', zinnen: ['Deel de teller door de noemer: 3 : 8 = 0,375.', 'Doe dat keer 100: 0,375 × 100 = 37,5.', '[3/8] deel is 37,5%.']},
      {pose: 'vraag', zinnen: ['Nu korting.', 'Een jas kost € 90. Je krijgt 30% korting.', 'De hele prijs is 100%.']},
      {pose: 'denken', zinnen: ['Je betaalt 100% − 30% = 70%.', 'Ga via 1%: 90 : 100.']},
      {pose: 'juichen', zinnen: ['90 : 100 × 70 = 63', 'De nieuwe prijs is € 63.', 'Onthoud: bij korting reken je met wat je nog betaalt.']}]},
  k4: {som: 'Prijs met 21% btw', tabellen: [{kop: EUR, boven: [[70, 2], ['0,70', 2], ['84,70', 3]], onder: [[100, 2], [1, 2], [121, 3]]}],
    balk: [[100, 'zonder btw 100%', 'paars', 0], [21, '+ 21%', 'roze', 1]],
    regels: [[1, '100% + 21% = 121%'], [4, 'met btw € 84,70', 1]],
    stappen: [{pose: 'vraag', zinnen: ['Een kast kost € 70 zonder btw.', 'Er komt 21% btw bij.']},
      {pose: 'denken', zinnen: ['Zonder btw is 100%.', 'Met btw betaal je 100% + 21% = 121%.', 'Dat is meer dan 100%.']},
      {pose: 'blij', zinnen: ['Maak een verhoudingstabel.', '€ 70 hoort bij 100%.', 'Ga naar 1%: 70 : 100 = 0,70.']},
      {pose: 'denken', zinnen: ['Ga nu naar 121%.', '0,70 × 121 = 84,70']},
      {pose: 'juichen', zinnen: ['De kast kost € 84,70 met btw.', 'Onthoud: 21% btw is 121%.', 'En 9% btw is 109%.']}]},
  k5: {som: 'Terug naar 100%', tabellen: [{kop: EUR, boven: [[605, 1], [5, 2], [500, 3]], onder: [[121, 1], [1, 2], [100, 3]]}],
    balk: [[100, 'zonder btw 100%', 'paars', 3], [21, 'btw 21%', 'roze', 1]],
    regels: [[2, '605 : 121 = 5'], [3, '5 × 100 = 500'], [4, 'zonder btw € 500', 1]],
    stappen: [{pose: 'vraag', zinnen: ['Een fiets kost € 605 met 21% btw.', 'Hoeveel kost de fiets zonder btw?']},
      {pose: 'denken', zinnen: ['Met btw is 121%.', '€ 605 hoort dus bij 121%, niet bij 100%.']},
      {pose: 'blij', zinnen: ['Ga via 1%.', '605 : 121 = 5']},
      {pose: 'denken', zinnen: ['Zonder btw is 100%.', '5 × 100 = 500']},
      {pose: 'juichen', zinnen: ['De fiets kost € 500 zonder btw.', 'Onthoud: deel door het percentage met btw.', 'Doe daarna keer 100.']}]}
};
const sw = (st, html, extra) => st ? `<span class="st${extra ? ' ' + extra : ''}" data-s="${st}">${html}</span>` : `<span${extra ? ` class="${extra}"` : ''}>${html}</span>`;
function veldVtab(a){
  const c = VB[a.vb]; const cel = ([v, st]) => `<td>${st ? `<span class="vv" data-s="${st}">${esc(String(v))}</span><span class="vp" data-s="${st}">…</span>` : esc(String(v))}</td>`;
  const tot = c.balk ? c.balk.reduce((t, b) => t + b[0], 0) : 0;
  return `<div class="an" id="an"><div class="an-som">${esc(c.som)}</div>
    ${c.balk ? `<div class="kbalk">${c.balk.map(([w, l, k, st]) => `<div class="kb-d k-${k}${st ? ' st' : ''}" ${st ? `data-s="${st}"` : ''} style="flex:${w}">${esc(l)}</div>`).join('')}</div>${tot > 100 ? '<div class="kb-100" style="width:' + (10000 / tot) + '%">100%</div>' : ''}` : ''}
    <div class="vt-rij">${c.tabellen.map(t => `<div class="vt-blok">${t.titel ? `<div class="vt-titel">${esc(t.titel)}</div>` : ''}<div class="vt-wrap"><table class="vt"><tr><th>${esc(t.kop[0])}</th>${t.boven.map(cel).join('')}</tr><tr><th>${esc(t.kop[1])}</th>${t.onder.map(cel).join('')}</tr></table></div></div>`).join('')}</div>
    <div class="an-regels">${c.regels.map(([st, t, groot]) => sw(st, fmt(t), 'an-r vis' + (groot ? ' groot' : ''))).join('')}</div></div>`;
}
const stappenVtab = a => VB[a.vb].stappen;
window.lesVB = VB;   // voor controle

const SOORTEN = {vtab: {stappen: stappenVtab, veld: veldVtab}, deel: {stappen: stappenDeel, veld: veldDeel}, procent: {stappen: stappenProcent, veld: veldProcent}, handig: {stappen: stappenHandig, veld: veldHandig},
  omzet: {stappen: stappenOmzet, veld: veldOmzet}, eenprocent: {stappen: stappenEen, veld: veldEen}};

const _toonTheorie = toonTheorie;
toonTheorie = function(it){
  if (!it.anim || !SOORTEN[it.anim.soort]) return _toonTheorie.apply(this, arguments);
  const soort = SOORTEN[it.anim.soort], stappen = soort.stappen(it.anim), s = st(it.id);
  let nu = 0, wacht = null;
  if (typeof s.uitlegStap !== 'number') s.uitlegStap = 0;
  const main = $('#main'); main.classList.remove('groot', 'werk');
  main.innerHTML = `<section class="links">${soort.veld(it.anim)}</section>
   <section class="rechts">
     <span class="label-domein">Uitleg van Pi Pluis</span>
     <div class="opdr-nr"><span>${esc(it.titel)}</span></div>
     ${leesKnoppen()}
     <div class="an-stip" id="anStip" aria-hidden="true">${stappen.map(() => '<span></span>').join('')}</div>
     <div class="theorie-tekst" id="anTekst" aria-live="polite"></div>
     <div class="knoppen"><button class="knop licht" id="anTerug">← Terug</button><button class="knop hoofd" id="anVerder">Volgende stap →</button></div>
     <div id="anControle"></div>
     <div class="feedback" id="feedback" role="status" aria-live="polite"></div>
   </section>`;
  const an = $('#an'), tekst = $('#anTekst'), verder = $('#anVerder'), terug = $('#anTerug');
  const zetVolgende = () => { const v = $('#volgende'); if (v){ v.disabled = !uitlegKlaar(it); v.textContent = 'Naar de opdrachten →'; } };
  function toon(k){
    nu = k; stopLezen(); clearTimeout(wacht);
    for (let i = 1; i < stappen.length; i++) an.classList.toggle('s' + i, i <= k);
    tekst.innerHTML = stappen[k].zinnen.map(z => `<span class="zin">${fmtF(z)}</span>`).join('');
    $('#anStip').querySelectorAll('span').forEach((x, i) => x.classList.toggle('af', i <= k));
    terug.disabled = k === 0;
    const laatste = k === stappen.length - 1;
    verder.hidden = laatste;
    const nieuw = k > s.uitlegStap; if (nieuw){ s.uitlegStap = k; bewaar(); }
    // een nieuwe stap eerst even bekijken: de knop gaat pas na 2 seconden aan
    if (!laatste){ verder.disabled = k >= s.uitlegStap && !uitlegKlaar(it); if (verder.disabled) wacht = setTimeout(() => { verder.disabled = false; }, 2000); }
    PP.zeg(stappen[k].pose === 'juichen' ? PP.kunstje() : stappen[k].pose, k === 0 ? 'Kijk goed mee. Ik leg het uit.' : laatste ? 'Dat is de hele truc!' : '');
    if (laatste) toonControle();
  }
  function toonControle(){
    const c = it.controle, vak = $('#anControle');
    if (!c || uitlegKlaar(it)){ if (!uitlegKlaar(it)) klaar(); else vak.innerHTML = '<div class="feedback goed" style="display:block">Je hebt deze uitleg al bekeken. Je mag door naar de opdrachten.</div>'; zetVolgende(); return; }
    vak.innerHTML = `<div class="an-controle"><b>Heb je goed gekeken?</b><div class="blok"><span class="zin">${fmtF(c.vraag)}</span></div>
      <div class="opties">${c.opties.map((o, k) => `<button class="optie" data-k="${k}">${fmtF(o)}</button>`).join('')}</div></div>`;
    vak.querySelectorAll('.optie').forEach(b => b.onclick = () => {
      const fb = $('#feedback');
      if (+b.dataset.k === c.ans){ b.classList.add('goed'); vak.querySelectorAll('.optie').forEach(x => x.disabled = true); fb.className = 'feedback goed'; fb.textContent = 'Goed zo! Nu mag je naar de opdrachten.'; klaar(); }
      else { b.classList.add('fout'); s.uitlegFout = (s.uitlegFout || 0) + 1; bewaar(); fb.className = 'feedback fout'; fb.textContent = 'Nog niet goed. Kijk nog eens naar de stap met de noemer.'; PP.zeg('verward', 'Kijk nog eens naar de uitleg.', 'fout');
        setTimeout(() => { fb.className = 'feedback'; fb.textContent = ''; vak.innerHTML = ''; toon(c.terug || 0); }, 2200); }
    });
  }
  function klaar(){ s.uitlegKlaar = true; bewaar(); zetVolgende(); PP.zeg(PP.kunstje(), 'Goed opgelet! Nu de opdrachten.', 'goed'); PP.effect(10); PP.badge('uitleg'); }
  verder.onclick = () => toon(Math.min(nu + 1, stappen.length - 1));
  terug.onclick = () => { $('#anControle').innerHTML = ''; toon(Math.max(nu - 1, 0)); };
  zetVolgende();
  toon(0);
};

/* ---------- 2b. routes: de app kiest ondersteunend, doorlopend of uitdagend ----------
   Iedereen maakt eerst de instap (de opdrachten zonder route).
   Daarna telt de app de punten van de instap (2 per opdracht in één keer goed):
   - alles in één keer goed            -> uitdagend  ('u')
   - de helft van de punten of minder  -> ondersteunend ('o')
   - anders                            -> doorlopend ('d') */
const ROUTE_NAAM = {o: 'Stap voor stap', d: 'Hoofdroute', u: 'Sterrenroute'};
const routeVan = secId => (S.route || {})[secId] || null;
const heeftRoutes = sec => sec.items.some(i => i.route);
const instapVan = sec => sec.items.filter(i => !i.theorie && !i.toets && !i.route && opNiveau(i));
const isAf = it => !!(S.items[it.id] && S.items[it.id].opgelost);
/* Niveau: basis ('b') of kader ('k'). De leerling kiest bij de start.
   Een opdracht of toetsvraag met  niveau: ['k']  is alleen voor kader, met  niveau: ['b']  alleen voor basis.
   Zonder  niveau  is hij voor allebei. */
const NIVEAU_NAAM = {b: 'Basis', k: 'Kader'};
const niveauVan = () => (S.niveau === 'k' ? 'k' : 'b');
const secVan = it => SECTIES.find(x => x.id === it.sectie) || {};
const opNiveau = it => { const n = it.niveau || secVan(it).niveau; return !n || n.includes(niveauVan()); };
window.lesSecActief = sec => !sec.niveau || sec.niveau.includes(niveauVan());
function actief(it){ return opNiveau(it) && (!it.route || it.route.includes(routeVan(it.sectie) || 'd')); }
const ALLE_TOETS = TOETSVRAGEN.slice();
window.lesActief = actief;
function syncVragen(){ const a = ITEMS.filter(i => !i.theorie && !i.toets && actief(i)); VRAGEN.length = 0; VRAGEN.push(...a);
  const t = ALLE_TOETS.filter(opNiveau); TOETSVRAGEN.length = 0; TOETSVRAGEN.push(...t);
  S.aantalVragen = VRAGEN.length; S.aantalToets = TOETSVRAGEN.length; }   // voor de docentenpagina
function kiesRoute(sec){
  const inst = instapVan(sec), max = inst.length * 2, pnt = inst.reduce((t, i) => t + puntenVan(S.items[i.id]), 0);
  const r = pnt >= max ? 'u' : pnt <= max / 2 ? 'o' : 'd';
  S.route = S.route || {}; S.route[sec.id] = r; S.routePunten = S.routePunten || {}; S.routePunten[sec.id] = pnt + '/' + max;
  bewaar(); syncVragen();
  setTimeout(() => {
    if (r === 'u'){ PP.zeg(PP.kunstje(), 'Wauw, alles in één keer goed! Jij krijgt de sterrenroute. Die is extra moeilijk.', 'goed'); PP.effect(12); }
    else if (r === 'o') PP.zeg('blij', 'Ik help je stap voor stap. Jij krijgt opdrachten met extra hulp.', 'hint');
    else PP.zeg('blij', 'Goed bezig! Je gaat door met de volgende opdrachten.', 'goed');
    toonRoute();
  }, 2800);
}
function toonRoute(){
  const strook = document.getElementById('strook'); if (!strook) return;
  strook.querySelectorAll('.stip[data-i]').forEach(b => { const it = ITEMS[+b.dataset.i]; b.hidden = !!(it && (it.theorie ? !opNiveau(it) : !actief(it))); });
  document.querySelectorAll('#app .tab[data-sec]').forEach(t => { const sec = SECTIES.find(x => x.id === t.dataset.sec); t.hidden = !!(sec && !window.lesSecActief(sec)); });
  const it = ITEMS[S.huidig], r = it && !it.toets && routeVan(it.sectie); let chip = strook.querySelector('.pp-route');
  if (!chip){ chip = document.createElement('span'); chip.className = 'pp-route'; strook.appendChild(chip); }
  chip.textContent = NIVEAU_NAAM[niveauVan()] + (r ? ' · ' + (r === 'u' ? '⭐ ' : '') + ROUTE_NAAM[r] : ''); chip.title = 'Jouw niveau en je route in dit level';
}

// zolang de uitleg niet af is, kun je niet naar de opdrachten van dat level;
// opdrachten van een andere route worden overgeslagen
const _ga = ga;
ga = function(i){
  const richting = i >= S.huidig ? 1 : -1;
  while (ITEMS[i] && (ITEMS[i].theorie ? !opNiveau(ITEMS[i]) : !actief(ITEMS[i]))) i += richting;
  const doel = ITEMS[i]; if (!doel) return;
  const sec = SECTIES.find(x => x.id === doel.sectie), u = sec && uitlegVan(sec);
  if (doel.toets && !S.toetsKlaar && TOETS_OP_SLOT && VRAGEN.some(v => !isAf(v))){
    PP.zeg('denken', 'Maak eerst alle opdrachten af. Daarna mag je de toets maken.', 'hint'); return;
  }
  if (u && doel !== u && !uitlegKlaar(u)){
    PP.zeg('denken', 'Bekijk eerst de hele uitleg.', 'hint');
    if (ITEMS[S.huidig] === u) return;
    return _ga.call(this, ITEMS.indexOf(u));
  }
  if (doel.route && !routeVan(sec.id)){
    const open = instapVan(sec).filter(x => !isAf(x));
    if (open.length){ PP.zeg('denken', `Maak eerst opdracht ${open.map(x => x.nr).join(', ')} af.`, 'hint'); return; }
    kiesRoute(sec); return ga(i);
  }
  return _ga.call(this, i);
};
// ook als iemand met een bewaarde stand midden in een level binnenkomt
const _render = render;
render = function(){
  syncVragen();
  if (S.gestart && !S.klaar && !S.toetsScherm){
    const it = ITEMS[S.huidig], sec = it && SECTIES.find(x => x.id === it.sectie), u = sec && uitlegVan(sec);
    if (it && !opNiveau(it)){ const k = ITEMS.findIndex(x => !x.toets && opNiveau(x)); if (k >= 0) S.huidig = k; }
    else if (u && it !== u && !uitlegKlaar(u)) S.huidig = ITEMS.indexOf(u);
    else if (it && !it.theorie && !it.toets && !actief(it)){ const k = ITEMS.findIndex(x => x.sectie === it.sectie && !x.theorie && actief(x) && !isAf(x)); if (k >= 0) S.huidig = k; }
  }
  const r = _render.apply(this, arguments);
  try { toonRoute(); } catch (e) { console.error('Les:', e); }
  return r;
};

/* ---------- 2c. niveau kiezen op het startscherm ---------- */
const _startScherm = startScherm;
startScherm = function(){
  const r = _startScherm.apply(this, arguments);
  try {
    const klas = document.getElementById('klas'), begin = document.getElementById('begin');
    if (klas && begin && !document.getElementById('niveauKeuze')){
      klas.closest('.antw-rij').insertAdjacentHTML('afterend', `<div class="antw-rij" id="niveauKeuze" role="radiogroup" aria-label="Kies je niveau"><span style="min-width:150px">Je niveau:</span>
        <label class="pp-niv"><input type="radio" name="niveau" value="b"> Basis</label><label class="pp-niv"><input type="radio" name="niveau" value="k"> Kader</label></div>`);
      const oud = begin.onclick;
      begin.onclick = function(e){
        const k = document.querySelector('input[name="niveau"]:checked'), f = document.getElementById('fbStart');
        if (!k){ f.className = 'feedback fout'; f.textContent = 'Kies eerst je niveau: basis of kader.'; return; }
        const r2 = oud.call(this, e);
        if (S.gestart){ S.niveau = k.value; bewaar(); render(); }
        return r2;
      };
    }
    // terugkerende leerling: laat het niveau zien
    const vh = document.getElementById('verderHier');
    if (vh && S.naam) vh.closest('.analyse').insertAdjacentHTML('beforeend', `<p style="margin:8px 0 0">Jouw niveau: <b>${NIVEAU_NAAM[niveauVan()]}</b></p>`);
  } catch (e) { console.error('Les:', e); }
  return r;
};

/* ---------- 3. hulp van Pi Pluis ---------- */
function maakDik(it){
  const rechts = document.querySelector('#main .rechts'); if (!rechts || rechts.dataset.dik) return;
  rechts.dataset.dik = '1';
  const nodig = it.nodig ? new Set(it.nodig.map(String)) : null;
  rechts.querySelectorAll('.blok .breuk').forEach(b => { if (!nodig || nodig.has(b.dataset.b)) b.classList.add('pp-nodig'); });
  rechts.querySelectorAll('.blok .zin').forEach(z => {
    const w = document.createTreeWalker(z, NodeFilter.SHOW_TEXT, {acceptNode: n => n.parentElement.closest('.breuk') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT});
    const nodes = []; while (w.nextNode()) nodes.push(w.currentNode);
    nodes.forEach(n => {
      const delen = n.textContent.split(/(\d+(?:[.,]\d+)?)/); if (delen.length < 2) return;
      const f = document.createDocumentFragment();
      delen.forEach((d, k) => { if (k % 2 && (!nodig || nodig.has(d))){ const b = document.createElement('b'); b.className = 'pp-nodig'; b.textContent = d; f.appendChild(b); } else f.appendChild(document.createTextNode(d)); });
      n.replaceWith(f);
    });
  });
}
const _toonVraag = toonVraag;
toonVraag = function(it){
  const r = _toonVraag.apply(this, arguments);
  try {
    const s = st(it.id);
    if (!it.toets){
      // deelvragen a, b, c boven de juiste regel zetten
      if (it.delen && !document.querySelector('#invoer .pp-deel')){
        const regels = [...document.querySelectorAll('#invoer .stappen > .stap')];
        it.delen.forEach(d => { const r = regels[d.bij]; if (!r) return;
          r.insertAdjacentHTML('beforebegin', `<div class="blok pp-deel"><span class="pp-letter" aria-hidden="true">${esc(d.letter)}</span><div class="pp-zinnen">${zinnen(d.vraag)}</div></div>`); });
      }
      // knop: Hulp van Pi Pluis
      const hk = $('#hintKnop');
      if (hk && !$('#ppHulp')){
        hk.insertAdjacentHTML('afterend', '<button class="knop licht" id="ppHulp" type="button">🧡 Hulp van Pi Pluis</button>');
        $('#ppHulp').onclick = () => {
          maakDik(it); s.hulpPi = (s.hulpPi || 0) + 1; bewaar();
          const lk = $('#leesKnop');
          PP.zeg('vraag', lk ? 'Ik lees de vraag voor. De dikke getallen heb je nodig.' : 'De dikke getallen heb je nodig.', 'hint'); PP.effect(4);
          if (lk && !lk.classList.contains('bezig')) lk.click();
        };
      }
    }
    {
      // berekening verplicht bij één antwoordvak (ook in de toets)
      if (it.type === 'num' && !it.geenBerekening && !$('#ber')){
        const rij = document.querySelector('#invoer .antw-rij');
        if (rij){
          rij.insertAdjacentHTML('beforebegin', `<div class="antw-rij"><label for="ber">Berekening:</label><input class="inv breed" id="ber" autocomplete="off" spellcheck="false" placeholder="${esc(it.toets ? 'typ hier je berekening' : (it.voorbeeld || 'bijvoorbeeld 42 − 28 = 14'))}"></div>`);
          const ber = $('#ber'); ber.value = (s.waarden && s.waarden.ber) || ''; ber.disabled = !!s.opgelost;
          ber.addEventListener('keydown', e => { if (e.key === 'Enter') $('#a0').focus(); });
        }
      }
    }
  } catch (e) { console.error('Les:', e); }
  return r;
};

/* ---------- 4. berekening verplicht ---------- */
const berGoed = t => /\d/.test(t) && /[:÷\/x×*+\-−]/.test(t) && t.replace(/\s/g, '').length >= 3;
const _controleer = controleer;
controleer = function(it){
  const s = st(it.id);
  if (!s.opgelost){
    const ber = $('#ber'), a0 = $('#a0');
    if (ber && a0 && a0.value.trim() !== '' && !berGoed(ber.value)){
      const fb = $('#feedback'); fb.className = 'feedback info';
      fb.innerHTML = `Schrijf eerst je berekening op.<br>Bijvoorbeeld: ${esc(it.toets ? '12 : 4 = 3' : (it.voorbeeld || '42 − 28 = 14'))}<br><span style="font-weight:500">Dit telt niet als fout.</span>`;
      PP.zeg('denken', 'Schrijf eerst je berekening op.', 'hint'); ber.focus(); return;
    }
    if (ber && berGoed(ber.value)) s.ber = ber.value.trim().slice(0, 120);
    else if (it.type === 'stappen' && it.velden.some(v => v.tpl)) s.ber = 'stappen';
  }
  const n = s.pogingen.length;
  const r = _controleer.apply(this, arguments);
  try {
    const s2 = st(it.id);
    if (s2.pogingen.length > n && typeof s2.ber === 'string' && s2.ber !== 'stappen'){
      s2.berekeningen = s2.berekeningen || []; if (!s2.berekeningen.includes(s2.ber)) s2.berekeningen.push(s2.ber);
      bewaar();
    }
    const sec = SECTIES.find(x => x.id === it.sectie);
    if (sec && !sec.toets && heeftRoutes(sec) && !routeVan(sec.id) && instapVan(sec).every(isAf)) kiesRoute(sec);
  } catch (e) { console.error('Les:', e); }
  return r;
};

render();
})();
