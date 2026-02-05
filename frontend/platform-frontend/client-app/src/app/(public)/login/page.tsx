"use client"

import { useState } from "react"
import { useAuthLoginVM } from "./useVM/useAuthLoginVM"

export default function LoginPage() {
  const { login, loading, error } = useAuthLoginVM()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          Đăng nhập
        </h1>

        <div className="space-y-4">
          <input
            className="w-full border rounded px-4 py-2 focus:ring focus:ring-blue-200"
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            className="w-full border rounded px-4 py-2 focus:ring focus:ring-blue-200"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            onClick={() => login(username, password)}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </div>
      </div>
    </div>
  )
}
