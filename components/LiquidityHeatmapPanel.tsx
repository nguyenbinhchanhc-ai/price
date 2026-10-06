'use client';

import React, { useState } from 'react';
import { LiquidityZone, DerivativesMetrics } from '@/lib/types';
import {
  Flame,
  Layers,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Radio,
  Zap,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  BarChart2,
} from 'lucide-react';

interface LiquidityHeatmapPanelProps {
  liquidityZones: LiquidityZone[];
  derivatives: DerivativesMetrics | null;
  currentPrice: number;
  targetPrice: number;
  onRefreshLiquidity?: () => void;
  isRefreshing?: boolean;
}

export const LiquidityHeatmapPanel: React.FC<LiquidityHeatmapPanelProps> = ({
  liquidityZones,
  derivatives,
  currentPrice,
  targetPrice,
  onRefreshLiquidity,
  isRefreshing = false,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'DERIVATIVES' | 'ORDER_BOOK'>('ALL');
  const isUp = targetPrice >= currentPrice;

  // Filter zones according to selection
  const filteredZones = liquidityZones.filter((zone) => {
    if (filterType === 'DERIVATIVES') {
      return zone.type.includes('Liquidation Pool');
    }
    if (filterType === 'ORDER_BOOK') {
      return zone.type.includes('Order Book');
    }
    return true;
  });

  // Calculate liquidity stats
  const shortPools = liquidityZones.filter((z) => z.type === 'Short Liquidation Pool');
  const longPools = liquidityZones.filter((z) => z.type === 'Long Liquidation Pool');
  const totalShortUsdt = shortPools.reduce((acc, z) => acc + z.estimatedVolumeUsdt, 0);
  const totalLongUsdt = longPools.reduce((acc, z) => acc + z.estimatedVolumeUsdt, 0);
  const highestMagnetZone = [...liquidityZones].sort((a, b) => b.magnetStrength - a.magnetStrength)[0];

  return (
    <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Flame className="w-5 h-5 text-amber-400 shrink-0" />
            <h3 className="text-sm sm:text-base font-semibold text-zinc-100">
              Vùng Thanh Khoản & Cụm Thanh Lý Phái Sinh Realtime (Liquidation Heatmap & L2 Walls)
            </h3>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              LIVE REALTIME
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Tổng hợp dữ liệu sổ lệnh Binance L2 thực tế & các bể thanh lý đòn bẩy 100x, 50x, 25x, 10x theo thời gian thực
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {derivatives && (
            <div className="text-xs font-mono bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-300">
              OI: <strong className="text-cyan-400">${(derivatives.openInterestUsdt / 1_000_000).toFixed(1)}M</strong>
              <span className="text-zinc-500 text-[11px] ml-1">({derivatives.openInterestSol.toLocaleString()} SOL)</span>
            </div>
          )}

          {onRefreshLiquidity && (
            <button
              onClick={onRefreshLiquidity}
              disabled={isRefreshing}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-lg border border-zinc-700 transition-all disabled:opacity-50"
              title="Làm mới sổ lệnh & thanh lý ngay lập tức"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Cập nhật</span>
            </button>
          )}
        </div>
      </div>

      {/* Realtime Liquidity Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-zinc-950/80 rounded-xl border border-zinc-800/70 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            <span>Thanh Lý Short (Phía Trên)</span>
          </div>
          <div className="font-mono font-bold text-base text-rose-400">
            ${(totalShortUsdt / 1_000_000).toFixed(1)}M
          </div>
          <p className="text-[10px] text-zinc-500">Nam châm hút giá khi phe Mua đẩy lệnh</p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Thanh Lý Long (Phía Dưới)</span>
          </div>
          <div className="font-mono font-bold text-base text-emerald-400">
            ${(totalLongUsdt / 1_000_000).toFixed(1)}M
          </div>
          <p className="text-[10px] text-zinc-500">Vùng quét dừng lỗ khi thị trường chỉnh</p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
            <Target className="w-3.5 h-3.5 text-amber-400" />
            <span>Điểm Hút Giá Cao Nhất</span>
          </div>
          <div className="font-mono font-bold text-base text-amber-300">
            ${highestMagnetZone?.priceLevel.toFixed(2) || currentPrice.toFixed(2)}
          </div>
          <p className="text-[10px] text-zinc-500">
            Lực hút {highestMagnetZone?.magnetStrength || 0}% ({highestMagnetZone?.distancePercent}% từ thị giá)
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Funding Rate Phái Sinh</span>
          </div>
          <div className="font-mono font-bold text-base text-cyan-300">
            {derivatives ? `${(derivatives.fundingRate * 100).toFixed(4)}%` : '0.0100%'}
          </div>
          <p className="text-[10px] text-zinc-500">
            {derivatives?.marketRegime || 'Healthy Leveraged Growth'}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-zinc-800/50">
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1 rounded-lg font-medium text-xs transition-colors ${
              filterType === 'ALL'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
                : 'bg-zinc-950/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            Tất Cả Vùng Thanh Khoản ({liquidityZones.length})
          </button>
          <button
            onClick={() => setFilterType('DERIVATIVES')}
            className={`px-3 py-1 rounded-lg font-medium text-xs transition-colors ${
              filterType === 'DERIVATIVES'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold'
                : 'bg-zinc-950/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            Bể Thanh Lý Phái Sinh ({liquidityZones.filter((z) => z.type.includes('Liquidation')).length})
          </button>
          <button
            onClick={() => setFilterType('ORDER_BOOK')}
            className={`px-3 py-1 rounded-lg font-medium text-xs transition-colors ${
              filterType === 'ORDER_BOOK'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold'
                : 'bg-zinc-950/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            Tường Sổ Lệnh L2 ({liquidityZones.filter((z) => z.type.includes('Order Book')).length})
          </button>
        </div>

        <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Thị giá SOL hiện tại: <strong className="text-zinc-200 font-bold">${currentPrice.toFixed(2)}</strong></span>
        </div>
      </div>

      {/* Liquidation Clusters Heatmap Ladder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredZones.map((zone) => {
          const isTarget = zone.type === 'Breakout Trigger';
          const isShortLiq = zone.type === 'Short Liquidation Pool';
          const isLongLiq = zone.type === 'Long Liquidation Pool';
          const isBidWall = zone.type === 'Order Book Bid Wall';
          const isAskWall = zone.type === 'Order Book Ask Wall';
          const isAbove = zone.priceLevel > currentPrice;

          return (
            <div
              key={zone.id}
              className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 text-xs ${
                isTarget
                  ? 'bg-cyan-950/30 border-cyan-500/40 shadow-sm'
                  : isBidWall
                  ? 'bg-emerald-950/20 border-emerald-500/40'
                  : isAskWall
                  ? 'bg-rose-950/20 border-rose-500/40'
                  : isShortLiq
                  ? 'bg-zinc-950/70 border-rose-500/25 hover:border-rose-500/50'
                  : 'bg-zinc-950/70 border-emerald-500/25 hover:border-emerald-500/50'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isTarget
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : isBidWall
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : isAskWall
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : isShortLiq
                        ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {zone.type}
                  </span>

                  <span className="font-mono text-zinc-400 text-[11px] font-semibold">
                    {isAbove ? '+' : ''}{zone.distancePercent}%
                  </span>

                  {zone.density === 'Extreme' && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      Mật độ dày
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-lg font-bold text-zinc-100">
                    ${zone.priceLevel.toFixed(2)}
                  </span>
                  {zone.solQuantity && (
                    <span className="text-[11px] text-zinc-400 font-mono">
                      ({zone.solQuantity.toLocaleString()} SOL)
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-zinc-400">
                  Quy mô ước tính:{' '}
                  <strong className="text-zinc-200 font-mono">
                    ${(zone.estimatedVolumeUsdt / 1_000_000).toFixed(2)}M USDT
                  </strong>
                </p>
              </div>

              <div className="text-right space-y-1 shrink-0">
                <div className="text-[10px] text-zinc-400 font-mono">Lực hút giá</div>
                <div className="font-mono font-bold text-sm text-amber-300">
                  {zone.magnetStrength}%
                </div>
                <div className="w-20 bg-zinc-800 h-2 rounded-full overflow-hidden ml-auto">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      zone.magnetStrength >= 80
                        ? 'bg-amber-400'
                        : zone.magnetStrength >= 50
                        ? 'bg-cyan-400'
                        : 'bg-zinc-500'
                    }`}
                    style={{ width: `${zone.magnetStrength}%` }}
                  />
                </div>
                <span className="text-[9px] text-zinc-500 font-mono">
                  {zone.source === 'ORDER_BOOK_L2' ? 'Sổ lệnh L2' : zone.source === 'TARGET_TRIGGER' ? 'Mục tiêu' : 'Phái sinh OI'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
