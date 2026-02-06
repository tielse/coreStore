'use client'
import { AuthService } from '@/services/auth.service'

export default function LoginForm() {
  const onSubmit = async (e) => {
    e.preventDefault()
    const form = new FormData(e.target)

    await AuthService.login({
      username: form.get('username'),
      password: form.get('password'),
    })

    location.href = '/'
  }

  return (
    <form onSubmit={onSubmit}>
      <input name="username" />
      <input name="password" type="password" />
      <button>Login</button>
    </form>
  )
}
