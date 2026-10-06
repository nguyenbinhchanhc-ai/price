'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  MarketSummary,
  Candle,
  TechnicalIndicators,
  TargetAnalysis,
  CalcMode,
  OrderBookDepth,
  WhaleFlowSummary,
  DerivativesMetrics,
  LiquidityZone,
  MarketNewsItem,
  NewsSentimentSummary,
} from '@/lib/types';
import {
  fetchSolMarketData,
  fetchWhaleTrades,
  fetchDerivativesMetrics,
  calculateLiquidityZones,
  fetchLiveLiquidityData,
  fetchLiveNewsAndCatalysts,
  getMarketNewsAndCatalysts,
} from '@/lib/market-data';
import { analyzeTargetPrice } from '@/lib/quant-math';
import { Header } from '@/components/Header';
import { TargetPriceInput } from '@/components/TargetPriceInput';
import { ProbabilitySummary } from '@/components/ProbabilitySummary';
import { LiveIndicatorMonitor } from '@/components/LiveIndicatorMonitor';
import { OrderBookWallPanel } from '@/components/OrderBookWallPanel';
import { ForecastChart } from '@/components/ForecastChart';
import { EmpiricalDistribution } from '@/components/EmpiricalDistribution';
import { TechnicalIndicatorsGrid } from '@/components/TechnicalIndicatorsGrid';
import { ObstaclesAndLevels } from '@/components/ObstaclesAndLevels';
import { AIForecastPanel } from '@/components/AIForecastPanel';
import { WhaleTrackerPanel } from '@/components/WhaleTrackerPanel';
import { LiquidityHeatmapPanel } from '@/components/LiquidityHeatmapPanel';
import { MarketNewsPanel } from '@/components/MarketNewsPanel';
import { RealCalcSettingsModal } from '@/components/RealCalcSettingsModal';
import { RefreshCw, Fish, Flame, Newspaper, BookOpen, BarChart3, Activity } from 'lucide-react';

