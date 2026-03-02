"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowRight, ArrowLeft } from "lucide-react"
import { useUnload } from "@/app/context/UnloadContext"

export default function UnloadDetailStep1() {
  const { inboundOrder } = useUnload()
  const router = useRouter()

  // If someone lands here directly without searching, send them back
  useEffect(() => {
    if (!inboundOrder) router.replace("/dashboard/unload")
  }, [inboundOrder])

  if (!inboundOrder) return null

  const details = [
    { label: "Inbound ID",   value: inboundOrder.inbound_id },
    { label: "Invoice No",   value: inboundOrder.invoice_no },
    { label: "Arrival date", value: inboundOrder.arrival_date },
    { label: "Container ID", value: inboundOrder.container_no },
  ]

  return (
    <div className="w-full max-w-3xl flex flex-col items-center mt-10">
      <h1 className="text-5xl font-extrabold text-[#0a173b] mb-12 drop-shadow-sm">Unload detail</h1>

      <div className="w-full space-y-4">
        {details.map((item, index) => (
          <div key={index} className="bg-white rounded-[20px] p-6 flex shadow-lg text-xl font-bold text-black">
            <div className="w-1/3 pl-4">{item.label}</div>
            <div className="w-16 text-center">:</div>
            <div className="flex-1 text-gray-700">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="w-full flex justify-between mt-12">
        <Link href="/dashboard/unload"
          className="p-4 bg-white rounded-[1rem] shadow-xl hover:scale-105 transition">
          <ArrowLeft className="w-8 h-8 text-black" strokeWidth={4} />
        </Link>
        <Link href="/dashboard/unload/step2"
          className="p-4 bg-white rounded-[1rem] shadow-xl hover:scale-105 transition">
          <ArrowRight className="w-8 h-8 text-black" strokeWidth={4} />
        </Link>
      </div>
    </div>
  )
}
