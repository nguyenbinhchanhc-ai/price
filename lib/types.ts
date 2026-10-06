export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketSummary {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  volumeQuote24h: number;
  openInterestUsdt?: number;
  longShortRatio?: number;
  fundingRate?: number; // Real Binance Futures Funding Rate (e.g. 0.0001 = 0.01%)
  fundingTime?: number;
  lastUpdated: number;
}

export interface OrderBookLevel {
  price: number;
  qty: number;
  totalUsdt: number;
}

export interface OrderBookDepth {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  totalBidUsdt: number;
  totalAskUsdt: number;
  bidAskRatio: number; // > 1 means buy side heavier, < 1 means sell side heavier
  targetWall: {
    side: 'ASK' | 'BID';
    levelsCount: number;
    cumulativeSol: number;
    cumulativeUsdt: number;
    absorptionHours: number; // based on 24h real volume
    largestWallPrice: number;
    largestWallUsdt: number;
  };
}

export interface IndicatorAlert {
  id: string;
  type: 'bullish' | 'bearish' | 'warning' | 'info';
  title: string;
  description: string;
  indicator: string;
  severity: 'high' | 'medium' | 'low';
}

export interface FibonacciLevels {
  swingHigh: number;
  swingLow: number;
  fib0: number;      // 0.000 (Low)
  fib236: number;   // 0.236
  fib382: number;   // 0.382
  fib500: number;   // 0.500
  fib618: number;   // 0.618 (Golden Pocket)
  fib786: number;   // 0.786
  fib1000: number;  // 1.000 (High)
  fib1272: number;  // 1.272 (Extension)
  fib1618: number;  // 1.618 (Extension)
}

export interface TechnicalIndicators {
  rsi14: number;
  rsiSignal: 'Oversold' | 'Bullish' | 'Neutral' | 'Bearish' | 'Overbought';
  stochRsi: {
    k: number;
    d: number;
    status: 'Overbought' | 'Oversold' | 'Bullish Cross' | 'Bearish Cross' | 'Neutral';
  };
  macd: {
    macdLine: number;
    signalLine: number;
    histogram: number;
    trend: 'Bullish Crossover' | 'Bearish Crossover' | 'Bullish Momentum' | 'Bearish Momentum';
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
    bandwidth: number;
    percentB: number;
    isSqueeze: boolean;
  };
  vwap: {
    price: number;
    deviationPercent: number;
    position: 'Above VWAP' | 'Below VWAP';
  };
  mfi14: number;
  mfiSignal: 'Inflow Strong' | 'Normal Accumulation' | 'Neutral' | 'Outflow / Distribution';
  obv: {
    current: number;
    change7dPercent: number;
    trend: 'Strong Inflow' | 'Accumulation' | 'Distribution' | 'Heavy Outflow';
  };
  atr14: number;
  atrPercent: number;
  volatilityRegime: 'Squeeze / Nén chặt' | 'Biến động bình thường' | 'Biến động cao' | 'Bùng nổ cực đại';
  ema20: number;
  ema50: number;
  ema200: number;
  sma20: number;
  trendAlignment: 'Strong Bullish' | 'Bullish' | 'Neutral' | 'Bearish' | 'Strong Bearish';
  pivotPoints: {
    pivot: number;
    r1: number;
    r2: number;
    r3: number;
    s1: number;
    s2: number;
    s3: number;
  };
  fibonacci: FibonacciLevels;
  compositeHealthScore: number;
  alerts: IndicatorAlert[];
  historicalDailyVol: number;
  annualizedVol: number;
  annualizedDrift: number;
}

// 3 Real Market Calculation Mechanisms (Không mô phỏng)
export type CalcMode = 'empirical-backtest' | 'atr-velocity' | 'orderbook-liquidity';

export interface ProbabilityHorizon {
  days: number;
  historicalSuccessRate: number; // Actual historical % of episodes that hit this target within N days
  occurrencesMet: number; // Actual times target was reached in history
  totalAttempts: number;
}

