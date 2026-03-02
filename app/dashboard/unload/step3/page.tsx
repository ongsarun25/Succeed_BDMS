"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check } from "lucide-react"
import { useUnload } from "@/app/context/UnloadContext"
import { fetchInboundParts, updatePartConditions, InboundPart } from "@/lib/inbound"

export default function UnloadDetailStep3() {
  const { inboundOrder } = useUnload()
  const router = useRouter()
  const [parts, setParts] = useState<InboundPart[]>([])
  const [conditions, setConditions] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!inboundOrder) {
      router.replace("/dashboard/unload")
      return
    }

    fetchInboundParts(inboundOrder.inbound_id).then((result) => {
      setParts(result)
      const initial: Record<string, string> = {}
      result.forEach((p) => {
        initial[p.in_detail_id] = ""
      })
      setConditions(initial)
      setLoading(false)
    })
  }, [inboundOrder])

  const handleConditionChange = (in_detail_id: string, value: string) => {
    setConditions((prev) => ({ ...prev, [in_detail_id]: value }))
  }

  const handleDone = async () => {
    const allSelected = parts.every((p) => conditions[p.in_detail_id])
    if (!allSelected) {
      setError("Please select a condition for all parts before submitting.")
      return
    }
    if (!inboundOrder) {
      setError("Inbound order not found.")
      return
    }
    setSaving(true)
    setError("")

    const updates = parts.map((p) => ({
      in_detail_id: p.in_detail_id,
      condition: conditions[p.in_detail_id],
    }))

    const result = await updatePartConditions(updates, inboundOrder.inbound_id)

    if (!result.success) {
      setError(result.error ?? "Failed to save. Please try again.")
      setSaving(false)
      return
    }

    router.push("/dashboard")
  }

  const conditionColor = (condition: string) => {
    switch (condition) {
      case "Available": return "text-purple-600"
      case "Damaged":   return "text-pink-500"
      case "Not found": return "text-gray-500"
      default:          return "text-black"
    }
  }

  if (loading) return (
    <div className="w-full max-w-4xl flex flex-col items-center mt-10">
      <h1 className="text-5xl font-extrabold text-[#0a173b] mb-12">Unload detail</h1>
      <p className="text-gray-400 text-xl">Loading parts...</p>
    </div>
  )

  return (
    <div className="w-full max-w-4xl flex flex-col items-center mt-10">
      <h1 className="text-5xl font-extrabold text-[#0a173b] mb-12 drop-shadow-sm">Unload detail</h1>

      <div className="w-full bg-white rounded-[30px] shadow-xl p-10 min-h-[400px]">
        {/* Header */}
        <div className="grid grid-cols-3 gap-4 text-2xl font-bold text-black mb-8 px-4 text-center">
          <div className="text-left">Part ID</div>
          <div>Serial No</div>
          <div>Status</div>
        </div>

        {/* Rows */}
        <div className="space-y-6 px-4">
          {parts.map((part) => (
            <div key={part.in_detail_id} className="grid grid-cols-3 gap-4 text-lg font-semibold text-gray-700 items-center">
              <div className="text-left">{part.part_id}</div>
              <div className="text-center">{part.serial_no}</div>
              <div className="text-center">
                <select
                  value={conditions[part.in_detail_id] ?? ""}
                  onChange={(e) => handleConditionChange(part.in_detail_id, e.target.value)}
                  className={`w-full max-w-[150px] mx-auto bg-white border-2 
                    ${conditions[part.in_detail_id] ? "border-gray-300" : "border-red-300"} 
                    rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-blue-500 font-bold cursor-pointer 
                    ${conditionColor(conditions[part.in_detail_id])}`}
                >
                  <option value="" disabled>Select...</option>
                  <option value="Available" className="text-purple-600 font-bold">Available</option>
                  <option value="Damaged" className="text-pink-500 font-bold">Damaged</option>
                  <option value="Not found" className="text-gray-500 font-bold">Not found</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        {error && <p className="text-red-500 font-semibold mt-6 text-center">{error}</p>}
      </div>

      {/* Navigation */}
      <div className="w-full flex justify-between mt-12">
        <button
          onClick={() => router.push("/dashboard/unload/step2")}
          className="p-4 bg-white rounded-[1rem] shadow-xl hover:scale-105 transition"
        >
          <ArrowLeft className="w-8 h-8 text-black" strokeWidth={4} />
        </button>
        <button
          onClick={handleDone}
          disabled={saving}
          className="px-8 py-4 bg-white rounded-[1rem] shadow-xl hover:scale-105 transition flex items-center gap-2 disabled:opacity-50"
        >
          <span className="text-xl font-bold text-green-600">
            {saving ? "Saving..." : "Done"}
          </span>
          <Check className="w-8 h-8 text-green-600" strokeWidth={4} />
        </button>
      </div>
    </div>
  )
}