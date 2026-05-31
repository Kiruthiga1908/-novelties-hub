'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useCartStore } from '@/lib/store'
import { use } from 'react'

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [product, setProduct] = useState<any>(null)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const addItem = useCartStore(s => s.addItem)

  useEffect(() => {
    supabase.from('products').select('*').eq('id', id).single()
      .then(({ data }) => setProduct(data))
  }, [id])

  if (!product) return (
    <div className="text-center py-24 text-gray-400">Loading...</div>
  )

  function handleAdd() {
    for (let i = 0; i < qty; i++) addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-orange-50 rounded-2xl flex items-center justify-center h-72 text-6xl">
          {product.images && product.images[0]
            ? <img src={product.images[0]} alt={product.name} className="h-full w-full object-contain p-4 rounded-2xl"/>
            : 'Gift'}
        </div>
        <div>
          <span className="bg-orange-100 text-orange-600 text-xs px-3 py-1 rounded-full font-semibold">
            {product.category}
          </span>
          <h1 className="text-2xl font-bold mt-3 mb-2">{product.name}</h1>
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold text-orange-500">Rs.{product.price}</span>
            {product.original_price && (
              <span className="text-gray-400 line-through text-lg">Rs.{product.original_price}</span>
            )}
          </div>
          {product.description && (
            <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.description}</p>
          )}
          {product.stock > 0 ? (
            <>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm text-gray-600 font-semibold">Qty:</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-8 h-8 rounded-full bg-gray-100 font-bold text-lg">-</button>
                  <span className="w-8 text-center font-bold">{qty}</span>
                  <button onClick={() => setQty(Math.min(product.stock, qty + 1))}
                    className="w-8 h-8 rounded-full bg-gray-100 font-bold text-lg">+</button>
                </div>
              </div>
              <button onClick={handleAdd}
                className={`w-full py-3 rounded-full font-bold text-white transition ${added ? 'bg-green-500' : 'bg-orange-500 hover:bg-orange-600'}`}>
                {added ? 'Added to Cart!' : 'Add to Cart'}
              </button>
            </>
          ) : (
            <div className="bg-red-50 text-red-500 px-4 py-3 rounded-xl text-sm font-semibold">
              Out of stock
            </div>
          )}
          <div className="mt-6 bg-orange-50 rounded-xl p-4 text-sm">
            <p className="font-semibold text-orange-700 mb-1">Delivery Info</p>
            <p className="text-gray-600">Delivered within Coimbatore in 1-3 days</p>
            <p className="text-gray-600">Rs.50 delivery charge. Free above Rs.500</p>
          </div>
        </div>
      </div>
    </div>
  )
}