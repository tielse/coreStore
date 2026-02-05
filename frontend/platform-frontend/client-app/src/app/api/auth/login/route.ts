import { NextResponse } from 'next/server'
import { verifyPassword } from '@/lib/password'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  const { email, password } = await req.json()

  const user = await db.sys_customer.findUnique({ where: { email } })
  if (!user) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
  }

  const isValid = await verifyPassword(password, user.password_hash)
  if (!isValid) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })

  response.cookies.set('client_token', user.id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
  })

  return response
}
