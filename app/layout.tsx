import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const siteUrl = 'https://carrinhocarioca.com.br'
const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Carrinho Carioca — O Rio compra melhor aqui',
    template: '%s | Carrinho Carioca',
  },
  description:
    'Compare preços dos supermercados do Rio de Janeiro e descubra onde comprar mais barato na Barra, Recreio e Jacarepaguá. Veja as Top 10 ofertas do dia.',
  keywords: [
    'ofertas supermercado Rio de Janeiro',
    'comparar preços mercado',
    'promoções Rio de Janeiro',
    'Guanabara',
    'Mundial',
    'Prezunic',
    'Pão de Açúcar',
    'economizar nas compras',
  ],
  applicationName: 'Carrinho Carioca',
  authors: [{ name: 'Carrinho Carioca' }],
  alternates: { canonical: siteUrl },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: siteUrl,
    siteName: 'Carrinho Carioca',
    title: 'Carrinho Carioca — O Rio compra melhor aqui',
    description:
      'Compare preços dos supermercados do Rio de Janeiro e descubra onde comprar mais barato. Veja as Top 10 ofertas do dia.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Carrinho Carioca — O Rio compra melhor aqui',
    description:
      'Compare preços dos supermercados do Rio de Janeiro e descubra onde comprar mais barato.',
  },
  robots: {
    index: true,
    follow: true,
  },
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#16A34A',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`light ${geistSans.variable} ${geistMono.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
        {adsenseClient && (
          <Script
            id="google-adsense"
            async
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
          />
        )}
      </body>
    </html>
  )
}
