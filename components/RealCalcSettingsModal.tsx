'use client';

import React, { useState } from 'react';
import { X, RotateCcw, Sliders, Check, Cpu, History, TrendingUp, BookOpen } from 'lucide-react';
import { CalcMode } from '@/lib/types';

interface RealCalcSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  horizonDays: number;
  calcMode: CalcMode;
  onSave: (horizon: number, mode: CalcMode) => void;
  onReset: () => void;
}

export const RealCalcSettingsModal: React.FC<RealCalcSettingsModalProps> = ({
  isOpen,
  onClose,
  horizonDays,
  calcMode: initialMode,
  onSave,
  onReset,
}) => {
  const [horizon, setHorizon] = useState<number>(horizonDays);
  const [mode, setMode] = useState<CalcMode>(initialMode);

  if (!isOpen) return null;

  const handleApply = () => {
    onSave(horizon, mode);
    onClose();
  };

  const handleReset = () => {
    onReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 p-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100">
                Cơ Chế & Tham Số Định Lượng Thực Tế
              </h3>
              <p className="text-xs text-zinc-400">
                100% dựa trên dữ liệu thật: Lịch sử nến Binance, Tốc độ ATR & Tường thanh khoản sổ lệnh
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Real Mechanism Selection */}
        <div className="space-y-2.5">
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cơ Chế Tính Toán Trọng Tâm (Primary Mechanism)</span>
          </label>
          <div className="space-y-2">
            {[
              {
                id: 'empirical-backtest' as CalcMode,
                title: 'Thực Nghiệm Đối Chiếu Lịch Sử (Empirical History)',
                desc: 'Quét và so sánh trực tiếp với mọi chu kỳ thật trong 180 ngày lịch sử của SOL để tính toán số ngày hoàn thành thực tế.',
                icon: <History className="w-4 h-4 text-cyan-400" />,
              },
              {
                id: 'atr-velocity' as CalcMode,
                title: 'Động Học Tốc Độ Thực Tế theo ATR (ATR Velocity)',
                desc: 'Tính toán dựa trên biên độ biến động trung bình ngày thực tế kết hợp gia tốc dòng tiền (RSI, MFI, MACD).',
                icon: <TrendingUp className="w-4 h-4 text-amber-400" />,
              },
              {
                id: 'orderbook-liquidity' as CalcMode,
                title: 'Hấp Thụ Thanh Khoản Sổ Lệnh Binance (Order Book Depth)',
                desc: 'Đo lường độ dày của tường lệnh mua/bán và tính toán số giờ cần thiết để thị trường hấp thụ hết tường cản.',
                icon: <BookOpen className="w-4 h-4 text-emerald-400" />,
              },
            ].map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`w-full p-3.5 rounded-xl border text-left transition-all text-xs flex items-start gap-3 ${
                  mode === m.id
                    ? 'bg-zinc-950 border-cyan-500 ring-1 ring-cyan-500 text-white'
                    : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 mt-0.5">
                  {m.icon}
                </div>
                <div className="space-y-1">
                  <div className={`font-semibold ${mode === m.id ? 'text-cyan-400' : 'text-zinc-200'}`}>
                    {m.title}
                  </div>
                  <div className="text-[11px] text-zinc-400 leading-relaxed">
                    {m.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Max Time Horizon Slider */}
        <div className="space-y-2 p-3.5 bg-zinc-950/60 border border-zinc-800 rounded-xl">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-zinc-300">Khung Thời Gian Quét Tối Đa (Horizon)</span>
            <span className="font-mono text-cyan-400 font-bold">{horizon} ngày</span>
          </div>
          <input
            type="range"
            min={14}
            max={180}
            step={7}
            value={horizon}
            onChange={e => setHorizon(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
            <span>2 tuần (14d)</span>
            <span>1 tháng (30d)</span>
            <span>3 tháng (90d)</span>
            <span>6 tháng (180d)</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Mặc định
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-indigo-500 transition-all font-mono"
            >
              <Check className="w-3.5 h-3.5" />
              Áp Dụng Cơ Chế
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
