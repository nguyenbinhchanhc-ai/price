'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { TargetAnalysis, TechnicalIndicators, AIForecastResponse } from '@/lib/types';
import { Sparkles, Bot, AlertTriangle, ShieldCheck, Target, RefreshCw } from 'lucide-react';

interface AIForecastPanelProps {
  analysis: TargetAnalysis;
  indicators: TechnicalIndicators | null;
}

function getFallbackForecast(
  currentPrice: number,
  priceDeltaPercent: number,
  direction: 'UP' | 'DOWN',
  distanceInATR: number,
  expectedDays: { min: number; max: number; expected: number } | null,
  empiricalSuccessRate: number,
  barriers: Array<{ label: string; price: number }>,
  indicators: TechnicalIndicators | null
): AIForecastResponse {
  return {
    sentiment: direction === 'UP' ? 'Bullish' : 'Bearish',
    targetFeasibility: Math.abs(priceDeltaPercent) < 25 ? 'Khả thi (Feasible)' : 'Thách thức (Challenging)',
    timeframeSummary: expectedDays
      ? `Dự kiến dao động trong khoảng ${expectedDays.min} - ${expectedDays.max} ngày (trung bình ~${expectedDays.expected} ngày) theo dữ liệu đối chiếu lịch sử thực tế.`
      : 'Cần từ 30 - 60 ngày để bứt phá qua các vùng cản kỹ thuật lớn.',
    keyDrivers: [
      'Duy trì khối lượng giao dịch trên mức trung bình 20 ngày (MA20 Volume)',
      `Đóng nến dứt khoát trên mốc cản gần nhất $${indicators?.pivotPoints?.r1 || Math.round(currentPrice * 1.05)}`,
      'Sự đồng pha với xu hướng Bitcoin và dòng tiền hệ sinh thái Solana',
    ],
    majorObstacles: barriers.map(b => `${b.label} ($${b.price})`).slice(0, 3),
    invalidationLevel: direction === 'UP'
      ? Number((currentPrice * 0.93).toFixed(2))
      : Number((currentPrice * 1.07).toFixed(2)),
    tradingThesis: `Với khoảng cách ${priceDeltaPercent > 0 ? '+' : ''}${priceDeltaPercent}% (tương đương ${distanceInATR} lần biên độ biến động ATR ngày), mô hình đối chiếu thực tế xác định xác suất đạt mốc trong lịch sử đạt ~${empiricalSuccessRate}%. Để kích hoạt kịch bản tăng tốc, SOL cần giữ vững các đường trung bình động EMA 20 và EMA 50.`,
    tacticalAdvice: 'Khuyến nghị giải ngân từng phần (DCA) quanh các nhịp kiểm định lại hỗ trợ thay vì mua đuổi fomo tại đỉnh cục bộ. Đặt dừng lỗ dưới mốc vô hiệu hóa để bảo vệ vốn.',
  };
}

