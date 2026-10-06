'use client';

import React, { useState, useMemo } from 'react';
import { Candle, EmpiricalHistoricalResult } from '@/lib/types';
import { History, Eye, EyeOff, Info, Layers, Compass } from 'lucide-react';

interface ForecastChartProps {
  candles: Candle[];
  currentPrice: number;
  targetPrice: number;
  empirical: EmpiricalHistoricalResult;
}

export const ForecastChart: React.FC<ForecastChartProps> = ({
  candles,
  currentPrice,
  targetPrice,
  empirical,
}) => {
  const [horizon, setHorizon] = useState<30 | 60 | 90>(60);
  const [showHistoricalAnalog, setShowHistoricalAnalog] = useState<boolean>(true);

  // Take recent 45 historical candles
  const historicalSlice = useMemo(() => {
    return candles.slice(-45);
  }, [candles]);

  const trajectoryBands = useMemo(() => {
    return (empirical.trajectoryBands || []).slice(0, horizon + 1);
  }, [empirical.trajectoryBands, horizon]);

  // Scaled closest historical analog path matching the current starting price
  const analogPoints = useMemo(() => {
    if (!empirical.closestHistoricalRun || !empirical.closestHistoricalRun.path) return [];
    const baseP = empirical.closestHistoricalRun.startPrice || currentPrice;
    const ratio = currentPrice / baseP;

    return empirical.closestHistoricalRun.path
      .filter(p => p.day <= horizon)
      .map(p => ({
        day: p.day,
        price: Number((p.price * ratio).toFixed(2)),
      }));
  }, [empirical.closestHistoricalRun, currentPrice, horizon]);

  // Determine min and max price across historical candles, target price, and trajectory
  const { minPrice, maxPrice } = useMemo(() => {
    let min = currentPrice;
    let max = currentPrice;

    historicalSlice.forEach(c => {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;
    });

    if (targetPrice < min) min = targetPrice;
    if (targetPrice > max) max = targetPrice;

    trajectoryBands.forEach(b => {
      if (b.lowerATRBand < min) min = b.lowerATRBand;
      if (b.upperATRBand > max) max = b.upperATRBand;
    });

    analogPoints.forEach(p => {
      if (p.price < min) min = p.price;
      if (p.price > max) max = p.price;
    });

    const padding = (max - min) * 0.08 || 10;
    return {
      minPrice: Math.max(0, min - padding),
      maxPrice: max + padding,
    };
  }, [historicalSlice, currentPrice, targetPrice, trajectoryBands, analogPoints]);

  const width = 850;
  const height = 360;
  const paddingLeft = 60;
  const paddingRight = 80;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const historyW = chartW * 0.38;
  const futureW = chartW * 0.62;
  const zeroX = paddingLeft + historyW;

  const getY = React.useCallback(
    (val: number) => {
      if (maxPrice <= minPrice) return height / 2;
      return paddingTop + chartH * (1 - (val - minPrice) / (maxPrice - minPrice));
    },
    [maxPrice, minPrice, height, paddingTop, chartH]
  );

  const getHistoryX = React.useCallback(
    (idx: number) => {
      const total = historicalSlice.length - 1 || 1;
      return paddingLeft + (idx / total) * historyW;
    },
    [historicalSlice.length, paddingLeft, historyW]
  );

  const getFutureX = React.useCallback(
    (day: number) => {
      return zeroX + (day / horizon) * futureW;
    },
    [zeroX, horizon, futureW]
  );

  // SVG Paths
  const historyPoints = historicalSlice.map((c, i) => `${getHistoryX(i)},${getY(c.close)}`).join(' ');
  const historyAreaPoints = `${getHistoryX(0)},${getY(minPrice)} ` +
    historyPoints +
    ` ${getHistoryX(historicalSlice.length - 1)},${getY(minPrice)}`;

  // ATR Real Volatility Channel Area (Upper ATR to Lower ATR)
  const atrChannelPoints = useMemo(() => {
    if (trajectoryBands.length === 0) return '';
    const upper = trajectoryBands.map(b => `${getFutureX(b.day)},${getY(b.upperATRBand)}`);
    const lower = [...trajectoryBands].reverse().map(b => `${getFutureX(b.day)},${getY(b.lowerATRBand)}`);
    return `${upper.join(' ')} ${lower.join(' ')}`;
  }, [trajectoryBands, getFutureX, getY]);

  // Real Median Empirical Path
  const medianPath = useMemo(() => {
    if (trajectoryBands.length === 0) return '';
    return trajectoryBands.map((b, i) => `${i === 0 ? 'M' : 'L'} ${getFutureX(b.day)} ${getY(b.medianPace)}`).join(' ');
  }, [trajectoryBands, getFutureX, getY]);

  // Real Closest Historical Analog Walk Path
  const analogPath = useMemo(() => {
    if (analogPoints.length === 0) return '';
    return analogPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getFutureX(p.day)} ${getY(p.price)}`).join(' ');
  }, [analogPoints, getFutureX, getY]);

  // Horizontal Grid Lines
  const gridSteps = 5;
  const gridLines = Array.from({ length: gridSteps + 1 }, (_, i) => {
    const val = minPrice + ((maxPrice - minPrice) * i) / gridSteps;
    return { val, y: getY(val) };
  });

  return (
    <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Chart Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Biểu Đồ Kênh Động Lượng Thực Tế & Đối Chiếu Lịch Sử (Real Trajectory)</span>
            </h3>
            <span className="text-xs text-zinc-500 hidden md:inline">
              · 100% Dữ liệu thực, không mô phỏng ngẫu nhiên
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Dải mờ màu lục lam là Kênh Biến Động ATR-14 Thực Tế. Đường màu tím là Quỹ Đạo Thực Tế của chu kỳ tương đồng nhất trong lịch sử SOL.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Historical Analog Toggle */}
          <button
            onClick={() => setShowHistoricalAnalog(!showHistoricalAnalog)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border transition-colors ${
              showHistoricalAnalog
                ? 'bg-zinc-800 text-purple-300 border-purple-500/40'
                : 'bg-zinc-950 text-zinc-500 border-zinc-800'
            }`}
            title="Bật/Tắt chu kỳ lịch sử tương đồng nhất"
          >
            {showHistoricalAnalog ? <Eye className="w-3.5 h-3.5 text-purple-400" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Chu kỳ lịch sử tương đồng</span>
          </button>

          {/* Horizon Selector */}
          <div className="flex items-center p-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono">
            {([30, 60, 90] as const).map(d => (
              <button
                key={d}
                onClick={() => setHorizon(d)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  horizon === d
                    ? 'bg-cyan-500 text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {d} Ngày
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="w-full overflow-x-auto select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[700px] font-mono text-[11px]"
        >
          <defs>
            <linearGradient id="realHistGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id="realAtrGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.06" />
            </linearGradient>

            <filter id="goldGlowReal" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#f59e0b" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Grid lines & Price Labels */}
          {gridLines.map((line, idx) => (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={line.y}
                x2={width - paddingRight}
                y2={line.y}
                stroke="#27272a"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text
                x={width - paddingRight + 8}
                y={line.y + 4}
                fill="#71717a"
                fontSize="10"
              >
                ${line.val.toFixed(1)}
              </text>
            </g>
          ))}

          {/* Vertical Separator: Today (Day 0) */}
          <line
            x1={zeroX}
            y1={paddingTop}
            x2={zeroX}
            y2={height - paddingBottom}
            stroke="#52525b"
            strokeDasharray="4 4"
            strokeWidth="1.5"
          />
          <text
            x={zeroX}
            y={paddingTop - 8}
            fill="#a1a1aa"
            textAnchor="middle"
            fontSize="10"
            fontWeight="bold"
          >
            HIỆN TẠI (DAY 0)
          </text>

          {/* Forecast Horizon Label */}
          <text
            x={zeroX + futureW}
            y={paddingTop - 8}
            fill="#06b6d4"
            textAnchor="end"
            fontSize="10"
            fontWeight="bold"
          >
            +{horizon} NGÀY TỚI
          </text>

          {/* Real ATR Channel Area */}
          {atrChannelPoints && (
            <polygon
              points={atrChannelPoints}
              fill="url(#realAtrGrad)"
            />
          )}

          {/* Closest Real Historical Analog Walk */}
          {showHistoricalAnalog && analogPath && (
            <path
              d={analogPath}
              fill="none"
              stroke="#c084fc"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          )}

          {/* Real Median Trajectory */}
          {medianPath && (
            <path
              d={medianPath}
              fill="none"
              stroke="#22d3ee"
              strokeWidth="2"
              strokeDasharray="4 2"
            />
          )}

          {/* Historical Close Price Area & Line */}
          <polygon points={historyAreaPoints} fill="url(#realHistGrad)" />
          <polyline
            points={historyPoints}
            fill="none"
            stroke="#818cf8"
            strokeWidth="2"
          />

          {/* Current Price Dot & Horizontal Reference */}
          <line
            x1={zeroX - 30}
            y1={getY(currentPrice)}
            x2={zeroX + futureW}
            y2={getY(currentPrice)}
            stroke="#a1a1aa"
            strokeOpacity="0.4"
            strokeDasharray="2 2"
            strokeWidth="1"
          />
          <circle
            cx={zeroX}
            cy={getY(currentPrice)}
            r="4.5"
            fill="#6366f1"
            stroke="#ffffff"
            strokeWidth="1.5"
          />

          {/* Target Price Line (Gold Glow) */}
          <line
            x1={paddingLeft}
            y1={getY(targetPrice)}
            x2={width - paddingRight + 5}
            y2={getY(targetPrice)}
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="6 4"
            filter="url(#goldGlowReal)"
          />

          {/* Target Price Flag / Badge */}
          <g transform={`translate(${width - paddingRight + 5}, ${getY(targetPrice) - 11})`}>
            <rect
              width="68"
              height="22"
              rx="4"
              fill="#f59e0b"
              filter="url(#goldGlowReal)"
            />
            <text
              x="34"
              y="14"
              fill="#09090b"
              fontWeight="bold"
              fontSize="10"
              textAnchor="middle"
            >
              ${targetPrice.toFixed(1)}
            </text>
          </g>

          {/* Bottom X-Axis Labels */}
          <text x={paddingLeft} y={height - paddingBottom + 18} fill="#71717a" fontSize="10">
            -45 phiên trước
          </text>
          <text x={zeroX} y={height - paddingBottom + 18} fill="#e4e4e7" fontSize="10" textAnchor="middle" fontWeight="bold">
            Hôm nay (${currentPrice.toFixed(1)})
          </text>
          <text x={zeroX + futureW * 0.33} y={height - paddingBottom + 18} fill="#71717a" fontSize="10" textAnchor="middle">
            +{Math.round(horizon * 0.33)}d
          </text>
          <text x={zeroX + futureW * 0.66} y={height - paddingBottom + 18} fill="#71717a" fontSize="10" textAnchor="middle">
            +{Math.round(horizon * 0.66)}d
          </text>
          <text x={zeroX + futureW} y={height - paddingBottom + 18} fill="#06b6d4" fontSize="10" textAnchor="middle" fontWeight="bold">
            +{horizon}d
          </text>
        </svg>
      </div>

      {/* Legend & Interpretive Guide */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-zinc-800 text-xs text-zinc-400">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-indigo-400 inline-block" />
            <span>Giá nến lịch sử</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-amber-400 border-dashed border-b border-amber-400 inline-block" />
            <span className="text-amber-300 font-medium">Mục tiêu: ${targetPrice.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-cyan-400 border-dashed border-b border-cyan-400 inline-block" />
            <span>Tốc độ trung vị thực tế</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-purple-400 inline-block" />
            <span className="text-purple-300 font-medium">
              Đường đi lịch sử tương đồng ({empirical.closestHistoricalRun?.daysTaken ?? 'N/A'} ngày)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-cyan-500/25 inline-block" />
            <span>Kênh biên độ ATR-14 Thực</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-zinc-500">
          <Info className="w-3.5 h-3.5" />
          <span>Biên độ mở rộng trực tiếp theo kênh ATR-14 thực tế của SOL</span>
        </div>
      </div>
    </div>
  );
};
