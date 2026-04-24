import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ApplyFirst — Fresh Jobs Direct From Companies',
  description: 'Browse 3M+ fresh jobs pulled directly from 21,000+ company career pages. Updated daily. Find your next role at Stripe, OpenAI, Netflix, Google and more.',
  keywords: 'jobs, remote jobs, tech jobs, software engineer jobs, marketing jobs, fresh job listings',
  openGraph: {
    title: 'ApplyFirst — Fresh Jobs Direct From Companies',
    description: 'Browse 3M+ fresh jobs pulled directly from 21,000+ company career pages. Updated daily.',
    url: 'https://www.applyfirstjobs.com',
    siteName: 'ApplyFirst',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ApplyFirst — Fresh Jobs Direct From Companies',
    description: 'Browse 3M+ fresh jobs pulled directly from 21,000+ company career pages. Updated daily.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://www.applyfirstjobs.com',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
