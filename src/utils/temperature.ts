import type { WeatherType, SmokeColor } from '../types/game';
import { DEFAULT_OPTIMAL_RANGE, MIN_TEMP, MAX_TEMP, BASE_TEMP } from '../config/levels';

export function calculateTemperature(
  gameTime: number,
  weather: WeatherType,
  addWoodBonus: number,
  tempChangeSpeed: number = 1.0
): number {
  const baseTime = gameTime * tempChangeSpeed;

  const baseWave = Math.sin(baseTime * 0.08) * 25;
  const secondWave = Math.sin(baseTime * 0.03 + 1.5) * 15;

  const linearTrend = Math.min(baseTime * 0.8, 200);

  const noise = (Math.random() - 0.5) * 12;

  let weatherEffect = 0;
  if (weather === 'wind') weatherEffect = -12;
  if (weather === 'rain') weatherEffect = -22;

  const temp = BASE_TEMP + baseWave + secondWave + linearTrend + noise + weatherEffect + addWoodBonus;

  return Math.max(MIN_TEMP, Math.min(MAX_TEMP, temp));
}

export function getSmokeColor(
  temperature: number,
  optimalRange: [number, number] = DEFAULT_OPTIMAL_RANGE
): SmokeColor {
  const [optMin, optMax] = optimalRange;
  if (temperature < optMin - 15) return 'white';
  if (temperature > optMax + 15) return 'black';
  return 'yellow';
}

export function isInOptimalWindow(
  temperature: number,
  optimalRange: [number, number]
): boolean {
  return temperature >= optimalRange[0] && temperature <= optimalRange[1];
}
