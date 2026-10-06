'use client';

import React, { useState } from 'react';
import { EmpiricalHistoricalResult } from '@/lib/types';
import { BarChart3, History, Calendar, CheckCircle2, Award, ListFilter, SlidersHorizontal } from 'lucide-react';

interface EmpiricalDistributionProps {
  empirical: EmpiricalHistoricalResult;
  targetPrice: number;
  currentPrice: number;
}

export const EmpiricalDistribution: React.FC<EmpiricalDistributionProps> = ({
  empirical,
  targetPrice,
  currentPrice,
}) => {
  const {
    histogram,
    medianDaysToHit,
    p25DaysToHit,
    p75DaysToHit,
    recordFastestDays,
    maxDaysToHit,
    totalHistoricalEpisodes,
    successfulEpisodes,
    empiricalSuccessRate,
    closestHistoricalRun,
  } = empirical;

  const [viewMode, setViewMode] = useState<'chart' | 'list'>('chart');
  const maxPercent = Math.max(...histogram.map(h => h.percentage), 1);
  const isUp = targetPrice >= currentPrice;
  const pctChange = ((targetPrice - currentPrice) / currentPrice * 100).toFixed(1);

  return (
    <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-zinc-100 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Phân Bổ Tần Suất Thời Gian Chạm Mốc Trong Lịch Sử (Empirical Scan)</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Dữ liệu đối chiếu 100% nến thật Binance: Thống kê số ngày SOL cần để đạt biên độ {isUp ? '+' : ''}{pctChange}%
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-xs font-mono text-zinc-300 bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Đã quét: <strong className="text-cyan-400 font-bold">{totalHistoricalEpisodes}</strong> chu kỳ</span>
          </div>

          <div className="inline-flex rounded-lg bg-zinc-950 p-1 border border-zinc-800 text-xs">
            <button
              onClick={() => setViewMode('chart')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                viewMode === 'chart'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <BarChart3 className="w-3 h-3" />
              <span>Cột</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                viewMode === 'list'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ListFilter className="w-3 h-3" />
              <span>Danh Sách</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real Percentiles Matrix - Responsive 5 Cards with NO text collisions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 p-3.5 bg-zinc-950/80 rounded-xl border border-zinc-800/70 text-xs">
        <div className="p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/50 space-y-1">
          <span className="text-[11px] text-zinc-400 font-mono flex items-center gap-1">
            <Award className="w-3 h-3 text-amber-400 shrink-0" />
            Kỷ lục nhanh nhất
          </span>
          <div className="font-mono font-bold text-sm sm:text-base text-emerald-400">
            {recordFastestDays !== null ? `${recordFastestDays} ngày` : 'Chưa ghi nhận'}
          </div>
          <p className="text-[10px] text-zinc-500">Đợt tăng tốc kỷ lục</p>
        </div>

        <div className="p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/50 space-y-1">
          <span className="text-[11px] text-zinc-400 font-mono">Top 25% nhanh</span>
          <div className="font-mono font-bold text-sm sm:text-base text-cyan-300">
            {p25DaysToHit !== null ? `${p25DaysToHit} ngày` : '—'}
          </div>
          <p className="text-[10px] text-zinc-500">Kịch bản bứt phá mạnh</p>
        </div>

        <div className="p-2.5 rounded-lg bg-cyan-950/20 border border-cyan-500/30 space-y-1">
          <span className="text-[11px] text-cyan-400 font-mono font-semibold">Trung vị P50 (Kỳ vọng)</span>
          <div className="font-mono font-bold text-base sm:text-lg text-zinc-50">
            {medianDaysToHit !== null ? `${medianDaysToHit} ngày` : '—'}
          </div>
          <p className="text-[10px] text-cyan-400/80 font-medium">Nhịp chạy phổ biến nhất</p>
        </div>

        <div className="p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/50 space-y-1">
          <span className="text-[11px] text-zinc-400 font-mono">Thận trọng (P75)</span>
          <div className="font-mono font-bold text-sm sm:text-base text-amber-300">
            {p75DaysToHit !== null ? `${p75DaysToHit} ngày` : '—'}
          </div>
          <p className="text-[10px] text-zinc-500">Tích lũy rũ bỏ trước khi đạt</p>
        </div>

        <div className="col-span-2 sm:col-span-1 lg:col-span-1 p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/50 space-y-1">
          <span className="text-[11px] text-zinc-400 font-mono">Dài nhất từng ghi nhận</span>
          <div className="font-mono font-bold text-sm sm:text-base text-zinc-300">
            {maxDaysToHit !== null ? `${maxDaysToHit} ngày` : '—'}
          </div>
          <p className="text-[10px] text-zinc-500">Giới hạn thời gian tối đa</p>
        </div>
      </div>

      {/* Real Histogram Presentation */}
      <div className="space-y-2 pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-zinc-400 px-1 gap-1">
          <span className="font-medium text-zinc-300">Tỷ lệ các chu kỳ lịch sử chạm đích theo từng mốc số ngày:</span>
          <span className="font-mono text-cyan-400 text-xs font-semibold">
            Đạt đích: {successfulEpisodes} / {totalHistoricalEpisodes} lần ({empiricalSuccessRate}%)
          </span>
        </div>

        {/* View Mode 1: Clean Bar Chart with Horizontal Scroll Protection on Mobile */}
        {viewMode === 'chart' ? (
          <div className="w-full overflow-x-auto pb-2 scrollbar-thin">
            <div className="min-w-[580px] sm:min-w-0 flex items-end justify-between gap-2 h-44 pt-7 px-3 bg-zinc-950/60 rounded-xl border border-zinc-800/60">
              {histogram.map((item, idx) => {
                const heightPercent = maxPercent > 0 ? (item.percentage / maxPercent) * 100 : 0;
                const isHighest = item.percentage === maxPercent && maxPercent > 0;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative min-w-[46px]">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-7 bg-zinc-900 border border-zinc-700 text-zinc-200 text-[10px] px-2 py-0.5 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                      {item.dayRange}: {item.percentage}% ({item.count} chu kỳ)
                    </div>

                    {/* Percentage above bar */}
                    <span className={`text-[10px] font-mono mb-1.5 transition-colors ${
                      isHighest ? 'text-cyan-300 font-bold' : 'text-zinc-500 group-hover:text-zinc-300'
                    }`}>
                      {item.percentage}%
                    </span>

                    {/* Bar container */}
                    <div className="w-full max-w-[32px] bg-zinc-800/60 rounded-t-md overflow-hidden flex flex-col justify-end" style={{ height: '78%' }}>
                      <div
                        className={`w-full transition-all duration-500 rounded-t-md ${
                          isHighest
                            ? 'bg-gradient-to-t from-cyan-600 via-cyan-500 to-cyan-300 shadow-lg shadow-cyan-500/25'
                            : 'bg-gradient-to-t from-zinc-700 via-indigo-600/70 to-indigo-400 group-hover:from-indigo-600 group-hover:to-cyan-400'
                        }`}
                        style={{ height: `${Math.max(item.count > 0 ? 8 : 0, heightPercent)}%` }}
                      />
                    </div>

                    {/* Range label under bar */}
                    <span className="text-[10px] font-mono text-zinc-400 mt-2 truncate max-w-full text-center">
                      {item.dayRange}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="sm:hidden text-center text-[10px] text-zinc-500 mt-1 font-mono">
              ↔ Vuốt ngang để xem toàn bộ 10 khoảng chu kỳ
            </div>
          </div>
        ) : (
          /* View Mode 2: Clean List Rows (Guaranteed 0 overlap on all phone screens) */
          <div className="space-y-1.5 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/60">
            {histogram.map((item, idx) => {
              const isHighest = item.percentage === maxPercent && maxPercent > 0;
              return (
                <div key={idx} className="flex items-center gap-3 text-xs py-1 px-2 rounded hover:bg-zinc-900/50">
                  <span className="w-20 font-mono text-zinc-400 text-xs shrink-0">{item.dayRange}</span>
                  <div className="flex-1 bg-zinc-800/70 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isHighest
                          ? 'bg-gradient-to-r from-cyan-500 to-cyan-300'
                          : 'bg-gradient-to-r from-indigo-500 to-zinc-500'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className={`w-14 text-right font-mono font-semibold ${isHighest ? 'text-cyan-300' : 'text-zinc-300'}`}>
                    {item.percentage}%
                  </span>
                  <span className="w-16 text-right font-mono text-zinc-500 text-[11px] shrink-0">
                    {item.count} lần
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Closest Historical Episode Match */}
      {closestHistoricalRun && (
        <div className="p-3.5 bg-gradient-to-r from-cyan-950/20 via-zinc-950/50 to-zinc-950/20 border border-cyan-500/20 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>Chu Kỳ Lịch Sử Thực Tế Tương Đồng Nhất (Historical Analog Match)</span>
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Trong lịch sử SOL, nhịp chạy từ ngày <strong className="text-zinc-200">{closestHistoricalRun.startDate}</strong> (giá ${closestHistoricalRun.startPrice}) đến ngày <strong className="text-zinc-200">{closestHistoricalRun.hitDate}</strong> (chạm ${closestHistoricalRun.hitPrice}) đã hoàn thành chính xác biên độ này.
            </p>
          </div>

          <div className="flex items-center gap-3 sm:text-right shrink-0">
            <div>
              <div className="text-[10px] text-zinc-500 font-mono">Thời gian thực tế:</div>
              <div className="text-base font-bold font-mono text-cyan-300">
                {closestHistoricalRun.daysTaken} ngày
              </div>
            </div>
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
