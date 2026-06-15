import { create } from 'zustand';
import type { GameState, Score, WeatherType, TempPoint, GameSave } from '../types/game';
import { DEFAULT_LEVELS, ADD_WOOD_TEMP, ADD_WOOD_BONUS_DECAY } from '../config/levels';
import { calculateTemperature, getSmokeColor, isInOptimalWindow } from '../utils/temperature';
import { calculateScore, getStars } from '../utils/scoring';
import { getOrCreateSave, saveGame, updateLevelProgress } from '../utils/storage';

interface GameStore extends GameState {
  gameSave: GameSave;
  startGame: (levelId: number) => void;
  addWood: () => void;
  harvest: () => void;
  updateTick: () => void;
  setWeather: (weather: WeatherType) => void;
  resetGame: () => void;
  clearResult: () => void;
  updateSaveAfterResult: () => void;
  getCurrentLevel: () => typeof DEFAULT_LEVELS[number];
  resetSave: () => void;
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
  gameSave: getOrCreateSave(),

  getCurrentLevel: () => {
    const state = get();
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
      weatherTimer: 0
    });
  },

  addWood: () => {
    const state = get();
    if (state.addWoodRemaining <= 0 || !state.isPlaying) return;

    set({
      addWoodRemaining: state.addWoodRemaining - 1,
      addWoodBonus: state.addWoodBonus + ADD_WOOD_TEMP,
      temperature: Math.min(350, state.temperature + ADD_WOOD_TEMP * 0.5)
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

    const newTemp = calculateTemperature(
      newTime,
      state.weather,
      newAddWoodBonus,
      level.tempChangeSpeed
    );

    const newSmokeColor = getSmokeColor(newTemp, level.optimalTempRange);
    const inOptimal = isInOptimalWindow(newTemp, level.optimalTempRange);

    const newHistory = [...state.tempHistory, { time: newTime, temperature: newTemp }];
    if (newHistory.length > 200) {
      newHistory.shift();
    }

    let newWeather = state.weather;
    let newWeatherTimer = state.weatherTimer + 0.1;

    if (newWeatherTimer > 8 && state.weather !== 'sunny') {
      newWeather = 'sunny';
      newWeatherTimer = 0;
    } else if (newWeatherTimer > 5 && Math.random() < level.weatherProbability * 0.1) {
      newWeather = Math.random() < 0.5 ? 'wind' : 'rain';
      newWeatherTimer = 0;
    }

    set({
      gameTime: newTime,
      temperature: newTemp,
      tempHistory: newHistory,
      smokeColor: newSmokeColor,
      optimalWindowActive: inOptimal,
      addWoodBonus: newAddWoodBonus,
      weather: newWeather,
      weatherTimer: newWeatherTimer
    });
  },

  setWeather: (weather: WeatherType) => {
    set({ weather, weatherTimer: 0 });
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
      weatherTimer: 0
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
    const { createNewSave, saveGame } = require('../utils/storage');
    const newSave = createNewSave();
    saveGame(newSave);
    set({ gameSave: newSave });
  }
}));
