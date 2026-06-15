import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore, MAX_FLIP_KILN } from '../store/useGameStore';
import { useGameLoop } from '../hooks/useGameLoop';
import { TempCurve } from '../components/Kiln/TempCurve';
import { KilnBody } from '../components/Kiln/KilnBody';
import { AddWoodBtn, HarvestBtn, FlipKilnBtn, WoodButton } from '../components/Controls/WoodButton';
import { WeatherIndicator } from '../components/Weather/WeatherIndicator';
import { getScoreComment } from '../utils/scoring';
import { GAME_DURATION } from '../config/levels';

export function EndlessPage() {
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
    weatherWarning,
    weatherWarningTimer,
    flipKilnRemaining,
    flipKilnActive,
    flipKilnTimer,
    statsAddWoodUsed,
    statsFlipKilnUsed,
    statsWarningActions,
    endlessChallenge,
    endlessResult,
    startEndlessChallenge,
    addWood,
    flipKiln,
    harvest,
    getCurrentLevel,
    clearResult,
    advanceEndlessLevel,
    endEndlessChallenge,
    clearEndlessResult
  } = useGameStore();

  const [showLevelResult, setShowLevelResult] = useState(false);

  useGameLoop();

  const level = getCurrentLevel();

  useEffect(() => {
    if (!endlessChallenge.isActive && !endlessResult) {
      startEndlessChallenge();
    }
  }, [endlessChallenge.isActive, endlessResult, startEndlessChallenge]);

  useEffect(() => {
    if (result && !showLevelResult && endlessChallenge.isActive) {
      setShowLevelResult(true);
    }
  }, [result, showLevelResult, endlessChallenge.isActive]);

  const handleContinue = () => {
    clearResult();
    setShowLevelResult(false);
    const success = advanceEndlessLevel();
    if (!success) {
      endEndlessChallenge();
    }
  };

  const handleBackToHome = () => {
    clearResult();
    clearEndlessResult();
    setShowLevelResult(false);
    navigate('/');
  };

  const handleRetry = () => {
    clearResult();
    clearEndlessResult();
    setShowLevelResult(false);
    startEndlessChallenge();
  };

  const warningMessage = weatherWarning === 'wind'
    ? '💨 大风将至，注意保温！'
    : weatherWarning === 'rain'
    ? '🌧️ 降雨将至，注意保温！'
    : '';

  if (endlessResult) {
    const isNewRecord = endlessResult.streak >= endlessResult.highestStreak && endlessResult.streak > 0;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="bg-gradient-to-b from-kiln-secondary to-kiln-primary p-6 rounded-2xl border-4 border-kiln-dark shadow-2xl max-w-md w-full animate-bounce-in">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">
              {endlessResult.streak >= 10 ? '🏆' : endlessResult.streak >= 5 ? '🎖️' : '🍠'}
            </div>
            <h2 className="font-title text-4xl text-white mb-2">
              连烤挑战结束
            </h2>
            {isNewRecord && (
              <div className="bg-kiln-gold text-kiln-dark px-4 py-1 rounded-full inline-block text-sm font-bold animate-pulse">
                🎉 新纪录！
              </div>
            )}
          </div>

          <div className="bg-kiln-charcoal/50 rounded-xl p-4 mb-4">
            <div className="text-kiln-gold font-bold mb-4 text-center text-xl">📊 挑战统计</div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-kiln-dark/50 rounded-lg p-4">
                <div className="text-kiln-light/70 text-sm mb-1">连闯关数</div>
                <div className="text-white font-bold text-4xl">{endlessResult.streak}</div>
                <div className="text-kiln-light/50 text-xs">关</div>
              </div>
              <div className="bg-kiln-dark/50 rounded-lg p-4">
                <div className="text-kiln-light/70 text-sm mb-1">总分</div>
                <div className="text-kiln-gold font-bold text-4xl">{endlessResult.totalScore}</div>
                <div className="text-kiln-light/50 text-xs">分</div>
              </div>
            </div>
          </div>

          <div className="bg-kiln-gold/20 rounded-xl p-4 mb-6 text-center">
            <div className="text-kiln-light/70 text-sm mb-1">🏅 历史最高连闯</div>
            <div className="text-kiln-gold font-bold text-3xl">{endlessResult.highestStreak} 关</div>
          </div>

          <div className="space-y-3">
            <WoodButton
              onClick={handleRetry}
              variant="gold"
              className="w-full px-6 py-4 text-lg"
            >
              🔄 再来一次
            </WoodButton>
            <WoodButton
              onClick={handleBackToHome}
              className="w-full px-6 py-3"
            >
              🏠 返回主页
            </WoodButton>
          </div>
        </div>
      </div>
    );
  }

  if (showLevelResult && result) {
    const comment = getScoreComment(result, temperature, level.optimalTempRange);
    const passed = result.total >= level.targetScore;
    const stars = result.total >= 90 ? 3 : result.total >= 75 ? 2 : result.total >= 60 ? 1 : 0;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="bg-gradient-to-b from-kiln-secondary to-kiln-primary p-6 rounded-2xl border-4 border-kiln-dark shadow-2xl max-w-md w-full animate-bounce-in">
          <div className="text-center mb-4">
            <div className="text-kiln-gold font-bold text-lg mb-2">
              🔥 连烤第 {endlessChallenge.currentStreak + 1} 关
            </div>
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

          <div className="bg-kiln-charcoal/50 rounded-xl p-4 mb-4">
            <div className="text-kiln-gold font-bold mb-2 text-center">📊 本局操作统计</div>
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className="bg-kiln-dark/50 rounded-lg p-2">
                <div className="text-kiln-light/70 text-xs">添柴</div>
                <div className="text-white font-bold text-xl">{statsAddWoodUsed}次</div>
              </div>
              <div className="bg-kiln-dark/50 rounded-lg p-2">
                <div className="text-kiln-light/70 text-xs">翻窖</div>
                <div className="text-white font-bold text-xl">{statsFlipKilnUsed}次</div>
              </div>
              <div className="bg-kiln-dark/50 rounded-lg p-2">
                <div className="text-kiln-light/70 text-xs">预警期操作</div>
                <div className="text-white font-bold text-xl">{statsWarningActions}次</div>
              </div>
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

          <div className="bg-kiln-charcoal/50 rounded-xl p-3 mb-4 text-center text-sm">
            <div className="text-kiln-light/70">当前累计</div>
            <div className="text-white">
              已连闯 <span className="text-kiln-gold font-bold">{endlessChallenge.currentStreak}</span> 关 · 
              总分 <span className="text-kiln-gold font-bold">{endlessChallenge.totalScore + (passed ? result.total : 0)}</span> 分
            </div>
          </div>

          <div className="space-y-3">
            {passed ? (
              <WoodButton
                onClick={handleContinue}
                variant="gold"
                className="w-full px-6 py-4 text-lg"
              >
                ▶️ 继续下一关
              </WoodButton>
            ) : (
              <WoodButton
                onClick={handleContinue}
                className="w-full px-6 py-4 text-lg"
              >
                📊 查看总结
              </WoodButton>
            )}
            <WoodButton
              onClick={handleBackToHome}
              className="w-full px-6 py-3"
            >
              🏠 放弃挑战
            </WoodButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handleBackToHome}
          className="wood-button px-4 py-2 text-sm"
        >
          ← 放弃
        </button>
        <div className="text-center">
          <div className="text-kiln-gold font-title text-2xl">
            🔥 连烤第 {endlessChallenge.currentStreak + 1} 关
          </div>
          <div className="text-kiln-light text-sm">
            目标 {level.targetScore} 分 · 温区 {level.optimalTempRange[0]}-{level.optimalTempRange[1]}°C
          </div>
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

      <div className="bg-kiln-charcoal/40 rounded-lg px-4 py-2 mb-4 text-center">
        <span className="text-kiln-light/70 text-sm">
          已连闯 <span className="text-kiln-gold font-bold">{endlessChallenge.currentStreak}</span> 关 · 
          总分 <span className="text-kiln-gold font-bold">{endlessChallenge.totalScore}</span> 分
        </span>
      </div>

      {weatherWarning && (
        <div className="bg-yellow-500 text-kiln-dark text-center py-2 px-4 rounded-lg mb-4 font-bold text-lg shadow-lg animate-pulse border-2 border-yellow-300">
          ⚠️ {warningMessage} ({weatherWarningTimer.toFixed(1)}s)
        </div>
      )}

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

      <div className="flex justify-center gap-3 mt-6 flex-wrap">
        <AddWoodBtn
          remaining={addWoodRemaining}
          maxWood={level.maxAddWood}
          onAdd={addWood}
          disabled={!isPlaying}
        />
        <FlipKilnBtn
          remaining={flipKilnRemaining}
          maxFlip={MAX_FLIP_KILN}
          onFlip={flipKiln}
          disabled={!isPlaying}
          isActive={flipKilnActive}
          remainingTime={flipKilnTimer}
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
