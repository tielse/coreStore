'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { loginWithKeycloak } from './useVM/auth.login'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleLogin() {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    if (res.ok) {
      router.push('/dashboard')
    }
  }

  return (
    <div>
      <input onChange={(e) => setEmail(e.target.value)} />
      <input type="password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={loginWithKeycloak}>
		Login with Keycloak
	  </button>

    </div>
  )
}
