import type { WeatherType } from '../../types/game';

interface WeatherIndicatorProps {
  weather: WeatherType;
}

export function WeatherIndicator({ weather }: WeatherIndicatorProps) {
  const config = {
    sunny: { icon: '☀️', text: '晴天', color: 'text-yellow-300' },
    wind: { icon: '💨', text: '大风', color: 'text-cyan-300' },
    rain: { icon: '🌧️', text: '下雨', color: 'text-blue-300' }
  };

  const { icon, text, color } = config[weather];

  return (
    <div className={`flex items-center gap-2 bg-kiln-charcoal/70 px-4 py-2 rounded-full ${weather !== 'sunny' ? 'animate-pulse' : ''}`}>
      <span className="text-2xl">{icon}</span>
      <span className={`font-bold ${color}`}>{text}</span>
    </div>
  );
}

export function WeatherOverlay({ weather }: { weather: WeatherType }) {
  if (weather === 'sunny') return null;

  if (weather === 'rain') {
    const drops = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
      duration: 0.5 + Math.random() * 0.4
    }));
    return (
      <div className="weather-overlay">
        {drops.map(d => (
          <div
            key={d.id}
            className="rain-drop"
            style={{
              left: `${d.left}%`,
              animationDelay: `${d.delay}s`,
              animationDuration: `${d.duration}s`
            }}
          />
        ))}
      </div>
    );
  }

  const lines = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    top: 10 + i * 9,
    width: 100 + Math.random() * 150,
    delay: Math.random() * 2,
    duration: 1.5 + Math.random() * 1
  }));

  return (
    <div className="weather-overlay">
      {lines.map(l => (
        <div
          key={l.id}
          className="wind-line"
          style={{
            top: `${l.top}%`,
            width: `${l.width}px`,
            animationDelay: `${l.delay}s`,
            animationDuration: `${l.duration}s`
          }}
        />
      ))}
    </div>
  );
}
