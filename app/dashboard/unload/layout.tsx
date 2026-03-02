"use client"
import UnloadProvider from "@/app/context/UnloadContext"

export default function UnloadLayout({ children }: { children: React.ReactNode }) {
  return (
    <UnloadProvider>
      {children}
    </UnloadProvider>
  )
}