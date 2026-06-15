export interface TempPoint {
  time: number;
  temperature: number;
}

export type WeatherType = 'sunny' | 'wind' | 'rain';

export type SmokeColor = 'white' | 'yellow' | 'black';

export interface Score {
  sugar: number;
  burnt: number;
  texture: number;
  total: number;
}

export interface LevelConfig {
  id: number;
  name: string;
  targetScore: number;
  maxAddWood: number;
  optimalTempRange: [number, number];
  tempChangeSpeed: number;
  weatherProbability: number;
  unlocked: boolean;
  bestScore: number;
  stars: number;
}

export interface GameSave {
  currentLevel: number;
  levels: LevelConfig[];
  totalPlayTime: number;
  lastPlayTime: number;
}

export interface GameState {
  currentLevel: number;
  temperature: number;
  tempHistory: TempPoint[];
  addWoodRemaining: number;
  weather: WeatherType;
  smokeColor: SmokeColor;
  isPlaying: boolean;
  gameTime: number;
  result: Score | null;
  optimalWindowActive: boolean;
  addWoodBonus: number;
  weatherTimer: number;
}
