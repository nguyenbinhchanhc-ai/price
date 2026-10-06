import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'SOL Target Price & Probability Forecast | Phân tích SOL/USDT',
  description: 'Nền tảng phân tích kỹ thuật và định lượng SOL/USDT, tính toán xác suất chạm giá mục tiêu, mô phỏng Monte Carlo và dự báo thời gian chạm mốc.',
  openGraph: {
    title: 'SOL Target Price & Probability Forecast | Phân tích SOL/USDT',
    description: 'Nền tảng phân tích kỹ thuật và định lượng SOL/USDT, tính toán xác suất chạm giá mục tiêu, mô phỏng Monte Carlo và dự báo thời gian chạm mốc.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SOL Target Price & Probability Forecast | Phân tích SOL/USDT',
    description: 'Nền tảng phân tích kỹ thuật và định lượng SOL/USDT, tính toán xác suất chạm giá mục tiêu, mô phỏng Monte Carlo và dự báo thời gian chạm mốc.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
