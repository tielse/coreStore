import { verifyToken } from '@/libs/jwt'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    // 1️⃣ Auth
    const token = req.cookies.get('access_token')?.value
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const user = verifyToken(token)

    // 2️⃣ Payload
    const { items, paymentMethod } = await req.json()

    if (!items?.length) {
      return NextResponse.json(
        { message: 'Cart is empty' },
        { status: 400 }
      )
    }

    // 3️⃣ Create Order (PENDING)
    const order = await OrderService.create({
      userId: user.sub,
      items,
      status: 'PENDING',
    })

    // 4️⃣ Delegate payment
    let redirectUrl = ''

    switch (paymentMethod) {
      case 'MOMO':
        redirectUrl = `/api/checkout/momo?orderId=${order.id}`
        break

      case 'PAYPAL':
        redirectUrl = `/api/checkout/paypal?orderId=${order.id}`
        break

      default:
        return NextResponse.json(
          { message: 'Unsupported payment method' },
          { status: 400 }
        )
    }

    // 5️⃣ Return redirect URL
    return NextResponse.json({ redirectUrl })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { message: 'Checkout failed' },
      { status: 500 }
    )
  }
}
