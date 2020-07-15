const MAX_ANGLE = 80;

const BOBBLE_DIAMETER = 60;
const BOBBLE_RADIUS = BOBBLE_DIAMETER / 2;
const LINE_HEIGHT = BOBBLE_RADIUS * Math.sqrt(3);

const FULL_HEIGHT = 800;
const FULL_WIDTH = 600;
const HALF_WIDTH = FULL_WIDTH / 2;

const INNER_HEIGHT = FULL_HEIGHT - BOBBLE_DIAMETER;
const INNER_WIDTH = FULL_WIDTH - BOBBLE_DIAMETER;
const HALF_INNER_WIDTH = INNER_WIDTH / 2;

const ANIMATION_SPEED = 12;
const GRAVITY_ACCELERATION = -2;
const KICK_DURATION = 500;