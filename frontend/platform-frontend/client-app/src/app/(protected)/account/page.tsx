import { cookies } from 'next/headers'

export default function Page() {
  const cookieStore = cookies()
  const token = cookieStore.get('access_token')?.value

  return <div>Account</div>
}
