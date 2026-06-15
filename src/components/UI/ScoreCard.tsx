import type { Score } from '../../types/game';

interface ScoreCardProps {
  score: Score;
  temperature: number;
  optimalRange: [number, number];
  targetScore: number;
  comment: string;
}

export function ScoreCard({
  score,
  temperature,
  optimalRange,
  targetScore,
  comment
}: ScoreCardProps) {
  const passed = score.total >= targetScore;
  const stars = score.total >= 90 ? 3 : score.total >= 75 ? 2 : score.total >= 60 ? 1 : 0;

  const [optMin, optMax] = optimalRange;
  const tempStatus = temperature < optMin
    ? { text: '偏生', color: 'text-cyan-400', emoji: '🥶' }
    : temperature > optMax
    ? { text: '焦糊', color: 'text-red-500', emoji: '🔥' }
    : { text: '完美', color: 'text-yellow-400', emoji: '✨' };

  return (
    <div className="bg-gradient-to-b from-kiln-secondary to-kiln-primary p-6 rounded-2xl border-4 border-kiln-dark shadow-2xl max-w-md mx-auto animate-bounce-in">
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
          <span className={`font-bold ${tempStatus.color}`}>
            {tempStatus.emoji} {Math.round(temperature)}°C ({tempStatus.text})
          </span>
        </div>
        <div className="text-kiln-light/70 text-xs text-right">
          最佳区间: {optMin}°C - {optMax}°C
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <ScoreItem label="糖化度" value={score.sugar} color="#FFD700" icon="🍯" />
        <ScoreItem label="焦糊度" value={100 - score.burnt} color="#FF6B35" icon="🔥" inverse />
        <ScoreItem label="口感度" value={score.texture} color="#DEB887" icon="👅" />
      </div>

      <div className="bg-kiln-gold rounded-xl p-4 text-center">
        <div className="text-kiln-dark/70 text-sm mb-1">综合得分</div>
        <div className="text-5xl font-bold text-kiln-dark mb-1">{score.total}</div>
        <div className={`text-sm font-bold ${passed ? 'text-green-700' : 'text-red-700'}`}>
          {passed ? `✓ 达到目标 ${targetScore} 分` : `✗ 目标 ${targetScore} 分，差 ${targetScore - score.total} 分`}
        </div>
      </div>
    </div>
  );
}

function ScoreItem({
  label,
  value,
  color,
  icon,
  inverse = false
}: {
  label: string;
  value: number;
  color: string;
  icon: string;
  inverse?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-white flex items-center gap-1">
          <span>{icon}</span>
          <span>{label}</span>
          {inverse && <span className="text-xs text-kiln-light/60">(低更好)</span>}
        </span>
        <span className="text-white font-bold">{value}</span>
      </div>
      <div className="score-bar">
        <div
          className="score-bar-fill"
          style={{
            width: `${Math.max(0, Math.min(100, value))}%`,
            background: `linear-gradient(90deg, ${color}99, ${color})`
          }}
        />
      </div>
    </div>
  );
}
