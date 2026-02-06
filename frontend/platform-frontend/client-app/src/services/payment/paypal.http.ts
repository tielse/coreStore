// services/payment/paypal.http.ts
const BASE_URL =
  process.env.PAYPAL_ENV === 'LIVE'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'

export class PaypalHttpClient {
  private static accessToken: string | null = null
  private static expiredAt = 0

  /**
   * Get OAuth2 token
   */
  private static async getAccessToken() {
    if (this.accessToken && Date.now() < this.expiredAt) {
      return this.accessToken
    }

    const auth = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString('base64')

    const res = await fetch(`${BASE_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })

    const data = await res.json()

    this.accessToken = data.access_token
    this.expiredAt = Date.now() + data.expires_in * 1000 - 60_000

    return this.accessToken
  }

  /**
   * POST helper
   */
  static async post(path: string, body: any) {
    const token = await this.getAccessToken()

    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`PayPal API error: ${err}`)
    }

    return res.json()
  }
}
