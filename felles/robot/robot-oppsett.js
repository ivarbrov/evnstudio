// EVN-roboten – felles oppsett. Én kilde for farge og lys som alle bildene lages med.
// Modell: helt-robot.glb = «RobotExpressive» av Tomás Laulhé (Quaternius), endret av Don McCurdy. CC0 1.0.
// Samme fil som spill/morkeskogen-2/prototype/modeller/helt-robot.glb (Mørkeskogen 2.0). Modellen er uendret.
export const ROBOT = {
  farge: 0xffcc00,          // Evens valg 2.11.2026: B «klassisk robotgul» (som Mørkeskogen 2.0, grafikk/helt.js)
  lys: { eksponering: 1.0, himmel: 1.1, sol: 2.6, fyll: 0.7 },
  web: { sving: 0.45 },     // nettsidebildene: roboten sett litt fra høyre
};
