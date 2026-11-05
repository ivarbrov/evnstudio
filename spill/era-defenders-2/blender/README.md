# Era Defenders 2 – Blender-modeller

`lag_modeller.py` lager alle modellene med Blender-skript (bpy 5.2), eksporterer `era2-modeller.glb`, og den legges inn som base64 i `../era2-modeller.js`.

Kjøring (Blender som Python-modul):

```
pip install bpy
python3 lag_modeller.py /sti/era2-modeller.glb
python3 -c "import base64;b=base64.b64encode(open('era2-modeller.glb','rb').read()).decode();open('../era2-modeller.js','w').write('window.EVN_ERA2_GLB=\"'+b+'\";\n')"
```

Alle modellene er egne, lavpoly og stiliserte (ingen nedlastede ressurser, ingen lisensbehov). 20 modeller, ca. 5 500 trekanter, 0,4 MB GLB.

| Modell | Brukes til |
|---|---|
| Laserpistol | Robotens våpen (festet til høyre hånd) |
| Isfjell1, Isfjell2 | Isplaneten: hindre og fjell rundt |
| GaaKropp, GaaBein | Gåmaskinen (boss, Isplaneten) |
| Kjempetre, Trehytte | Skogmånen |
| Svevesykkel | Rask fiende på Skogmånen |
| Soyle, Kontrollpult | Kampstasjonen |
| Lavastein, Basaltplattform | Lavaplaneten |
| MonsterKropp, MonsterBein | Robotmonstre (farge settes i spillet) |
| Snotroll, Bille, Trollsopp, Romvesen, Salamander, Golem | Skapninger (materialer som slutter på «Tint» farges i spillet) |
