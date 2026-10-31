# EVN Studio – endringslogg

Brukes til å sammenligne GoatCounter-tallene før og etter endringer. Nyeste øverst.
Tidspunkt er når endringen ble publisert på evnstudio.no (norsk tid). Tallene i GoatCounter
er små – se på retning over flere uker, ikke på enkeltdager.

| Dato | Hva | Spill | Kan påvirke |
|---|---|---|---|
| 2026-10-31 (SIKKERHETSTID) | **Sikkerhet fase 2–3.** three.js r128 og skrifter (Rubik, Nunito, Lilita One) ligger nå på evnstudio.no i stedet for cdnjs og Google Fonts. Innholdspolicy (CSP) og referrer-policy på alle sider. Nye sider: /sikkerhet/, /personvern/ og /.well-known/security.txt, med lenker i bunnteksten. Spillmekanikk, lagring og statistikk er uendret. | Alle | Ingen forventet effekt. Ellers kan det tyde på at CSP blokkerer statistikken. |
| 2026-10-31 ca. 16:40 | Fossil Zoo v0.4 → v0.6 fra Fossil-samtalen: tre tidsepoker med egne verdener, 13 dyr, «Tau opp», tidsepoke-velger. Gammel lagring flyttes over automatisk (funnede bein og vekkede dyr beholdes, gravingen starter på nytt). Avslutt spør først. Commit e60f13e. | Fossil Zoo | Spillstarter, spilletid |
| 2026-10-31 ca. 16:30 | **Runde 1 – Kom i gang.** Ny forside: alle spill synlige tidligere, nye navn (Era Defenders, Mørkeskogen, Fossil Zoo), slagordet «Laget av barn. For barn.», ny Om-tekst. Nye startskjermer med mål og styring for PC eller mobil. Avslutt spør først. Commits 8a9987e, f6bcef5, 81b9262. | Alle | Spillstarter, besøk på spillsidene |
| 2026-10-31 ca. 16:30 | Mørkeskogen oppdatert fra 5.2 til 5.5: 5.3–5.4 fra Mørkeskogen-samtalen (musestyring, kart med tåke, lagret fremgang i Beinslottet) + runde 1 (kort startkort, utviklerpanel av, våpenlinja passer mobil). Commits 34f38e9, ae482fe. | Mørkeskogen | Spillstarter, spilletid |
| 2026-10-31 | Eventyrspillet v0.17: sju tidsepoker | Era Defenders | Spilletid |
| 2026-10-31 | Fossil Zoo (da «Fossilspillet») v0.3 og v0.4 publisert | Fossil Zoo | Besøk, spillstarter |
| 2026-10-31 | GoatCounter tatt i bruk (start av måling) | Alle | – |

Forrige fungerende versjon før runde 1 ligger i grenen `backup-for-runde1`.
