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
  const [uploading, setUploading] = useState(false)
  const [editProduct, setEditProduct] = useState<any>(null)
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: p } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    const { data: o } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    setProducts(p || [])
    setOrders(o || [])
    setLoading(false)
  }

  async function uploadImage(file: File) {
    setUploading(true)
    const fileName = `${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file)
    if (error) { setMsg('Upload failed: ' + error.message); setUploading(false); return null }
    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName)
    setUploading(false)
    return urlData.publicUrl
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadImage(file)
    if (url) setForm({ ...form, images: url })
  }

  async function addProduct() {
    if (!form.name || !form.price) { setMsg('Name and price required!'); return }
    setSaving(true)
    const images = form.images ? [form.images] : []
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

  async function updateProduct() {
    if (!editProduct) return
    setSaving(true)
    const images = editProduct.imageUrl ? [editProduct.imageUrl] : editProduct.images
    await supabase.from('products').update({
      name: editProduct.name,
      description: editProduct.description,
      price: parseFloat(editProduct.price),
      original_price: editProduct.original_price ? parseFloat(editProduct.original_price) : null,
      category: editProduct.category,
      stock: parseInt(editProduct.stock) || 0,
      images: images,
    }).eq('id', editProduct.id)
    setMsg('Product updated!')
    setEditProduct(null)
    setSaving(false)
    loadData()
  }

  async function handleEditImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadImage(file)
    if (url) setEditProduct({ ...editProduct, imageUrl: url })
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

  if (!authenticated) return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50">
      <div className="bg-white rounded-2xl p-8 border shadow-sm w-80 text-center">
        <p className="text-3xl mb-4">🔐</p>
        <h2 className="font-bold text-lg mb-4">Admin Login</h2>
        <input type="password" value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && password === 'Mamitha@6384') setAuthenticated(true) }}
          placeholder="Enter password"
          className="w-full border rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:border-orange-400"/>
        <button onClick={() => {
          if (password === 'mamitha123') setAuthenticated(true)
          else alert('Wrong password!')
        }} className="w-full bg-orange-500 text-white py-3 rounded-full font-bold">
          Login
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <button onClick={() => setAuthenticated(false)}
          className="text-sm text-gray-500 border px-3 py-1 rounded-full hover:bg-gray-50">
          Logout
        </button>
      </div>
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

      <div className="flex gap-2 mb-6 flex-wrap">
        {['products','add','orders'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-full font-semibold text-sm ${tab === t ? 'bg-orange-500 text-white' : 'bg-white border'}`}>
            {t === 'products' ? 'Products' : t === 'add' ? 'Add Product' : 'Orders'}
          </button>
        ))}
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
              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                Product Photo {uploading && '(Uploading...)'}
              </label>
              <input type="file" accept="image/*" onChange={handleImageUpload}
                className="w-full border rounded-lg px-3 py-2 text-sm"/>
              {form.images && (
                <img src={form.images} alt="preview" className="mt-2 h-20 w-20 object-cover rounded-lg"/>
              )}
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Description</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                placeholder="Product description..."
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 h-20"/>
            </div>
          </div>
          <button onClick={addProduct} disabled={saving || uploading}
            className="mt-4 bg-orange-500 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-600 transition disabled:opacity-50">
            {saving ? 'Saving...' : 'Add Product'}
          </button>
        </div>
      )}

      {tab === 'products' && (
        <div className="space-y-3">
          {editProduct && (
            <div className="bg-white rounded-2xl p-6 border mb-4">
              <h2 className="font-bold text-lg mb-4">Edit Product</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Name</label>
                  <input value={editProduct.name} onChange={e => setEditProduct({...editProduct, name: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Category</label>
                  <select value={editProduct.category} onChange={e => setEditProduct({...editProduct, category: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400">
                    <option>Gifts</option>
                    <option>Toys</option>
                    <option>Fancy Items</option>
                    <option>Stationery</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Price</label>
                  <input value={editProduct.price} onChange={e => setEditProduct({...editProduct, price: e.target.value})}
                    type="number" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Stock</label>
                  <input value={editProduct.stock} onChange={e => setEditProduct({...editProduct, stock: e.target.value})}
                    type="number" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"/>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">
                    New Photo {uploading && '(Uploading...)'}
                  </label>
                  <input type="file" accept="image/*" onChange={handleEditImageUpload}
                    className="w-full border rounded-lg px-3 py-2 text-sm"/>
                  {(editProduct.imageUrl || editProduct.images?.[0]) && (
                    <img src={editProduct.imageUrl || editProduct.images?.[0]} alt="preview"
                      className="mt-2 h-20 w-20 object-cover rounded-lg"/>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Description</label>
                  <textarea value={editProduct.description} onChange={e => setEditProduct({...editProduct, description: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400 h-20"/>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={updateProduct} disabled={saving}
                  className="bg-orange-500 text-white px-6 py-2 rounded-full font-bold hover:bg-orange-600 transition disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => setEditProduct(null)}
                  className="bg-gray-100 text-gray-600 px-6 py-2 rounded-full font-bold">
                  Cancel
                </button>
              </div>
            </div>
          )}
          {products.map((p: any) => (
            <div key={p.id} className="bg-white rounded-xl p-4 border flex justify-between items-center">
              <div className="flex items-center gap-3">
                {p.images?.[0] && (
                  <img src={p.images[0]} alt={p.name} className="w-12 h-12 object-cover rounded-lg"/>
                )}
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-orange-500">Rs.{p.price} · {p.category} · Stock: {p.stock}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditProduct({...p, imageUrl: null})}
                  className="text-blue-400 text-sm border border-blue-200 px-3 py-1 rounded-full hover:bg-blue-50">
                  Edit
                </button>
                <button onClick={() => deleteProduct(p.id)}
                  className="text-red-400 text-sm border border-red-200 px-3 py-1 rounded-full hover:bg-red-50">
                  Delete
                </button>
              </div>
            </div>
          ))}
          {products.length === 0 && <p className="text-center text-gray-400 py-8">No products yet!</p>}
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
                {['confirmed','out_for_delivery','delivered'].map(s => (
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