// app/api/webhook/momo/route.ts
import { NextResponse } from 'next/server'
import { MomoService } from '@/services/payment/momo.service'
import { AuditLogService } from '@/services/payment/audit-log.service'
import { InventoryService } from '@/services/payment/inventory.service'
// import { OrderService } from '@/services/order.service'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    /**
     * 1️⃣ Verify signature (SOURCE OF TRUTH)
     */
    const isValid = MomoService.verifyWebhook(body)
    if (!isValid) {
      return new Response('Invalid signature', { status: 400 })
    }

    const orderId = body.orderId
    const resultCode = body.resultCode

    /**
     * 2️⃣ Audit log (LUÔN LUÔN LOG)
     */
    await AuditLogService.log({
      orderId,
      provider: 'MOMO',
      event: resultCode === 0 ? 'PAYMENT_SUCCESS' : 'PAYMENT_FAILED',
      payload: body,
    })

    /**
     * 3️⃣ Load order (bắt buộc idempotent)
     */
    // const order = await OrderService.findById(orderId)
    // if (!order) {
    //   return NextResponse.json({ message: 'Order not found' }, { status: 404 })
    // }

    // ⛔ Nếu đã PAID rồi thì bỏ qua (MoMo có thể retry webhook)
    // if (order.status === 'PAID') {
    //   return NextResponse.json({ message: 'Already processed' })
    // }

    /**
     * 4️⃣ Update order theo kết quả
     */
    if (resultCode === 0) {
      // ✅ PAYMENT SUCCESS
      // await OrderService.markPaid(orderId)

      // 5️⃣ Trừ kho SAU KHI PAID
      // await InventoryService.deduct(orderId)
    } else {
      // ❌ PAYMENT FAILED
      // await OrderService.markFailed(orderId)
    }

    /**
     * 6️⃣ Trả OK cho MoMo (BẮT BUỘC 200)
     */
    return NextResponse.json({ message: 'OK' })
  } catch (err) {
    console.error('MoMo webhook error:', err)

    /**
     * ⚠️ MoMo sẽ retry nếu không nhận 200
     * → vẫn nên trả 200 để tránh spam webhook
     */
    return NextResponse.json({ message: 'OK' })
  }
}
