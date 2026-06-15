import { useMemo } from 'react';
import type { SmokeColor } from '../../types/game';

interface SmokeEffectProps {
  color: SmokeColor;
  intensity?: number;
}

export function SmokeEffect({ color, intensity = 1 }: SmokeEffectProps) {
  const particles = useMemo(() => {
    const count = Math.round(8 * intensity);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: 35 + Math.random() * 30,
      size: 20 + Math.random() * 25,
      delay: (i * 0.35) % 3,
      duration: 2.5 + Math.random() * 1.5
    }));
  }, [intensity]);

  const colorMap: Record<SmokeColor, string> = {
    white: 'rgba(230, 230, 230, 0.7)',
    yellow: 'rgba(255, 200, 100, 0.75)',
    black: 'rgba(40, 40, 40, 0.8)'
  };

  const glowMap: Record<SmokeColor, string> = {
    white: 'rgba(200, 200, 200, 0.3)',
    yellow: 'rgba(255, 180, 50, 0.5)',
    black: 'rgba(20, 20, 20, 0.4)'
  };

  const smokeColor = colorMap[color];
  const glowColor = glowMap[color];

  return (
    <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="smoke-particle"
          style={{
            left: `${p.left}%`,
            bottom: '0',
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: smokeColor,
            boxShadow: `0 0 ${p.size}px ${glowColor}`,
            animation: `smokeRise ${p.duration}s ease-out ${p.delay}s infinite`
          }}
        />
      ))}
    </div>
  );
}
