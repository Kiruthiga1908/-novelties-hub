'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function Home() {
  const [products, setProducts] = useState<any[]>([])
  const [filtered, setFiltered] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      setProducts(data || [])
      setFiltered(data || [])
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    let result = products
    if (activeCategory !== 'all')
      result = result.filter((p) => p.category === activeCategory)
    if (search)
      result = result.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
    setFiltered(result)
  }, [activeCategory, search, products])

  const categories = ['all', 'Gifts', 'Toys', 'Fancy Items', 'Stationery']

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="bg-orange-500 rounded-2xl p-8 mb-8 text-white text-center">
        <h1 className="text-3xl font-bold mb-2">NoveltiesHub</h1>
        <p className="text-orange-100">Gifts Toys Fancy Stationery</p>
        <p className="text-orange-100 text-sm mt-1">Vadavalli, Coimbatore</p>
      </div>
      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full border-2 border-orange-200 rounded-full px-5 py-3 mb-6 text-sm focus:outline-none focus:border-orange-400"
      />
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition ${activeCategory === cat ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
            {cat === 'all' ? 'All' : cat}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-64 animate-pulse"/>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p>No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <Link href={`/product/${p.id}`} key={p.id}>
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition">
                <div className="bg-orange-50 h-40 flex items-center justify-center text-3xl">
                  {p.images && p.images[0] ? <img src={p.images[0]} alt={p.name} className="h-full w-full object-contain p-2"/> : 'Gift'}
                </div>
                <div className="p-3">
                  <p className="text-xs text-orange-500 font-semibold">{p.category}</p>
                  <p className="text-sm font-bold text-gray-800 mt-1">{p.name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-orange-500 font-bold">Rs.{p.price}</span>
                    {p.original_price && (<span className="text-gray-400 text-xs line-through">Rs.{p.original_price}</span>)}
                  </div>
                  {p.stock === 0 && (<p className="text-red-400 text-xs mt-1">Out of stock</p>)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}