export interface ScenarioFactorScore {
  name: string;
  score: number; // 0 - 100
  weight: number; // %
  bias: 'Supportive' | 'Neutral' | 'Opposing';
  summary: string;
}

export interface DominantScenarioSynthesis {
  scenarioKey: 'bullish' | 'base' | 'conservative';
  scenarioName: string;
  probability: number; // 0 - 100%
  confidenceLevel: 'Rất cao (Strong Conviction)' | 'Cao (High)' | 'Trung bình (Moderate)' | 'Thận trọng (Cautious)';
  compositeSynthesisScore: number; // 0 - 100
  reasoning: string;
  catalystsSummary: string;
  expectedTimeWindow: string;
  factorScores: ScenarioFactorScore[];
}

export interface ScenarioResult {
  key?: 'bullish' | 'base' | 'conservative';
  name: string;
  label: string;
  description: string;
  daysToHit: number | null;
  estimatedDate: string | null;
  dailyVelocityNeeded: number;
  probability: number;
  isDominant?: boolean;
  color: string;
}

export interface EmpiricalHistoricalResult {
  totalHistoricalEpisodes: number;
  successfulEpisodes: number;
  empiricalSuccessRate: number; // % of times this % move was achieved in SOL real history
  recordFastestDays: number | null;
  p25DaysToHit: number | null;
  medianDaysToHit: number | null;
  p75DaysToHit: number | null;
  maxDaysToHit: number | null;
  histogram: { dayRange: string; count: number; percentage: number }[];
  trajectoryBands: {
    day: number;
    fastPace: number;
    medianPace: number;
    conservativePace: number;
    upperATRBand: number;
    lowerATRBand: number;
  }[];
  closestHistoricalRun: {
    startDate: string;
    startPrice: number;
    hitDate: string;
    hitPrice: number;
    daysTaken: number;
    path: { day: number; price: number }[];
  } | null;
}

export interface BarrierLevel {
  label: string;
  price: number;
  type: 'Resistance' | 'Support' | 'Pivot' | 'Psychological' | 'Fibonacci';
  strength: 'High' | 'Medium' | 'Low';
  distancePercent: number;
  status: 'passed' | 'obstacle' | 'target';
  breakoutProbability?: number;
  orderBookVolumeUsdt?: number; // Real USDT wall standing at this exact level
}

export interface TargetAnalysis {
  targetPrice: number;
  currentPrice: number;
  priceDelta: number;
  priceDeltaPercent: number;
  direction: 'UP' | 'DOWN';
  distanceInATR: number;
  requiredDailyVelocityPercent: number;
  horizons: ProbabilityHorizon[];
  expectedDays: {
    min: number;
    expected: number;
    max: number;
  } | null;
  scenarios: {
    bullish: ScenarioResult;
    base: ScenarioResult;
    conservative: ScenarioResult;
  };
  barriers: BarrierLevel[];
  empirical: EmpiricalHistoricalResult;
  orderBook: OrderBookDepth | null;
  dominantScenario: DominantScenarioSynthesis;
  calcMode: CalcMode;
  confidenceScore: number;
}

export interface WhaleTrade {
  id: string;
  time: number;
  price: number;
  qty: number;
  amountUsdt: number;
  side: 'BUY' | 'SELL';
  whaleTier: 'Mega Whale ($500k+)' | 'Large Whale ($200k+)' | 'Shark ($50k+)';
}

export interface WhaleClusterBlock {
  id: string;
  side: 'BUY' | 'SELL';
  whaleTier: string;
  executionStyle: 'TWAP Algorithm' | 'Iceberg Order' | 'Market Sweep' | 'Block Accumulation' | string;
  timeRange: string;
  subOrderCount: number;
  totalAmountUsdt: number;
  totalQty: number;
  avgPrice: number;
  priceImpactPercent: number;
}

