'use client'
import Link from 'next/link'
import { useCartStore } from '@/lib/store'

export default function Navbar() {
  const items = useCartStore(s => s.items)
  const count = items.reduce((sum, i) => sum + i.qty, 0)

  return (
    <nav className="bg-white border-b-2 border-orange-500 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="font-bold text-xl text-orange-500">
          🎁 NoveltiesHub
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm text-gray-600 hover:text-orange-500">
            Home
          </Link>
          <Link href="/orders" className="text-sm text-gray-600 hover:text-orange-500">
            My Orders
          </Link>
          <Link href="/cart" className="relative">
            <span className="text-2xl">🛒</span>
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  )
}