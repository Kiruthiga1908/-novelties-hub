import { Geist } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import { Toaster } from 'react-hot-toast'

const geist = Geist({ subsets: ['latin'] })

export const metadata = {
  title: 'NoveltiesHub - Gifts, Toys & Stationery',
description: 'Shop gifts, toys, fancy items and stationery in Vadavalli, Coimbatore',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <Navbar />
        <main className="min-h-screen bg-orange-50">
          {children}
        </main>
        <Toaster position="bottom-center" />
      </body>
    </html>
  )
}