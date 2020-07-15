"use strict"

function Bobble(color = Bobble.randomColor()) {
  this.color = color;
  this.position = [0, 0];

  this.el = document.createElement("div");
  this.el.classList.add("bobble", color);
}
Bobble.colors = ["red", "gold", "green", "blue", "purple"];
Bobble.randomColor = function() { // EXERCISE ?
  return Bobble.colors[Math.random() * Bobble.colors.length |0]
};
Bobble.prototype.coords = function() { // EXERCISE ??
  const [x, y] = this.position;
  return [HALF_INNER_WIDTH + x, INNER_HEIGHT - y];
};
Bobble.prototype.move = function(x, y) {
  this.position[0] = x;
  this.position[1] = y;

  const [left, top] = this.coords();
  this.el.style.left = (left |0) + "px";
  this.el.style.top = (top |0) + "px";
};
Bobble.prototype.collides = function({position: [x, y]}) { // EXERCISE
  const [x0, y0] = this.position;
  return (x-x0)**2 + (y-y0)**2 < BOBBLE_DIAMETER**2;
};
Bobble.animations = [];
Bobble.globalAnimation = function() {
  Bobble.animations = Bobble.animations.filter(f => f());

  if (Bobble.animations.length) {
    requestAnimationFrame(Bobble.globalAnimation);
  }
};
Bobble.prototype.animate = function(frame) {
  Bobble.animations.push(frame);
  if (Bobble.animations.length === 1) {
    requestAnimationFrame(Bobble.globalAnimation);
  }
};
Bobble.prototype.Fire = function(direction, check) {
  const angle = direction / 180 * Math.PI; // EXERCISE
  let vx = Math.sin(angle) * ANIMATION_SPEED;
  let vy = Math.cos(angle) * ANIMATION_SPEED;

  let time = Date.now();
  return () => {
    const now = Date.now();
    const delta = (now - time) / 1000;
    time = now;

    const [x0, y0] = this.position;
    let x1 = x0 + vx;
    const y1 = y0 + vy;

    const lDelta = -HALF_INNER_WIDTH - x1; // EXERCISE ?
    if (lDelta > 0) {
      x1 = -HALF_INNER_WIDTH + lDelta;
      vx = -vx;
    } else {
      const rDelta = -HALF_INNER_WIDTH + x1;
      if (rDelta > 0) {
        x1 = HALF_INNER_WIDTH - rDelta;
        vx = -vx;
      }
    }

    this.move(x1, y1);
    return check(this);
  };
};
Bobble.prototype.Kick = function(cx, cy, duration, done) {
  this.el.classList.add("pop");
  let [x, y] = this.position;

  const dx = x - cx, dy = y - cy;
  const dl = Math.sqrt(dx**2 + dy**2);
  let vx = dx/dl * ANIMATION_SPEED;
  let vy = dy/dl * ANIMATION_SPEED;

  let time = Date.now();
  return () => {
    const now = Date.now();
    const delta = now - time;

    if (delta >= duration) {
      done();
      return false;
    }

    const [x0, y0] = this.position;
    const x1 = x0 + vx;
    const y1 = y0 + vy;

    this.move(x1, y1);

    vy += GRAVITY_ACCELERATION;
    return true;
  };
};
