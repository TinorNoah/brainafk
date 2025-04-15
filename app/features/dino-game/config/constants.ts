// Game physics constants
export const GRAVITY = 1200.0; // Increased for better jump feel
export const JUMP_INITIAL_VELOCITY = -600; // Adjusted for new gravity
export const GROUND_Y_OFFSET = 100; // Increased for more game space

// Game speed settings
export const INITIAL_GAME_SPEED = 400;
export const MAX_GAME_SPEED = 800;
export const GAME_SPEED_INCREMENT = 20;
export const SCORE_INCREMENT_INTERVAL = 100; // Score milestones every 100 points

// Additional speed boosts at milestone scores
export const SPEED_MILESTONE_BOOSTS = [
  { score: 50, boost: 3 },
  { score: 100, boost: 5 },
  { score: 200, boost: 8 },
  { score: 500, boost: 10 }
];

// Animation timings
export const DINO_ANIMATION_FRAME_DURATION = 100; // In milliseconds

// Game entity dimensions
export const DINO_INITIAL_X = 80;
export const DINO_WIDTH = 60;
export const DINO_HEIGHT = 64;

// Dino characters 
export const DINO_CHARACTERS = {
  DOUX: 'doux',
  MORT: 'mort',
  TARD: 'tard',
  VITA: 'vita'
} as const;

export type DinoCharacterType = (typeof DINO_CHARACTERS)[keyof typeof DINO_CHARACTERS];

// Dino sprite sheet properties (for sheet-based animations)
export const DINO_SPRITE_SHEET = {
  WIDTH: 24,   // Width of single frame in sprite sheet
  HEIGHT: 24,  // Height of single frame
  RUN_FRAMES: [4, 5], // Frame indices for running animation
  JUMP_FRAME: 3,      // Frame index for jump animation
  CROUCH_FRAMES: [6, 7], // Frame indices for crouching animation
  TOTAL_FRAMES: 24    // Total frames in the sprite sheet
};

// Cactus sprite sheet properties
export const CACTUS_SPRITE_SHEET = {
  WIDTH: 96,   // Width of single cactus frame in sprite sheet (576px total width / 6 frames = 96px per frame)
  HEIGHT: 128,  // Height of single cactus frame from the actual image
  TOTAL_FRAMES: 6,    // Total different cactus types in sheet
  TYPES: {
    SMALL_SINGLE: 0,  // Small single cactus
    SMALL_DOUBLE: 1,  // Two small cacti together
    SMALL_TRIPLE: 2,  // Three small cacti together
    LARGE_SINGLE: 3,  // Large single cactus
    LARGE_DOUBLE: 4,  // Two large cacti together
    MIXED: 5,         // Mix of large and small cacti
  }
};

// Collision detection adjustments
export const DINO_HITBOX_INSET_X = 10;
export const DINO_HITBOX_INSET_WIDTH = 20;
export const OBSTACLE_HITBOX_INSET_X = 5;
export const OBSTACLE_HITBOX_INSET_WIDTH = 10;

// Cloud generation settings
export const CLOUD_LIMIT = 5;
export const CLOUD_SPAWN_CHANCE = 0.05; // Increased from 0.03

// Obstacle generation settings
export const MIN_OBSTACLE_INTERVAL = 800; // Minimum time between obstacles
export const MAX_OBSTACLE_INTERVAL = 2000; // Maximum time between obstacles
export const OBSTACLE_SPEED_FACTOR = 1.5;
export const OBSTACLE_PATTERN_CHANCE = 0.3; // Chance to generate a pattern instead of single obstacle

// Obstacle types
export const OBSTACLE_TYPES = {
  SMALL_CACTUS: 'small-cactus',
  LARGE_CACTUS: 'large-cactus',
  CACTUS_GROUP: 'cactus-group',
} as const; // Added 'as const'

// Obstacle patterns (arrays of obstacle configurations to create interesting sequences)
export const OBSTACLE_PATTERNS = [
  // Pattern 1: Three small cacti in a row
  [
    { type: OBSTACLE_TYPES.SMALL_CACTUS, offsetX: 0, scale: 0.8 },
    { type: OBSTACLE_TYPES.SMALL_CACTUS, offsetX: 50, scale: 0.8 },
    { type: OBSTACLE_TYPES.SMALL_CACTUS, offsetX: 100, scale: 0.8 }
  ],
  // Pattern 2: Small and large cactus combination
  [
    { type: OBSTACLE_TYPES.SMALL_CACTUS, offsetX: 0, scale: 0.7 },
    { type: OBSTACLE_TYPES.LARGE_CACTUS, offsetX: 80, scale: 1 }
  ],
  // Pattern 3: Large cactus followed by two small ones
  [
    { type: OBSTACLE_TYPES.LARGE_CACTUS, offsetX: 0, scale: 1 },
    { type: OBSTACLE_TYPES.SMALL_CACTUS, offsetX: 100, scale: 0.6 },
    { type: OBSTACLE_TYPES.SMALL_CACTUS, offsetX: 140, scale: 0.7 }
  ]
];

// Sprite paths
export const SPRITE_PATHS = {
  // Original sprites
  dinoRun1: '/game/sprites/dinoRun1.png',
  dinoRun2: '/game/sprites/dinoRun2.png',
  dinoJump: '/game/sprites/dinoJump.png',
  obstacleSmall: '/game/sprites/obstacleSmall.png', 
  obstacleLarge: '/game/sprites/obstacleLarge.png',
  cloud: '/game/sprites/cloud.png',
  
  // New character sprite sheets
  dinoSheetDoux: '/game/sprites/dino-characters/DinoSprites - doux.png',
  dinoSheetMort: '/game/sprites/dino-characters/DinoSprites - mort.png', 
  dinoSheetTard: '/game/sprites/dino-characters/DinoSprites - tard.png',
  dinoSheetVita: '/game/sprites/dino-characters/DinoSprites - vita.png',
  
  // Cactus sprite sheet
  cactusSheet: '/game/sprites/Cactus_Sprite_Sheet.png'
};

// Sound paths
export const SOUND_PATHS = {
  jump: '/game/sounds/jump.wav',
  die: '/game/sounds/die.wav',
  milestone: '/game/sounds/point.wav',
};