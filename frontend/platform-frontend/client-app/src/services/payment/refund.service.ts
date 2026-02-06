import { PaypalService } from './paypal.service'
import { AuditLogService } from './audit-log.service'

export class RefundService {
  static async refund(payment: {
    id: string
    provider: 'PAYPAL' | 'MOMO'
    captureId?: string
    amount: number
  }) {
    try {
      if (payment.provider === 'PAYPAL') {
        await PaypalService.refundCapture(payment.captureId!)
      }

      // MoMo refund ở đây nếu cần

      await AuditLogService.log({
        orderId: payment.id,
        provider: payment.provider,
        event: 'REFUND_REQUESTED',
      })
    } catch (err) {
      throw err
    }
  }
}