export interface WhaleAccumulationZone {
  priceRange: string;
  dominantAction: 'ACCUMULATION' | 'DISTRIBUTION';
  netFlowUsdt: number;
  buyVolumeUsdt: number;
  sellVolumeUsdt: number;
  buyRatio: number;
}

export interface WhaleTimeframeMetric {
  netFlowUsdt: number;
  buyRatio: number;
  buyVolumeUsdt: number;
  sellVolumeUsdt: number;
}

export interface WhaleTierBreakdown {
  megaWhales: { buyUsdt: number; sellUsdt: number; netUsdt: number };
  largeWhales: { buyUsdt: number; sellUsdt: number; netUsdt: number };
  sharks: { buyUsdt: number; sellUsdt: number; netUsdt: number };
}

export interface WhaleFlowSummary {
  recentWhaleTrades: WhaleTrade[];
  totalWhaleBuyUsdt: number;
  totalWhaleSellUsdt: number;
  netWhaleFlowUsdt: number;
  whaleBuyRatio: number; // e.g. 58.4%
  dominantSide: 'ACCUMULATION' | 'DISTRIBUTION' | 'BALANCED';
  whaleImpactScore: number; // 0 - 100
  totalSubOrdersAnalyzed: number;
  timeframes: {
    '1h': WhaleTimeframeMetric;
    '4h': WhaleTimeframeMetric;
    '24h': WhaleTimeframeMetric;
  };
  tierBreakdown: WhaleTierBreakdown;
  whaleClusters: WhaleClusterBlock[];
  accumulationZones: WhaleAccumulationZone[];
}

export interface DerivativesMetrics {
  openInterestSol: number;
  openInterestUsdt: number;
  openInterestChange24hPercent: number;
  globalLongShortRatio: number; // Account ratio e.g. 1.85
  topTraderLongShortRatio: number; // Top trader ratio e.g. 2.10
  fundingRate: number; // e.g. 0.0001
  annualizedFundingPercent: number; // e.g. 10.95%
  nextFundingMinutes: number;
  marketRegime: 'Squeeze Long' | 'Squeeze Short' | 'Healthy Leveraged Growth' | 'Deleveraging';
}

export interface LiquidityZone {
  id: string;
  priceLevel: number;
  type: 'Short Liquidation Pool' | 'Long Liquidation Pool' | 'Institutional Fair Value' | 'Breakout Trigger' | 'Order Book Bid Wall' | 'Order Book Ask Wall';
  estimatedVolumeUsdt: number;
  distancePercent: number;
  density: 'Extreme' | 'High' | 'Medium';
  magnetStrength: number; // 0 - 100
  source?: 'DERIVATIVES_LIQ' | 'ORDER_BOOK_L2' | 'TARGET_TRIGGER';
  solQuantity?: number;
  ordersCount?: number;
}

export interface MarketNewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url?: string;
  timestamp: number;
  timeAgo: string;
  category: 'ETF & Macro' | 'Firedancer & Network' | 'DeFi & On-Chain' | 'Institutional' | 'Regulation' | 'Solana Ecosystem';
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  impactScore: number; // -100 to +100
  impactLevel: 'Cực mạnh' | 'Đáng kể' | 'Vừa phải';
  isLiveFeed?: boolean;
}

export interface NewsSentimentSummary {
  overallScore: number; // -100 to +100
  sentimentLabel: 'Rất Tích Cực' | 'Tích Cực' | 'Trung Lập' | 'Tiêu Cực';
  bullishCount: number;
  bearishCount: number;
  neutralCount: number;
  topCatalyst: string;
  lastUpdated?: number;
}

export interface AIForecastResponse {
  sentiment: 'Bullish' | 'Neutral' | 'Bearish' | 'High Risk';
  targetFeasibility: 'Rất cao (Very High)' | 'Khả thi (Feasible)' | 'Thách thức (Challenging)' | 'Rủi ro cao (High Risk)';
  timeframeSummary: string;
  keyDrivers: string[];
  majorObstacles: string[];
  invalidationLevel: number;
  tradingThesis: string;
  tacticalAdvice: string;
}
