import { db } from '@/libs/db'

export class InventoryService {
  static async deduct(orderId: string) {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })

    if (order.inventoryDeducted) return

    for (const item of order.items) {
      await db.productInventory.update({
        where: { product_id: item.product_id },
        data: { quantity: { decrement: item.qty } },
      })
    }

    await db.order.update({
      where: { id: orderId },
      data: { inventoryDeducted: true },
    })
  }
}
