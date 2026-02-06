import { PaypalHttpClient } from './paypal.http'

export class PaypalService {
  /**
   * Verify webhook signature (REAL PayPal API)
   */
  static async verifyWebhook(headers: Record<string, string>, body: any) {
    const payload = {
      auth_algo: headers['paypal-auth-algo'],
      cert_url: headers['paypal-cert-url'],
      transmission_id: headers['paypal-transmission-id'],
      transmission_sig: headers['paypal-transmission-sig'],
      transmission_time: headers['paypal-transmission-time'],
      webhook_id: process.env.PAYPAL_WEBHOOK_ID!,
      webhook_event: body,
    }

    const res = await PaypalHttpClient.post(
      '/v1/notifications/verify-webhook-signature',
      payload
    )

    return res.verification_status === 'SUCCESS'
  }

  /**
   * Refund capture (FULL / PARTIAL)
   */
  static async refundCapture(
    captureId: string,
    amount?: { value: string; currency_code: string }
  ) {
    const payload = amount
      ? {
          amount,
        }
      : {}

    return PaypalHttpClient.post(
      `/v2/payments/captures/${captureId}/refund`,
      payload
    )
  }
}
