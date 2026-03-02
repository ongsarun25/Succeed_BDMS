"use client"
import Image from "next/image";
import Link from "next/link";
import { LogIn, LogOut, Package } from "lucide-react"; // ใช้ Icon แทนสัญลักษณ์

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gradient-to-b from-[#f2f4f7] via-[#8fa3c0] to-[#0a1e4a] font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a173b] text-white flex flex-col py-8 shadow-2xl z-10">
        <h2 className="text-xl font-bold text-center mb-10">MENU</h2>
        <nav className="flex flex-col gap-2 px-4">
          <Link href="/dashboard" className="flex items-center justify-between px-4 py-3 rounded-lg bg-white/10 font-bold">
            <div className="flex items-center gap-3">
              <LogIn className="w-5 h-5" />
              <span>Inbound</span>
            </div>
            <span>▶</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 font-semibold text-gray-300 transition">
            <LogOut className="w-5 h-5" />
            <span>Outbound</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 font-semibold text-gray-300 transition">
            <Package className="w-5 h-5" />
            <span>Shipment</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col items-center justify-center p-8">
        {/* Logo Top Left */}
        <div className="absolute top-6 left-8 -mt-10">
          <Image src="/logo.png" alt="Succeed Logo" width={300} height={200} priority />
        </div>
        
        {/* Render Page Content Here */}
        {children}
      </main>
    </div>
  );
}