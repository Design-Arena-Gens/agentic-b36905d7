import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'श्री - Marathi Voice Assistant',
  description: 'Your personal Marathi voice AI assistant',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="mr">
      <body>{children}</body>
    </html>
  )
}
