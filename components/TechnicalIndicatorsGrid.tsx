'use client';

import React from 'react';
import { TechnicalIndicators } from '@/lib/types';
import { Activity, Gauge, TrendingUp, GitFork, ShieldCheck, Zap, Waves, Layers } from 'lucide-react';

interface TechnicalIndicatorsGridProps {
  indicators: TechnicalIndicators;
  currentPrice: number;
}

export const TechnicalIndicatorsGrid: React.FC<TechnicalIndicatorsGridProps> = ({
  indicators,
  currentPrice,
}) => {
  const {
    rsi14,
    rsiSignal,
    stochRsi,
    macd,
    bollingerBands,
    vwap,
    mfi14,
    mfiSignal,
    obv,
    atr14,
    atrPercent,
    volatilityRegime,
    ema20,
    ema50,
    ema200,
    sma20,
    trendAlignment,
    pivotPoints,
    fibonacci,
    annualizedVol,
  } = indicators;

  const trendBadgeColor =
    trendAlignment === 'Strong Bullish'
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      : trendAlignment === 'Bullish'
      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
      : trendAlignment === 'Strong Bearish'
      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
      : 'bg-zinc-800 text-zinc-300 border-zinc-700';

  return (
    <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Chỉ Số Kỹ Thuật Chuyên Sâu (Quantitative Dashboard)</span>
          </h3>
          <p className="text-xs text-zinc-400">
            Dữ liệu tính toán từ chuỗi nến thời gian thực để cấp tham số cho mô hình xác suất
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">Cấu trúc xu hướng:</span>
          <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${trendBadgeColor}`}>
            {trendAlignment}
          </span>
        </div>
      </div>

      {/* Grid of indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. RSI (14) & StochRSI */}
        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-indigo-400" />
              RSI & StochRSI
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                rsi14 >= 70
                  ? 'bg-rose-500/20 text-rose-300'
                  : rsi14 <= 30
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-zinc-800 text-zinc-300'
              }`}
            >
              {rsiSignal}
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl font-bold font-mono text-zinc-100">{rsi14}</span>
            <span className="text-xs text-zinc-400 font-mono">
              Stoch %K: {stochRsi.k}
            </span>
          </div>

          <div className="space-y-1">
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  rsi14 >= 70 ? 'bg-rose-400' : rsi14 <= 30 ? 'bg-emerald-400' : 'bg-indigo-400'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, rsi14))}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-zinc-500">
              <span>0 Quá bán</span>
              <span>50 Trung lập</span>
              <span>100 Quá mua</span>
            </div>
          </div>
        </div>

        {/* 2. MACD (12, 26, 9) */}
        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              MACD (12, 26, 9)
            </span>
            <span className="text-[10px] font-mono text-cyan-400">
              {macd.trend}
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl font-bold font-mono text-zinc-100">
              {macd.histogram > 0 ? '+' : ''}{macd.histogram}
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              Signal: {macd.signalLine}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs text-zinc-400 pt-1">
            <span>MACD Line: <strong className="font-mono text-zinc-200">{macd.macdLine}</strong></span>
            <span className={macd.histogram >= 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
              {macd.histogram >= 0 ? 'Histo Tăng' : 'Histo Giảm'}
            </span>
          </div>
        </div>

        {/* 3. Bollinger Bands & Squeeze */}
        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Bollinger Bands
            </span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                bollingerBands.isSqueeze
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                  : 'text-zinc-400'
              }`}
            >
              {bollingerBands.isSqueeze ? '⚡ Squeeze Nén' : `Độ mở: ${bollingerBands.bandwidth}%`}
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div className="space-y-0.5">
              <div className="text-[10px] text-zinc-500">Dải trên (Upper)</div>
              <div className="text-base font-bold font-mono text-zinc-200">${bollingerBands.upper}</div>
            </div>
            <div className="space-y-0.5 text-right">
              <div className="text-[10px] text-zinc-500">Dải dưới (Lower)</div>
              <div className="text-base font-bold font-mono text-zinc-200">${bollingerBands.lower}</div>
            </div>
          </div>

          <div className="text-xs text-zinc-400 flex justify-between items-center pt-1 border-t border-zinc-800/60">
            <span>Vị trí giá %B:</span>
            <span className="font-mono font-medium text-cyan-400">
              {(bollingerBands.percentB * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* 4. ATR (14) & Volatility Regime */}
        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-violet-400" />
              ATR (14) & Trạng Thái Vol
            </span>
            <span className="text-[10px] font-mono text-emerald-400">
              {atrPercent}% / ngày
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl font-bold font-mono text-zinc-100">
              ${atr14}
            </span>
            <span className="text-xs text-zinc-300 font-medium">
              {volatilityRegime}
            </span>
          </div>

          <div className="text-xs text-zinc-400 flex justify-between items-center pt-1 border-t border-zinc-800/60">
            <span>Vol năm (σ):</span>
            <span className="font-mono text-zinc-200 font-bold">
              {(annualizedVol * 100).toFixed(0)}% / năm
            </span>
          </div>
        </div>
      </div>

      {/* Moving Averages Ribbon, Fibonacci & Pivot Points breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* Moving Averages Ribbon */}
        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
              <GitFork className="w-3.5 h-3.5 text-cyan-400" />
              Đường Trung Bình Động (MA)
            </span>
            <span className="text-[11px] text-zinc-500 font-mono">So với giá</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800/80">
              <div>
                <span className="text-zinc-400 font-mono text-[11px]">EMA 20 (Ngắn):</span>
                <span className="font-mono font-bold text-zinc-100 ml-1.5">${ema20}</span>
              </div>
              <span className={`text-[10px] font-medium ${currentPrice >= ema20 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {currentPrice >= ema20 ? '▲ Trên' : '▼ Dưới'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800/80">
              <div>
                <span className="text-zinc-400 font-mono text-[11px]">EMA 50 (Trung):</span>
                <span className="font-mono font-bold text-zinc-100 ml-1.5">${ema50}</span>
              </div>
              <span className={`text-[10px] font-medium ${currentPrice >= ema50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {currentPrice >= ema50 ? '▲ Trên' : '▼ Dưới'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800/80">
              <div>
                <span className="text-zinc-400 font-mono text-[11px]">EMA 200 (Dài):</span>
                <span className="font-mono font-bold text-zinc-100 ml-1.5">${ema200}</span>
              </div>
              <span className={`text-[10px] font-medium ${currentPrice >= ema200 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {currentPrice >= ema200 ? '▲ Bull Trend' : '▼ Bear Trend'}
              </span>
            </div>
          </div>
        </div>

        {/* Fibonacci Retracements & Extensions */}
        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              Mốc Fibonacci Then Chốt
            </span>
            <span className="text-[11px] font-mono text-zinc-500">45d Swing</span>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between items-center p-1.5 rounded bg-zinc-900/60 border border-zinc-800/60">
              <span className="text-zinc-400">Fib 0.382 (Đỡ):</span>
              <span className="text-zinc-200">${fibonacci.fib382}</span>
            </div>
            <div className="flex justify-between items-center p-1.5 rounded bg-amber-950/20 border border-amber-500/30">
              <span className="text-amber-300 font-semibold">Fib 0.618 (Golden Pocket):</span>
              <span className="text-amber-200 font-bold">${fibonacci.fib618}</span>
            </div>
            <div className="flex justify-between items-center p-1.5 rounded bg-zinc-900/60 border border-zinc-800/60">
              <span className="text-zinc-400">Fib 0.786:</span>
              <span className="text-zinc-200">${fibonacci.fib786}</span>
            </div>
            <div className="flex justify-between items-center p-1.5 rounded bg-cyan-950/20 border border-cyan-800/30">
              <span className="text-cyan-300 font-semibold">Fib 1.618 Extension:</span>
              <span className="text-cyan-200 font-bold">${fibonacci.fib1618}</span>
            </div>
          </div>
        </div>

        {/* Pivot Points Table */}
        <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-200">
              Mốc Xoay & Hỗ Trợ / Kháng Cự
            </span>
            <span className="text-[11px] font-mono text-cyan-400">Pivot (P): ${pivotPoints.pivot}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="space-y-1.5 p-2 bg-zinc-900/60 rounded-lg border border-zinc-800/60">
              <div className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider">Kháng Cự (R)</div>
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-zinc-400">R1:</span>
                <span className="text-zinc-200">${pivotPoints.r1}</span>
              </div>
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-zinc-400">R2:</span>
                <span className="text-zinc-200">${pivotPoints.r2}</span>
              </div>
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-zinc-400">R3:</span>
                <span className="text-zinc-200">${pivotPoints.r3}</span>
              </div>
            </div>

            <div className="space-y-1.5 p-2 bg-zinc-900/60 rounded-lg border border-zinc-800/60">
              <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Hỗ Trợ (S)</div>
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-zinc-400">S1:</span>
                <span className="text-zinc-200">${pivotPoints.s1}</span>
              </div>
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-zinc-400">S2:</span>
                <span className="text-zinc-200">${pivotPoints.s2}</span>
              </div>
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-zinc-400">S3:</span>
                <span className="text-zinc-200">${pivotPoints.s3}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
