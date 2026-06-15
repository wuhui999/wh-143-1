import { create } from 'zustand';
import type { GameState, Score, WeatherType, TempPoint, GameSave, EndlessChallengeState, LevelConfig } from '../types/game';
import { DEFAULT_LEVELS, ADD_WOOD_TEMP, ADD_WOOD_BONUS_DECAY, GAME_DURATION, ENDLESS_CHALLENGE } from '../config/levels';
import { calculateTemperature, getSmokeColor, isInOptimalWindow } from '../utils/temperature';
import { calculateScore, getStars } from '../utils/scoring';
import { getOrCreateSave, saveGame, updateLevelProgress, saveEndlessRecord, getEndlessHighestStreak, createNewSave } from '../utils/storage';

export const FLIP_KILN_TEMP_BOOST = 15;
export const FLIP_KILN_DURATION = 5;
export const WEATHER_WARNING_DURATION = 3;
export const MAX_FLIP_KILN = 1;

interface GameStore extends GameState {
  gameSave: GameSave;
  endlessChallenge: EndlessChallengeState;
  endlessResult: { streak: number; totalScore: number; highestStreak: number } | null;
  startGame: (levelId: number) => void;
  addWood: () => void;
  flipKiln: () => void;
  harvest: () => void;
  updateTick: () => void;
  setWeather: (weather: WeatherType) => void;
  resetGame: () => void;
  clearResult: () => void;
  updateSaveAfterResult: () => void;
  getCurrentLevel: () => LevelConfig;
  resetSave: () => void;
  startEndlessChallenge: () => void;
  endEndlessChallenge: () => void;
  advanceEndlessLevel: () => boolean;
  getEndlessHighestStreak: () => number;
  clearEndlessResult: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  currentLevel: 1,
  temperature: 80,
  tempHistory: [],
  addWoodRemaining: 5,
  weather: 'sunny',
  smokeColor: 'white',
  isPlaying: false,
  gameTime: 0,
  result: null,
  optimalWindowActive: false,
  addWoodBonus: 0,
  weatherTimer: 0,
  flipKilnRemaining: MAX_FLIP_KILN,
  flipKilnActive: false,
  flipKilnTimer: 0,
  weatherWarning: null,
  weatherWarningTimer: 0,
  statsAddWoodUsed: 0,
  statsFlipKilnUsed: 0,
  statsWarningActions: 0,
  gameSave: getOrCreateSave(),
  endlessChallenge: {
    isActive: false,
    currentStreak: 0,
    totalScore: 0,
    currentOptimalRange: [...ENDLESS_CHALLENGE.INITIAL_OPT_RANGE] as [number, number],
    currentMaxAddWood: ENDLESS_CHALLENGE.INITIAL_MAX_WOOD,
    currentTargetScore: ENDLESS_CHALLENGE.BASE_TARGET_SCORE
  },
  endlessResult: null,

  getCurrentLevel: () => {
    const state = get();
    if (state.endlessChallenge.isActive) {
      return {
        id: state.endlessChallenge.currentStreak + 1,
        name: `连烤第 ${state.endlessChallenge.currentStreak + 1} 关`,
        targetScore: state.endlessChallenge.currentTargetScore,
        maxAddWood: state.endlessChallenge.currentMaxAddWood,
        optimalTempRange: state.endlessChallenge.currentOptimalRange,
        tempChangeSpeed: Math.min(1.0 + state.endlessChallenge.currentStreak * 0.05, 1.5),
        weatherProbability: Math.min(0.1 + state.endlessChallenge.currentStreak * 0.02, 0.3),
        unlocked: true,
        bestScore: 0,
        stars: 0
      };
    }
    const level = state.gameSave.levels.find(l => l.id === state.currentLevel);
    return level || DEFAULT_LEVELS[0];
  },

