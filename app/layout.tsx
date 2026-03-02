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
        {/* Navbar */}
        <header className="flex justify-between items-center px-6 py-3 bg-[#f4f5f7] shadow-sm">
          <h1 className="text-lg font-bold text-black">Warehouse Management System (WMS)</h1>
          <div className="flex gap-3">
            <Link href="/" className="px-5 py-1.5 bg-white rounded-lg font-bold text-black shadow-sm text-sm">
              Log in
            </Link>
            <Link href="/signin" className="px-5 py-1.5 bg-white rounded-lg font-bold text-black shadow-sm text-sm">
              Sign in
            </Link>
          </div>
        </header>

        <main className="flex-1 flex flex-col w-full relative">
          {children}
        </main>

      </body>
    </html>
  )
}