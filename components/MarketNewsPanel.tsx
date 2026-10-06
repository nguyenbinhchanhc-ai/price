'use client';

import React, { useState } from 'react';
import { MarketNewsItem, NewsSentimentSummary } from '@/lib/types';
import {
  Newspaper,
  TrendingUp,
  TrendingDown,
  Clock,
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Radio,
  Flame,
  Globe,
} from 'lucide-react';

interface MarketNewsPanelProps {
  newsData: {
    news: MarketNewsItem[];
    summary: NewsSentimentSummary;
  };
  onRefreshNews?: () => void;
  isRefreshing?: boolean;
}

export const MarketNewsPanel: React.FC<MarketNewsPanelProps> = ({
  newsData,
  onRefreshNews,
  isRefreshing = false,
}) => {
  const { news, summary } = newsData;
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedSentiment, setSelectedSentiment] = useState<'ALL' | 'Bullish' | 'Bearish' | 'Neutral'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter news items
  const filteredNews = news.filter((item) => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSentiment = selectedSentiment === 'ALL' || item.sentiment === selectedSentiment;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.source.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSentiment && matchesSearch;
  });

  const formattedLastUpdated = summary.lastUpdated
    ? new Date(summary.lastUpdated).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : 'Vừa xong';

  return (
    <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Newspaper className="w-5 h-5 text-sky-400 shrink-0" />
            <h3 className="text-sm sm:text-base font-semibold text-zinc-100">
              Tin Tức Thị Trường & Điểm Lượng Hóa Tác Động Realtime (Live News & Catalysts)
            </h3>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
              LIVE FEED
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Cập nhật tin tức liên tục từ CoinTelegraph, CoinDesk & các chất xúc tác on-chain Solana thực tế
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="text-xs font-mono bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800 flex items-center gap-2">
            <span className="text-zinc-400">Điểm tổng hợp:</span>
            <strong className="text-emerald-400 text-sm font-bold">
              {summary.overallScore > 0 ? '+' : ''}{summary.overallScore}/100
            </strong>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
              {summary.sentimentLabel}
            </span>
          </div>

          {onRefreshNews && (
            <button
              onClick={onRefreshNews}
              disabled={isRefreshing}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-lg border border-zinc-700 transition-all disabled:opacity-50"
              title="Làm mới nguồn tin tức tức thì"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-sky-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Làm mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Sentiment Counts & Catalyst Highlight */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 p-3.5 bg-zinc-950/80 rounded-xl border border-zinc-800/70 text-xs">
        <div className="space-y-1">
          <span className="text-[11px] text-zinc-400 font-mono">Xúc Tác Trọng Tâm (Top Catalyst)</span>
          <div className="font-semibold text-zinc-100 text-xs line-clamp-2">
            {summary.topCatalyst}
          </div>
          <p className="text-[10px] text-zinc-500 font-mono">Cập nhật lúc: {formattedLastUpdated}</p>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] text-zinc-400 font-mono">Tin Tức Tích Cực (Bullish)</span>
          <div className="font-mono font-bold text-base text-emerald-400 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4" />
            <span>{summary.bullishCount} tin tức</span>
          </div>
          <p className="text-[10px] text-zinc-500">Tác động thúc đẩy giá tích cực</p>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] text-zinc-400 font-mono">Tin Tức Thận Trọng (Neutral/Risk)</span>
          <div className="font-mono font-bold text-base text-zinc-300">
            {summary.neutralCount + summary.bearishCount} tin tức
          </div>
          <p className="text-[10px] text-zinc-500">
            {summary.bearishCount > 0 ? `${summary.bearishCount} tin tiêu cực` : 'Chưa có tin rủi ro lớn'}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] text-zinc-400 font-mono">Trọng Số Dự Báo (Pillar 5)</span>
          <div className="font-mono font-bold text-base text-cyan-300">
            20% Trọng số lượng hóa
          </div>
          <p className="text-[10px] text-zinc-500">Động cơ tính toán xác suất 5 trụ cột</p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1 border-t border-zinc-800/50">
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          {['ALL', 'Solana Ecosystem', 'ETF & Macro', 'Firedancer & Network', 'DeFi & On-Chain', 'Institutional'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
                  : 'bg-zinc-950/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {cat === 'ALL' ? 'Tất Cả' : cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Sentiment Filter Pills */}
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs">
            <button
              onClick={() => setSelectedSentiment('ALL')}
              className={`px-2 py-0.5 rounded text-[11px] ${
                selectedSentiment === 'ALL' ? 'bg-zinc-800 text-zinc-200 font-bold' : 'text-zinc-400'
              }`}
            >
              Mọi chiều
            </button>
            <button
              onClick={() => setSelectedSentiment('Bullish')}
              className={`px-2 py-0.5 rounded text-[11px] ${
                selectedSentiment === 'Bullish' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-zinc-400'
              }`}
            >
              Tăng
            </button>
            <button
              onClick={() => setSelectedSentiment('Bearish')}
              className={`px-2 py-0.5 rounded text-[11px] ${
                selectedSentiment === 'Bearish' ? 'bg-rose-500/20 text-rose-300 font-bold' : 'text-zinc-400'
              }`}
            >
              Giảm
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-44">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm tin..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-2.5 py-1 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>
      </div>

      {/* News Item Feed */}
      <div className="space-y-2.5">
        {filteredNews.length === 0 ? (
          <div className="p-8 text-center bg-zinc-950/50 rounded-xl border border-zinc-800/60 text-zinc-500 text-xs">
            Không tìm thấy tin tức nào khớp với bộ lọc hiện tại.
          </div>
        ) : (
          filteredNews.map((item) => {
            const isBullish = item.sentiment === 'Bullish';
            const isBearish = item.sentiment === 'Bearish';

            return (
              <div
                key={item.id}
                className="bg-zinc-950/70 border border-zinc-800/70 hover:border-zinc-700/90 rounded-xl p-3.5 space-y-2 transition-all hover:bg-zinc-950/90"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {item.category}
                    </span>
                    <span className="text-[11px] text-zinc-500 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      {item.timeAgo}
                    </span>
                    <span className="text-[11px] text-zinc-400 font-mono flex items-center gap-1">
                      <Globe className="w-3 h-3 text-zinc-500" />
                      {item.source}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-zinc-400 font-mono">Tác động:</span>
                    <span
                      className={`font-mono font-bold text-xs px-2 py-0.5 rounded border ${
                        item.impactScore > 0
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : item.impactScore < 0
                          ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                      }`}
                    >
                      {item.impactScore > 0 ? '+' : ''}{item.impactScore}đ ({item.impactLevel})
                    </span>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-sm font-semibold text-zinc-100 leading-snug">
                    {item.title}
                  </h4>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-500 hover:text-sky-400 transition-colors p-1 shrink-0"
                      title="Mở bài viết gốc"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  {item.summary}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
