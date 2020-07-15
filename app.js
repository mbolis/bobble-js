"use strict"

const app = document.getElementById("app");

function createLevel(map) {
  const level = new Level();

  const COLORS = {
    R: "red",
    Y: "gold",
    G: "green",
    B: "blue",
    P: "purple"
  };

  for (let r = 0; r < map.length; r++) {
    const row = map[r];
    for (let c = 0; c < row.length; c++) {
      const color = COLORS[row[c*2]];
      if (!color) continue;
      level.add(r, c, new Bobble(color));
    }
  }

  level.save();
}

createLevel([
  "  B B B     G G G",
   "  B B R R R G G",
  "    B   R R   G",
   "  P P P R Y Y Y",
  "    P P     Y Y",
   "    P       Y"
]);
