"use client"
import InboundCreateProvider from "@/app/context/InboundCreateContext"

export default function InboundCreateLayout({ children }: { children: React.ReactNode }) {
  return (
    <InboundCreateProvider>
      {children}
    </InboundCreateProvider>
  )
}