  startGame: (levelId: number) => {
    const level = get().gameSave.levels.find(l => l.id === levelId) || DEFAULT_LEVELS[0];
    set({
      currentLevel: levelId,
      temperature: 80,
      tempHistory: [{ time: 0, temperature: 80 }],
      addWoodRemaining: level.maxAddWood,
      weather: 'sunny',
      smokeColor: 'white',
      isPlaying: true,
      gameTime: 0,
      result: null,
      optimalWindowActive: false,
      addWoodBonus: 0,
      weatherTimer: 0,
      flipKilnRemaining: MAX_FLIP_KILN,
      flipKilnActive: false,
      flipKilnTimer: 0,
      weatherWarning: null,
      weatherWarningTimer: 0,
      statsAddWoodUsed: 0,
      statsFlipKilnUsed: 0,
      statsWarningActions: 0,
      endlessChallenge: {
        isActive: false,
        currentStreak: 0,
        totalScore: 0,
        currentOptimalRange: [...ENDLESS_CHALLENGE.INITIAL_OPT_RANGE] as [number, number],
        currentMaxAddWood: ENDLESS_CHALLENGE.INITIAL_MAX_WOOD,
        currentTargetScore: ENDLESS_CHALLENGE.BASE_TARGET_SCORE
      },
      endlessResult: null
    });
  },

  addWood: () => {
    const state = get();
    if (state.addWoodRemaining <= 0 || !state.isPlaying) return;

    const inWarning = state.weatherWarning !== null;

    set({
      addWoodRemaining: state.addWoodRemaining - 1,
      addWoodBonus: state.addWoodBonus + ADD_WOOD_TEMP,
      temperature: Math.min(350, state.temperature + ADD_WOOD_TEMP * 0.5),
      statsAddWoodUsed: state.statsAddWoodUsed + 1,
      statsWarningActions: inWarning ? state.statsWarningActions + 1 : state.statsWarningActions
    });
  },

  flipKiln: () => {
    const state = get();
    if (state.flipKilnRemaining <= 0 || !state.isPlaying) return;

    const inWarning = state.weatherWarning !== null;

    set({
      flipKilnRemaining: state.flipKilnRemaining - 1,
      flipKilnActive: true,
      flipKilnTimer: FLIP_KILN_DURATION,
      temperature: Math.min(350, state.temperature + FLIP_KILN_TEMP_BOOST),
      statsFlipKilnUsed: state.statsFlipKilnUsed + 1,
      statsWarningActions: inWarning ? state.statsWarningActions + 1 : state.statsWarningActions
    });
  },

  harvest: () => {
    const state = get();
    if (!state.isPlaying) return;

    const level = state.getCurrentLevel();
    const score = calculateScore(state.temperature, level.optimalTempRange);

    set({
      isPlaying: false,
      result: score
    });
  },

