interface WoodButtonProps {
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'gold';
  children: React.ReactNode;
  className?: string;
}

export function WoodButton({
  onClick,
  disabled = false,
  variant = 'default',
  children,
  className = ''
}: WoodButtonProps) {
  const variantClass = variant === 'gold' ? 'wood-button-gold' : '';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`wood-button ${variantClass} ${className}`}
    >
      {children}
    </button>
  );
}

interface AddWoodBtnProps {
  remaining: number;
  maxWood: number;
  onAdd: () => void;
  disabled?: boolean;
}

export function AddWoodBtn({ remaining, maxWood, onAdd, disabled = false }: AddWoodBtnProps) {
  return (
    <WoodButton
      onClick={onAdd}
      disabled={disabled || remaining <= 0}
      className="px-6 py-4 text-lg flex items-center gap-3"
    >
      <span className="text-2xl">🪵</span>
      <div className="flex flex-col items-start">
        <span>添柴</span>
        <span className="text-sm opacity-80">
          剩余 {remaining} / {maxWood}
        </span>
      </div>
      <div className="flex gap-1 ml-2">
        {Array.from({ length: maxWood }, (_, i) => (
          <div
            key={i}
            className={`w-3 h-5 rounded-sm ${i < remaining ? 'bg-kiln-gold' : 'bg-kiln-charcoal/50'}`}
          />
        ))}
      </div>
    </WoodButton>
  );
}

interface HarvestBtnProps {
  onHarvest: () => void;
  disabled?: boolean;
  isOptimal?: boolean;
}

export function HarvestBtn({ onHarvest, disabled = false, isOptimal = false }: HarvestBtnProps) {
  return (
    <WoodButton
      onClick={onHarvest}
      disabled={disabled}
      variant={isOptimal ? 'gold' : 'default'}
      className={`px-8 py-5 text-xl flex items-center gap-3 ${isOptimal ? 'animate-pulse-glow scale-105' : ''}`}
    >
      <span className="text-3xl">🍠</span>
      <div className="flex flex-col items-center">
        <span className="font-bold">出窖！</span>
        <span className="text-xs opacity-80">点击取出红薯</span>
      </div>
    </WoodButton>
  );
}

interface FlipKilnBtnProps {
  remaining: number;
  maxFlip: number;
  onFlip: () => void;
  disabled?: boolean;
  isActive?: boolean;
  remainingTime?: number;
}

export function FlipKilnBtn({
  remaining,
  maxFlip,
  onFlip,
  disabled = false,
  isActive = false,
  remainingTime = 0
}: FlipKilnBtnProps) {
  return (
    <WoodButton
      onClick={onFlip}
      disabled={disabled || remaining <= 0}
      variant={isActive ? 'gold' : 'default'}
      className={`px-6 py-4 text-lg flex items-center gap-3 ${isActive ? 'animate-pulse-glow' : ''}`}
    >
      <span className="text-2xl">🔄</span>
      <div className="flex flex-col items-start">
        <span>翻窖</span>
        <span className="text-sm opacity-80">
          {isActive
            ? `生效中 ${remainingTime.toFixed(1)}s`
            : `剩余 ${remaining} / ${maxFlip}`}
        </span>
      </div>
      <div className="flex gap-1 ml-2">
        {Array.from({ length: maxFlip }, (_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full ${
              isActive ? 'bg-kiln-gold animate-pulse' : i < remaining ? 'bg-kiln-gold' : 'bg-kiln-charcoal/50'
            }`}
          />
        ))}
      </div>
    </WoodButton>
  );
}
