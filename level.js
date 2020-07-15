"use strict"

const bobbleSlot = name => {
  const el = name + "El";
  const field = "_" + name;
  const replace = "replace" + name[0].toUpperCase() + name.slice(1);

  return {
    [el]: {
      value: document.getElementById(name)
    },
    [name]: {
      get() {
        return this[field];
      },
      set(value) {
        if (this[field]) {
          this[field].el.remove();
        }
        if (value) {
          this[el].append(value.el);
        }
        this[field] = value;
      }
    },
    [replace]: {
      value(newValue = null) {
        const value = this[field];
        this[name] = newValue;
        return value;
      }
    }
  };
};

function Launcher(level) {
  this.level = level;
  this.reset();
}
Launcher.prototype.reset = function() {
  this.launcher = new Bobble();
  this.preview = new Bobble();
  this.rotation = 0;
};
Object.defineProperties(Launcher.prototype, {
  ...bobbleSlot("launcher"),
  ...bobbleSlot("preview"),
  rotation: {
    get() {
      return this._rotation;
    },
    set(rotation) {
      requestAnimationFrame(() => {
        rotation = Math.min(Math.max(-MAX_ANGLE, rotation), MAX_ANGLE);
        this.launcherEl.style.transform = `rotate(${rotation}deg)`;
        this._rotation = rotation;
      });
    }
  }
});
Launcher.prototype.rotateLeft = function() {
  this.rotation--;
};
Launcher.prototype.rotateRight = function() {
  this.rotation++;
};
Launcher.prototype.feed = function() {
  this.launcher = this.replacePreview(new Bobble());
};
Launcher.prototype.fire = function() {
  if (!this.launcher) return;

  const bobble = this.replaceLauncher();
  app.append(bobble.el);

  bobble.move(0, 0);
  bobble.animate(bobble.Fire(this.rotation, bobble =>
    !this.level.tryCollision(bobble)));
};

function Level() {
  this.bobbles = [];
  this.launcher = new Launcher(this);

  document.onkeydown = ({key}) => {
    switch (key) {
      case "ArrowLeft":
        this.launcher.rotateLeft();
        break;
      case "ArrowRight":
        this.launcher.rotateRight();
        break;
      case " ":
        this.launcher.fire();
        break;
      default:
        //console.log(key);
    }
  };
}
Level.cellCoords = function(r, c) { // EXERCISE ?
  const x = -HALF_WIDTH + (1 + r%2)*BOBBLE_RADIUS + c*BOBBLE_DIAMETER;
  const y = FULL_HEIGHT - (BOBBLE_DIAMETER + r*LINE_HEIGHT);
  return [x, y];
};
Level.whichCell = function(x, y) { // EXERCISE ?
  const r = Math.round((FULL_HEIGHT-y - BOBBLE_DIAMETER) / LINE_HEIGHT);
  const c = Math.round((HALF_WIDTH+x - (1 + r%2)*BOBBLE_RADIUS) / BOBBLE_DIAMETER);
  return [r, c]
};
Level.prototype.save = function() {
  this._save = this.bobbles.map(row => row.map(b => b ? b.color : undefined));
};
Level.prototype.reset = function() {
  this.bobbles = [];
  this._save && this._save.forEach((row, r) =>
    row.forEach((color, c) =>
      color && this.add(r, c, new Bobble(color))));

  this.launcher.reset();
};
Level.prototype.add = function(r, c, bobble) {
  let row = this.bobbles[r];
  if (!row) {
    this.bobbles[r] = row = [];
  }

  row[c] = bobble;
  bobble.r = r;
  bobble.c = c;

  const [x, y] = Level.cellCoords(r, c);
  bobble.move(x, y);
  app.append(bobble.el);
};
Level.prototype.get = function(r, c) {
  const row = this.bobbles[r];
  if (row) return row[c];
};
Level.prototype.delete = function(r, c) {
  delete this.bobbles[r][c];
};
Level.prototype.count = function() {
  return this.bobbles
    .map(row => row
      .map(cell => !!cell ? 1 : 0)
      .reduce((sum, x) => sum + x, 0))
    .reduce((sum, x) => sum + x, 0);
};
Level.prototype.tryCollision = function(bobble) {
  const [r, c] = Level.whichCell(...bobble.position);
  if (r === 0) { // EXERCISE ?
    this.snap(r, c, bobble);
    return true;
  }

  const neighbours = this.findNeighbours(r, c);
  if (neighbours.some(n => n.collides(bobble))) {
    this.snap(r, c, bobble);
    return true;
  }

  return false;
};
Level.prototype.snap = function(r, c, bobble) {
  this.add(r, c, bobble);

  const colorArea = this.findSameColor(r, c);
  if (colorArea.length >= 3) {
    const popArea = this.findPopArea(colorArea);
    setTimeout(() => {
      this.pop(popArea);

      const count = this.count();
      if (count === 0) {
        this.victory();
      } else {
        this.launcher.feed();
      }
    }, 0);

  } else {
    this.launcher.feed();
  }
};
Level.prototype.victory = function() {
  setTimeout(() => {
    alert("YOU WIN!");
    this.reset();
  }, 550);
};
Level.prototype.pop = function(bobbles) {
  const [cx, cy] = bobbles
    .map(b => b.position)
    .reduce(([cx, cy], [x, y], i) => [
      (x + i*cx) / (i+1) |0,
      (y + i*cy) / (i+1) |0
    ], [0, 0]);

  for (let bobble of bobbles) {
    bobble.animate(bobble.Kick(cx, cy, KICK_DURATION, () => {
      bobble.el.remove();
    }));

    this.delete(bobble.r, bobble.c);
  }
};
Level.prototype.findSameColor = function(r, c) {
  const start = this.get(r, c);
  return this.findBobbles(start, n => n.color === start.color);
};
Level.prototype.findPopArea = function(startingCluster) {
  const removed = new WeakSet(startingCluster);
  const visited = new WeakSet();
  const floating = startingCluster.slice();
  for (let r = 0; r < this.bobbles.length; r++) {
    for (let bobble of this.bobbles[r]) {
      if (!bobble) continue;
      if (visited.has(bobble)) continue;

      const cluster = this.findBobbles(bobble, () => true, visited, removed);
      if (!cluster.length) continue;

      const isFloating = cluster.every(b => b.r > 0);
      if (isFloating) floating.push(...cluster);
    }
  }

  return floating;
};
Level.prototype.findBobbles = function(start, match, visited=new WeakSet(), removed=new Set()) {
  const bobbles = [];

  const search = [start];

  while (search.length) {
    const curr = search.pop();

    if (visited.has(curr)) continue;
    if (removed.has(curr)) continue;

    visited.add(curr);
    bobbles.push(curr);

    for (let n of this.findNeighbours(curr.r, curr.c)) {
      if (!visited.has(n) && match(n)) {
        search.push(n);
      }
    }
  }

  return bobbles;
};
Level.prototype.findNeighbours = function(r, c) { // EXERCISE ?
  const x = r % 2;
  return [
      [r-1, c+x-1], [r-1, c+x],
    [r,  c-1],           [r,  c+1],
      [r+1, c+x-1], [r+1, c+x]
  ]
    .map(([r, c]) => this.get(r, c))
    .filter(n => !!n);
};
