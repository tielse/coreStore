// src/libs/cookies.ts
import { cookies } from 'next/headers'

export const Cookie = {
  get(name: string) {
    return cookies().get(name)?.value
  },

  set(
    name: string,
    value: string,
    options?: {
      httpOnly?: boolean
      secure?: boolean
      maxAge?: number
      path?: string
    }
  ) {
    cookies().set({
      name,
      value,
      httpOnly: options?.httpOnly ?? true,
      secure: options?.secure ?? true,
      maxAge: options?.maxAge,
      path: options?.path ?? '/',
    })
  },

  delete(name: string) {
    cookies().delete(name)
  },
}
