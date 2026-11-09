# Min Bondegård

Evens gårdsspill. Hay Day er kvalitetsreferanse for spillopplevelsen, men innhold og grafikk er våre egne.

- Plan: `claude/min-bondegard-spillbar-1-10-plan.md` (prosjektfil). Progresjon og tall: `claude/min-bondegard-progresjon.md`.
- Grafisk referanse og tilbakefall: testscene 0.7.4 på grenen `prototype/min-bondegard-testscene` (`prototype/min-bondegard/`). Den er ikke endret.
- Ikke publisert. Publisering krever voksen godkjenning av konkret versjon.

## Filer

| Fil | Innhold |
|---|---|
| `index.html` | Verden fra testscene 0.7.4 (terreng, bygg, dyr, robot, rev), grensesnitt, felles pause, nullstilling og feilkort |
| `data.js` | Alle tall for nivå 1–10: avlinger, dyr, oppskrifter, bygg, XP, lager og priser. Én kilde for spillet, testene og simuleringen |
| `logikk.js` | Spillreglene uten grafikk: plante, høste, mate, produsere, selge, nivå, tid og lagring |
| `spill.js` | Kobler reglene til verden: åkre og bygg som kan flyttes, robotens jobber, handlingskort, lager og markedsbu, opplæring |

## Tester

- `node test/min-bondegard/logikk.test.mjs`: spillreglene, tallene, lagring og tid (B1).
- `node test/min-bondegard/sim.mjs`: simulering på de ekte reglene. Måler tid til nivå 2–4, fastlåsing og venting.
- `node test/kjor.mjs`: felles røyktest (start, pause, versjon, CSP, ingen feil).

## Lagring

`evn-min-bondegard-v1` i `localStorage`, format `{v: 1, seq, sist, nivaa, xp, mynter, lager, akre, dyr, bygg, plasser, oppl, stat}`.
- Alle jobber har en fast slutt-tid. De blir ferdige mens spillet er lukket (B1), og venter til spilleren henter dem.
- Ting som hentes, fjernes fra tilstanden. Derfor kan ingenting hentes to ganger, uansett omlasting.
- Går klokka bakover, blir ingen ventetid lengre enn jobben selv.
- `seq` øker ved hver lagring. Har en annen fane lagret nyere fremgang, tas den i bruk.
- Ødelagt lagring, eller lagring fra en nyere versjon, tas vare på i `evn-min-bondegard-v1-kopi`, og spillet starter en ny gård.
- `?test` i adressen gir egen lagring (`evn-min-bondegard-test`) og viser testmenyen fra testscenen.

## Versjoner

- **0.8.1** (ikke publisert): Roboten finner veien rundt bygg, gjerder og binger og går ikke lenger gjennom gjerdet ved hønsegården (Even 9.11). Den kan gå over åkrene og gårdsveien. Mobil i høykant starter med hele tunet i bildet.
- **0.8.0** (fase 1, ikke publisert):
  - Spillbar kjernesløyfe for nivå 1–3: hvete og mais, høner og egg, fôrkvern, bakeri (kjøpes for 50), silo og låve, markedsbu, mynter, XP og nivåer.
  - Produksjonen fortsetter mens spillet er lukket.
  - Åkre, fôrkvern, bakeri og silo kan flyttes innenfor gården (B3).
  - Opplæring i fem steg med Nysgjerrig.
  - Felles pause (EVN-PAUSE v2) og statistikk (`evn-start`).
  - Kjente begrensninger:
    - Bestillinger og lastebil kommer i 0.9.0.
    - Låven, hønsehuset, beitet og markedsbua kan ikke flyttes ennå.
    - Ytelse på iPhone er ikke målt for spillversjonen.
