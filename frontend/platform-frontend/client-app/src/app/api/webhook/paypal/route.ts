// app/api/webhook/paypal/route.ts
import { NextResponse } from 'next/server'
import { PaypalService } from '@/services/payment/paypal.service'
import { AuditLogService } from '@/services/payment/audit-log.service'
// import { OrderService } from '@/services/order.service'
// import { InventoryService } from '@/services/payment/inventory.service'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const headers = Object.fromEntries(req.headers.entries())
    const eventType = body.event_type

    /**
     * 1️⃣ Verify webhook signature với PayPal API
     */
    const isValid = await PaypalService.verifyWebhook(headers, body)
    if (!isValid) {
      return new Response('Invalid PayPal webhook', { status: 400 })
    }

    /**
     * 2️⃣ Extract orderId (custom_id là chuẩn PayPal)
     */
    const resource = body.resource
    const orderId =
      resource?.custom_id ||
      resource?.invoice_id ||
      resource?.supplementary_data?.related_ids?.order_id

    /**
     * 3️⃣ Audit log (luôn log)
     */
    await AuditLogService.log({
      orderId,
      provider: 'PAYPAL',
      event: eventType,
      payload: body,
    })

    /**
     * 4️⃣ Handle event
     */
    switch (eventType) {
      /**
       * ✅ Thanh toán thành công
       */
      case 'PAYMENT.CAPTURE.COMPLETED': {
        // const order = await OrderService.findById(orderId)
        // if (!order) break

        // if (order.status !== 'PAID') {
        //   await OrderService.markPaid(orderId)
        //   await InventoryService.deduct(orderId)
        // }

        break
      }

      /**
       * ❌ Thanh toán thất bại
       */
      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.REFUNDED':{
		const captureId = body.resource.id

		const payment = await PaymentService.findByCaptureId(captureId)
		if (!payment) break

		if (payment.status !== 'REFUNDING') break

		await PaymentService.markRefunded(payment.id)
		await OrderService.markRefunded(payment.orderId)

		// + restore inventory
		// await InventoryService.restore(payment.orderId)

		break
		}
      case 'CHECKOUT.ORDER.CANCELLED': {
        // await OrderService.markFailed(orderId)
        break
      }

      /**
       * ⚠️ Các event khác: log thôi
       */
      default:
        break
    }

    /**
     * 5️⃣ Trả 200 OK (PayPal yêu cầu)
     */
    return NextResponse.json({ message: 'OK' })
  } catch (err) {
    console.error('PayPal webhook error:', err)

    /**
     * ⚠️ PayPal sẽ retry nếu không 200
     * → luôn trả OK để tránh spam
     */
    return NextResponse.json({ message: 'OK' })
  }
}
