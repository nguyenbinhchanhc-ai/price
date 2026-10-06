import { GoogleGenAI, Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

interface CacheEntry {
  data: Record<string, unknown>;
  timestamp: number;
}

const forecastCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache
const ERROR_BACKOFF_TTL_MS = 2 * 60 * 1000; // 2 minutes backoff on quota limits
let lastQuotaExceededTime = 0;

export async function POST(req: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const {
    currentPrice = 155,
    targetPrice = 180,
    priceDeltaPercent = 16.1,
    direction = 'UP',
    indicators,
    expectedDays,
    overallHitProbability = 54,
    distanceInATR = 3.2,
    barriers,
  } = body as {
    currentPrice?: number;
    targetPrice?: number;
    priceDeltaPercent?: number;
    direction?: 'UP' | 'DOWN';
    indicators?: Record<string, unknown>;
    expectedDays?: { min: number; max: number; expected: number } | null;
    overallHitProbability?: number;
    distanceInATR?: number;
    barriers?: Array<{ label: string; price: number }>;
  };

  const cPrice = Number(currentPrice) || 155;
  const tPrice = Number(targetPrice) || 180;
  const deltaPct = Number(priceDeltaPercent) || 16.1;
  const dir = direction === 'DOWN' ? 'DOWN' : 'UP';
  const prob = Number(overallHitProbability) || 50;
  const atrDist = Number(distanceInATR) || 3.0;

  const fallbackData = {
    sentiment: dir === 'UP' ? 'Bullish' : 'Bearish',
    targetFeasibility: Math.abs(deltaPct) < 25 ? 'Khả thi (Feasible)' : 'Thách thức (Challenging)',
    timeframeSummary: expectedDays
      ? `Dự kiến dao động trong khoảng ${expectedDays.min} - ${expectedDays.max} ngày (trung bình ~${expectedDays.expected} ngày) theo dữ liệu đối chiếu lịch sử thực tế.`
      : 'Cần từ 30 - 60 ngày để tích lũy và bứt phá qua các vùng cản lớn.',
    keyDrivers: [
      'Duy trì khối lượng giao dịch trên mức trung bình 20 ngày (MA20 Volume)',
      `Đóng nến dứt khoát trên mốc cản gần nhất $${(indicators as { pivotPoints?: { r1?: number } })?.pivotPoints?.r1 || Math.round(cPrice * 1.05)}`,
      'Sự hỗ trợ đồng thuận từ xu hướng Bitcoin và dòng tiền hệ sinh thái Solana',
    ],
    majorObstacles: (barriers || []).map(b => `${b.label} ($${b.price})`).slice(0, 3),
    invalidationLevel: dir === 'UP'
      ? Number((cPrice * 0.93).toFixed(2))
      : Number((cPrice * 1.07).toFixed(2)),
    tradingThesis: `Với khoảng cách ${deltaPct > 0 ? '+' : ''}${deltaPct}% (tương đương ${atrDist} lần biên độ biến động ATR ngày), mô hình định lượng xác định xác suất chạm mốc đạt ~${prob}%. Để kích hoạt kịch bản tăng tốc, SOL cần giữ vững các đường trung bình động EMA 20 và EMA 50.`,
    tacticalAdvice: 'Khuyến nghị giải ngân từng phần (DCA) quanh các nhịp kiểm định lại hỗ trợ thay vì mua đuổi fomo tại đỉnh cục bộ. Đặt dừng lỗ dưới mốc vô hiệu hóa để bảo vệ vốn.',
  };

  // Cache key based on rounded prices and direction
  const cacheKey = `${Math.round(cPrice)}-${Math.round(tPrice)}-${dir}`;
  const cached = forecastCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cached.data);
  }

  // If recently encountered 429 quota or Gemini is in backoff, immediately return fallbackData
  if (Date.now() - lastQuotaExceededTime < ERROR_BACKOFF_TTL_MS) {
    return NextResponse.json(fallbackData);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    forecastCache.set(cacheKey, { data: fallbackData, timestamp: Date.now() });
    return NextResponse.json(fallbackData);
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `
Bạn là chuyên gia phân tích định lượng (Quantitative Crypto Analyst) chuyên sâu về Solana (SOL/USDT).
Hãy phân tích dữ liệu thị trường và mô hình xác suất toán học dưới đây để đưa ra nhận định chi tiết, khách quan và chuyên nghiệp bằng Tiếng Việt.

THÔNG SỐ HIỆN TẠI:
- Giá SOL hiện tại: $${cPrice} USDT
- Giá mục tiêu nhập vào: $${tPrice} USDT
- Chênh lệch giá: ${deltaPct > 0 ? '+' : ''}${deltaPct}%
- Hướng mục tiêu: ${dir === 'UP' ? 'Tăng giá (Long / Bullish Target)' : 'Giảm giá (Short / Bearish Target)'}
- Khoảng cách theo ATR (14 ngày): ${atrDist} lần ATR
- Xác suất chạm mốc từ mô phỏng Monte Carlo (90 ngày): ${prob}%
- Thời gian dự kiến: ${
      expectedDays
        ? `Nhanh nhất: ${expectedDays.min} ngày | Cơ sở: ${expectedDays.expected} ngày | Thận trọng: ${expectedDays.max} ngày`
        : 'Ngoài biên độ 90 ngày'
    }
- Chỉ số kỹ thuật:
  + RSI (14): ${(indicators as { rsi14?: number; rsiSignal?: string })?.rsi14} (${(indicators as { rsiSignal?: string })?.rsiSignal})
  + MACD Trend: ${(indicators as { macd?: { trend?: string } })?.macd?.trend}
  + Cấu trúc xu hướng: ${(indicators as { trendAlignment?: string })?.trendAlignment}
  + Các mốc cản trung gian: ${(barriers || []).map(b => `${b.label}: $${b.price}`).join(', ') || 'Không có cản lớn'}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: {
              type: Type.STRING,
              description: 'One of: Bullish, Neutral, Bearish, High Risk',
            },
            targetFeasibility: {
              type: Type.STRING,
              description: 'One of: Rất cao (Very High), Khả thi (Feasible), Thách thức (Challenging), Rủi ro cao (High Risk)',
            },
            timeframeSummary: {
              type: Type.STRING,
              description: 'Estimated timeframe summary in Vietnamese',
            },
            keyDrivers: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of 3 key drivers in Vietnamese',
            },
            majorObstacles: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of obstacles in Vietnamese',
            },
            invalidationLevel: {
              type: Type.NUMBER,
              description: 'Numeric price level where the thesis is invalidated',
            },
            tradingThesis: {
              type: Type.STRING,
              description: 'Quantitative thesis in Vietnamese',
            },
            tacticalAdvice: {
              type: Type.STRING,
              description: 'Tactical advice in Vietnamese',
            },
          },
          required: [
            'sentiment',
            'targetFeasibility',
            'timeframeSummary',
            'keyDrivers',
            'majorObstacles',
            'invalidationLevel',
            'tradingThesis',
            'tacticalAdvice',
          ],
        },
      },
    });

    const text = response.text || '';
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      const cleanJson = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
      parsed = JSON.parse(cleanJson);
    }

    const safeResult = {
      sentiment: ['Bullish', 'Bearish', 'High Risk', 'Neutral'].includes(parsed.sentiment as string)
        ? parsed.sentiment
        : fallbackData.sentiment,
      targetFeasibility: parsed.targetFeasibility || fallbackData.targetFeasibility,
      timeframeSummary: parsed.timeframeSummary || fallbackData.timeframeSummary,
      keyDrivers: Array.isArray(parsed.keyDrivers) && parsed.keyDrivers.length > 0
        ? parsed.keyDrivers
        : fallbackData.keyDrivers,
      majorObstacles: Array.isArray(parsed.majorObstacles) && parsed.majorObstacles.length > 0
        ? parsed.majorObstacles
        : fallbackData.majorObstacles,
      invalidationLevel: typeof parsed.invalidationLevel === 'number' && !isNaN(parsed.invalidationLevel)
        ? parsed.invalidationLevel
        : fallbackData.invalidationLevel,
      tradingThesis: parsed.tradingThesis || fallbackData.tradingThesis,
      tacticalAdvice: parsed.tacticalAdvice || fallbackData.tacticalAdvice,
    };

    forecastCache.set(cacheKey, { data: safeResult, timestamp: Date.now() });
    return NextResponse.json(safeResult);
  } catch {
    lastQuotaExceededTime = Date.now();
    forecastCache.set(cacheKey, { data: fallbackData, timestamp: Date.now() });
    return NextResponse.json(fallbackData, { status: 200 });
  }
}
