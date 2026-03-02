"use client";
import './globals.css'
import Link from 'next/link'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col font-sans bg-gradient-to-b from-[#e2e6f0] via-[#5c7796] to-[#06153b]">
        {/* Top Navbar Removed for a cleaner look */}

        <main className="flex-1 flex flex-col w-full relative">
          {children}
        </main>

      </body>
    </html>
  )
}