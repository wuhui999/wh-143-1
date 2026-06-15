import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { WoodButton } from '../components/Controls/WoodButton';

export function HomePage() {
  const navigate = useNavigate();
  const { gameSave, getEndlessHighestStreak } = useGameStore();

  const hasProgress = gameSave.levels.some(l => l.bestScore > 0);
  const currentLevel = gameSave.levels.find(l => l.id === gameSave.currentLevel) || gameSave.levels[0];
  const highestStreak = getEndlessHighestStreak();

  const icons = ['🔥', '🍠', '🌡️', '🪵', '💨', '✨'];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-20">
        {Array.from({ length: 15 }, (_, i) => (
          <div
            key={i}
            className="absolute text-4xl"
            style={{
              left: `${(i * 7) % 100}%`,
              top: `${(i * 13) % 100}%`,
              transform: `rotate(${i * 24}deg)`,
              animation: `bounce 3s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`
            }}
          >
            {icons[i % icons.length]}
          </div>
        ))}
      </div>

      <div className="relative z-10 text-center mb-10">
        <div className="text-8xl mb-4 animate-bounce-in">🍠</div>
        <h1 className="font-title text-6xl text-kiln-gold mb-2 drop-shadow-lg">
          烤红薯出窖时机
        </h1>
        <p className="text-kiln-light text-xl mb-2">观察窑温 · 把控火候 · 完美出窖</p>
      </div>

      <div className="relative z-10 bg-kiln-charcoal/60 backdrop-blur-sm p-6 rounded-2xl border-2 border-kiln-secondary mb-8 max-w-md w-full">
        <div className="grid grid-cols-2 gap-4 text-center text-kiln-light">
          <div>
            <div className="text-kiln-gold font-bold text-2xl">当前关卡</div>
            <div className="text-3xl">第 {gameSave.currentLevel} 关</div>
            <div className="text-sm opacity-80">{currentLevel.name}</div>
          </div>
          <div>
            <div className="text-kiln-gold font-bold text-2xl">已解锁</div>
            <div className="text-3xl">{gameSave.levels.filter(l => l.unlocked).length}/{gameSave.levels.length}</div>
            <div className="text-sm opacity-80">个关卡</div>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-4 w-full max-w-xs">
        <WoodButton
          onClick={() => navigate('/kiln')}
          className="px-8 py-5 text-xl"
        >
          {hasProgress ? '🎮 继续游戏' : '🎮 开始游戏'}
        </WoodButton>

        <WoodButton
          onClick={() => navigate('/levels')}
          className="px-8 py-4 text-lg"
        >
          📋 选择关卡
        </WoodButton>

        <div className="relative">
          <WoodButton
            onClick={() => navigate('/endless')}
            variant="gold"
            className="px-8 py-4 text-lg w-full"
          >
            🔥 连烤挑战
          </WoodButton>
          {highestStreak > 0 && (
            <div className="absolute -top-2 -right-2 bg-kiln-gold text-kiln-dark text-xs font-bold px-2 py-1 rounded-full">
              最高 {highestStreak} 关
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 mt-10 text-center text-kiln-light/70 text-sm max-w-md">
        <p className="mb-2">🎯 玩法提示</p>
        <p>观察窑温曲线，在最佳温度区间点击"出窖"</p>
        <p>添柴可升温，天气会影响温度，把握好时机！</p>
      </div>
    </div>
  );
}
