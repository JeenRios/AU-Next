import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AU-Next | Automated Trading Platform - MT5 Integration',
  description: 'Experience next-generation automated trading with AU-Next. Connect your MT5 account, deploy Expert Advisors, and trade 24/7 with enterprise-grade security.',
  keywords: ['automated trading', 'MT5', 'MetaTrader 5', 'forex', 'trading bot', 'EA', 'expert advisor', 'algorithmic trading'],
  authors: [{ name: 'AU-Next Team' }],
  creator: 'AU-Next',
  publisher: 'AU-Next',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://au-next.com',
    siteName: 'AU-Next',
    title: 'AU-Next | Automated Trading Made Simple',
    description: 'Connect your MT5 account and start automated trading in minutes. 24/7 trading, enterprise security, real-time analytics.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AU-Next Automated Trading Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AU-Next | Automated Trading Platform',
    description: 'Next-generation automated trading with MT5 integration. Start trading smarter today.',
    images: ['/og-image.png'],
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#c9a227',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  alternates: {
    canonical: 'https://au-next.com',
  },
};

// JSON-LD Structured Data
export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'AU-Next',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Web',
  description: 'Automated trading platform with MT5 integration for forex and commodities trading.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free tier available',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '150',
  },
  featureList: [
    'MT5 Integration',
    'Automated Trading',
    '24/7 Operation',
    'Real-time Analytics',
    'Risk Management',
  ],
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