export default function Home() {
  const [summary, setSummary] = useState<MarketSummary | null>(null);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [indicators, setIndicators] = useState<TechnicalIndicators | null>(null);
  const [orderBook, setOrderBook] = useState<OrderBookDepth | null>(null);
  const [whaleData, setWhaleData] = useState<WhaleFlowSummary | null>(null);
  const [derivatives, setDerivatives] = useState<DerivativesMetrics | null>(null);
  const [liquidityZones, setLiquidityZones] = useState<LiquidityZone[]>([]);
  const [newsData, setNewsData] = useState<{ news: MarketNewsItem[]; summary: NewsSentimentSummary } | null>(null);

  const [isRefreshingLiquidity, setIsRefreshingLiquidity] = useState<boolean>(false);
  const [isRefreshingNews, setIsRefreshingNews] = useState<boolean>(false);

  const [targetPrice, setTargetPrice] = useState<number>(180);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'all' | 'forecast' | 'whales' | 'liquidity' | 'orderbook' | 'news'>('all');

  // 100% Real Calculation Mechanism
  const [selectedMode, setSelectedMode] = useState<CalcMode>('empirical-backtest');
  const [customHorizon, setCustomHorizon] = useState<number>(90);

  // Fast Realtime Liquidity Refresh from Binance L2 and Derivatives
  const handleRefreshLiquidity = useCallback(async () => {
    setIsRefreshingLiquidity(true);
    try {
      const liveData = await fetchLiveLiquidityData(
        targetPrice,
        summary?.price || 153.4,
        summary?.volume24h || 8000000
      );
      setOrderBook(liveData.orderBook);
      setLiquidityZones(liveData.liquidityZones);
      setDerivatives(liveData.derivatives);

      if (liveData.price && (!summary || Math.abs(liveData.price - summary.price) > 0.02)) {
        setSummary(prev => (prev ? { ...prev, price: liveData.price, lastUpdated: Date.now() } : prev));
      }
    } catch (err) {
      console.error('Error refreshing liquidity realtime:', err);
    } finally {
      setIsRefreshingLiquidity(false);
    }
  }, [summary, targetPrice]);

  // Fast Realtime News Refresh from API Feed
  const handleRefreshNews = useCallback(async () => {
    setIsRefreshingNews(true);
    try {
      const latestNews = await fetchLiveNewsAndCatalysts();
      setNewsData(latestNews);
    } catch (err) {
      console.error('Error refreshing news realtime:', err);
    } finally {
      setIsRefreshingNews(false);
    }
  }, []);

  // Load all market dimensions directly from Binance
  const loadMarket = useCallback(async () => {
    try {
      const data = await fetchSolMarketData(targetPrice);
      setSummary(data.summary);
      setCandles(data.candles);
      setIndicators(data.indicators);
      setOrderBook(data.orderBook);

      const price = data.summary.price;

      // Parallel fetch for deep whale, derivatives and news data
      const [whales, deriv, news] = await Promise.all([
        fetchWhaleTrades(price),
        fetchDerivativesMetrics(price),
        fetchLiveNewsAndCatalysts(),
      ]);

      setWhaleData(whales);
      setDerivatives(deriv);
      setNewsData(news);
      setLiquidityZones(calculateLiquidityZones(price, targetPrice, data.orderBook, deriv));

      setTargetPrice(prev => {
        if (prev === 180 && price > 0) {
          return Math.round(price * 1.18);
        }
        return prev;
      });
    } catch (err) {
      console.error('Error fetching real market data from Binance:', err);
    } finally {
      setLoading(false);
    }
  }, [targetPrice]);

  const handleManualRefresh = useCallback(async () => {
    setLoading(true);
    await loadMarket();
  }, [loadMarket]);

  useEffect(() => {
    let ignore = false;

    async function initialLoad() {
      try {
        const data = await fetchSolMarketData(180);
        if (!ignore) {
          setSummary(data.summary);
          setCandles(data.candles);
          setIndicators(data.indicators);
          setOrderBook(data.orderBook);

          const price = data.summary.price;
          const [whales, deriv, news] = await Promise.all([
            fetchWhaleTrades(price),
            fetchDerivativesMetrics(price),
            fetchLiveNewsAndCatalysts(),
          ]);

          setWhaleData(whales);
          setDerivatives(deriv);
          setNewsData(news);
          setLiquidityZones(calculateLiquidityZones(price, 180, data.orderBook, deriv));

          setTargetPrice(prev => {
            if (prev === 180 && price > 0) {
              return Math.round(price * 1.18);
            }
            return prev;
          });
          setLoading(false);
        }
      } catch (err) {
        console.error('Error initializing market data:', err);
        if (!ignore) setLoading(false);
      }
    }

    initialLoad();

    // 1. Fast realtime polling for Liquidity Zones & L2 Order Book (every 8 seconds)
    const liquidityTimer = setInterval(() => {
      handleRefreshLiquidity();
    }, 8000);

    // 2. Realtime polling for live news feed (every 30 seconds)
    const newsTimer = setInterval(() => {
      handleRefreshNews();
    }, 30000);

    // 3. Complete market klines & indicator recalculation (every 30 seconds)
    const marketTimer = setInterval(() => {
      loadMarket();
    }, 30000);

    return () => {
      ignore = true;
      clearInterval(liquidityTimer);
      clearInterval(newsTimer);
      clearInterval(marketTimer);
    };
  }, [loadMarket, handleRefreshLiquidity, handleRefreshNews]);

  // Compute Target Analysis with the 5 Quantitative Pillars
  const analysis: TargetAnalysis | null = useMemo(() => {
    if (!summary || !indicators || candles.length === 0) return null;

    return analyzeTargetPrice(
      summary.price,
      targetPrice,
      indicators,
      candles,
      orderBook,
      {
        horizonDays: customHorizon,
        calcMode: selectedMode,
        whales: whaleData,
        derivatives,
        newsItems: newsData?.news,
        newsSummary: newsData?.summary,
        liquidityZones,
        changePercent24h: summary.changePercent24h,
        change24h: summary.change24h,
      }
    );
  }, [summary, indicators, candles, orderBook, targetPrice, customHorizon, selectedMode, whaleData, derivatives, newsData, liquidityZones]);

  const handleSaveSettings = (horizon: number, mode: CalcMode) => {
    setCustomHorizon(horizon);
    setSelectedMode(mode);
  };

  const handleResetSettings = () => {
    setCustomHorizon(90);
    setSelectedMode('empirical-backtest');
  };

  const currentPrice = summary?.price ?? 153.4;

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Header */}
      <Header
        summary={summary}
        loading={loading}
        onRefresh={handleManualRefresh}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Target Price Controller Card */}
        <section aria-label="Mục tiêu giá">
          <TargetPriceInput
            currentPrice={currentPrice}
            targetPrice={targetPrice}
            onTargetChange={setTargetPrice}
            indicators={indicators}
          />
        </section>

        {/* Quick View Category Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950/40'
                : 'bg-zinc-950/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
            }`}
          >
            <span>Tất Cả Chỉ Số</span>
          </button>
          <button
            onClick={() => setActiveTab('forecast')}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'forecast'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950/40'
                : 'bg-zinc-950/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Kịch Bản & Dự Báo Xác Suất</span>
          </button>
          <button
            onClick={() => setActiveTab('whales')}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'whales'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-950/40'
                : 'bg-zinc-950/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
            }`}
          >
            <Fish className="w-3.5 h-3.5 text-emerald-400" />
            <span>Lệnh Cá Voi & Cá Mập</span>
          </button>
          <button
            onClick={() => setActiveTab('liquidity')}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'liquidity'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-950/40'
                : 'bg-zinc-950/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Vùng Thanh Khoản & Phái Sinh</span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              LIVE
            </span>
          </button>
          <button
            onClick={() => setActiveTab('orderbook')}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'orderbook'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-950/40'
                : 'bg-zinc-950/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Sổ Lệnh & Tường Cản</span>
          </button>
          <button
            onClick={() => setActiveTab('news')}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'news'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm shadow-sky-950/40'
                : 'bg-zinc-950/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5 text-sky-400" />
            <span>Tin Tức & Xúc Tác Vĩ Mô</span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-sky-400 bg-sky-500/10 px-1.5 py-0.2 rounded border border-sky-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
              FEED
            </span>
          </button>
        </div>

        {analysis ? (
          <>
            {/* Primary Probability & Dominant Scenario Synthesis */}
            {(activeTab === 'all' || activeTab === 'forecast') && (
              <section aria-label="Dự báo thời gian và xác suất thực tế">
                <ProbabilitySummary analysis={analysis} />
              </section>
            )}

            {/* Whale Order Flow Radar */}
            {(activeTab === 'all' || activeTab === 'whales') && whaleData && (
              <section aria-label="Lệnh cá voi và cá mập">
                <WhaleTrackerPanel
                  whaleData={whaleData}
                  currentPrice={currentPrice}
                />
              </section>
            )}

            {/* Liquidity Heatmap & Derivatives Liquidation Pools */}
            {(activeTab === 'all' || activeTab === 'liquidity') && (
              <section aria-label="Vùng thanh khoản và cụm thanh lý">
                <LiquidityHeatmapPanel
                  liquidityZones={liquidityZones}
                  derivatives={derivatives}
                  currentPrice={currentPrice}
                  targetPrice={targetPrice}
                  onRefreshLiquidity={handleRefreshLiquidity}
                  isRefreshing={isRefreshingLiquidity}
                />
              </section>
            )}

            {/* Real Binance Order Book Depth & Liquidity Wall */}
            {(activeTab === 'all' || activeTab === 'orderbook') && orderBook && (
              <section aria-label="Độ sâu sổ lệnh và tường cản thực tế">
                <OrderBookWallPanel
                  orderBook={orderBook}
                  currentPrice={currentPrice}
                  targetPrice={targetPrice}
                  direction={analysis.direction}
                />
              </section>
            )}

            {/* Market News & Macro Catalysts Panel */}
            {(activeTab === 'all' || activeTab === 'news') && newsData && (
              <section aria-label="Tin tức thị trường và xúc tác vĩ mô">
                <MarketNewsPanel
                  newsData={newsData}
                  onRefreshNews={handleRefreshNews}
                  isRefreshing={isRefreshingNews}
                />
              </section>
            )}

            {/* Projection Chart with Real Candlesticks and Empirical Bands */}
            {(activeTab === 'all' || activeTab === 'forecast') && (
              <section aria-label="Biểu đồ dự báo thực tế">
                <ForecastChart
                  candles={candles}
                  currentPrice={currentPrice}
                  targetPrice={targetPrice}
                  empirical={analysis.empirical}
                />
              </section>
            )}

            {/* Real Historical Arrival Time Frequency Distribution - Responsive Bug Fix */}
            {(activeTab === 'all' || activeTab === 'forecast') && (
              <section aria-label="Phân bổ thời gian chạm mốc trong lịch sử">
                <EmpiricalDistribution
                  empirical={analysis.empirical}
                  targetPrice={targetPrice}
                  currentPrice={currentPrice}
                />
              </section>
            )}

            {/* Live Indicator Monitor & Multi-Mechanism Model Switcher */}
            {(activeTab === 'all' || activeTab === 'forecast') && indicators && (
              <section aria-label="Giám sát chỉ số và cơ chế tính toán thực tế">
                <LiveIndicatorMonitor
                  indicators={indicators}
                  currentPrice={currentPrice}
                  selectedMode={selectedMode}
                  onSelectMode={setSelectedMode}
                  empirical={analysis.empirical}
                  confidenceScore={analysis.confidenceScore}
                />
              </section>
            )}

            {/* Two-Column Layout: Path Barriers & Deep Technical Indicators */}
            {(activeTab === 'all' || activeTab === 'forecast') && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Obstacles Ladder */}
                <div className="lg:col-span-5">
                  <ObstaclesAndLevels
                    barriers={analysis.barriers}
                    currentPrice={currentPrice}
                    targetPrice={targetPrice}
                    direction={analysis.direction}
                  />
                </div>

                {/* Technical Indicators Summary */}
                <div className="lg:col-span-7">
                  {indicators && (
                    <TechnicalIndicatorsGrid
                      indicators={indicators}
                      currentPrice={currentPrice}
                    />
                  )}
                </div>
              </div>
            )}

            {/* AI Quantitative Thesis & Tactical Blueprint */}
            {(activeTab === 'all' || activeTab === 'forecast') && (
              <section aria-label="Phân tích AI định lượng">
                <AIForecastPanel
                  analysis={analysis}
                  indicators={indicators}
                />
              </section>
            )}
          </>
        ) : (
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
            <div className="text-sm font-medium text-zinc-300">
              Đang đồng bộ dữ liệu nến Binance, sổ lệnh, cá voi và tính toán kịch bản xác suất cao nhất...
            </div>
          </div>
        )}
      </main>

      {/* Real Calculation Settings Modal */}
      <RealCalcSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        horizonDays={customHorizon}
        calcMode={selectedMode}
        onSave={handleSaveSettings}
        onReset={handleResetSettings}
      />

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/60 py-6 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-zinc-400">SOL Real Quant Multi-Factor Engine</span>
            <span>·</span>
            <span>100% Thực tế: Đối chiếu lịch sử chu kỳ · Tường sổ lệnh · Cá voi · Vùng thanh khoản · Tin tức vĩ mô</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-zinc-500">
            <span>Dữ liệu trực tiếp Binance Spot & Futures API</span>
            <span>·</span>
            <span>AI Powered by Gemini 3.8 Flash</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
