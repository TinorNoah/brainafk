import { DinoCharacterType } from '../config/constants';

// --- Component Props ---
export interface GameCanvasProps {
  isActive: boolean;
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
  selectedCharacter?: DinoCharacterType;
}

export interface GameUIProps {
  onClose: () => void;
  isStarted: boolean;
  isGameOver: boolean;
  isReady: boolean;
  children: React.ReactNode;
}

export interface MainMenuProps {
  onStartGame: () => void;
  highScore: number;
  onCharacterSelect: (character: DinoCharacterType) => void;
  selectedCharacter: DinoCharacterType;
}

// --- Game Engine Types ---
export interface Sprites {
  dinoRun1?: HTMLImageElement;
  dinoRun2?: HTMLImageElement;
  dinoJump?: HTMLImageElement;
  obstacleSmall?: HTMLImageElement;
  obstacleLarge?: HTMLImageElement;
  cloud?: HTMLImageElement;
  // New sprite sheets
  dinoSheetDoux?: HTMLImageElement;
  dinoSheetMort?: HTMLImageElement;
  dinoSheetTard?: HTMLImageElement;
  dinoSheetVita?: HTMLImageElement;
}

export interface DinoState {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;
  isJumping: boolean;
  runFrame: number;
  frameTime: number;
  character: DinoCharacterType;
  crouching: boolean;
}

export interface ObstacleState {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'small' | 'large';
  cactusType?: number; // Index into the cactus sprite sheet
}

export interface CloudState {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

export interface GameState {
  status: 'ready' | 'playing' | 'paused' | 'over';
  dino: DinoState;
  obstacles: ObstacleState[];
  score: number;
  gameSpeed: number;
  groundY: number;
  lastObstacleTime: number;
  gameStartTime: number;
  spritesLoaded: boolean;
  sprites?: Sprites;
}

export interface GameRefs {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
}

export interface GameEngineState {
  status: 'ready' | 'playing' | 'paused' | 'over';
  dino: DinoState;
  obstacles: ObstacleState[];
  clouds: CloudState[];
  score: number;
  gameSpeed: number;
  groundY: number;
  lastObstacleTime: number;
  gameStartTime: number;
  spritesLoaded: boolean;
  gravity: number;
  obstacleInterval: number;
  sprites?: Sprites;
}