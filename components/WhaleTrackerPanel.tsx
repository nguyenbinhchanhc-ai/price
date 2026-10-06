'use client';

import React, { useState } from 'react';
import { WhaleFlowSummary, WhaleClusterBlock } from '@/lib/types';
import {
  Fish,
  TrendingUp,
  TrendingDown,
  Layers,
  Clock,
  Zap,
  ShieldCheck,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  BarChart3,
  SlidersHorizontal,
  Info,
} from 'lucide-react';

interface WhaleTrackerPanelProps {
  whaleData: WhaleFlowSummary | null;
  currentPrice: number;
}

type WhaleTab = 'clusters' | 'timeframes' | 'zones' | 'rawTicks';

export const WhaleTrackerPanel: React.FC<WhaleTrackerPanelProps> = ({
  whaleData,
  currentPrice,
}) => {
  const [activeTab, setActiveTab] = useState<WhaleTab>('clusters');
  const [selectedStyleFilter, setSelectedStyleFilter] = useState<string>('ALL');

  if (!whaleData) return null;

  const {
    totalWhaleBuyUsdt,
    totalWhaleSellUsdt,
    netWhaleFlowUsdt,
    whaleBuyRatio,
    dominantSide,
    whaleImpactScore,
    totalSubOrdersAnalyzed,
    timeframes,
    tierBreakdown,
    whaleClusters,
    accumulationZones,
    recentWhaleTrades,
  } = whaleData;

  const isAccumulation = dominantSide === 'ACCUMULATION';
  const isDistribution = dominantSide === 'DISTRIBUTION';

  // Filter clusters by execution style if selected
  const filteredClusters = whaleClusters.filter(c => {
    if (selectedStyleFilter === 'ALL') return true;
    return c.executionStyle === selectedStyleFilter;
  });

  return (
    <div className="bg-zinc-900/80 border border-zinc-800/90 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5">
      {/* Panel Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800/70 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Fish className="w-5 h-5 shrink-0" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-zinc-100">
                  Radar Phân Cụm Lệnh & Dòng Tiền Cá Voi (Whale Order Clustering)
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  Hợp Nhất Đa Lệnh
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Cá voi & tổ chức gom/xả bằng thuật toán TWAP / Iceberg chia nhỏ thành hàng trăm lệnh con (sub-orders). Hệ thống tự động phân cụm và tổng hợp đa chu kỳ thay vì chỉ nhìn lệnh tức thời.
              </p>
            </div>
          </div>
        </div>

        {/* Global Net Status Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-2 shadow-sm ${
              isAccumulation
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-emerald-950/30'
                : isDistribution
                ? 'bg-rose-500/15 text-rose-400 border-rose-500/30 shadow-rose-950/30'
                : 'bg-zinc-800/80 text-zinc-300 border-zinc-700'
            }`}
          >
            {isAccumulation ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : isDistribution ? (
              <TrendingDown className="w-4 h-4 text-rose-400" />
            ) : (
              <Activity className="w-4 h-4 text-zinc-400" />
            )}
            <span>
              {isAccumulation
                ? 'Cá Voi Đang Gom Hàng Ròng (Net Accumulation)'
                : isDistribution
                ? 'Cá Voi Đang Xả Hàng Ròng (Net Distribution)'
                : 'Dòng Tiền Cá Voi Đang Cân Bằng'}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Core Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: 24h Net Flow */}
        <div className="p-3.5 bg-zinc-950/70 rounded-xl border border-zinc-800/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-400 font-medium">Dòng Tiền Cá Voi 24H</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
              Tổng Hợp 24h
            </span>
          </div>
          <div
            className={`font-mono font-bold text-xl flex items-center gap-1 ${
              netWhaleFlowUsdt >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {netWhaleFlowUsdt >= 0 ? '+' : ''}
            ${(netWhaleFlowUsdt / 1_000_000).toFixed(2)}M USDT
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono text-zinc-400">
              <span className="text-emerald-400">{whaleBuyRatio}% Mua</span>
              <span className="text-rose-400">{(100 - whaleBuyRatio).toFixed(1)}% Bán</span>
            </div>
            <div className="w-full bg-rose-500/30 h-1.5 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${whaleBuyRatio}%` }}
              />
            </div>
          </div>
          <div className="text-[10px] text-zinc-500 pt-0.5">
            Mua: ${(totalWhaleBuyUsdt / 1_000_000).toFixed(1)}M · Xả: ${(totalWhaleSellUsdt / 1_000_000).toFixed(1)}M
          </div>
        </div>

        {/* Card 2: Short-term Consensus (1H & 4H) */}
        <div className="p-3.5 bg-zinc-950/70 rounded-xl border border-zinc-800/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-400 font-medium">Biến Động Ngắn Hạn (1h & 4h)</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
              Multi-Timeframe
            </span>
          </div>
          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400">1 Giờ Qua:</span>
              <span
                className={`font-bold ${
                  timeframes['1h'].netFlowUsdt >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {timeframes['1h'].netFlowUsdt >= 0 ? '+' : ''}
                ${(timeframes['1h'].netFlowUsdt / 1_000_000).toFixed(2)}M ({timeframes['1h'].buyRatio}%)
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400">4 Giờ Qua:</span>
              <span
                className={`font-bold ${
                  timeframes['4h'].netFlowUsdt >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {timeframes['4h'].netFlowUsdt >= 0 ? '+' : ''}
                ${(timeframes['4h'].netFlowUsdt / 1_000_000).toFixed(2)}M ({timeframes['4h'].buyRatio}%)
              </span>
            </div>
          </div>
          <p className="text-[10px] text-zinc-500 pt-0.5">
            {timeframes['1h'].netFlowUsdt >= 0 && timeframes['4h'].netFlowUsdt >= 0
              ? 'Đồng thuận gom cả 1h & 4h'
              : timeframes['1h'].netFlowUsdt < 0 && timeframes['4h'].netFlowUsdt < 0
              ? 'Áp lực xả bao trùm cả 1h & 4h'
              : 'Phân kỳ dòng tiền giữa các khung giờ'}
          </p>
        </div>

        {/* Card 3: Detected Order Clusters */}
        <div className="p-3.5 bg-zinc-950/70 rounded-xl border border-zinc-800/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-400 font-medium">Cụm Lệnh Thuật Toán</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              TWAP / Iceberg
            </span>
          </div>
          <div className="font-mono font-bold text-xl text-zinc-100 flex items-center gap-2">
            <span>{whaleClusters.length} Cụm Lệnh Lớn</span>
          </div>
          <div className="text-xs text-cyan-400 font-mono flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>Gom từ {totalSubOrdersAnalyzed.toLocaleString()} lệnh con</span>
          </div>
          <div className="text-[10px] text-zinc-500 pt-0.5">
            Tự động loại bỏ nhiễu của các lệnh khớp lẻ micro-tick
          </div>
        </div>

        {/* Card 4: Capital Tier Breakdown */}
        <div className="p-3.5 bg-zinc-950/70 rounded-xl border border-zinc-800/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-400 font-medium">Theo Cấp Bậc Vốn</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
              Quỹ & Sharks
            </span>
          </div>
          <div className="space-y-1 text-[11px] font-mono">
            <div className="flex justify-between items-center">
              <span className="text-purple-300">Siêu Cá Voi ($1M+):</span>
              <span
                className={`font-bold ${
                  tierBreakdown.megaWhales.netUsdt >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {tierBreakdown.megaWhales.netUsdt >= 0 ? '+' : ''}$
                {(tierBreakdown.megaWhales.netUsdt / 1_000_000).toFixed(1)}M
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-300">Cá Voi ($250k-$1M):</span>
              <span
                className={`font-bold ${
                  tierBreakdown.largeWhales.netUsdt >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {tierBreakdown.largeWhales.netUsdt >= 0 ? '+' : ''}$
                {(tierBreakdown.largeWhales.netUsdt / 1_000_000).toFixed(1)}M
              </span>
            </div>
          </div>
          <div className="text-[10px] text-zinc-500 pt-0.5">
            Điểm tác động: <span className="font-bold text-zinc-300">{whaleImpactScore}/100</span>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/70 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('clusters')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'clusters'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 bg-zinc-950/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Cụm Lệnh Thuật Toán ({whaleClusters.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('timeframes')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'timeframes'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 bg-zinc-950/60'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Tổng Hợp Chu Kỳ (1h - 4h - 24h)</span>
          </button>
          <button
            onClick={() => setActiveTab('zones')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'zones'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 bg-zinc-950/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Vùng Giá Cá Voi Gom ({accumulationZones.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('rawTicks')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'rawTicks'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 bg-zinc-950/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Radar Lệnh Đơn Lẻ</span>
          </button>
        </div>

        {/* Style Filter (Only on clusters tab) */}
        {activeTab === 'clusters' && (
          <div className="flex items-center gap-1 text-[11px]">
            <SlidersHorizontal className="w-3 h-3 text-zinc-500" />
            <span className="text-zinc-500">Kiểu lệnh:</span>
            <select
              value={selectedStyleFilter}
              onChange={(e) => setSelectedStyleFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-[11px] rounded-md px-2 py-1 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="ALL">Tất Cả Kiểu</option>
              <option value="TWAP Algorithm">TWAP Algorithm</option>
              <option value="Iceberg Order">Iceberg Order</option>
              <option value="Market Sweep">Market Sweep</option>
              <option value="Block Accumulation">Block Accumulation</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: Aggregated Whale Order Clusters */}
      {activeTab === 'clusters' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-950/50 p-2.5 rounded-xl border border-zinc-800/60">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              <strong>Nguyên lý:</strong> Quỹ và cá voi không mua thẳng $5M một lần vì sẽ trượt giá. Họ dùng thuật toán <strong>TWAP</strong> hoặc <strong>Iceberg</strong> rải đều thành nhiều lệnh nhỏ. Dưới đây là các cụm lệnh đã được phát hiện và gom lại:
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredClusters.map((cluster) => {
              const isBuy = cluster.side === 'BUY';
              let tierColor = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
              if (cluster.whaleTier.includes('Mega') || cluster.whaleTier.includes('Quỹ')) {
                tierColor = 'bg-purple-500/15 text-purple-300 border-purple-500/30';
              } else if (cluster.whaleTier.includes('Lớn')) {
                tierColor = 'bg-blue-500/15 text-blue-300 border-blue-500/30';
              }

              return (
                <div
                  key={cluster.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isBuy
                      ? 'bg-zinc-950/80 border-emerald-500/25 hover:border-emerald-500/40'
                      : 'bg-zinc-950/80 border-rose-500/25 hover:border-rose-500/40'
                  }`}
                >
                  {/* Top Bar: Side + Tier + Time */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold border flex items-center gap-1 ${
                          isBuy
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {isBuy ? (
                          <>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            <span>GOM HÀNG (BUY)</span>
                          </>
                        ) : (
                          <>
                            <ArrowDownRight className="w-3.5 h-3.5" />
                            <span>XẢ HÀNG (SELL)</span>
                          </>
                        )}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${tierColor}`}>
                        {cluster.whaleTier}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono text-zinc-400 shrink-0">
                      {cluster.timeRange}
                    </span>
                  </div>

                  {/* Execution Style & Sub-Orders badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {cluster.executionStyle}
                    </span>
                    <span className="text-[11px] font-mono text-cyan-300">
                      Đã gom từ <strong>{cluster.subOrderCount}</strong> lệnh con
                    </span>
                  </div>

                  {/* Cluster Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2.5 bg-zinc-900/60 rounded-lg border border-zinc-800/70 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Tổng Giá Trị</span>
                      <span className="font-bold text-zinc-100 text-sm">
                        ${(cluster.totalAmountUsdt / 1_000_000).toFixed(2)}M
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Khối Lượng SOL</span>
                      <span className="font-bold text-zinc-300 text-sm">
                        {cluster.totalQty.toLocaleString()} SOL
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block">Giá Bình Quân</span>
                      <span className="font-bold text-zinc-200">
                        ${cluster.avgPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Price Impact Bar */}
                  <div className="mt-2.5 flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500">Tác động giá (Price Impact):</span>
                    <span
                      className={`font-mono font-bold ${
                        cluster.priceImpactPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {cluster.priceImpactPercent >= 0 ? '+' : ''}
                      {cluster.priceImpactPercent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Multi-Timeframe Synthesis */}
      {activeTab === 'timeframes' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(['1h', '4h', '24h'] as const).map((tf) => {
              const data = timeframes[tf];
              const isNetBuy = data.netFlowUsdt >= 0;
              const tfLabel = tf === '1h' ? '1 Giờ Qua' : tf === '4h' ? '4 Giờ Qua' : '24 Giờ Qua';

              return (
                <div key={tf} className="p-4 bg-zinc-950/80 rounded-xl border border-zinc-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-200">{tfLabel}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isNetBuy ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                      }`}
                    >
                      {isNetBuy ? 'GOM HÀNG' : 'XẢ HÀNG'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-zinc-500 block">Dòng Tiền Ròng</span>
                    <div
                      className={`text-lg font-bold font-mono ${
                        isNetBuy ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isNetBuy ? '+' : ''}${(data.netFlowUsdt / 1_000_000).toFixed(2)}M USDT
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-emerald-400">{data.buyRatio}% Mua</span>
                      <span className="text-rose-400">{(100 - data.buyRatio).toFixed(1)}% Bán</span>
                    </div>
                    <div className="w-full bg-rose-500/30 h-2 rounded-full overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-full transition-all duration-500"
                        style={{ width: `${data.buyRatio}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-zinc-400 pt-1 border-t border-zinc-800/60 flex justify-between">
                    <span>Mua: ${(data.buyVolumeUsdt / 1_000_000).toFixed(2)}M</span>
                    <span>Xả: ${(data.sellVolumeUsdt / 1_000_000).toFixed(2)}M</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tier Table */}
          <div className="p-4 bg-zinc-950/80 rounded-xl border border-zinc-800/80 space-y-2">
            <h4 className="text-xs font-bold text-zinc-200">
              Chi Tiết Dòng Tiền Theo Quy Mô Tổ Chức & Cá Voi:
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="text-[11px] text-zinc-500 border-b border-zinc-800">
                  <tr>
                    <th className="py-2 px-3">Cấp Bậc</th>
                    <th className="py-2 px-3 text-right">Khối Lượng Mua</th>
                    <th className="py-2 px-3 text-right">Khối Lượng Bán</th>
                    <th className="py-2 px-3 text-right">Dòng Tiền Ròng</th>
                    <th className="py-2 px-3 text-center">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  <tr>
                    <td className="py-2.5 px-3 text-purple-300 font-bold">Siêu Cá Voi / Quỹ ($1M+)</td>
                    <td className="py-2.5 px-3 text-right text-zinc-300">
                      ${(tierBreakdown.megaWhales.buyUsdt / 1_000_000).toFixed(2)}M
                    </td>
                    <td className="py-2.5 px-3 text-right text-zinc-300">
                      ${(tierBreakdown.megaWhales.sellUsdt / 1_000_000).toFixed(2)}M
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-bold ${
                        tierBreakdown.megaWhales.netUsdt >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tierBreakdown.megaWhales.netUsdt >= 0 ? '+' : ''}$
                      {(tierBreakdown.megaWhales.netUsdt / 1_000_000).toFixed(2)}M
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tierBreakdown.megaWhales.netUsdt >= 0
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-rose-500/15 text-rose-400'
                        }`}
                      >
                        {tierBreakdown.megaWhales.netUsdt >= 0 ? 'GOM RÒNG' : 'XẢ RÒNG'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-blue-300 font-bold">Cá Voi Lớn ($250k - $1M)</td>
                    <td className="py-2.5 px-3 text-right text-zinc-300">
                      ${(tierBreakdown.largeWhales.buyUsdt / 1_000_000).toFixed(2)}M
                    </td>
                    <td className="py-2.5 px-3 text-right text-zinc-300">
                      ${(tierBreakdown.largeWhales.sellUsdt / 1_000_000).toFixed(2)}M
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-bold ${
                        tierBreakdown.largeWhales.netUsdt >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tierBreakdown.largeWhales.netUsdt >= 0 ? '+' : ''}$
                      {(tierBreakdown.largeWhales.netUsdt / 1_000_000).toFixed(2)}M
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tierBreakdown.largeWhales.netUsdt >= 0
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-rose-500/15 text-rose-400'
                        }`}
                      >
                        {tierBreakdown.largeWhales.netUsdt >= 0 ? 'GOM RÒNG' : 'XẢ RÒNG'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 text-cyan-300 font-bold">Cá Mập ($50k - $250k)</td>
                    <td className="py-2.5 px-3 text-right text-zinc-300">
                      ${(tierBreakdown.sharks.buyUsdt / 1_000_000).toFixed(2)}M
                    </td>
                    <td className="py-2.5 px-3 text-right text-zinc-300">
                      ${(tierBreakdown.sharks.sellUsdt / 1_000_000).toFixed(2)}M
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-bold ${
                        tierBreakdown.sharks.netUsdt >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tierBreakdown.sharks.netUsdt >= 0 ? '+' : ''}$
                      {(tierBreakdown.sharks.netUsdt / 1_000_000).toFixed(2)}M
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tierBreakdown.sharks.netUsdt >= 0
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-rose-500/15 text-rose-400'
                        }`}
                      >
                        {tierBreakdown.sharks.netUsdt >= 0 ? 'GOM RÒNG' : 'XẢ RÒNG'}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Price Zones Where Whales Accumulate */}
      {activeTab === 'zones' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
            <span>Các dải giá có hoạt động gom/xả mạnh nhất của cá voi quanh thị giá ${currentPrice.toFixed(2)}:</span>
          </div>

          <div className="space-y-2.5">
            {accumulationZones.map((zone, idx) => {
              const isAcc = zone.dominantAction === 'ACCUMULATION';
              return (
                <div
                  key={idx}
                  className="p-3.5 bg-zinc-950/80 rounded-xl border border-zinc-800/80 space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-zinc-200">
                        {zone.priceRange}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isAcc
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {isAcc ? 'VÙNG TÍCH LŨY (GOM HÀNG)' : 'VÙNG PHÂN PHỐI (XẢ HÀNG)'}
                      </span>
                    </div>

                    <div className="font-mono text-xs text-zinc-300">
                      Ròng:{' '}
                      <span className={zone.netFlowUsdt >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {zone.netFlowUsdt >= 0 ? '+' : ''}${(zone.netFlowUsdt / 1_000_000).toFixed(2)}M
                      </span>
                    </div>
                  </div>

                  {/* Progress ratio */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                      <span className="text-emerald-400">Mua: ${(zone.buyVolumeUsdt / 1_000_000).toFixed(2)}M ({zone.buyRatio}%)</span>
                      <span className="text-rose-400">Xả: ${(zone.sellVolumeUsdt / 1_000_000).toFixed(2)}M ({(100 - zone.buyRatio).toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-rose-500/30 h-2 rounded-full overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-full transition-all duration-500"
                        style={{ width: `${zone.buyRatio}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: Raw Sub-Orders Feed */}
      {activeTab === 'rawTicks' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
            <span className="font-medium text-zinc-300">Các lệnh khớp tức thời quy mô lớn (&gt; $10,000 USDT):</span>
            <span className="text-[11px] font-mono text-zinc-500">Live Binance AggTrades</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-800/60 bg-zinc-950/50">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/60 text-zinc-400 font-mono text-[11px] border-b border-zinc-800">
                <tr>
                  <th className="py-2.5 px-3">Thời gian</th>
                  <th className="py-2.5 px-3">Phân loại</th>
                  <th className="py-2.5 px-3">Hành vi</th>
                  <th className="py-2.5 px-3 text-right">Giá khớp</th>
                  <th className="py-2.5 px-3 text-right">Khối lượng (SOL)</th>
                  <th className="py-2.5 px-3 text-right">Giá trị (USDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40 font-mono">
                {recentWhaleTrades.length > 0 ? (
                  recentWhaleTrades.map((t) => {
                    const isBuy = t.side === 'BUY';
                    const date = new Date(t.time);
                    const timeFormatted = date.toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    });

                    let tierColor = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
                    if (t.whaleTier.includes('Mega')) {
                      tierColor = 'bg-purple-500/15 text-purple-300 border-purple-500/30';
                    } else if (t.whaleTier.includes('Large')) {
                      tierColor = 'bg-blue-500/15 text-blue-300 border-blue-500/30';
                    }

                    return (
                      <tr key={t.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="py-2 px-3 text-zinc-400 text-[11px] whitespace-nowrap">
                          {timeFormatted}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${tierColor}`}>
                            {t.whaleTier}
                          </span>
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 font-bold text-xs ${
                              isBuy ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isBuy ? (
                              <>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                                <span>MUA CHỦ ĐỘNG</span>
                              </>
                            ) : (
                              <>
                                <ArrowDownRight className="w-3.5 h-3.5" />
                                <span>XẢ CHỦ ĐỘNG</span>
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right text-zinc-200">
                          ${t.price.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-right text-zinc-300">
                          {t.qty.toLocaleString()} SOL
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-zinc-100">
                          ${t.amountUsdt.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-zinc-500">
                      Đang quét luồng lệnh cá voi từ Binance...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
