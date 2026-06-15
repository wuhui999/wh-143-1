import type { LevelConfig } from '../types/game';

export const MIN_TEMP = 50;
export const MAX_TEMP = 350;
export const BASE_TEMP = 80;
export const ADD_WOOD_TEMP = 40;
export const TEMP_DECAY_RATE = 0.8;
export const ADD_WOOD_BONUS_DECAY = 0.3;

export const DEFAULT_OPTIMAL_RANGE: [number, number] = [180, 220];

export const GAME_DURATION = 90;
export const TEMP_SAMPLE_RATE = 100;

export const SCORE_WEIGHTS = {
  sugar: 0.4,
  burnt: 0.3,
  texture: 0.3
};

export const STAR_THRESHOLDS = {
  one: 60,
  two: 75,
  three: 90
};

export const DEFAULT_LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: '初出茅庐',
    targetScore: 60,
    maxAddWood: 5,
    optimalTempRange: [170, 230],
    tempChangeSpeed: 1.0,
    weatherProbability: 0.1,
    unlocked: true,
    bestScore: 0,
    stars: 0
  },
  {
    id: 2,
    name: '小试牛刀',
    targetScore: 68,
    maxAddWood: 4,
    optimalTempRange: [175, 225],
    tempChangeSpeed: 1.1,
    weatherProbability: 0.15,
    unlocked: false,
    bestScore: 0,
    stars: 0
  },
  {
    id: 3,
    name: '渐入佳境',
    targetScore: 72,
    maxAddWood: 4,
    optimalTempRange: [180, 220],
    tempChangeSpeed: 1.2,
    weatherProbability: 0.2,
    unlocked: false,
    bestScore: 0,
    stars: 0
  },
  {
    id: 4,
    name: '炉火纯青',
    targetScore: 78,
    maxAddWood: 3,
    optimalTempRange: [185, 215],
    tempChangeSpeed: 1.3,
    weatherProbability: 0.25,
    unlocked: false,
    bestScore: 0,
    stars: 0
  },
  {
    id: 5,
    name: '登峰造极',
    targetScore: 85,
    maxAddWood: 3,
    optimalTempRange: [190, 210],
    tempChangeSpeed: 1.4,
    weatherProbability: 0.3,
    unlocked: false,
    bestScore: 0,
    stars: 0
  }
];

export const STORAGE_KEY = 'sweet_potato_kiln_save';
