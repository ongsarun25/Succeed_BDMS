"use client"
import { createContext, useContext, useState } from "react"

export type ExcelPart = {
  part_id: string
  quantity: number
  invoice_no: string
  serial_no: string
}

type InboundCreateData = {
  container_no: string
  provider_id: string
  parts: ExcelPart[]
}

const InboundCreateContext = createContext<{
  data: InboundCreateData
  setData: (data: Partial<InboundCreateData>) => void
} | null>(null)

export function InboundCreateProvider({ children }: { children: React.ReactNode }) {
  const [data, setDataRaw] = useState<InboundCreateData>({
    container_no: "",
    provider_id: "",
    parts: [],
  })

  const setData = (partial: Partial<InboundCreateData>) =>
    setDataRaw(prev => ({ ...prev, ...partial }))

  return (
    <InboundCreateContext.Provider value={{ data, setData }}>
      {children}
    </InboundCreateContext.Provider>
  )
}

export function useInboundCreate() {
  const context = useContext(InboundCreateContext)
  if (!context) throw new Error("useInboundCreate must be used within InboundCreateProvider")
  return context
}

export default InboundCreateProvider