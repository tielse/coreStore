import { RefundService } from '@/services/payment/refund.service'

export async function POST(req: Request) {
  const { orderId } = await req.json()

  const order = await OrderService.findById(orderId)
  const payment = await PaymentService.findByOrderId(orderId)

  if (order.status !== 'PAID') {
    return new Response('Not refundable', { status: 400 })
  }

  await PaymentService.markRefunding(payment.id)
  await OrderService.markRefunding(orderId)

  await RefundService.refund(payment)

  return Response.json({ status: 'REFUNDING' })
}
