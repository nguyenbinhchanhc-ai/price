'use client';

import React from 'react';
import { BarrierLevel } from '@/lib/types';
import { Milestone, CheckCircle2, ShieldAlert, ArrowRight, ShieldCheck, Zap, Layers } from 'lucide-react';

interface ObstaclesAndLevelsProps {
  barriers: BarrierLevel[];
  currentPrice: number;
  targetPrice: number;
  direction: 'UP' | 'DOWN';
}

export const ObstaclesAndLevels: React.FC<ObstaclesAndLevelsProps> = ({
  barriers,
  currentPrice,
  targetPrice,
  direction,
}) => {
  const isUp = direction === 'UP';

  return (
    <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <Milestone className="w-4 h-4 text-cyan-400" />
            <span>Các Vùng Cản Kỹ Thuật & Tỷ Lệ Đột Phá (Barrier Radar)</span>
          </h3>
          <p className="text-xs text-zinc-400">
            Lộ trình từng chặng từ ${currentPrice.toFixed(2)} đến ${targetPrice.toFixed(2)}
          </p>
        </div>

        <span className="text-xs font-mono text-zinc-400">
          {barriers.length > 0 ? `${barriers.length} chướng ngại vật then chốt` : 'Đường đi thông thoáng'}
        </span>
      </div>

      {barriers.length === 0 ? (
        <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-800 text-xs text-zinc-400 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            Mục tiêu rất gần hoặc nằm trong khoảng dao động tự do hiện tại. Không có rào cản kỹ thuật lớn chặn giữa đường.
          </span>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Visual step ladder */}
          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
            {/* Step 0: Starting Price */}
            <div className="relative flex items-center gap-3 text-xs">
              <span className="absolute -left-6 w-5 h-5 rounded-full bg-zinc-800 border-2 border-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">
                0
              </span>
              <div className="flex-1 bg-zinc-950/80 border border-zinc-800/70 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-zinc-400 font-medium">Xuất phát: Giá SOL Hiện Tại</span>
                  <div className="font-mono font-bold text-sm text-zinc-100">${currentPrice.toFixed(2)}</div>
                </div>
                <span className="text-[11px] text-indigo-400 font-mono font-medium">Khởi điểm</span>
              </div>
            </div>

            {/* Intermediate Obstacles */}
            {barriers.map((barrier, idx) => (
              <div key={idx} className="relative flex items-center gap-3 text-xs">
                <span className="absolute -left-6 w-5 h-5 rounded-full bg-zinc-900 border-2 border-cyan-500 flex items-center justify-center text-[10px] font-bold text-cyan-300">
                  {idx + 1}
                </span>

                <div className="flex-1 bg-zinc-950/80 border border-zinc-800/70 hover:border-zinc-700 transition-colors rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="space-y-1">
                    <div className="flex items-center flex-wrap gap-1.5">
                      <span className="font-semibold text-zinc-200">{barrier.label}</span>
                      {barrier.type === 'Fibonacci' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          Fibonacci
                        </span>
                      )}
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                          barrier.strength === 'High'
                            ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}
                      >
                        Độ cản: {barrier.strength === 'High' ? 'Mạnh' : 'Trung bình'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono">
                      <span>Cách hiện tại: {barrier.distancePercent > 0 ? '+' : ''}{barrier.distancePercent}%</span>
                      {barrier.breakoutProbability !== undefined && (
                        <span className="text-cyan-400 font-semibold">
                          Xác suất bứt phá: ~{barrier.breakoutProbability}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="font-mono font-bold text-sm text-zinc-100">${barrier.price.toFixed(2)}</div>
                    <div className="text-[11px] text-cyan-400 bg-cyan-950/40 px-2 py-1 rounded border border-cyan-800/40 font-mono">
                      Cột mốc #{idx + 1}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Final Step: Target Price */}
            <div className="relative flex items-center gap-3 text-xs">
              <span className="absolute -left-6 w-5 h-5 rounded-full bg-amber-500 border-2 border-amber-300 flex items-center justify-center text-[10px] font-bold text-zinc-950">
                ★
              </span>
              <div className="flex-1 bg-amber-950/20 border border-amber-500/40 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-amber-300 font-semibold">Đích Đến: Mức Giá Mục Tiêu</span>
                  <div className="font-mono font-bold text-base text-amber-200">${targetPrice.toFixed(2)}</div>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400">Hoàn thành mục tiêu</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
