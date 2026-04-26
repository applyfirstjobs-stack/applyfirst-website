import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ApplyFirst — Fresh Jobs Direct From Companies',
  description: 'Browse fresh jobs pulled directly from 21,000+ company career pages. Updated daily.',
  openGraph: {
    title: 'ApplyFirst — Fresh Jobs Direct From Companies',
    description: 'Browse fresh jobs pulled directly from 21,000+ company career pages. Updated daily.',
    url: 'https://www.applyfirstjobs.com',
    siteName: 'ApplyFirst',
    type: 'website',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://www.applyfirstjobs.com' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
