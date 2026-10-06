'use client';

import React from 'react';
import { TechnicalIndicators, CalcMode, EmpiricalHistoricalResult } from '@/lib/types';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  Waves,
  Zap,
  TrendingUp,
  History,
  BookOpen,
} from 'lucide-react';

interface LiveIndicatorMonitorProps {
  indicators: TechnicalIndicators;
  currentPrice: number;
  selectedMode: CalcMode;
  onSelectMode: (mode: CalcMode) => void;
  empirical: EmpiricalHistoricalResult;
  confidenceScore: number;
}

export const LiveIndicatorMonitor: React.FC<LiveIndicatorMonitorProps> = ({
  indicators,
  currentPrice,
  selectedMode,
  onSelectMode,
  empirical,
  confidenceScore,
}) => {
  const {
    compositeHealthScore,
    alerts,
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
    fibonacci,
    trendAlignment,
  } = indicators;

  // Composite gauge coloring
  const scoreColor =
    compositeHealthScore >= 70
      ? 'text-emerald-400'
      : compositeHealthScore >= 50
      ? 'text-cyan-400'
      : compositeHealthScore >= 35
      ? 'text-amber-400'
      : 'text-rose-400';

  const scoreBadge =
    compositeHealthScore >= 75
      ? 'Động Lực Tăng Rất Mạnh'
      : compositeHealthScore >= 60
      ? 'Xu Hướng Tích Cực'
      : compositeHealthScore >= 45
      ? 'Cân Bằng / Tích Lũy'
      : 'Chịu Áp Lực Bán';

  const calculationMechanisms: {
    id: CalcMode;
    name: string;
    icon: React.ReactNode;
    subtitle: string;
    description: string;
    badge: string;
  }[] = [
    {
      id: 'empirical-backtest',
      name: 'Thực Nghiệm Đối Chiếu Lịch Sử (100% Real Cycles)',
      icon: <History className="w-4 h-4 text-cyan-400" />,
      subtitle: `Quét ${empirical.totalHistoricalEpisodes} chu kỳ nến thật`,
      description: 'So sánh trực tiếp với mọi đợt tăng/giảm cùng biên độ trong lịch sử thực tế của SOL trên Binance để tìm thời gian trung vị.',
      badge: 'Khuyên Dùng',
    },
    {
      id: 'atr-velocity',
      name: 'Động Học Tốc Độ & Động Lượng Thực Tế (Real ATR)',
      icon: <TrendingUp className="w-4 h-4 text-amber-400" />,
      subtitle: `ATR 14: $${atr14} (~${atrPercent}%/ngày)`,
      description: 'Dựa trên tốc độ di chuyển trung bình thực tế mỗi ngày của SOL, kết hợp đà gia tốc từ RSI, MACD và độ dốc đường MA.',
      badge: 'Động Lực Học',
    },
    {
      id: 'orderbook-liquidity',
      name: 'Thanh Khoản & Tường Cản Sổ Lệnh Binance (Order Book Depth)',
      icon: <BookOpen className="w-4 h-4 text-emerald-400" />,
      subtitle: 'Độ sâu 100 bước giá thực',
      description: 'Đo lường chính xác lượng triệu USDT đang chặn giữa giá hiện tại và mục tiêu, tính thời gian hấp thụ dựa trên Volume 24h thật.',
      badge: 'Thanh Khoản Sống',
    },
  ];

  return (
    <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6 relative overflow-hidden">
      {/* Background ambient gradient */}
      <div className="absolute -top-10 left-1/3 w-80 h-80 bg-gradient-to-br from-cyan-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Top Header & Health Score */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-zinc-100">
              Giám Sát Chỉ Số Đa Tầng Thời Gian Thực & Cơ Chế Định Lượng
            </h3>
            <span className="text-[11px] px-2 py-0.5 rounded-full font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Monitor
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Giám sát 8 nhóm chỉ báo kỹ thuật thực tế: RSI, StochRSI, MACD, Bollinger Squeeze, VWAP, Dòng tiền MFI/OBV & Fibonacci
          </p>
        </div>

        {/* Composite Health Gauge & Confidence Score */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 p-2.5 px-4 bg-zinc-950/80 rounded-xl border border-zinc-800">
            <div className="text-right">
              <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
                Điểm Sức Mạnh Kỹ Thuật
              </div>
              <div className="text-xs font-semibold text-zinc-300">{scoreBadge}</div>
            </div>
            <div className={`font-mono text-2xl font-bold ${scoreColor}`}>
              {compositeHealthScore}
              <span className="text-xs text-zinc-500 font-normal">/100</span>
            </div>
          </div>

          <div className="p-2.5 px-3 bg-zinc-950/80 rounded-xl border border-zinc-800 text-right hidden sm:block">
            <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
              Độ Tin Cậy Mẫu Thật
            </div>
            <div className="font-mono text-base font-bold text-cyan-400">
              {confidenceScore}%
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Indicator Alerts Bar (if any) */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Cảnh Báo Biến Động & Tín Hiệu Nổi Bật Đang Kích Hoạt ({alerts.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {alerts.slice(0, 4).map(alert => (
              <div
                key={alert.id}
                className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs transition-all ${
                  alert.type === 'bullish'
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                    : alert.type === 'bearish'
                    ? 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                    : 'bg-amber-950/20 border-amber-500/30 text-amber-300'
                }`}
              >
                <div className="p-1 rounded bg-black/30 mt-0.5 shrink-0">
                  {alert.type === 'bullish' ? (
                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                  ) : alert.type === 'bearish' ? (
                    <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <div className="font-semibold text-zinc-100 flex items-center gap-2">
                    <span>{alert.title}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-mono text-zinc-400 bg-zinc-900 border border-zinc-800">
                      {alert.indicator}
                    </span>
                  </div>
                  <p className="text-zinc-300 text-[11px] leading-relaxed">
                    {alert.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3 Real Calculation Mechanisms Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Lựa Chọn Cơ Chế Tính Toán Thực Tế (Không Mô Phỏng Ngẫu Nhiên)</span>
          </span>
          <span className="text-[11px] text-zinc-400 font-mono">
            Chế độ đang chọn: <strong className="text-cyan-400">{calculationMechanisms.find(m => m.id === selectedMode)?.name.split(' (')[0]}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {calculationMechanisms.map(mech => {
            const isSelected = selectedMode === mech.id;
            return (
              <button
                key={mech.id}
                type="button"
                onClick={() => onSelectMode(mech.id)}
                className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between space-y-2.5 ${
                  isSelected
                    ? 'bg-zinc-950 border-cyan-500 ring-1 ring-cyan-500/70 shadow-lg shadow-cyan-500/10'
                    : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 text-zinc-300 hover:bg-zinc-950'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                      {mech.icon}
                    </div>
                    <div>
                      <div className={`text-xs font-bold leading-tight ${isSelected ? 'text-cyan-300' : 'text-zinc-200'}`}>
                        {mech.name}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400">
                        {mech.subtitle}
                      </div>
                    </div>
                  </div>
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                    isSelected ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                  }`}>
                    {mech.badge}
                  </span>
                </div>

                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  {mech.description}
                </p>

                <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500">Trạng thái:</span>
                  <span className={isSelected ? 'text-cyan-400 font-semibold flex items-center gap-1' : 'text-zinc-500'}>
                    {isSelected ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        Đang áp dụng
                      </>
                    ) : (
                      'Nhấn để chọn'
                    )}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Real-time Indicator Matrix Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1 text-xs">
        {/* Card 1: VWAP Positioning */}
        <div className="p-3.5 bg-zinc-950/70 border border-zinc-800/80 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Waves className="w-3.5 h-3.5 text-indigo-400" />
              VWAP (Giá Khối Lượng)
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                vwap.position === 'Above VWAP'
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-rose-500/10 text-rose-400'
              }`}
            >
              {vwap.position === 'Above VWAP' ? '▲ Trên VWAP' : '▼ Dưới VWAP'}
            </span>
          </div>

          <div className="flex items-baseline justify-between pt-0.5">
            <span className="font-mono text-lg font-bold text-zinc-100">${vwap.price}</span>
            <span
              className={`font-mono text-xs font-semibold ${
                vwap.deviationPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {vwap.deviationPercent >= 0 ? '+' : ''}{vwap.deviationPercent}%
            </span>
          </div>
          <div className="text-[10px] text-zinc-500 leading-tight">
            Mốc neo chi phí trung bình 30 phiên gần nhất của cá mập
          </div>
        </div>

        {/* Card 2: MFI & Money Flow */}
        <div className="p-3.5 bg-zinc-950/70 border border-zinc-800/80 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Dòng Tiền MFI & OBV
            </span>
            <span className="text-[10px] font-mono text-cyan-400 font-semibold">{mfiSignal}</span>
          </div>

          <div className="flex items-baseline justify-between pt-0.5">
            <span className="font-mono text-lg font-bold text-zinc-100">{mfi14}</span>
            <span className="font-mono text-xs text-zinc-300">
              OBV 7d: <strong className={obv.change7dPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {obv.change7dPercent >= 0 ? '+' : ''}{obv.change7dPercent}%
              </strong>
            </span>
          </div>
          <div className="text-[10px] text-zinc-500 leading-tight">
            MFI &gt; 50 và OBV dương xác nhận dòng tiền tổ chức hấp thụ
          </div>
        </div>

        {/* Card 3: Stochastic RSI */}
        <div className="p-3.5 bg-zinc-950/70 border border-zinc-800/80 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              Stochastic RSI
            </span>
            <span className="text-[10px] font-mono text-zinc-300 font-medium">{stochRsi.status}</span>
          </div>

          <div className="flex items-baseline justify-between pt-0.5">
            <span className="font-mono text-lg font-bold text-zinc-100">
              %K: {stochRsi.k}
            </span>
            <span className="font-mono text-xs text-zinc-400">
              %D: {stochRsi.d}
            </span>
          </div>
          <div className="text-[10px] text-zinc-500 leading-tight">
            Đo chu kỳ vi mô: báo hiệu nhịp cắt đảo chiều trước RSI truyền thống
          </div>
        </div>

        {/* Card 4: Fibonacci Golden Pocket */}
        <div className="p-3.5 bg-zinc-950/70 border border-zinc-800/80 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-violet-400" />
              Fibonacci 0.618
            </span>
            <span className="text-[10px] font-mono text-amber-400 font-semibold">Golden Pocket</span>
          </div>

          <div className="flex items-baseline justify-between pt-0.5">
            <span className="font-mono text-lg font-bold text-zinc-100">
              ${fibonacci.fib618}
            </span>
            <span className="font-mono text-xs text-zinc-400">
              Mở rộng 1.618: ${fibonacci.fib1618}
            </span>
          </div>
          <div className="text-[10px] text-zinc-500 leading-tight">
            Vùng phản ứng giá mạnh nhất trong lý thuyết sóng Elliott
          </div>
        </div>
      </div>
    </div>
  );
};
