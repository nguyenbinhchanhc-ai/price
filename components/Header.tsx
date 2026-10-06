'use client';

import React from 'react';
import { MarketSummary } from '@/lib/types';
import { TrendingUp, TrendingDown, RefreshCw, Sliders, Zap, Flame, BarChart2 } from 'lucide-react';

interface HeaderProps {
  summary: MarketSummary | null;
  loading: boolean;
  onRefresh: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  summary,
  loading,
  onRefresh,
  onOpenSettings,
}) => {
  const isPositive = (summary?.changePercent24h ?? 0) >= 0;

  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand & Market Identity */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400 text-lg">
                ◎
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-semibold text-zinc-100 tracking-tight">
                SOL/USDT Terminal Định Lượng Chuyên Sâu
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Binance Live
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Sổ Lệnh · Radar Cá Voi · Cụm Thanh Lý & OI · FVG & Order Block · Tin Tức & Xúc Tác
            </p>
          </div>
        </div>

        {/* Live Price & Ticker Metrics */}
        {summary ? (
          <div className="flex items-center flex-wrap gap-3 sm:gap-5 text-xs">
            {/* Price Box */}
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold font-mono text-zinc-50 tracking-tight">
                ${summary.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span
                className={`flex items-center gap-0.5 font-semibold text-xs ${
                  isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {isPositive ? '+' : ''}
                {summary.changePercent24h.toFixed(2)}%
              </span>
            </div>

            {/* Separator */}
            <div className="hidden sm:block h-6 w-px bg-zinc-800" />

            {/* 24h High/Low */}
            <div className="hidden sm:flex flex-col text-zinc-400 text-[11px]">
              <span className="text-zinc-500 uppercase tracking-wider font-medium">24h Cao / Thấp</span>
              <span className="font-mono text-zinc-200">
                ${summary.high24h.toFixed(2)} / ${summary.low24h.toFixed(2)}
              </span>
            </div>

            {/* Open Interest (OI) */}
            {summary.openInterestUsdt !== undefined && (
              <div className="hidden md:flex flex-col text-zinc-400 text-[11px]">
                <span className="text-zinc-500 uppercase tracking-wider font-medium flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" />
                  Hợp Đồng Mở (OI)
                </span>
                <span className="font-mono text-zinc-200">
                  ${(summary.openInterestUsdt / 1_000_000).toFixed(1)}M
                </span>
              </div>
            )}

            {/* Long/Short Ratio */}
            {summary.longShortRatio !== undefined && (
              <div className="hidden lg:flex flex-col text-zinc-400 text-[11px]">
                <span className="text-zinc-500 uppercase tracking-wider font-medium flex items-center gap-1">
                  <BarChart2 className="w-3 h-3 text-cyan-400" />
                  Long/Short
                </span>
                <span className="font-mono text-emerald-400 font-semibold">
                  {summary.longShortRatio.toFixed(2)}x
                </span>
              </div>
            )}

            {/* Real Funding Rate */}
            {summary.fundingRate !== undefined && (
              <div className="hidden xl:flex flex-col text-zinc-400 text-[11px]">
                <span className="text-zinc-500 uppercase tracking-wider font-medium flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  Funding 8h
                </span>
                <span className={`font-mono ${summary.fundingRate >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {summary.fundingRate >= 0 ? '+' : ''}{(summary.fundingRate * 100).toFixed(4)}%
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
              <button
                onClick={onRefresh}
                disabled={loading}
                title="Làm mới dữ liệu từ Binance"
                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
                <span className="text-[11px] hidden sm:inline">Làm mới</span>
              </button>

              <button
                onClick={onOpenSettings}
                title="Tùy chỉnh cơ chế & tham số thực tế"
                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span className="text-[11px] hidden sm:inline">Cơ chế</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-xs text-zinc-500 flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            Đang đồng bộ trực tiếp từ sàn Binance...
          </div>
        )}
      </div>
    </header>
  );
};
