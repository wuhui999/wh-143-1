import type { GameSave, LevelConfig } from '../types/game';
import { DEFAULT_LEVELS, STORAGE_KEY } from '../config/levels';

export function saveGame(save: GameSave): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
  } catch (e) {
    console.error('保存游戏失败', e);
  }
}

export function loadGame(): GameSave | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('读取存档失败', e);
  }
  return null;
}

export function createNewSave(): GameSave {
  return {
    currentLevel: 1,
    levels: JSON.parse(JSON.stringify(DEFAULT_LEVELS)),
    totalPlayTime: 0,
    lastPlayTime: Date.now()
  };
}

export function getOrCreateSave(): GameSave {
  const save = loadGame();
  if (save) return save;
  const newSave = createNewSave();
  saveGame(newSave);
  return newSave;
}

export function updateLevelProgress(
  levels: LevelConfig[],
  levelId: number,
  score: number,
  stars: number
): LevelConfig[] {
  return levels.map(level => {
    if (level.id === levelId) {
      return {
        ...level,
        bestScore: Math.max(level.bestScore, score),
        stars: Math.max(level.stars, stars)
      };
    }
    if (level.id === levelId + 1 && score >= 60) {
      return {
        ...level,
        unlocked: true
      };
    }
    return level;
  });
}

export function clearSave(): void {
  localStorage.removeItem(STORAGE_KEY);
}
