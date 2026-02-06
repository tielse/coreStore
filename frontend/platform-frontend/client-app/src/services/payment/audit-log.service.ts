import { db } from '@/libs/db'

export class AuditLogService {
  static async log({
    orderId,
    provider,
    event,
    payload,
  }: {
    orderId: string
    provider: 'MOMO' | 'PAYPAL'
    event: string
    payload: any
  }) {
    await db.paymentAuditLog.create({
      data: {
        order_id: orderId,
        provider,
        event,
        payload,
      },
    })
  }
}
