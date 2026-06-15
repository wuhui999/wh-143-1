import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { WoodButton } from '../components/Controls/WoodButton';

export function LevelsPage() {
  const navigate = useNavigate();
  const { gameSave, startGame } = useGameStore();

  const handleSelectLevel = (levelId: number) => {
    startGame(levelId);
    navigate('/kiln');
  };

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/')}
          className="wood-button px-4 py-2 text-sm"
        >
          ← 返回
        </button>
        <h1 className="font-title text-4xl text-kiln-gold">选择关卡</h1>
        <div className="w-20" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {gameSave.levels.map(level => (
          <div
            key={level.id}
            className={`p-5 rounded-2xl border-4 shadow-lg transition-all ${
              level.unlocked
                ? 'bg-gradient-to-b from-kiln-secondary to-kiln-primary border-kiln-dark cursor-pointer hover:scale-105'
                : 'bg-kiln-charcoal/40 border-kiln-charcoal border-dashed opacity-60'
            }`}
            onClick={() => level.unlocked && handleSelectLevel(level.id)}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-kiln-light text-sm">第 {level.id} 关</div>
                <div className={`font-title text-2xl ${level.unlocked ? 'text-white' : 'text-kiln-light/50'}`}>
                  {level.name}
                </div>
              </div>
              {!level.unlocked && <div className="text-4xl">🔒</div>}
            </div>

            {level.unlocked && (
              <>
                <div className="flex gap-1 my-2">
                  {[1, 2, 3].map(i => (
                    <span
                      key={i}
                      className={`text-2xl ${i <= level.stars ? 'text-kiln-gold drop-shadow' : 'text-kiln-charcoal/50'}`}
                    >
                      ★
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                  <div className="bg-kiln-charcoal/40 rounded-lg p-2 text-center">
                    <div className="text-kiln-light/70 text-xs">目标分</div>
                    <div className="text-kiln-gold font-bold text-lg">{level.targetScore}</div>
                  </div>
                  <div className="bg-kiln-charcoal/40 rounded-lg p-2 text-center">
                    <div className="text-kiln-light/70 text-xs">最佳</div>
                    <div className="text-white font-bold text-lg">{level.bestScore || '-'}</div>
                  </div>
                  <div className="bg-kiln-charcoal/40 rounded-lg p-2 text-center">
                    <div className="text-kiln-light/70 text-xs">添柴</div>
                    <div className="text-white font-bold text-lg">{level.maxAddWood}次</div>
                  </div>
                  <div className="bg-kiln-charcoal/40 rounded-lg p-2 text-center">
                    <div className="text-kiln-light/70 text-xs">最佳温区</div>
                    <div className="text-white font-bold text-sm">{level.optimalTempRange[0]}-{level.optimalTempRange[1]}°C</div>
                  </div>
                </div>
              </>
            )}

            {!level.unlocked && (
              <div className="text-kiln-light/50 text-sm mt-2">
                通过上一关即可解锁
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="text-center mt-6">
        <WoodButton
          onClick={() => navigate('/')}
          className="px-6 py-3"
        >
          🏠 返回主页
        </WoodButton>
      </div>
    </div>
  );
}
