import { useState } from "react"
import { useRouter } from "next/router"
import { AuthService } from "../services/auth.service"

export function useAuthLoginVM() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = async (username: string, password: string) => {
    try {
      setLoading(true)
      setError(null)

      // nếu login thất bại → API sẽ throw
      await AuthService.get().login({ username, password })

      // ✅ login thành công → điều hướng
      router.push("/")

      return true
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Login failed")
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    login,
  }
}
