"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useUnload } from "@/app/context/UnloadContext"
import { fetchInboundParts, InboundPart } from "@/lib/inbound"

type PartSummary = {
  part_id: string
  part_name: string
  qty: number
}

export default function UnloadStep2() {
  const { inboundOrder } = useUnload()
  const router = useRouter()
  const [summary, setSummary] = useState<PartSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!inboundOrder) {
      router.replace("/dashboard/unload")
      return
    }

    fetchInboundParts(inboundOrder.inbound_id).then((parts: InboundPart[]) => {
      // Group by part_id and count qty
      const grouped: Record<string, PartSummary> = {}
      parts.forEach((p) => {
        if (!grouped[p.part_id]) {
          grouped[p.part_id] = { part_id: p.part_id, part_name: p.part_name, qty: 0 }
        }
        grouped[p.part_id].qty += 1
      })
      setSummary(Object.values(grouped))
      setLoading(false)
    })
  }, [inboundOrder])

  return (
    <div className="w-full max-w-4xl flex flex-col items-center mt-10">
      <h1 className="text-5xl font-extrabold text-[#0a173b] mb-2 drop-shadow-sm">
        Part Summary
      </h1>
      <p className="text-gray-500 font-semibold mb-10">
        {inboundOrder?.inbound_id}
      </p>

      {loading && <p className="text-gray-400 text-xl">Loading...</p>}

      {!loading && summary.length === 0 && (
        <p className="text-red-500 font-semibold">No parts found for this inbound order.</p>
      )}

      {!loading && summary.length > 0 && (
        <div className="w-full space-y-4">
          {/* Header */}
          <div className="bg-[#0a173b] text-white rounded-[20px] p-4 flex font-bold text-sm px-6">
            <div className="w-1/4">Part ID</div>
            <div className="flex-1">Part Name</div>
            <div className="w-24 text-center">Qty</div>
          </div>

          {/* Rows */}
          {summary.map((item) => (
            <div key={item.part_id}
              className="bg-white rounded-[20px] p-5 flex items-center shadow-md text-sm font-semibold text-black px-6"
            >
              <div className="w-1/4 text-gray-700">{item.part_id}</div>
              <div className="flex-1">{item.part_name}</div>
              <div className="w-24 text-center">
                <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-xs">
                  {item.qty}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Navigation */}
      <div className="w-full flex justify-between mt-12">
        <button
          onClick={() => router.push("/dashboard/unload/step1")}
          className="p-4 bg-white rounded-[1rem] shadow-xl hover:scale-105 transition"
        >
          <ArrowLeft className="w-8 h-8 text-black" strokeWidth={4} />
        </button>
        <button
          onClick={() => router.push("/dashboard/unload/step3")}
          className="p-4 bg-white rounded-[1rem] shadow-xl hover:scale-105 transition"
        >
          <ArrowRight className="w-8 h-8 text-black" strokeWidth={4} />
        </button>
      </div>
    </div>
  )
}