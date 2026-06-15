import { useRef, useEffect } from 'react';
import type { TempPoint } from '../../types/game';
import { MIN_TEMP, MAX_TEMP } from '../../config/levels';

interface TempCurveProps {
  data: TempPoint[];
  optimalRange: [number, number];
  currentTemp: number;
  width?: number;
  height?: number;
}

export function TempCurve({
  data,
  optimalRange,
  currentTemp,
  width = 600,
  height = 250
}: TempCurveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padding = { top: 20, right: 20, bottom: 30, left: 45 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, 'rgba(47, 47, 47, 0.9)');
    bgGradient.addColorStop(1, 'rgba(62, 39, 35, 0.95)');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    const [optMin, optMax] = optimalRange;
    const yMin = MIN_TEMP - 20;
    const yMax = MAX_TEMP + 20;

    const optMinY = padding.top + chartHeight * (1 - (optMin - yMin) / (yMax - yMin));
    const optMaxY = padding.top + chartHeight * (1 - (optMax - yMin) / (yMax - yMin));

    ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
    ctx.fillRect(padding.left, optMaxY, chartWidth, optMinY - optMaxY);

    ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(padding.left, optMinY);
    ctx.lineTo(padding.left + chartWidth, optMinY);
    ctx.moveTo(padding.left, optMaxY);
    ctx.lineTo(padding.left + chartWidth, optMaxY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = 'rgba(222, 184, 135, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
    }

    ctx.fillStyle = '#DEB887';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const yLabels = [50, 125, 200, 275, 350];
    yLabels.forEach(t => {
      const y = padding.top + chartHeight * (1 - (t - yMin) / (yMax - yMin));
      ctx.fillText(`${t}°C`, padding.left - 6, y);
    });

    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`最佳: ${optMin}-${optMax}°C`, padding.left + 5, padding.top + 10);

    if (data.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = currentTemp >= optMin && currentTemp <= optMax ? '#FFD700' : '#FF6B35';
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      data.forEach((point, index) => {
        const x = padding.left + (index / 199) * chartWidth;
        const y = padding.top + chartHeight * (1 - (point.temperature - yMin) / (yMax - yMin));
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      const lastPoint = data[data.length - 1];
      const lastX = padding.left + Math.min((data.length - 1) / 199, 1) * chartWidth;
      const lastY = padding.top + chartHeight * (1 - (lastPoint.temperature - yMin) / (yMax - yMin));

      ctx.beginPath();
      ctx.arc(lastX, lastY, 6, 0, Math.PI * 2);
      const tempColor = lastPoint.temperature < optMin ? '#87CEEB' :
                        lastPoint.temperature > optMax ? '#8B0000' : '#FFD700';
      ctx.fillStyle = tempColor;
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(lastX, lastY, 10, 0, Math.PI * 2);
      ctx.fillStyle = tempColor + '40';
      ctx.fill();
    }

    ctx.strokeStyle = '#CD853F';
    ctx.lineWidth = 2;
    ctx.strokeRect(padding.left, padding.top, chartWidth, chartHeight);
  }, [data, optimalRange, currentTemp, width, height, chartWidth, chartHeight, padding.top, padding.left, padding.bottom, padding.right]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="rounded-lg shadow-lg"
      />
      <div className="absolute top-2 right-4 bg-kiln-charcoal/80 px-3 py-1 rounded-full">
        <span className="text-kiln-gold font-bold text-lg">🌡️ {Math.round(currentTemp)}°C</span>
      </div>
    </div>
  );
}
