import crypto from 'crypto'

const {
  MOMO_PARTNER_CODE,
  MOMO_ACCESS_KEY,
  MOMO_SECRET_KEY,
  APP_URL,
} = process.env

export class MomoService {
  static sign(raw: string) {
    return crypto
      .createHmac('sha256', MOMO_SECRET_KEY!)
      .update(raw)
      .digest('hex')
  }

  static createPayment({
    orderId,
    amount,
  }: {
    orderId: string
    amount: number
  }) {
    const requestId = orderId
    const orderInfo = `Thanh toán đơn ${orderId}`
    const redirectUrl = `${APP_URL}/checkout/success`
    const ipnUrl = `${APP_URL}/api/webhook/momo`
    const requestType = 'captureWallet'

    const rawSignature =
      `accessKey=${MOMO_ACCESS_KEY}` +
      `&amount=${amount}` +
      `&extraData=` +
      `&ipnUrl=${ipnUrl}` +
      `&orderId=${orderId}` +
      `&orderInfo=${orderInfo}` +
      `&partnerCode=${MOMO_PARTNER_CODE}` +
      `&redirectUrl=${redirectUrl}` +
      `&requestId=${requestId}` +
      `&requestType=${requestType}`

    const signature = this.sign(rawSignature)

    return {
      partnerCode: MOMO_PARTNER_CODE,
      accessKey: MOMO_ACCESS_KEY,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      requestType,
      signature,
      extraData: '',
    }
  }

  static verifyWebhook(body: any) {
    const raw =
      `accessKey=${body.accessKey}` +
      `&amount=${body.amount}` +
      `&extraData=${body.extraData}` +
      `&message=${body.message}` +
      `&orderId=${body.orderId}` +
      `&orderInfo=${body.orderInfo}` +
      `&orderType=${body.orderType}` +
      `&partnerCode=${body.partnerCode}` +
      `&payType=${body.payType}` +
      `&requestId=${body.requestId}` +
      `&responseTime=${body.responseTime}` +
      `&resultCode=${body.resultCode}` +
      `&transId=${body.transId}`

    const signature = this.sign(raw)
    return signature === body.signature
  }
}
