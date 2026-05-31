'use client'
import { useCartStore } from '@/lib/store'
import Link from 'next/link'

export default function CartPage() {
  const { items, updateQty, removeItem } = useCartStore()
  const total = items.reduce((sum: number, i: any) => sum + i.price * i.qty, 0)
  const delivery = total >= 500 ? 0 : 50

  if (items.length === 0) return (
    <div className="text-center py-24">
      <p className="text-6xl mb-4">🛒</p>
      <p className="text-xl font-semibold text-gray-500 mb-6">Your cart is empty</p>
      <Link href="/" className="bg-orange-500 text-white px-8 py-3 rounded-full font-bold">
        Continue Shopping
      </Link>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      <div className="space-y-4 mb-6">
        {items.map((item: any) => (
          <div key={item.id} className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border">
            <div className="w-16 h-16 bg-orange-50 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
              {item.images && item.images[0]
                ? <img src={item.images[0]} alt={item.name} className="w-full h-full object-contain rounded-xl"/>
                : 'Gift'}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{item.name}</p>
              <p className="text-orange-500 font-bold">Rs.{item.price}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateQty(item.id, item.qty - 1)}
                className="w-7 h-7 rounded-full bg-gray-100 font-bold">-</button>
              <span className="w-6 text-center font-semibold">{item.qty}</span>
              <button onClick={() => updateQty(item.id, item.qty + 1)}
                className="w-7 h-7 rounded-full bg-gray-100 font-bold">+</button>
            </div>
            <button onClick={() => removeItem(item.id)}
              className="text-red-400 text-sm font-bold ml-2">X</button>
          </div>
        ))}
      </div>

      <div className="bg-orange-50 rounded-2xl p-5 mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Subtotal</span><span>Rs.{total}</span>
        </div>
        <div className="flex justify-between text-sm mb-3">
          <span>Delivery</span>
          <span className={delivery === 0 ? 'text-green-600 font-semibold' : ''}>
            {delivery === 0 ? 'FREE!' : `Rs.${delivery}`}
          </span>
        </div>
        {delivery > 0 && (
          <p className="text-xs text-gray-500 mb-3">Add Rs.{500 - total} more for free delivery</p>
        )}
        <div className="flex justify-between font-bold text-lg border-t pt-3">
          <span>Total</span>
          <span className="text-orange-500">Rs.{total + delivery}</span>
        </div>
      </div>

      <Link href="/checkout"
        className="block w-full bg-orange-500 text-white text-center py-4 rounded-full font-bold text-lg hover:bg-orange-600 transition">
        Proceed to Checkout
      </Link>
    </div>
  )
}