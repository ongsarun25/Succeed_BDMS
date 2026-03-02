"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { useUnload } from "@/app/context/UnloadContext"
import { findInboundOrder } from "@/lib/inbound"

export default function UnloadInsertIdPage() {
  const { setInboundOrder } = useUnload()
  const [inputId, setInputId] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleNext = async () => {
    console.log("🔵 handleNext called, inputId:", inputId)  // ← add this
  if (!inputId.trim()) {
    setError("Please enter an Inbound ID.")
    return
  }
    if (!inputId.trim()) {
      setError("Please enter an Inbound ID.")
      return
    }
    setLoading(true)
    setError("")

    const result = await findInboundOrder(inputId)
    setLoading(false)

    if (!result) {
      setError("Inbound ID not found. Please check and try again.")
      return
    }

    setInboundOrder(result)
    router.push("/dashboard/unload/step1")
  }

  return (
    <div className="w-full max-w-2xl flex flex-col items-center mt-10">
      <h1 className="text-5xl font-extrabold text-[#0a173b] mb-16 drop-shadow-sm">Unload</h1>

      <div className="w-full max-w-lg space-y-4">
        <label className="text-2xl font-bold text-black ml-2">Inbound ID</label>
        <input
          type="text"
          placeholder="Please Insert Inbound ID"
          value={inputId}
          onChange={(e) => setInputId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleNext()}
          className="w-full px-6 py-5 rounded-[20px] bg-white text-lg text-black placeholder:text-gray-400 focus:outline-none shadow-lg"
        />
        {error && <p className="text-red-500 font-semibold ml-2">{error}</p>}
      </div>

      <div className="mt-12">
        <button
          onClick={handleNext}
          disabled={loading}
          className="block p-4 bg-white rounded-[1rem] shadow-xl hover:scale-105 transition-transform disabled:opacity-50"
        >
          <ArrowRight className="w-8 h-8 text-black" strokeWidth={4} />
        </button>
      </div>
    </div>
  )
}