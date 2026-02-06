import { NextResponse } from 'next/server'
import { MomoService } from '@/services/payment/momo.service'

const MOMO_API_URL = 'https://test-payment.momo.vn/v2/gateway/api/create'

export async function POST(req: Request) {
  try {
    const { orderId, amount } = await req.json()

    if (!orderId || !amount) {
      return NextResponse.json(
        { message: 'Missing orderId or amount' },
        { status: 400 }
      )
    }

    // 1️⃣ (NÊN CÓ) Validate order tồn tại + status = PENDING
    // await OrderService.ensurePending(orderId)

    // 2️⃣ Create MoMo payload (TẤT CẢ logic nằm trong service)
    const payload = MomoService.createPayment({
      orderId,
      amount,
    })

    // 3️⃣ Call MoMo API
    const res = await fetch(MOMO_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await res.json()

    // 4️⃣ (NÊN CÓ) Log request / response
    // await AuditLogService.log({ ... })

    return NextResponse.json(data)
  } catch (err: any) {
    console.error('MoMo checkout error:', err)

    return NextResponse.json(
      { message: 'MoMo checkout failed' },
      { status: 500 }
    )
  }
}
