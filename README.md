# 2BB/2KB H4 Procenten – oefenen met Professor Pi Pluis

Leergame voor hoofdstuk 4 Procenten, voor 2BB (basis) en 2KB (kader) in één app.

**Voor leerlingen:** https://miekevankemenade.github.io/2BB-2KB-H4-procenten/
**Docentenpagina:** https://miekevankemenade.github.io/2BB-2KB-H4-procenten/docent.html

## Hoe werkt het?

- De leerling kiest bij de start **Basis** of **Kader**.
- Er zijn 5 levels (§ 4.1 t/m 4.5). Elk level begint met een uitleg-animatie van Pi Pluis.
  De leerling moet de uitleg helemaal bekijken en een controlevraag goed hebben.
- Iedereen maakt eerst opdracht 1 t/m 3. Daarna kiest de app de route:
  - alles in één keer goed → uitdagend (U-opdracht)
  - de helft van de punten of minder → ondersteunend (O-opdracht)
  - anders → doorlopend
- Bij elke opdracht: hint, **Hulp van Pi Pluis** (leest voor en maakt de nodige getallen dik), rekenmachine en voorlezen.
- De leerling schrijft altijd de berekening op.
- Spel: munten, reeksen, sterren per level, badges en een winkel voor Pi Pluis.
- Eindtoets: 15 vragen, één poging, geen hints, met een cijfer. Gaat open als alle levels af zijn.

**Punten:** 2 punten in één keer goed, 1 punt bij de 2e poging of na een hint.
**Cijfer eindtoets:** (punten ÷ totaal × 9) + 1.

## Bestanden

| Bestand | Wat is het? |
|---|---|
| `index.html` | De app en alle opdrachten. |
| `les.js` | Uitleg-animaties, routes, niveau basis/kader, hulp van Pi Pluis, berekening verplicht. |
| `pipluis.js` | Pi Pluis, munten, badges, levels en winkel. |
| `pipluis/` | De plaatjes van Pi Pluis. |
| `docent.html` + `docent-extra.js` | Resultaten voor de docent, met niveau, route, uitleg, hints en eindtoets per leerling. |
| `config.js` | Supabase-gegevens en de naam van de app (`MODULE`). |
| `supabase.sql` | Script voor de tabellen (bestaan al in het project). |

## Online zetten

GitHub → **Settings** → **Pages** → *Deploy from a branch* → **main** en **/ (root)**.
