'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminPage() {
  const [products, setProducts] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [tab, setTab] = useState('products')
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    name: '', description: '', price: '', original_price: '',
    category: 'Gifts', stock: '', images: ''
  })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: p } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    const { data: o } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    setProducts(p || [])
    setOrders(o || [])
    setLoading(false)
  }

  async function addProduct() {
    if (!form.name || !form.price) { setMsg('Name and price required!'); return }
    setSaving(true)
    const images = form.images ? form.images.split(',').map(s => s.trim()) : []
    const { error } = await supabase.from('products').insert({
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      category: form.category,
      stock: parseInt(form.stock) || 0,
      images: images,
      is_active: true
    })
    if (error) { setMsg('Error: ' + error.message) }
    else {
      setMsg('Product added!')
      setForm({ name: '', description: '', price: '', original_price: '', category: 'Gifts', stock: '', images: '' })
      loadData()
    }
    setSaving(false)
  }

  async function deleteProduct(id: string) {
    await supabase.from('products').delete().eq('id', id)
    loadData()
  }

  async function updateOrderStatus(id: string, status: string) {
    await supabase.from('orders').update({ order_status: status }).eq('id', id)
    loadData()
  }

  const statusColor: any = {
    placed: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    out_for_delivery: 'bg-orange-100 text-orange-700',
    delivered: 'bg-green-100 text-green-700'
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Admin Panel</h1>
      <p className="text-sm text-gray-500 mb-6">NoveltiesHub - Vadavalli</p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-orange-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-orange-500">{products.length}</p>
          <p className="text-sm text-gray-600">Products</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-500">{orders.length}</p>
          <p className="text-sm text-gray-600">Total Orders</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-500">
            {orders.filter((o: any) => o.order_status === 'placed').length}
          </p>
          <p className="text-sm text-gray-600">Pending</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('products')}
          className={`px-5 py-2 rounded-full font-semibold text-sm ${tab === 'products' ? 'bg-orange-500 text-white' : 'bg-white border'}`}>
          Products
        </button>
        <button onClick={() => setTab('add')}
          className={`px-5 py-2 rounded-full font-semibold text-sm ${tab === 'add' ? 'bg-orange-500 text-white' : 'bg-white border'}`}>
          Add Product
        </button>
        <button onClick={() => setTab('orders')}
          className={`px-5 py-2 rounded-full font-semibold text-sm ${tab === 'orders' ? 'bg-orange-500 text-white' : 'bg-white border'}`}>
          Orders
        </button>
      </div>

      {tab === 'add' && (
        <div className="bg-white rounded-2xl p-6 border">
          <h2 className="font-bold text-lg mb-4">Add New Product</h2>
          {msg && <p className="text-sm mb-4 text-orange-600 font-semibold">{msg}</p>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Product Name *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                placeholder="Ex: Birthday Gift Box"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"/>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Category</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400">
                <option>Gifts</option>
                <option>Toys</option>
                <option>Fancy Items</option>
                <option>Stationery</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Price (Rs.) *</label>
              <input value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                placeholder="99" type="number"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"/>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Original Price (Rs.)</label>
              <input value={form.original_price} onChange={e => setForm({...form, original_price: e.target.value})}
                placeholder="149" type="number"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"/>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Stock</label>
              <input value={form.stock} onChange={e => setForm({...form, stock: e.target.value})}
                placeholder="10" type="number"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"/>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Image URL</label>
              <input value={form.images} onChange={e => setForm({...form, images: e.target.value})}
                placeholder="https://..."
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"/>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Description</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                placeholder="Product description..."
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 h-20"/>
            </div>
          </div>
          <button onClick={addProduct} disabled={saving}
            className="mt-4 bg-orange-500 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-600 transition disabled:opacity-50">
            {saving ? 'Saving...' : 'Add Product'}
          </button>
        </div>
      )}

      {tab === 'products' && (
        <div className="space-y-3">
          {products.map((p: any) => (
            <div key={p.id} className="bg-white rounded-xl p-4 border flex justify-between items-center">
              <div>
                <p className="font-semibold">{p.name}</p>
                <p className="text-sm text-orange-500">Rs.{p.price} · {p.category} · Stock: {p.stock}</p>
              </div>
              <button onClick={() => deleteProduct(p.id)}
                className="text-red-400 text-sm border border-red-200 px-3 py-1 rounded-full hover:bg-red-50">
                Delete
              </button>
            </div>
          ))}
          {products.length === 0 && <p className="text-center text-gray-400 py-8">No products yet. Add some!</p>}
        </div>
      )}

      {tab === 'orders' && (
        <div className="space-y-4">
          {orders.map((o: any) => (
            <div key={o.id} className="bg-white rounded-xl p-4 border">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold">{o.customer_name}</p>
                  <p className="text-sm text-gray-500">{o.customer_phone}</p>
                  <p className="text-xs text-gray-400">{o.delivery_address}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-orange-500">Rs.{o.total}</p>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${statusColor[o.order_status] || 'bg-gray-100'}`}>
                    {o.order_status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {['confirmed', 'out_for_delivery', 'delivered'].map(s => (
                  <button key={s} onClick={() => updateOrderStatus(o.id, s)}
                    disabled={o.order_status === s}
                    className={`text-xs px-3 py-1 rounded-full border font-semibold transition
                      ${o.order_status === s ? 'bg-gray-100 text-gray-400' : 'border-orange-300 text-orange-600 hover:bg-orange-50'}`}>
                    {s.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {orders.length === 0 && <p className="text-center text-gray-400 py-8">No orders yet.</p>}
        </div>
      )}
    </div>
  )
}