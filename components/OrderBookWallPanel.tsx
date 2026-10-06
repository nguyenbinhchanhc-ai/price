'use client';

import React, { useState, useMemo } from 'react';
import { OrderBookDepth } from '@/lib/types';
import {
  BookOpen,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  DollarSign,
  Clock,
  BarChart2,
  TrendingDown,
  TrendingUp,
  Sliders,
} from 'lucide-react';

interface OrderBookWallPanelProps {
  orderBook: OrderBookDepth | null;
  currentPrice: number;
  targetPrice: number;
  direction: 'UP' | 'DOWN';
}

export const OrderBookWallPanel: React.FC<OrderBookWallPanelProps> = ({
  orderBook,
  currentPrice,
  targetPrice,
  direction,
}) => {
  const [activeTab, setActiveTab] = useState<'WALLS' | 'TIERS' | 'SLIPPAGE'>('WALLS');

  const bookBids = orderBook?.bids;
  const bookAsks = orderBook?.asks;

  // Calculate dynamic multi-tier depth imbalance
  const depthTiers = useMemo(() => {
    if (!bookBids || !bookAsks) return [];

    const tiersConfig = [
      { range: '0.5%', pct: 0.005 },
      { range: '1.0%', pct: 0.01 },
      { range: '2.0%', pct: 0.02 },
      { range: '5.0%', pct: 0.05 },
    ];

    return tiersConfig.map(({ range, pct }) => {
      const bidUsdt = bookBids
        .filter(b => b.price >= currentPrice * (1 - pct))
        .reduce((sum, b) => sum + b.totalUsdt, 0);
      const askUsdt = bookAsks
        .filter(a => a.price <= currentPrice * (1 + pct))
        .reduce((sum, a) => sum + a.totalUsdt, 0);
      const ratio = askUsdt > 0 ? Number((bidUsdt / askUsdt).toFixed(2)) : 1.0;
      const bias: 'Buy Heavy' | 'Neutral' | 'Sell Heavy' =
        ratio >= 1.15 ? 'Buy Heavy' : ratio <= 0.85 ? 'Sell Heavy' : 'Neutral';

      return {
        range,
        bidUsdt: Math.round(bidUsdt),
        askUsdt: Math.round(askUsdt),
        ratio,
        bias,
      };
    });
  }, [bookBids, bookAsks, currentPrice]);

  // Calculate dynamic slippage simulation for market orders
  const slippageEstimates = useMemo(() => {
    if (!bookBids || !bookAsks) return [];

    const sizes = [50000, 200000, 500000, 1000000];

    return sizes.map(size => {
      // Simulate buying into asks
      let remainingBuy = size;
      let totalCostBuy = 0;
      let totalQtyBuy = 0;
      for (const a of bookAsks) {
        const fillAmount = Math.min(remainingBuy, a.totalUsdt);
        const fillQty = fillAmount / a.price;
        totalCostBuy += fillAmount;
        totalQtyBuy += fillQty;
        remainingBuy -= fillAmount;
        if (remainingBuy <= 0) break;
      }
      const avgBuyPrice = totalQtyBuy > 0 ? totalCostBuy / totalQtyBuy : currentPrice * 1.01;
      const buySlippage = Number((((avgBuyPrice - currentPrice) / currentPrice) * 100).toFixed(2));

      // Simulate selling into bids
      let remainingSell = size;
      let totalCostSell = 0;
      let totalQtySell = 0;
      for (const b of bookBids) {
        const fillAmount = Math.min(remainingSell, b.totalUsdt);
        const fillQty = fillAmount / b.price;
        totalCostSell += fillAmount;
        totalQtySell += fillQty;
        remainingSell -= fillAmount;
        if (remainingSell <= 0) break;
      }
      const avgSellPrice = totalQtySell > 0 ? totalCostSell / totalQtySell : currentPrice * 0.99;
      const sellSlippage = Number((((currentPrice - avgSellPrice) / currentPrice) * 100).toFixed(2));

      return {
        orderSizeUsdt: size,
        buySlippagePercent: buySlippage,
        buyExecutionPrice: avgBuyPrice,
        sellSlippagePercent: sellSlippage,
        sellExecutionPrice: avgSellPrice,
      };
    });
  }, [bookBids, bookAsks, currentPrice]);

  if (!orderBook) return null;

  const { targetWall, bidAskRatio, totalBidUsdt, totalAskUsdt, bids, asks } = orderBook;

  return (
    <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
        <div>
          <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>Độ Sâu Sổ Lệnh, Tường Thanh Khoản & Đo Trượt Giá (Microstructure)</span>
          </h3>
          <p className="text-xs text-zinc-400">
            Dữ liệu sổ lệnh trực tiếp: Khối lượng USDT thực tế đang chặn giữa ${currentPrice.toFixed(2)} và ${targetPrice.toFixed(2)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">Tỷ lệ Mua / Bán:</span>
          <span
            className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold border ${
              bidAskRatio >= 1.15
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : bidAskRatio <= 0.85
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                : 'bg-zinc-800 text-zinc-300 border-zinc-700'
            }`}
          >
            {bidAskRatio}x ({bidAskRatio >= 1 ? 'Phe Mua Áp Đảo' : 'Phe Bán Áp Đảo'})
          </span>
        </div>
      </div>

      {/* Target Wall Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
        {/* Metric 1: Total Wall in USDT */}
        <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5 text-[10px]">
              <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
              Tổng Tường Cản Thực
            </span>
            <span className="text-[10px] font-mono text-zinc-500">{targetWall.side} Side</span>
          </div>
          <div className="font-mono text-lg font-bold text-zinc-100">
            ${(targetWall.cumulativeUsdt / 1_000_000).toFixed(2)}M USDT
          </div>
          <div className="text-[10px] text-zinc-500 font-mono">
            Tương đương: {targetWall.cumulativeSol.toLocaleString()} SOL
          </div>
        </div>

        {/* Metric 2: Estimated Absorption Time */}
        <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5 text-[10px]">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Thời Gian Hấp Thụ Tường
            </span>
            <span className="text-[10px] font-mono text-zinc-500">Theo Vol 24h</span>
          </div>
          <div className="font-mono text-lg font-bold text-zinc-100">
            ~{targetWall.absorptionHours} giờ
          </div>
          <div className="text-[10px] text-zinc-500">
            {targetWall.absorptionHours < 24
              ? 'Thanh khoản mỏng, dễ bứt phá'
              : 'Tường dày, cần volume bùng nổ'}
          </div>
        </div>

        {/* Metric 3: Heaviest Wall Level */}
        <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5 text-[10px]">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              Tường Lệnh Nặng Nhất
            </span>
            <span className="text-[10px] font-mono text-zinc-500">Chặn giá</span>
          </div>
          <div className="font-mono text-lg font-bold text-zinc-100">
            ${targetWall.largestWallPrice.toFixed(2)}
          </div>
          <div className="text-[10px] text-zinc-500 font-mono">
            Khối lượng: ${(targetWall.largestWallUsdt / 1_000).toFixed(0)}K USDT
          </div>
        </div>

        {/* Metric 4: Total Order Book Balance */}
        <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5 text-[10px]">
              <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
              Tổng Độ Sâu 100 Tầng
            </span>
            <span className="text-[10px] font-mono text-zinc-500">Bids vs Asks</span>
          </div>
          <div className="flex items-baseline justify-between font-mono pt-0.5">
            <span className="text-emerald-400 font-bold">${(totalBidUsdt / 1_000_000).toFixed(1)}M</span>
            <span className="text-zinc-600">/</span>
            <span className="text-rose-400 font-bold">${(totalAskUsdt / 1_000_000).toFixed(1)}M</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full"
              style={{ width: `${(totalBidUsdt / (totalBidUsdt + totalAskUsdt || 1)) * 100}%` }}
            />
            <div
              className="bg-rose-500 h-full"
              style={{ width: `${(totalAskUsdt / (totalBidUsdt + totalAskUsdt || 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sub Tabs: Ladder vs Depth Tiers vs Slippage */}
      <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('WALLS')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition-all ${
            activeTab === 'WALLS'
              ? 'bg-zinc-800 text-white shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Sổ Lệnh 100 Bước Giá
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('TIERS')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition-all ${
            activeTab === 'TIERS'
              ? 'bg-zinc-800 text-cyan-300 shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Cân Bằng Độ Sâu Từng Tầng (0.5% - 5%)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('SLIPPAGE')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-medium transition-all ${
            activeTab === 'SLIPPAGE'
              ? 'bg-zinc-800 text-amber-300 shadow-sm'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Mô Phỏng Trượt Giá Lệnh Lớn (Slippage)
        </button>
      </div>

      {/* Content for TAB 1: Sổ Lệnh */}
      {activeTab === 'WALLS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Asks (Sell Orders) */}
          <div className="p-3.5 bg-zinc-950/60 rounded-xl border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs text-rose-400 font-semibold uppercase tracking-wider">
              <span>Sổ Bán (Asks - Cản Tăng)</span>
              <span className="text-[10px] font-mono text-zinc-500">Giá · Số lượng · Tổng</span>
            </div>
            <div className="space-y-1 font-mono text-xs">
              {asks.slice(0, 6).map((ask, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-1.5 rounded bg-zinc-900/60 hover:bg-zinc-800/60 text-[11px]"
                >
                  <span className="text-rose-400 font-bold">${ask.price.toFixed(2)}</span>
                  <span className="text-zinc-300">{ask.qty.toFixed(1)} SOL</span>
                  <span className="text-zinc-400">${(ask.totalUsdt / 1000).toFixed(1)}K</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bids (Buy Orders) */}
          <div className="p-3.5 bg-zinc-950/60 rounded-xl border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold uppercase tracking-wider">
              <span>Sổ Mua (Bids - Đỡ Giảm)</span>
              <span className="text-[10px] font-mono text-zinc-500">Giá · Số lượng · Tổng</span>
            </div>
            <div className="space-y-1 font-mono text-xs">
              {bids.slice(0, 6).map((bid, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-1.5 rounded bg-zinc-900/60 hover:bg-zinc-800/60 text-[11px]"
                >
                  <span className="text-emerald-400 font-bold">${bid.price.toFixed(2)}</span>
                  <span className="text-zinc-300">{bid.qty.toFixed(1)} SOL</span>
                  <span className="text-zinc-400">${(bid.totalUsdt / 1000).toFixed(1)}K</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content for TAB 2: Multi-tier Depth Imbalance */}
      {activeTab === 'TIERS' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {depthTiers.map(tier => (
            <div key={tier.range} className="p-3.5 bg-zinc-950/70 border border-zinc-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-zinc-200">Biên độ ±{tier.range}</span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                    tier.bias === 'Buy Heavy'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : tier.bias === 'Sell Heavy'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                >
                  {tier.bias}
                </span>
              </div>

              <div className="space-y-1 font-mono">
                <div className="flex justify-between text-zinc-400 text-[11px]">
                  <span>Bids (Mua):</span>
                  <span className="text-emerald-400 font-bold">${(tier.bidUsdt / 1000).toFixed(0)}K</span>
                </div>
                <div className="flex justify-between text-zinc-400 text-[11px]">
                  <span>Asks (Bán):</span>
                  <span className="text-rose-400 font-bold">${(tier.askUsdt / 1000).toFixed(0)}K</span>
                </div>
                <div className="flex justify-between text-zinc-500 text-[10px] pt-1 border-t border-zinc-800/80">
                  <span>Tỷ lệ Bid/Ask:</span>
                  <span className="text-zinc-200 font-bold">{tier.ratio}x</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content for TAB 3: Slippage Estimator */}
      {activeTab === 'SLIPPAGE' && (
        <div className="space-y-2.5 text-xs">
          <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80 text-zinc-400 text-[11px]">
            Ước tính mức trượt giá (Slippage) nếu cá voi hoặc quỹ đặt một lệnh Market Mua / Bán đột ngột vào sổ lệnh hiện tại của Binance:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {slippageEstimates.map(est => (
              <div key={est.orderSizeUsdt} className="p-3.5 bg-zinc-950/70 border border-zinc-800 rounded-xl space-y-2 font-mono">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-cyan-400">
                    ${(est.orderSizeUsdt / 1000).toFixed(0)}K USD
                  </span>
                  <span className="text-[10px] text-zinc-500">Lệnh Market</span>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800/60 space-y-0.5">
                    <div className="text-emerald-400 font-semibold flex justify-between">
                      <span>Trượt giá Mua:</span>
                      <span>+{est.buySlippagePercent}%</span>
                    </div>
                    <div className="text-zinc-400 text-[10px]">
                      Khớp trung bình: ${est.buyExecutionPrice.toFixed(2)}
                    </div>
                  </div>

                  <div className="p-2 rounded bg-zinc-900/60 border border-zinc-800/60 space-y-0.5">
                    <div className="text-rose-400 font-semibold flex justify-between">
                      <span>Trượt giá Bán:</span>
                      <span>-{est.sellSlippagePercent}%</span>
                    </div>
                    <div className="text-zinc-400 text-[10px]">
                      Khớp trung bình: ${est.sellExecutionPrice.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
