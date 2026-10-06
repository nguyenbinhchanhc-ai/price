'use client';

import React from 'react';
import { TechnicalIndicators } from '@/lib/types';
import { Target, ArrowUpRight, ArrowDownRight, Sparkles, Layers } from 'lucide-react';

interface TargetPriceInputProps {
  currentPrice: number;
  targetPrice: number;
  onTargetChange: (price: number) => void;
  indicators: TechnicalIndicators | null;
}

export const TargetPriceInput: React.FC<TargetPriceInputProps> = ({
  currentPrice,
  targetPrice,
  onTargetChange,
  indicators,
}) => {
  const isUp = targetPrice >= currentPrice;
  const delta = targetPrice - currentPrice;
  const deltaPercent = currentPrice > 0 ? (delta / currentPrice) * 100 : 0;
  const atrRatio = indicators && indicators.atr14 > 0 ? Math.abs(delta) / indicators.atr14 : 0;

  // Percentage presets based on current price
  const percentPresets = [
    { label: '+5%', value: Number((currentPrice * 1.05).toFixed(2)) },
    { label: '+10%', value: Number((currentPrice * 1.10).toFixed(2)) },
    { label: '+20%', value: Number((currentPrice * 1.20).toFixed(2)) },
    { label: '+35%', value: Number((currentPrice * 1.35).toFixed(2)) },
    { label: '+50%', value: Number((currentPrice * 1.50).toFixed(2)) },
    { label: '-10%', value: Number((currentPrice * 0.90).toFixed(2)) },
    { label: '-20%', value: Number((currentPrice * 0.80).toFixed(2)) },
  ];

  // Technical level presets
  const techPresets = indicators
    ? [
        { label: 'R1 Kháng cự', price: indicators.pivotPoints.r1 },
        { label: 'R2 Đột phá', price: indicators.pivotPoints.r2 },
        { label: 'BB Upper', price: indicators.bollingerBands.upper },
        { label: 'S1 Hỗ trợ', price: indicators.pivotPoints.s1 },
        { label: 'Đỉnh ATH ($260)', price: 260.06 },
      ]
    : [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val > 0) {
      onTargetChange(val);
    }
  };

  const minSlider = Math.max(10, Math.floor(currentPrice * 0.5));
  const maxSlider = Math.ceil(Math.max(currentPrice * 2.2, 350));

  return (
    <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Decorative subtle background aura */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        {/* Left: Input & Key Direction */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="target-price-input" className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
              <Target className="w-4 h-4 text-cyan-400" />
              <span>Nhập Mức Giá Mục Tiêu (Target Price)</span>
            </label>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-zinc-400">Giá hiện tại:</span>
              <span className="font-mono font-medium text-zinc-200">${currentPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Primary Input Box */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 font-mono text-lg font-bold">
                $
              </div>
              <input
                id="target-price-input"
                type="number"
                step="0.1"
                min="1"
                max="5000"
                value={targetPrice || ''}
                onChange={handleInputChange}
                placeholder="Nhập giá mục tiêu..."
                className="w-full pl-9 pr-24 py-3 bg-zinc-950 border border-zinc-700/80 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 rounded-xl text-xl sm:text-2xl font-mono font-bold text-zinc-50 placeholder-zinc-600 transition-all outline-none"
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <span className="text-xs font-mono font-medium text-zinc-500">USDT</span>
              </div>
            </div>

            {/* Direction & Distance Badge */}
            <div
              className={`flex flex-col justify-center px-4 py-2.5 rounded-xl border min-w-[130px] sm:min-w-[150px] ${
                isUp
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider">
                {isUp ? (
                  <>
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Mục tiêu Tăng</span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
                    <span>Mục tiêu Giảm</span>
                  </>
                )}
              </div>
              <div className="font-mono font-bold text-sm sm:text-base mt-0.5">
                {isUp ? '+' : ''}
                {delta.toFixed(2)} ({deltaPercent > 0 ? '+' : ''}
                {deltaPercent.toFixed(1)}%)
              </div>
            </div>
          </div>

          {/* Slider for smooth dragging */}
          <div className="space-y-1 pt-1">
            <input
              type="range"
              min={minSlider}
              max={maxSlider}
              step="1"
              value={targetPrice}
              onChange={e => onTargetChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>Min: ${minSlider}</span>
              <span className="text-zinc-400 font-medium">Khoảng cách: {atrRatio.toFixed(1)}x ATR (14d)</span>
              <span>Max: ${maxSlider}</span>
            </div>
          </div>
        </div>

        {/* Right: Presets and Technical Snaps */}
        <div className="lg:w-80 flex flex-col justify-between space-y-3.5 pt-2 lg:pt-0 lg:border-l lg:border-zinc-800 lg:pl-6">
          {/* Quick % buttons */}
          <div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Phần trăm nhanh:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {percentPresets.map(preset => {
                const isSelected = Math.abs(targetPrice - preset.value) < 0.5;
                const isPresetUp = preset.label.startsWith('+');
                return (
                  <button
                    key={preset.label}
                    onClick={() => onTargetChange(preset.value)}
                    className={`px-2.5 py-1 text-xs font-mono font-medium rounded-lg transition-all ${
                      isSelected
                        ? 'bg-cyan-500 text-zinc-950 font-bold shadow-md shadow-cyan-500/20'
                        : isPresetUp
                        ? 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white'
                        : 'bg-zinc-800/80 hover:bg-zinc-700 text-rose-300 hover:text-rose-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Technical Level Snaps */}
          {techPresets.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-2">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Mốc kỹ thuật trọng yếu:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {techPresets.map(level => {
                  const isSelected = Math.abs(targetPrice - level.price) < 0.5;
                  return (
                    <button
                      key={level.label}
                      onClick={() => onTargetChange(level.price)}
                      className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-zinc-100 text-zinc-950 border-zinc-100 font-bold'
                          : 'bg-zinc-950/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-zinc-800'
                      }`}
                    >
                      <span>{level.label}</span>
                      <span className="font-mono ml-1 text-[11px] opacity-75">${level.price.toFixed(0)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
