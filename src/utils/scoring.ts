import type { Score } from '../types/game';
import { SCORE_WEIGHTS, DEFAULT_OPTIMAL_RANGE, MAX_TEMP, MIN_TEMP, STAR_THRESHOLDS } from '../config/levels';

export function calculateScore(
  temperature: number,
  optimalRange: [number, number] = DEFAULT_OPTIMAL_RANGE
): Score {
  const [optMin, optMax] = optimalRange;
  const optCenter = (optMin + optMax) / 2;
  const optRange = optMax - optMin;

  const deviation = Math.abs(temperature - optCenter);
  const normalizedDeviation = deviation / (MAX_TEMP - MIN_TEMP);

  const sugar = Math.max(0, Math.min(100, 100 - normalizedDeviation * 200));

  let burnt: number;
  if (temperature <= optMax) {
    burnt = Math.max(0, (temperature - optMin) * 0.1);
  } else {
    burnt = Math.min(100, 20 + (temperature - optMax) * 1.2);
  }

  let texture: number;
  if (temperature >= optMin && temperature <= optMax) {
    texture = 80 + (1 - Math.abs(temperature - optCenter) / (optRange / 2)) * 20;
  } else if (temperature < optMin) {
    texture = Math.max(0, 55 - (optMin - temperature) * 0.6);
  } else {
    texture = Math.max(0, 55 - (temperature - optMax) * 0.7);
  }

  const total = sugar * SCORE_WEIGHTS.sugar +
    (100 - burnt) * SCORE_WEIGHTS.burnt +
    texture * SCORE_WEIGHTS.texture;

  return {
    sugar: Math.round(sugar),
    burnt: Math.round(burnt),
    texture: Math.round(texture),
    total: Math.round(total)
  };
}

export function getStars(totalScore: number): number {
  if (totalScore >= STAR_THRESHOLDS.three) return 3;
  if (totalScore >= STAR_THRESHOLDS.two) return 2;
  if (totalScore >= STAR_THRESHOLDS.one) return 1;
  return 0;
}

export function getScoreComment(score: Score, temperature: number, optRange: [number, number]): string {
  const [optMin, optMax] = optRange;
  if (temperature < optMin - 20) return '太生了！红薯还没熟透呢～';
  if (temperature < optMin) return '还差一点火候，再等等就好！';
  if (temperature > optMax + 30) return '焦糊了！这锅只能当炭烧了...';
  if (temperature > optMax + 15) return '有点焦了，下次早点出窖哦～';
  if (score.total >= 90) return '完美！大师级的烤红薯！';
  if (score.total >= 75) return '很不错！香甜软糯～';
  if (score.total >= 60) return '还可以，及格水平！';
  return '继续努力，下次会更好！';
}
