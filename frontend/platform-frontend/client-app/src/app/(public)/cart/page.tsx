'use client'
import { useCart } from '@/stores/cart.store'

export default function CartPage() {
  const { items, removeItem } = useCart()

  return (
    <div>
      {items.map(i => (
        <div key={i.id}>
          {i.name} x {i.qty}
          <button onClick={() => removeItem(i.id)}>X</button>
        </div>
      ))}
    </div>
  )
}