  updateTick: () => {
    const state = get();
    if (!state.isPlaying) return;

    const level = state.getCurrentLevel();
    const newTime = state.gameTime + 0.1;
    const newAddWoodBonus = Math.max(0, state.addWoodBonus - ADD_WOOD_BONUS_DECAY);

    let newFlipKilnActive = state.flipKilnActive;
    let newFlipKilnTimer = Math.max(0, state.flipKilnTimer - 0.1);
    if (newFlipKilnTimer <= 0) {
      newFlipKilnActive = false;
      newFlipKilnTimer = 0;
    }

    let baseTemp = calculateTemperature(
      newTime,
      state.weather,
      newAddWoodBonus,
      level.tempChangeSpeed
    );

    if (newFlipKilnActive && baseTemp < state.temperature) {
      const diff = state.temperature - baseTemp;
      baseTemp = state.temperature - diff * 0.5;
    }

    const newTemp = Math.max(50, Math.min(350, baseTemp));

    const newSmokeColor = getSmokeColor(newTemp, level.optimalTempRange);
    const inOptimal = isInOptimalWindow(newTemp, level.optimalTempRange);

    const newHistory = [...state.tempHistory, { time: newTime, temperature: newTemp }];
    if (newHistory.length > 200) {
      newHistory.shift();
    }

    let newWeather = state.weather;
    let newWeatherTimer = state.weatherTimer + 0.1;
    let newWeatherWarning = state.weatherWarning;
    let newWeatherWarningTimer = Math.max(0, state.weatherWarningTimer - 0.1);

    if (state.weatherWarning && newWeatherWarningTimer <= 0) {
      newWeather = state.weatherWarning;
      newWeatherWarning = null;
      newWeatherTimer = 0;
    } else if (!state.weatherWarning && newWeatherTimer > 5 && state.weather === 'sunny') {
      if (Math.random() < level.weatherProbability * 0.1) {
        const upcomingWeather: WeatherType = Math.random() < 0.5 ? 'wind' : 'rain';
        newWeatherWarning = upcomingWeather;
        newWeatherWarningTimer = WEATHER_WARNING_DURATION;
        newWeatherTimer = 0;
      }
    }

    if (!state.weatherWarning && newWeatherTimer > 8 && state.weather !== 'sunny') {
      newWeather = 'sunny';
      newWeatherTimer = 0;
    }

    if (newTime >= GAME_DURATION) {
      const score = calculateScore(newTemp, level.optimalTempRange);
      set({
        gameTime: GAME_DURATION,
        temperature: newTemp,
        tempHistory: newHistory,
        smokeColor: newSmokeColor,
        optimalWindowActive: inOptimal,
        addWoodBonus: newAddWoodBonus,
        weather: newWeather,
        weatherTimer: newWeatherTimer,
        flipKilnActive: newFlipKilnActive,
        flipKilnTimer: newFlipKilnTimer,
        weatherWarning: newWeatherWarning,
        weatherWarningTimer: newWeatherWarningTimer,
        isPlaying: false,
        result: score
      });
      return;
    }

    set({
      gameTime: newTime,
      temperature: newTemp,
      tempHistory: newHistory,
      smokeColor: newSmokeColor,
      optimalWindowActive: inOptimal,
      addWoodBonus: newAddWoodBonus,
      weather: newWeather,
      weatherTimer: newWeatherTimer,
      flipKilnActive: newFlipKilnActive,
      flipKilnTimer: newFlipKilnTimer,
      weatherWarning: newWeatherWarning,
      weatherWarningTimer: newWeatherWarningTimer
    });
  },

  setWeather: (weather: WeatherType) => {
    set({ weather, weatherTimer: 0, weatherWarning: null, weatherWarningTimer: 0 });
  },

  resetGame: () => {
    set({
      temperature: 80,
      tempHistory: [],
      addWoodRemaining: 5,
      weather: 'sunny',
      smokeColor: 'white',
      isPlaying: false,
      gameTime: 0,
      result: null,
      optimalWindowActive: false,
      addWoodBonus: 0,
      weatherTimer: 0,
      flipKilnRemaining: MAX_FLIP_KILN,
      flipKilnActive: false,
      flipKilnTimer: 0,
      weatherWarning: null,
      weatherWarningTimer: 0,
      statsAddWoodUsed: 0,
      statsFlipKilnUsed: 0,
      statsWarningActions: 0
    });
  },

  clearResult: () => {
    set({ result: null });
  },

  updateSaveAfterResult: () => {
    const state = get();
    if (!state.result) return;

    const level = state.getCurrentLevel();
    const stars = getStars(state.result.total);
    const newLevels = updateLevelProgress(state.gameSave.levels, state.currentLevel, state.result.total, stars);
    const newSave: GameSave = {
      ...state.gameSave,
      levels: newLevels,
      currentLevel: state.result.total >= 60 ? Math.min(state.currentLevel + 1, 5) : state.currentLevel,
      lastPlayTime: Date.now()
    };

    saveGame(newSave);
    set({ gameSave: newSave });
  },

  resetSave: () => {
    const newSave = createNewSave();
    saveGame(newSave);
    set({ gameSave: newSave });
  },

