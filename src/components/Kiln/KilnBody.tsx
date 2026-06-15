import type { SmokeColor, WeatherType } from '../../types/game';
import { SmokeEffect } from './SmokeEffect';
import { WeatherOverlay } from '../Weather/WeatherIndicator';

interface KilnBodyProps {
  temperature: number;
  smokeColor: SmokeColor;
  weather: WeatherType;
  isPlaying: boolean;
  optimalWindowActive: boolean;
}

export function KilnBody({
  temperature,
  smokeColor,
  weather,
  isPlaying,
  optimalWindowActive
}: KilnBodyProps) {
  const fireIntensity = Math.min((temperature - 50) / 250, 1);
  const fireColor = temperature < 150 ? '#FF6B35' :
                    temperature < 250 ? '#FF8C00' : '#FF4500';

  return (
    <div className="relative w-full max-w-md mx-auto">
      <WeatherOverlay weather={weather} />
      <SmokeEffect color={smokeColor} intensity={isPlaying ? 1 : 0.3} />

      <div className={`relative mt-16 transition-all duration-500 ${optimalWindowActive ? 'animate-pulse-glow' : ''}`}>
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-32 h-8 bg-gradient-to-b from-kiln-light to-kiln-secondary rounded-t-lg border-4 border-kiln-dark" />

        <div className="relative w-64 h-72 mx-auto bg-gradient-to-b from-kiln-secondary via-kiln-primary to-kiln-dark rounded-t-[120px] rounded-b-2xl border-4 border-kiln-dark shadow-2xl overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-10 left-4 w-12 h-2 bg-kiln-charcoal/40 rounded-full rotate-12" />
            <div className="absolute top-24 right-6 w-16 h-2 bg-kiln-charcoal/40 rounded-full -rotate-6" />
            <div className="absolute top-40 left-8 w-20 h-2 bg-kiln-charcoal/40 rounded-full rotate-3" />
            <div className="absolute top-56 right-10 w-10 h-2 bg-kiln-charcoal/40 rounded-full -rotate-12" />
          </div>

          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-36 h-28 bg-gradient-to-b from-kiln-charcoal to-black rounded-t-2xl border-4 border-kiln-dark overflow-hidden">
            {isPlaying && (
              <>
                <div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-t-full animate-flame-flicker"
                  style={{
                    width: `${40 + fireIntensity * 30}px`,
                    height: `${50 + fireIntensity * 50}px`,
                    background: `radial-gradient(ellipse at bottom, #FFF3B0 0%, ${fireColor} 50%, transparent 100%)`,
                    opacity: 0.9
                  }}
                />
                <div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-t-full animate-flame-flicker"
                  style={{
                    width: `${25 + fireIntensity * 20}px`,
                    height: `${35 + fireIntensity * 35}px`,
                    background: `radial-gradient(ellipse at bottom, white 0%, #FFD700 40%, ${fireColor} 100%)`,
                    opacity: 0.8,
                    animationDelay: '0.1s'
                  }}
                />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-gradient-to-t from-orange-600 to-transparent opacity-80" />
              </>
            )}

            <div className="absolute bottom-2 left-4 w-8 h-10 bg-kiln-charcoal rounded-t-lg transform -rotate-12" />
            <div className="absolute bottom-2 right-4 w-8 h-10 bg-kiln-charcoal rounded-t-lg transform rotate-12" />
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-10 h-8 bg-kiln-dark rounded-t-lg" />
          </div>

          <div className="absolute top-6 left-1/2 -translate-x-1/2 text-5xl">
            🍠
          </div>
        </div>

        <div className="w-72 h-6 mx-auto bg-gradient-to-b from-kiln-dark to-kiln-charcoal rounded-full -mt-1 shadow-lg" />
      </div>

      {optimalWindowActive && isPlaying && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-kiln-gold text-kiln-dark px-6 py-2 rounded-full font-bold text-lg animate-bounce-in shadow-lg z-10">
          ⭐ 最佳时机！快出窖！
        </div>
      )}
    </div>
  );
}
