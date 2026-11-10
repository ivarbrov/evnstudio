# Alternativ C – lik sjeldenhetsstige per art (vurdering)

Ingenting her er koblet til spillet. Filene brukes til å vurdere alternativ C før en eventuell prototype bak flagg.

| Fil | Innhold |
|---|---|
| `stige.js` | Bygger alternativ C fra dagens data: 6/5/5/4/3/1/1 per art, alle 1 000 ID-er beholdes, faste figurer (Óðinn, Loki m.fl.) beholdes, rekkefølgen innen hver art bevares. `node stige.js` viser flyttinger. |
| `gardsniva-c.js` | Gårdsnivå 1–10, samme modell som `../gardsniva.js`, med bestillingsgaranti og nivå 10-varianter. **Simulering, ikke spilltest.** `FORDELING=idag|c GARANTI=av|proto|tak K10=hval|valgfri BOOST=0.15 N=300 MIN=960` |
| `res-*.json`, `b0-*.json` | Resultater (N=300, 16 t). `b0-` = bestillingsregn av. |
| `migrering.js` | Forslag til lagringsmigrering (bestefarsregel), for både produksjons- og prototypeformatet. |
| `migrering.test.js` | 20 migreringstester. `node --test migrering.test.js` |
| `okonomi-migrering.js` | Inntekt før/etter migrering for simulerte lagringer (krever `DUMP=lagringer.json` fra `gardsniva-c.js`). |

Merk: `gardsniva-c.js` reserverer bare så mange dyr som kravet trenger. `../gardsniva.js` reserverte alle dyr som passet et krav. Det låste en full base og overvurderte tiden til nivå 9–10 (f.eks. 271 i stedet for ca. 164 min for «Vanlig barn» på nivå 10).
