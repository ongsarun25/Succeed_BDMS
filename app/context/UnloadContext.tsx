"use client"
import { createContext, useContext, useState } from "react"

export type InboundOrder = {
  idx: number
  inbound_id: string
  invoice_no: string
  arrival_date: string
  status: string
  container_no: string
  provider_id: string
  created_at: string
  updated_at: string
}

const UnloadContext = createContext<{
  inboundOrder: InboundOrder | null
  setInboundOrder: (data: InboundOrder | null) => void
} | null>(null)

export function UnloadProvider({ children }: { children: React.ReactNode }) {
  const [inboundOrder, setInboundOrder] = useState<InboundOrder | null>(null)

  return (
    <UnloadContext.Provider value={{ inboundOrder, setInboundOrder }}>
      {children}
    </UnloadContext.Provider>
  )
}

export function useUnload() {
  const context = useContext(UnloadContext)
  if (!context) throw new Error("useUnload must be used within UnloadProvider")
  return context
}

export default UnloadProvider