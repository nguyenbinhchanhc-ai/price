'use client';

import React, { useState } from 'react';
import { TargetAnalysis } from '@/lib/types';
import {
  Clock,
  Percent,
  Zap,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Compass,
  History,
  Crown,
  ChevronDown,
  ChevronUp,
  Layers,
  Activity,
  Fish,
  BookOpen,
  Newspaper,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface ProbabilitySummaryProps {
  analysis: TargetAnalysis;
}

export const ProbabilitySummary: React.FC<ProbabilitySummaryProps> = ({ analysis }) => {
  const {
    expectedDays,
    empirical,
    scenarios,
    horizons,
    requiredDailyVelocityPercent,
    distanceInATR,
    direction,
    dominantScenario,
  } = analysis;

  const [showPillars, setShowPillars] = useState<boolean>(true);
  const isUp = direction === 'UP';

  const probVal = empirical.empiricalSuccessRate;
  const probBadgeColor =
    probVal >= 65
      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      : probVal >= 35
      ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
      : 'text-amber-400 bg-amber-500/10 border-amber-500/20';

  const getPillarIcon = (name: string) => {
    if (name.includes('Kỹ Thuật')) return <Activity className="w-4 h-4 text-cyan-400" />;
    if (name.includes('Cá Voi')) return <Fish className="w-4 h-4 text-emerald-400" />;
    if (name.includes('Sổ Lệnh')) return <BookOpen className="w-4 h-4 text-amber-400" />;
    if (name.includes('Phái Sinh') || name.includes('Thanh Khoản')) return <Layers className="w-4 h-4 text-purple-400" />;
    return <Newspaper className="w-4 h-4 text-sky-400" />;
  };

  const getBiasBadge = (bias: 'Supportive' | 'Neutral' | 'Opposing') => {
    if (bias === 'Supportive') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          Ủng hộ mạnh
        </span>
      );
    }
    if (bias === 'Opposing') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
          Cản trở / Rủi ro
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
        Trung tính
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* FEATURE 2: DOMINANT SCENARIO MULTI-FACTOR SYNTHESIS HERO CARD */}
      {dominantScenario && (
        <div className="relative overflow-hidden bg-gradient-to-br from-cyan-950/40 via-zinc-900/90 to-zinc-950 border border-cyan-500/40 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-cyan-950/30">
          {/* Subtle Glow Background Effect */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

          <div className="relative z-10 space-y-4">
            {/* Top row: Badge, Scenario Name, Prob */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm">
                  <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
                  <span>KỊCH BẢN CÓ KHẢ NĂNG XẢY RA CAO NHẤT</span>
                  <span className="text-zinc-500">·</span>
                  <span className="text-zinc-300 font-normal">Tổng hợp 5 nhóm chỉ số</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-50 flex items-center gap-2">
                  <span>{dominantScenario.scenarioName}</span>
                </h2>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-auto bg-zinc-950/70 px-4 py-2 rounded-xl border border-zinc-800">
                <div className="text-right">
                  <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">Xác Suất Tổng Hợp</div>
                  <div className="text-2xl font-bold font-mono text-cyan-300">
                    {dominantScenario.probability}%
                  </div>
                </div>
                <div className="h-8 w-px bg-zinc-800" />
                <div className="text-left">
                  <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">Độ Tin Cậy</div>
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{dominantScenario.confidenceLevel}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle row: Synthesized Explanation & Time Window */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              <div className="lg:col-span-8 space-y-2">
                <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
                  {dominantScenario.reasoning}
                </p>
                <div className="text-xs text-cyan-400/90 font-medium flex items-center gap-1.5 bg-cyan-950/30 px-3 py-1.5 rounded-lg border border-cyan-500/20">
                  <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  <span>Xúc tác thị trường: {dominantScenario.catalystsSummary}</span>
                </div>
              </div>

              <div className="lg:col-span-4 bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800/80 space-y-2.5 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-zinc-400 font-medium">Khung thời gian dự kiến:</span>
                  <span className="font-mono text-cyan-300 font-bold text-xs sm:text-sm bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30 shrink-0 self-start sm:self-auto">
                    {dominantScenario.expectedTimeWindow}
                  </span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Điểm hợp lưu 5 trụ cột:</span>
                  <span className="font-mono text-zinc-100 font-bold">{dominantScenario.compositeSynthesisScore} / 100</span>
                </div>
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 rounded-full"
                    style={{ width: `${dominantScenario.compositeSynthesisScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Toggle button to expand/collapse 5 Pillars Breakdown */}
            <div className="pt-2 flex justify-between items-center">
              <button
                onClick={() => setShowPillars(!showPillars)}
                className="text-xs text-zinc-300 hover:text-cyan-300 flex items-center gap-1.5 font-medium transition-colors"
              >
                <span>{showPillars ? 'Thu gọn bảng điểm 5 trụ cột' : 'Xem chi tiết 5 trụ cột định lượng (Tin tức, Cá voi, Sổ lệnh, Chỉ báo, Phái sinh)'}</span>
                {showPillars ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              <span className="text-[11px] text-zinc-500 font-mono hidden sm:inline">
                Trọng số lượng hóa khách quan
              </span>
            </div>

            {/* 5 Pillars Matrix Card */}
            {showPillars && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-2">
                {dominantScenario.factorScores.map((factor, idx) => (
                  <div
                    key={idx}
                    className="bg-zinc-950/70 border border-zinc-800/70 rounded-xl p-3 space-y-2 flex flex-col justify-between hover:border-zinc-700 transition-colors"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {getPillarIcon(factor.name)}
                          <span className="text-[10px] font-mono text-zinc-400">
                            {factor.weight}% tỷ trọng
                          </span>
                        </div>
                        {getBiasBadge(factor.bias)}
                      </div>

                      <div className="text-xs font-semibold text-zinc-200 line-clamp-1">
                        {factor.name}
                      </div>

                      <div className="flex items-baseline justify-between pt-1">
                        <span className="text-lg font-bold font-mono text-zinc-100">
                          {factor.score}
                          <span className="text-[11px] text-zinc-500 font-normal">/100</span>
                        </span>
                        <div className="w-16 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              factor.score >= 60
                                ? 'bg-emerald-400'
                                : factor.score <= 40
                                ? 'bg-rose-400'
                                : 'bg-cyan-400'
                            }`}
                            style={{ width: `${factor.score}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/50 line-clamp-2">
                      {factor.summary}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Primary Forecast Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Real Expected Time to Hit */}
        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Thời Gian Thực Tế Dự Báo
              </span>
              <span className="text-[11px] text-zinc-500 font-mono">P25 - P75</span>
            </div>

            <div className="pt-2">
              {expectedDays ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-mono text-zinc-50 tracking-tight">
                    {expectedDays.min} – {expectedDays.max}
                  </span>
                  <span className="text-sm font-semibold text-zinc-400">ngày</span>
                </div>
              ) : (
                <div className="text-xl font-bold text-amber-400">
                  &gt; 90 ngày
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs">
            <span className="text-zinc-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              {scenarios.base.estimatedDate ? scenarios.base.estimatedDate : 'Dài hạn'}
            </span>
            <span className="font-mono text-zinc-300 font-medium">
              Trung vị thực: ~{expectedDays?.expected ?? 'N/A'} ngày
            </span>
          </div>
        </div>

        {/* Card 2: Real Empirical Historical Hit Rate */}
        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-emerald-400" />
                Xác Suất Lịch Sử (Empirical)
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${probBadgeColor}`}>
                {probVal >= 65 ? 'Khả thi cao' : probVal >= 35 ? 'Trung bình' : 'Khó khăn'}
              </span>
            </div>

            <div className="pt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-zinc-50 tracking-tight">
                {probVal}%
              </span>
              <span className="text-xs text-zinc-400">trong các chu kỳ SOL</span>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-zinc-800/60">
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, Math.max(2, probVal))}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1.5">
              <span>Đạt {empirical.successfulEpisodes} / {empirical.totalHistoricalEpisodes} chu kỳ</span>
              <span>Kỷ lục: {empirical.recordFastestDays ?? 'N/A'} ngày</span>
            </div>
          </div>
        </div>

        {/* Card 3: Required Daily Velocity */}
        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Vận Tốc Cần Thiết
              </span>
              <span className="text-[11px] text-zinc-500 font-mono">Mỗi phiên</span>
            </div>

            <div className="pt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-zinc-50 tracking-tight">
                {scenarios.base.dailyVelocityNeeded > 0
                  ? `$${scenarios.base.dailyVelocityNeeded.toFixed(2)}`
                  : '—'}
              </span>
              <span className="text-xs font-semibold text-zinc-400">/ngày</span>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs">
            <span className="text-zinc-400">Tỷ lệ tương đối:</span>
            <span className="font-mono text-cyan-400 font-medium">
              {isUp ? '+' : '-'}{requiredDailyVelocityPercent}% / ngày
            </span>
          </div>
        </div>

        {/* Card 4: Distance in Volatility Units (ATR) */}
        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-zinc-400 text-xs">
              <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-violet-400" />
                Khoảng Cách Theo ATR
              </span>
              <span className="text-[11px] text-zinc-500 font-mono">ATR14 Thực</span>
            </div>

            <div className="pt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-zinc-50 tracking-tight">
                {distanceInATR}x
              </span>
              <span className="text-xs text-zinc-400">biên độ ngày</span>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs">
            <span className="text-zinc-400">Đánh giá cơ học:</span>
            <span
              className={`font-semibold font-mono ${
                distanceInATR < 2.5
                  ? 'text-emerald-400'
                  : distanceInATR < 5.0
                  ? 'text-cyan-400'
                  : 'text-amber-400'
              }`}
            >
              {distanceInATR < 2.5 ? 'Rất gần (1-3 phiên)' : distanceInATR < 5.0 ? 'Vừa phải' : 'Cần sóng lớn'}
            </span>
          </div>
        </div>
      </div>

      {/* Horizon Probability Ladder & 3 Scenarios breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Probabilities by time horizon (7d, 14d, 30d, 60d, 90d) */}
        <div className="lg:col-span-5 bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Xác Suất Chạm Theo Mốc Thời Gian Thực</span>
              </h3>
              <span className="text-[11px] text-zinc-400 font-mono">Scan 180 nến</span>
            </div>

            <div className="space-y-3">
              {horizons.map(h => {
                const prob = h.historicalSuccessRate;
                return (
                  <div key={h.days} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-zinc-300">
                        Trong vòng <span className="font-mono font-bold text-zinc-100">{h.days} ngày</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-zinc-500 font-mono">
                          ({h.occurrencesMet} / {h.totalAttempts} lần)
                        </span>
                        <span className="font-mono font-bold text-sm text-zinc-100">
                          {prob}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-800/60 p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          prob >= 60
                            ? 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                            : prob >= 30
                            ? 'bg-cyan-500'
                            : 'bg-zinc-600'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(3, prob))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800 text-[11px] text-zinc-400 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>
              100% dữ liệu thực: Quét toàn bộ các chu kỳ 90 ngày trong lịch sử giao dịch thực tế của SOL/USDT trên Binance.
            </span>
          </div>
        </div>

        {/* Right: 3 Scenario Trajectories */}
        <div className="lg:col-span-7 bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>3 Kịch Bản Di Chuyển Theo Dữ Liệu Thực Tế</span>
            </h3>
            <span className="text-[11px] text-zinc-400 font-mono">Định lượng tổng hợp</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Bullish / Fastest */}
            <div
              className={`bg-zinc-950/60 rounded-xl p-3.5 space-y-2 relative transition-all ${
                scenarios.bullish.isDominant
                  ? 'border-2 border-emerald-500 shadow-lg shadow-emerald-950/30'
                  : 'border border-zinc-800/80 hover:border-emerald-500/30'
              }`}
            >
              {scenarios.bullish.isDominant && (
                <div className="absolute -top-2.5 left-3 px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500 text-zinc-950 flex items-center gap-1 shadow-sm">
                  <Crown className="w-2.5 h-2.5 fill-zinc-950" />
                  XÁC SUẤT CAO NHẤT
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400">Bứt Phá Nhanh</span>
                <span className="text-[11px] font-mono font-bold text-emerald-400">
                  {scenarios.bullish.probability}%
                </span>
              </div>
              <div className="font-mono text-xl font-bold text-zinc-100">
                {scenarios.bullish.daysToHit ? `${scenarios.bullish.daysToHit} ngày` : '> 90d'}
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                {scenarios.bullish.description}
              </p>
              <div className="pt-2 border-t border-zinc-800/60 text-[10px] text-zinc-500 font-mono">
                Dự kiến: {scenarios.bullish.estimatedDate ?? '—'}
              </div>
            </div>

            {/* Base Case */}
            <div
              className={`bg-zinc-950/60 rounded-xl p-3.5 space-y-2 relative transition-all ${
                scenarios.base.isDominant
                  ? 'border-2 border-cyan-400 shadow-lg shadow-cyan-950/30'
                  : 'border border-cyan-500/30'
              }`}
            >
              {scenarios.base.isDominant && (
                <div className="absolute -top-2.5 left-3 px-2 py-0.5 rounded text-[9px] font-bold bg-cyan-400 text-zinc-950 flex items-center gap-1 shadow-sm">
                  <Crown className="w-2.5 h-2.5 fill-zinc-950" />
                  XÁC SUẤT CAO NHẤT
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-cyan-400">Kịch Bản Trung Vị</span>
                <span className="text-[11px] font-mono font-bold text-cyan-300">
                  {scenarios.base.probability}%
                </span>
              </div>
              <div className="font-mono text-xl font-bold text-zinc-100">
                {scenarios.base.daysToHit ? `${scenarios.base.daysToHit} ngày` : '> 90d'}
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                {scenarios.base.description}
              </p>
              <div className="pt-2 border-t border-zinc-800/60 text-[10px] text-cyan-400 font-mono font-medium">
                Dự kiến: {scenarios.base.estimatedDate ?? '—'}
              </div>
            </div>

            {/* Conservative / Choppy */}
            <div
              className={`bg-zinc-950/60 rounded-xl p-3.5 space-y-2 relative transition-all ${
                scenarios.conservative.isDominant
                  ? 'border-2 border-amber-400 shadow-lg shadow-amber-950/30'
                  : 'border border-zinc-800/80 hover:border-amber-500/30'
              }`}
            >
              {scenarios.conservative.isDominant && (
                <div className="absolute -top-2.5 left-3 px-2 py-0.5 rounded text-[9px] font-bold bg-amber-400 text-zinc-950 flex items-center gap-1 shadow-sm">
                  <Crown className="w-2.5 h-2.5 fill-zinc-950" />
                  XÁC SUẤT CAO NHẤT
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-400">Tích Lũy Kéo Dài</span>
                <span className="text-[11px] font-mono font-bold text-amber-300">
                  {scenarios.conservative.probability}%
                </span>
              </div>
              <div className="font-mono text-xl font-bold text-zinc-100">
                {scenarios.conservative.daysToHit ? `${scenarios.conservative.daysToHit} ngày` : '> 90d'}
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                {scenarios.conservative.description}
              </p>
              <div className="pt-2 border-t border-zinc-800/60 text-[10px] text-zinc-500 font-mono">
                Dự kiến: {scenarios.conservative.estimatedDate ?? '—'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
