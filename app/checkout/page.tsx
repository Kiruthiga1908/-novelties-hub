'use client'
import { useState } from 'react'
import { useCartStore } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore()
  const router = useRouter()
  const total = items.reduce((sum: number, i: any) => sum + i.price * i.qty, 0)
  const delivery = total >= 500 ? 0 : 50
  const grandTotal = total + delivery

  const [form, setForm] = useState({
    name: '', phone: '', address: '', pincode: '', notes: ''
  })
  const [payment, setPayment] = useState('cod')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (items.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-xl font-semibold text-gray-500 mb-4">No items in cart!</p>
        <a href="/" className="bg-orange-500 text-white px-8 py-3 rounded-full font-bold">Go Shopping</a>
      </div>
    )
  }

  async function placeOrder() {
    if (!form.name || !form.phone || !form.address) {
      setError('Please fill name, phone and address!')
      return
    }
    if (form.phone.length !== 10) {
      setError('Enter valid 10 digit phone number!')
      return
    }
    setLoading(true)
    setError('')

    if (payment === 'cod') {
      const { data, error: err } = await supabase.from('orders').insert({
        customer_name: form.name,
        customer_phone: form.phone,
        delivery_address: form.address + ', Coimbatore - ' + form.pincode,
        items: items,
        subtotal: total,
        delivery_charge: delivery,
        total: grandTotal,
        payment_method: 'cod',
        payment_status: 'pending',
        order_status: 'placed',
        notes: form.notes
      }).select().single()

      if (err) { setError('Order failed! Try again.'); setLoading(false); return }
      clearCart()
      router.push('/orders?success=true&id=' + data.id)
    } else {
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: grandTotal })
      })
      const { orderId } = await res.json()

      const rzp = new (window as any).Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: grandTotal * 100,
        currency: 'INR',
        name:  'NoveltiesHub',
        description: 'Order Payment',
        order_id: orderId,
        handler: async function(response: any) {
          const { data } = await supabase.from('orders').insert({
            customer_name: form.name,
            customer_phone: form.phone,
            delivery_address: form.address + ', Coimbatore - ' + form.pincode,
            items: items,
            subtotal: total,
            delivery_charge: delivery,
            total: grandTotal,
            payment_method: 'razorpay',
            payment_status: 'paid',
            order_status: 'confirmed',
            razorpay_order_id: orderId,
            razorpay_payment_id: response.razorpay_payment_id,
            notes: form.notes
          }).select().single()
          clearCart()
          router.push('/orders?success=true&id=' + data.id)
        },
        prefill: { name: form.name, contact: form.phone }
      })
      rzp.open()
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="bg-white rounded-2xl p-6 border mb-4">
        <h2 className="font-bold mb-4">Delivery Details</h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Full Name *</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              placeholder="Your name"
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400"/>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Phone Number *</label>
            <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
              placeholder="10 digit mobile number" maxLength={10} type="tel"
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400"/>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Delivery Address *</label>
            <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})}
              placeholder="House no, Street, Area, Coimbatore"
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 h-20"/>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Pincode</label>
            <input value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})}
              placeholder="641041" maxLength={6}
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400"/>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Notes (optional)</label>
            <input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
              placeholder="Any special instructions..."
              className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400"/>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border mb-4">
        <h2 className="font-bold mb-4">Payment Method</h2>
        <div className="space-y-3">
          <div onClick={() => setPayment('cod')}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${payment === 'cod' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${payment === 'cod' ? 'border-orange-500' : 'border-gray-300'}`}>
              {payment === 'cod' && <div className="w-3 h-3 rounded-full bg-orange-500"/>}
            </div>
            <div>
              <p className="font-semibold text-sm">Cash on Delivery</p>
              <p className="text-xs text-gray-500">Pay when you receive</p>
            </div>
          </div>
          <div onClick={() => setPayment('razorpay')}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${payment === 'razorpay' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${payment === 'razorpay' ? 'border-orange-500' : 'border-gray-300'}`}>
              {payment === 'razorpay' && <div className="w-3 h-3 rounded-full bg-orange-500"/>}
            </div>
            <div>
              <p className="font-semibold text-sm">Online Payment</p>
              <p className="text-xs text-gray-500">UPI, Card, NetBanking via Razorpay</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-orange-50 rounded-2xl p-5 mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Subtotal</span><span>Rs.{total}</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span>Delivery</span>
          <span>{delivery === 0 ? 'FREE' : `Rs.${delivery}`}</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t pt-3">
          <span>Total</span>
          <span className="text-orange-500">Rs.{grandTotal}</span>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mb-4 font-semibold">{error}</p>}

      <button onClick={placeOrder} disabled={loading}
        className="w-full bg-orange-500 text-white py-4 rounded-full font-bold text-lg hover:bg-orange-600 transition disabled:opacity-50">
        {loading ? 'Placing Order...' : `Place Order - Rs.${grandTotal}`}
      </button>
    </div>
  )
}