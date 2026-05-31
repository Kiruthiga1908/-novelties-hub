'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function OrdersContent() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const success = searchParams.get('success')
  const orderId = searchParams.get('id')

  useEffect(() => {
    supabase.from('orders').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setOrders(data || []); setLoading(false) })
  }, [])

  const statusColor: any = {
    placed: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    out_for_delivery: 'bg-orange-100 text-orange-700',
    delivered: 'bg-green-100 text-green-700'
  }

  const statusLabel: any = {
    placed: 'Order Placed',
    confirmed: 'Confirmed',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered'
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6 text-center">
          <p className="text-4xl mb-2">🎉</p>
          <p className="font-bold text-green-700 text-lg">Order Placed Successfully!</p>
          <p className="text-sm text-green-600 mt-1">We will deliver within 1-3 days in Coimbatore</p>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-32 animate-pulse"/>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">📦</p>
          <p className="text-gray-500 mb-6">No orders yet</p>
          <Link href="/" className="bg-orange-500 text-white px-8 py-3 rounded-full font-bold">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o: any) => (
            <div key={o.id} className="bg-white rounded-2xl p-5 border">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-bold">{o.customer_name}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(o.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${statusColor[o.order_status] || 'bg-gray-100'}`}>
                  {statusLabel[o.order_status] || o.order_status}
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Payment</span>
                  <span className="font-semibold">{o.payment_method === 'cod' ? 'Cash on Delivery' : 'Online'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total</span>
                  <span className="font-bold text-orange-500">Rs.{o.total}</span>
                </div>
              </div>
              <div className="mt-3 bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 font-semibold mb-1">Delivery Address</p>
                <p className="text-xs text-gray-600">{o.delivery_address}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="text-center py-24 text-gray-400">Loading...</div>}>
      <OrdersContent />
    </Suspense>
  )
}