export const AIForecastPanel: React.FC<AIForecastPanelProps> = ({
  analysis,
  indicators,
}) => {
  const {
    currentPrice,
    targetPrice,
    priceDeltaPercent,
    direction,
    distanceInATR,
    expectedDays,
    barriers,
    empirical,
  } = analysis;
  const empiricalSuccessRate = empirical.empiricalSuccessRate;

  const fallbackData = useMemo(
    () =>
      getFallbackForecast(
        currentPrice,
        priceDeltaPercent,
        direction,
        distanceInATR,
        expectedDays,
        empiricalSuccessRate,
        barriers,
        indicators
      ),
    [
      currentPrice,
      priceDeltaPercent,
      direction,
      distanceInATR,
      expectedDays,
      empiricalSuccessRate,
      barriers,
      indicators,
    ]
  );

  const [aiData, setAiData] = useState<AIForecastResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const lastFetchedTargetRef = useRef<number | null>(null);

  const data = aiData || fallbackData;

  const executeFetch = useCallback(async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/ai/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPrice,
          targetPrice,
          priceDeltaPercent,
          direction,
          indicators,
          expectedDays,
          overallHitProbability: empiricalSuccessRate,
          distanceInATR,
          barriers,
        }),
      });

      if (!res.ok) {
        throw new Error(`AI API returned status ${res.status}`);
      }

      const result = await res.json();
      if (result && typeof result === 'object') {
        setAiData({
          ...result,
          invalidationLevel: Number(result.invalidationLevel) || (direction === 'UP' ? currentPrice * 0.93 : currentPrice * 1.07),
          keyDrivers: Array.isArray(result.keyDrivers) && result.keyDrivers.length > 0
            ? result.keyDrivers
            : fallbackData.keyDrivers,
          majorObstacles: Array.isArray(result.majorObstacles) && result.majorObstacles.length > 0
            ? result.majorObstacles
            : fallbackData.majorObstacles,
        });
      }
    } catch {
      // Gracefully maintain current data
    } finally {
      setLoading(false);
    }
  }, [
    currentPrice,
    targetPrice,
    priceDeltaPercent,
    direction,
    distanceInATR,
    expectedDays,
    empiricalSuccessRate,
    barriers,
    indicators,
    fallbackData,
  ]);

  // Sync AI forecast only on mount or when target price changes
  useEffect(() => {
    if (lastFetchedTargetRef.current === targetPrice) {
      return;
    }
    lastFetchedTargetRef.current = targetPrice;

    const controller = new AbortController();

    async function initialLoad() {
      try {
        const res = await fetch('/api/ai/forecast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            currentPrice,
            targetPrice,
            priceDeltaPercent,
            direction,
            indicators,
            expectedDays,
            overallHitProbability: empiricalSuccessRate,
            distanceInATR,
            barriers,
          }),
        });

        if (res.ok) {
          const result = await res.json();
          setAiData({
            ...result,
            invalidationLevel: Number(result.invalidationLevel) || (direction === 'UP' ? currentPrice * 0.93 : currentPrice * 1.07),
            keyDrivers: Array.isArray(result.keyDrivers) && result.keyDrivers.length > 0
              ? result.keyDrivers
              : fallbackData.keyDrivers,
            majorObstacles: Array.isArray(result.majorObstacles) && result.majorObstacles.length > 0
              ? result.majorObstacles
              : fallbackData.majorObstacles,
          });
        }
      } catch {
        // Silently use fallbackData without throwing error
      }
    }

    initialLoad();

    return () => {
      controller.abort();
    };
  }, [
    targetPrice,
    currentPrice,
    priceDeltaPercent,
    direction,
    distanceInATR,
    expectedDays,
    empiricalSuccessRate,
    barriers,
    indicators,
    fallbackData,
  ]);

  const sentimentColor =
    data?.sentiment === 'Bullish'
      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      : data?.sentiment === 'Bearish'
      ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
      : data?.sentiment === 'High Risk'
      ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      : 'text-zinc-300 bg-zinc-800 border-zinc-700';

  return (
    <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-500/5 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-cyan-500/30 text-cyan-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
              <span>Đánh Giá Định Lượng AI & Kịch Bản Thực Tế</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Gemini 3.8 Flash
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Tổng hợp đa biến số: Lịch sử đối chiếu thực tế, sổ lệnh Binance, ATR, VWAP, MFI & Fibonacci
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {data && (
            <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${sentimentColor}`}>
              Xu hướng: {data.sentiment}
            </span>
          )}

          <button
            onClick={executeFetch}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700 text-xs font-medium text-zinc-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{loading ? 'Đang phân tích...' : 'Phân tích lại'}</span>
          </button>
        </div>
      </div>

      {/* Content Body */}
      {data ? (
        <div className="space-y-4 text-xs">
          {/* Feasibility & Timeframe Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-xl space-y-1.5">
              <span className="text-zinc-500 uppercase tracking-wider font-semibold text-[10px]">
                Tính Khả Thi Của Mục Tiêu
              </span>
              <div className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                <span>{data.targetFeasibility}</span>
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                {data.timeframeSummary}
              </p>
            </div>

            <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-xl space-y-1.5">
              <span className="text-zinc-500 uppercase tracking-wider font-semibold text-[10px]">
                Mốc Vô Hiệu Hóa Kịch Bản (Stop-loss Khuyên Dùng)
              </span>
              <div className="text-sm font-bold font-mono text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>${(Number(data.invalidationLevel) || (analysis.direction === 'UP' ? analysis.currentPrice * 0.93 : analysis.currentPrice * 1.07)).toFixed(2)}</span>
                <span className="text-[11px] font-normal text-zinc-500">
                  ({((((Number(data.invalidationLevel) || (analysis.direction === 'UP' ? analysis.currentPrice * 0.93 : analysis.currentPrice * 1.07)) - analysis.currentPrice) / analysis.currentPrice) * 100).toFixed(1)}%)
                </span>
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Nếu giá SOL xuyên thủng mốc này, cấu trúc kỹ thuật bị phá vỡ và kịch bản chạm mục tiêu bị vô hiệu hóa.
              </p>
            </div>
          </div>

          {/* Quantitative Trading Thesis */}
          <div className="p-4 bg-zinc-950/90 border border-zinc-800 rounded-xl space-y-2">
            <span className="text-zinc-400 font-semibold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              Luận Điểm Định Lượng & Hành Vi Thị Trường Thực Tế
            </span>
            <div className="text-zinc-300 text-xs leading-relaxed space-y-2">
              <p>{data.tradingThesis}</p>
            </div>
          </div>

          {/* Drivers & Obstacles Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Drivers */}
            <div className="p-3.5 bg-zinc-950/60 border border-zinc-800 rounded-xl space-y-2">
              <span className="text-emerald-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Điều Kiện Cần Để Hoàn Thành Mục Tiêu
              </span>
              <ul className="space-y-1.5 text-zinc-300 text-[11px]">
                {data.keyDrivers.map((driver, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{driver}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Obstacles */}
            <div className="p-3.5 bg-zinc-950/60 border border-zinc-800 rounded-xl space-y-2">
              <span className="text-amber-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Rào Cản Lớn Cần Vượt Qua
              </span>
              <ul className="space-y-1.5 text-zinc-300 text-[11px]">
                {data.majorObstacles.map((obstacle, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{obstacle}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Tactical Advice */}
          <div className="p-3.5 bg-indigo-950/20 border border-indigo-500/20 rounded-xl text-zinc-200">
            <span className="text-indigo-400 font-semibold uppercase tracking-wider text-[10px] block mb-1">
              Khuyến Nghị Chiến Thuật & Quản Trị Rủi Ro
            </span>
            <p className="text-[11px] leading-relaxed text-zinc-300">
              {data.tacticalAdvice}
            </p>
          </div>
        </div>
      ) : (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
          <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
          <span className="text-xs text-zinc-400">
            Đang tổng hợp luận điểm định lượng thời gian thực...
          </span>
        </div>
      )}
    </div>
  );
};
