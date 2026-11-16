/* =========================================================
   DOCENT – ALLES ZIEN
   Extra kolommen in "Codes en voortgang" en per leerling een
   knop "Alles": route, uitleg, hulp, berekeningen, munten,
   badges en de eindtoets. Haakt aan op docent.html.
   ========================================================= */
(function(){
"use strict";
if (typeof toonVoortgang !== 'function') return;
const ROUTE = {o: 'Stap voor stap (ondersteunend)', d: 'Hoofdroute (doorlopend)', u: 'Sterrenroute (uitdagend)'};
const ROUTE_KORT = {o: 'Ondersteunend', d: 'Doorlopend', u: 'Uitdagend'};
const BADGE = {eerste: 'Eerste ster', ineens5: 'In één keer', reeks3: 'Reeks van 3', reeks5: 'Reeks van 5', doorzet: 'Doorzetter', uitleg: 'Goed opgelet', reken: 'Nette rekenaar',
  level: 'Level gehaald', zonder: 'Zonder hint', ster3: 'Drie sterren', spaar: 'Spaarder', alles: 'Alles af', toets: 'Toetsklaar'};
const WINKEL = {'k-juichen': 'Juichsprong', 'k-knipoog': 'Knipoog', 'k-strooien': 'Sterrenstrooier', 'k-toveren': 'Toverstaf', 'e-som': 'Plus en min', 'e-confetti': 'Confetti', 'e-pi': 'Pi-regen',
  'r-roze': 'Roze kader', 'r-cyaan': 'Blauw kader', 'r-goud': 'Gouden kader', 'r-regen': 'Regenboogkader'};
const punten = x => { if (!x || !x.opgelost) return 0; if ('toetsGoed' in x) return x.toetsGoed ? 2 : 0; const f = (x.pogingen || []).filter(p => !p.goed).length; return (f === 0 && !x.hint) ? 2 : f <= 1 ? 1 : 0; };
const tijd = ms => { const s = Math.round((ms || 0) / 1000); return s < 60 ? s + ' s' : Math.floor(s / 60) + ' min ' + (s % 60) + ' s'; };

function samenvatting(d){
  const items = Object.entries((d && d.items) || {}).filter(([, x]) => x);
  const uitleg = items.filter(([, x]) => 'uitlegStap' in x || x.uitlegKlaar);
  const opdr = items.filter(([id, x]) => !isToets(id, x) && x.pogingen && x.pogingen.length);
  const toets = items.filter(([id, x]) => isToets(id, x) && x.opgelost);
  const g = d.game || {};
  const tGoed = toets.filter(([, x]) => x.toetsGoed).length, tTot = d.aantalToets || toets.length;
  return {
    routes: Object.entries(d.route || {}).sort().map(([sec, r]) => ({level: sec.replace(/\D/g, ''), r, punten: (d.routePunten || {})[sec] || ''})),
    af: opdr.filter(([, x]) => x.opgelost).length, totaal: d.aantalVragen || null,
    uitlegKlaar: uitleg.filter(([, x]) => x.uitlegKlaar).length, uitlegTot: uitleg.length, uitlegFout: uitleg.reduce((a, [, x]) => a + (x.uitlegFout || 0), 0),
    hints: opdr.reduce((a, [, x]) => a + (x.hint || 0), 0), hulp: opdr.reduce((a, [, x]) => a + (x.hulpPi || 0), 0),
    munten: g.munten || 0, verdiend: g.verdiend || 0, beste: g.beste || 0, badges: Object.keys(g.badges || {}), gekocht: g.gekocht || [], levels: g.levels || {},
    toetsKlaar: !!d.toetsKlaar, tGoed, tTot, cijfer: (d.toetsKlaar && tTot) ? (tGoed * 2 / (tTot * 2) * 9 + 1) : null, opdr, toets, uitleg
  };
}

// extra kolommen in de tabel met leerlingen
const kopRij = document.querySelector('#vRijen').closest('table').querySelector('thead tr');
const laatste = kopRij.lastElementChild;
['Niveau', 'Route', 'Uitleg', 'Hints', 'Hulp Pi Pluis', 'Munten', 'Badges', 'Eindtoets'].forEach(t => { const th = document.createElement('th'); th.textContent = t; kopRij.insertBefore(th, laatste); });

const _toonVoortgang = toonVoortgang;
toonVoortgang = function(){
  const r = _toonVoortgang.apply(this, arguments);
  try {
    document.querySelectorAll('#vRijen tr').forEach(tr => {
      const cb = tr.querySelector('input[data-code]'); if (!cb){ const td = tr.querySelector('td[colspan]'); if (td) td.colSpan = 15; return; }
      const rij = vData.find(x => x.code === cb.dataset.code); if (!rij) return;
      const d0 = rij.data || {}; const s = samenvatting(d0); const eind = tr.lastElementChild;
      if (s.totaal) tr.children[4].textContent = `${s.af} / ${s.totaal}`;
      [d0.niveau === 'k' ? 'Kader' : d0.niveau === 'b' ? 'Basis' : '–', s.routes.length ? s.routes.map(x => `L${x.level} ${ROUTE_KORT[x.r]}`).join(', ') : '–',
       s.uitlegTot ? `${s.uitlegKlaar} van 5 bekeken` + (s.uitlegFout ? ` (${s.uitlegFout}× fout)` : '') : '–',
       s.hints, s.hulp, s.munten, s.badges.length,
       s.cijfer != null ? s.cijfer.toFixed(1).replace('.', ',') : (s.toets.length ? 'bezig' : '–')
      ].forEach(v => { const td = document.createElement('td'); td.textContent = v; tr.insertBefore(td, eind); });
      const knop = document.createElement('button'); knop.className = 'licht'; knop.textContent = 'Alles'; knop.title = 'Bekijk alles van deze leerling';
      knop.onclick = () => toonAlles(rij.code); eind.prepend(knop, ' ');
    });
  } catch (e) { console.error('Docent extra:', e); }
  return r;
};

function toonAlles(code){
  const r = vData.find(x => x.code === code); if (!r) return;
  const d = r.data || {}, s = samenvatting(d);
  const sorteer = a => a.slice().sort((p, q) => (p[1].volg ?? 9999) - (q[1].volg ?? 9999));
  const rijOpdr = ([id, x]) => { const f = x.pogingen.filter(p => !p.goed).length;
    const status = x.opgelost ? (f || x.hint ? `✓ goed na ${f} ${f === 1 ? 'fout' : 'fouten'}${x.hint ? ' en hint' : ''}` : '✓ in één keer goed') : `✗ nog niet goed (${f} ${f === 1 ? 'fout' : 'fouten'})`;
    return `<tr><td><b>${esc(vraagNaam(id, x))}</b><div class="vtekst">${esc(x.vraag || '')}</div></td><td>${status}</td><td>${punten(x)}</td><td>${x.pogingen.length}</td><td>${x.hint || 0}</td><td>${x.hulpPi || 0}</td><td>${tijd(x.tijd)}</td>
      <td style="white-space:normal">${x.pogingen.map((p, i) => `<div>${p.goed ? '✓' : '✗'} ${esc(p.antw || '(niet bewaard)')}${p.cat ? ` <span class="vtekst">– ${esc(p.cat)}</span>` : ''}</div>`).join('')}${(x.berekeningen || []).length ? `<div class="vtekst">Berekening: ${esc(x.berekeningen.join(' · '))}</div>` : ''}</td></tr>`; };
  const rijToets = ([id, x]) => `<tr><td><b>${esc(vraagNaam(id, x))}</b><div class="vtekst">${esc(x.vraag || '')}</div></td><td>${x.toetsGoed ? '✓ goed' : '✗ fout'}</td><td>${x.toetsGoed ? 2 : 0}</td><td>${tijd(x.tijd)}</td><td style="white-space:normal">${esc(((x.pogingen || [])[0] || {}).antw || '')}</td></tr>`;
  $('#foutDetail').hidden = false;
  $('#fdTitel').textContent = `${r.leerling}${r.klas ? ' · ' + r.klas : ''} – alles`;
  $('#fdInhoud').innerHTML = `
    <div class="lln"><b>Niveau</b><br>${d.niveau === 'k' ? 'Kader' : d.niveau === 'b' ? 'Basis' : 'Niet gekozen (oudere voortgang)'}</div>
    <div class="lln"><b>Route</b><br>${s.routes.length ? s.routes.map(x => `Level ${x.level}: ${ROUTE[x.r]}. Punten bij de instap: ${esc(x.punten)}.`).join('<br>') : 'Nog niet gekozen. De leerling is nog met de instap bezig.'}</div>
    <div class="lln"><b>Uitleg</b><br>${s.uitleg.length ? s.uitleg.slice().sort((p, q) => (({u1: 1, ub: 2, uc: 3, ud: 4, ue: 5, ka: 1, kb: 2, kc: 3, kd: 4, ke: 5})[p[0]] || 9) - (({u1: 1, ub: 2, uc: 3, ud: 4, ue: 5, ka: 1, kb: 2, kc: 3, kd: 4, ke: 5})[q[0]] || 9)).map(([id, x]) => `Level ${({u1: 1, ub: 2, uc: 3, ud: 4, ue: 5, ka: 1, kb: 2, kc: 3, kd: 4, ke: 5})[id] || '?'}: ${x.uitlegKlaar ? '✓ helemaal bekeken' : `nog bezig, bij stap ${(x.uitlegStap || 0) + 1}`}${x.uitlegFout ? `, controlevraag ${x.uitlegFout}× fout` : ', controlevraag in één keer goed'}`).join('<br>') : 'Nog niet geopend.'}</div>
    <div class="lln"><b>Opdrachten</b> – ${s.af}${s.totaal ? ' van ' + s.totaal : ''} af, ${s.hints} ${s.hints === 1 ? 'hint' : 'hints'}, ${s.hulp}× hulp van Pi Pluis
      ${s.opdr.length ? `<div class="tw"><table><thead><tr><th>Opdracht</th><th>Resultaat</th><th>Punten</th><th>Pogingen</th><th>Hints</th><th>Hulp</th><th>Tijd</th><th>Wat vulde de leerling in?</th></tr></thead><tbody>${sorteer(s.opdr).map(rijOpdr).join('')}</tbody></table></div>` : '<br>Nog geen opdrachten gemaakt.'}</div>
    <div class="lln"><b>Eindtoets</b> – ${s.cijfer != null ? `cijfer ${s.cijfer.toFixed(1).replace('.', ',')} (${s.tGoed} van ${s.tTot} goed)` : s.toets.length ? `nog niet ingeleverd, ${s.toets.length} vragen gemaakt` : 'nog niet gemaakt'}
      ${s.toetsKlaar && s.toets.length ? `<div class="tw"><table><thead><tr><th>Vraag</th><th>Resultaat</th><th>Punten</th><th>Tijd</th><th>Antwoord en berekening</th></tr></thead><tbody>${sorteer(s.toets).map(rijToets).join('')}</tbody></table></div>` : ''}</div>
    <div class="lln"><b>Spel</b><br>Munten nu: ${s.munten} (in totaal verdiend: ${s.verdiend}). Langste reeks in één keer goed: ${s.beste}.<br>
      Sterren per level: ${Object.values(s.levels).length ? Object.values(s.levels).map((n, k) => `level ${k + 1}: ${'★'.repeat(n)}${'☆'.repeat(3 - n)}`).join(', ') : 'nog geen level af'}.<br>
      Badges (${s.badges.length}): ${s.badges.map(b => esc(BADGE[b] || b)).join(', ') || 'geen'}.<br>
      Gekocht in de winkel: ${s.gekocht.map(w => esc(WINKEL[w] || w)).join(', ') || 'niets'}.</div>
    <p class="vtekst" style="max-width:none">Een getypte berekening wordt niet nagekeken; je ziet hier wat de leerling heeft opgeschreven.</p>`;
  $('#fdInhoud').innerHTML = $('#fdInhoud').innerHTML.replace(/\[(\d+)\/(\d+)\]/g, '$1/$2');   // breuken leesbaar
  $('#foutDetail').scrollIntoView({behavior: 'smooth'});
}
window.toonAlles = toonAlles;
})();
