import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { useGameLoop } from '../hooks/useGameLoop';
import { TempCurve } from '../components/Kiln/TempCurve';
import { KilnBody } from '../components/Kiln/KilnBody';
import { AddWoodBtn, HarvestBtn } from '../components/Controls/WoodButton';
import { WeatherIndicator } from '../components/Weather/WeatherIndicator';
import { getScoreComment } from '../utils/scoring';
import { GAME_DURATION } from '../config/levels';

export function KilnPage() {
  const navigate = useNavigate();
  const {
    currentLevel,
    temperature,
    tempHistory,
    addWoodRemaining,
    weather,
    smokeColor,
    isPlaying,
    result,
    optimalWindowActive,
    gameTime,
    startGame,
    addWood,
    harvest,
    getCurrentLevel,
    clearResult,
    updateSaveAfterResult
  } = useGameStore();

  const [showResult, setShowResult] = useState(false);

  useGameLoop();

  const level = getCurrentLevel();

  useEffect(() => {
    if (!isPlaying && tempHistory.length <= 1) {
      startGame(currentLevel);
    }
  }, [isPlaying, currentLevel, tempHistory.length, startGame]);

  useEffect(() => {
    if (result && !showResult) {
      updateSaveAfterResult();
      setShowResult(true);
    }
  }, [result, showResult, updateSaveAfterResult]);

  const handleBack = () => {
    clearResult();
    setShowResult(false);
    navigate('/levels');
  };

  const handleRetry = () => {
    clearResult();
    setShowResult(false);
    startGame(currentLevel);
  };

  const handleNext = () => {
    clearResult();
    setShowResult(false);
    if (result && result.total >= 60) {
      const nextLevel = Math.min(currentLevel + 1, 5);
      startGame(nextLevel);
    } else {
      startGame(currentLevel);
    }
  };

  if (showResult && result) {
    const comment = getScoreComment(result, temperature, level.optimalTempRange);
    const passed = result.total >= level.targetScore;
    const stars = result.total >= 90 ? 3 : result.total >= 75 ? 2 : result.total >= 60 ? 1 : 0;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="bg-gradient-to-b from-kiln-secondary to-kiln-primary p-6 rounded-2xl border-4 border-kiln-dark shadow-2xl max-w-md w-full animate-bounce-in">
          <div className="text-center mb-4">
            <h2 className="font-title text-3xl text-white mb-2">
              {passed ? '🎉 烤好了！' : '😅 还需努力'}
            </h2>
            <div className="flex justify-center gap-1 mb-2">
              {[1, 2, 3].map(i => (
                <span
                  key={i}
                  className={`star ${i <= stars ? 'active' : ''}`}
                  style={{ animationDelay: `${i * 0.2}s` }}
                >
                  ★
                </span>
              ))}
            </div>
            <p className="text-kiln-light italic">"{comment}"</p>
          </div>

          <div className="bg-kiln-charcoal/50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-kiln-light text-sm">窑温</span>
              <span className="font-bold text-kiln-gold">
                {temperature < level.optimalTempRange[0] ? '🥶' : temperature > level.optimalTempRange[1] ? '🔥' : '✨'} {Math.round(temperature)}°C
              </span>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            {[
              { label: '糖化度', value: result.sugar, color: '#FFD700', icon: '🍯' },
              { label: '焦糊度', value: 100 - result.burnt, color: '#FF6B35', icon: '🔥', inverse: true },
              { label: '口感度', value: result.texture, color: '#DEB887', icon: '👅' }
            ].map(item => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white flex items-center gap-1">
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                      {item.inverse && <span className="text-xs text-kiln-light/60">(低更好)</span>}
                    </span>
                  <span className="text-white font-bold">{item.value}</span>
                </div>
                <div className="score-bar">
                  <div
                    className="score-bar-fill"
                    style={{
                      width: `${Math.max(0, Math.min(100, item.value))}%`,
                      background: `linear-gradient(90deg, ${item.color}99, ${item.color})`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-kiln-gold rounded-xl p-4 text-center mb-6">
            <div className="text-kiln-dark/70 text-sm mb-1">综合得分</div>
            <div className="text-5xl font-bold text-kiln-dark mb-1">{result.total}</div>
            <div className={`text-sm font-bold ${passed ? 'text-green-700' : 'text-red-700'}`}>
              {passed
                ? `✓ 达到目标 ${level.targetScore} 分`
                : `✗ 目标 ${level.targetScore} 分，差 ${level.targetScore - result.total} 分`}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleBack}
              className="wood-button px-4 py-3"
            >
              📋 关卡
            </button>
            <button
              onClick={handleRetry}
              className="wood-button px-4 py-3"
            >
              🔄 重试
            </button>
            {passed && currentLevel < 5 && (
              <button
                onClick={handleNext}
                className="col-span-2 wood-button wood-button-gold px-4 py-3 text-lg"
              >
                ▶️ 下一关
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate('/levels')}
          className="wood-button px-4 py-2 text-sm"
        >
          ← 返回
        </button>
        <div className="text-center">
          <div className="text-kiln-gold font-title text-2xl">第 {level.id} 关 · {level.name}</div>
          <div className="text-kiln-light text-sm">目标 {level.targetScore} 分</div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className={`text-xl font-bold px-3 py-1 rounded-full ${
            isPlaying && Math.ceil(GAME_DURATION - gameTime) <= 10
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-kiln-charcoal/70 text-kiln-gold'
          }`}>
            ⏱️ {Math.ceil(Math.max(0, GAME_DURATION - gameTime))}s
          </div>
          <WeatherIndicator weather={weather} />
        </div>
      </div>

      {isPlaying && Math.ceil(GAME_DURATION - gameTime) <= 10 && (
        <div className="bg-red-600 text-white text-center py-2 px-4 rounded-lg mb-4 font-bold text-lg animate-pulse shadow-lg">
          ⚠️ 倒计时 {Math.ceil(GAME_DURATION - gameTime)} 秒！快出窖！
        </div>
      )}

      <div className="mb-4">
        <TempCurve
          data={tempHistory}
          optimalRange={level.optimalTempRange}
          currentTemp={temperature}
          width={600}
          height={220}
        />
      </div>

      <div className="flex justify-center">
        <KilnBody
          temperature={temperature}
          smokeColor={smokeColor}
          weather={weather}
          isPlaying={isPlaying}
          optimalWindowActive={optimalWindowActive}
        />
      </div>

      <div className="flex justify-center gap-4 mt-6">
        <AddWoodBtn
          remaining={addWoodRemaining}
          maxWood={level.maxAddWood}
          onAdd={addWood}
          disabled={!isPlaying}
        />
        <HarvestBtn
          onHarvest={harvest}
          disabled={!isPlaying}
          isOptimal={optimalWindowActive}
        />
      </div>

      <div className="text-center mt-4 text-kiln-light/60 text-sm">
        游戏时间: {Math.floor(gameTime)}s | 烟气:
        {smokeColor === 'white' ? ' 💨 白烟(温度低)' :
         smokeColor === 'yellow' ? ' 💛 黄烟(正好)' :
         ' 🖤 黑烟(焦糊了)'}
      </div>
    </div>
  );
}
