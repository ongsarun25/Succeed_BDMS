"use client"

import Image from "next/image"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { findUser } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("กรุณากรอก Username และ Password")
      return
    }

    setLoading(true)
    setError("")

    const user = await findUser(username, password)

    setLoading(false)

    if (!user) {
      setError("Username หรือ Password ไม่ถูกต้อง")
      return
    }

    // ✅ No more manual cookie!
    // Supabase handles session automatically
    router.push("/dashboard")
  }

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md flex flex-col items-center">

        {/* Logo */}
        <div className="mb-6">
          <Image src="/logo.png" alt="Succeed Logo" width={300} height={200} priority />
        </div>

        {/* Glass Card */}
        <div className="w-full bg-white/20 backdrop-blur-md border border-white/10 shadow-2xl rounded-[40px] p-10">
          <h2 className="text-2xl font-extrabold text-black mb-6">Log in</h2>

          <div className="space-y-5">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-5 py-4 rounded-[20px] bg-white text-black placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full px-5 py-4 rounded-[20px] bg-white text-black placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            {/* ❌ Error Message */}
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <div className="flex justify-between items-center pt-4">
              <Link
                href="/signin"
                className="px-6 py-2 bg-white rounded-full text-sm font-semibold text-black shadow-md hover:bg-gray-50 transition"
              >
                Register
              </Link>

              {/* ✅ Button with loading state */}
              <button
                onClick={handleLogin}
                disabled={loading}
                className="p-2 bg-white rounded-xl shadow-md hover:bg-gray-100 transition block disabled:opacity-50"
              >
                {loading ? (
                  // 🆕 Spinner when loading
                  <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowRight className="w-6 h-6 text-black" strokeWidth={3} />
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}