  startEndlessChallenge: () => {
    set({
      endlessChallenge: {
        isActive: true,
        currentStreak: 0,
        totalScore: 0,
        currentOptimalRange: [...ENDLESS_CHALLENGE.INITIAL_OPT_RANGE] as [number, number],
        currentMaxAddWood: ENDLESS_CHALLENGE.INITIAL_MAX_WOOD,
        currentTargetScore: ENDLESS_CHALLENGE.BASE_TARGET_SCORE
      },
      endlessResult: null,
      currentLevel: 1,
      temperature: 80,
      tempHistory: [{ time: 0, temperature: 80 }],
      addWoodRemaining: ENDLESS_CHALLENGE.INITIAL_MAX_WOOD,
      weather: 'sunny',
      smokeColor: 'white',
      isPlaying: true,
      gameTime: 0,
      result: null,
      optimalWindowActive: false,
      addWoodBonus: 0,
      weatherTimer: 0,
      flipKilnRemaining: MAX_FLIP_KILN,
      flipKilnActive: false,
      flipKilnTimer: 0,
      weatherWarning: null,
      weatherWarningTimer: 0,
      statsAddWoodUsed: 0,
      statsFlipKilnUsed: 0,
      statsWarningActions: 0
    });
  },

  endEndlessChallenge: () => {
    const state = get();
    const highestStreak = saveEndlessRecord(
      state.endlessChallenge.currentStreak,
      state.endlessChallenge.totalScore
    );
    set({
      endlessResult: {
        streak: state.endlessChallenge.currentStreak,
        totalScore: state.endlessChallenge.totalScore,
        highestStreak
      },
      endlessChallenge: {
        ...state.endlessChallenge,
        isActive: false
      }
    });
  },

  advanceEndlessLevel: () => {
    const state = get();
    if (!state.endlessChallenge.isActive || !state.result) return false;

    const level = state.getCurrentLevel();
    if (state.result.total < level.targetScore) {
      return false;
    }

    const newStreak = state.endlessChallenge.currentStreak + 1;
    const newTotalScore = state.endlessChallenge.totalScore + state.result.total;

    const [currentMin, currentMax] = state.endlessChallenge.currentOptimalRange;
    const [minMin, minMax] = ENDLESS_CHALLENGE.MIN_OPT_RANGE;
    const newOptMin = Math.min(currentMin + ENDLESS_CHALLENGE.NARROW_STEP, minMin);
    const newOptMax = Math.max(currentMax - ENDLESS_CHALLENGE.NARROW_STEP, minMax);

    const newMaxWood = Math.max(
      state.endlessChallenge.currentMaxAddWood - ENDLESS_CHALLENGE.WOOD_REDUCE_STEP,
      ENDLESS_CHALLENGE.MIN_MAX_WOOD
    );

    const newTargetScore = ENDLESS_CHALLENGE.BASE_TARGET_SCORE +
      newStreak * ENDLESS_CHALLENGE.TARGET_SCORE_INCREMENT;

    set({
      endlessChallenge: {
        isActive: true,
        currentStreak: newStreak,
        totalScore: newTotalScore,
        currentOptimalRange: [newOptMin, newOptMax] as [number, number],
        currentMaxAddWood: newMaxWood,
        currentTargetScore: newTargetScore
      },
      currentLevel: newStreak + 1,
      temperature: 80,
      tempHistory: [{ time: 0, temperature: 80 }],
      addWoodRemaining: newMaxWood,
      weather: 'sunny',
      smokeColor: 'white',
      isPlaying: true,
      gameTime: 0,
      result: null,
      optimalWindowActive: false,
      addWoodBonus: 0,
      weatherTimer: 0,
      flipKilnRemaining: MAX_FLIP_KILN,
      flipKilnActive: false,
      flipKilnTimer: 0,
      weatherWarning: null,
      weatherWarningTimer: 0,
      statsAddWoodUsed: 0,
      statsFlipKilnUsed: 0,
      statsWarningActions: 0
    });

    return true;
  },

  getEndlessHighestStreak: () => {
    return getEndlessHighestStreak();
  },

  clearEndlessResult: () => {
    set({ endlessResult: null });
  }
}));
