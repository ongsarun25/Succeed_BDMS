'use client'; // ต้องเติมบรรทัดนี้ เพราะเราจะใช้ usePathname ซึ่งเป็น Client Hook

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation"; // นำเข้า usePathname
import { LogIn, LogOut, Package } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); // ดึงค่า Path ปัจจุบันมาเก็บไว้

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-[#f2f4f7] via-[#8fa3c0] to-[#0a1e4a] font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a173b] text-white flex flex-col py-8 shadow-2xl z-10">
        <h2 className="text-xl font-bold text-center mb-10">MENU</h2>
        <nav className="flex flex-col gap-2 px-4">
          
          {/* Inbound Menu */}
          <Link 
            href="/dashboard" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              pathname === '/dashboard' 
                ? 'bg-white/20 font-bold text-white shadow-inner' // สไตล์ตอนถูกเลือก (Highlight)
                : 'hover:bg-white/5 font-semibold text-gray-300'  // สไตล์ตอนไม่ได้เลือก
            }`}
          >
            <LogIn className="w-5 h-5" />
            <span>Inbound</span>
          </Link>

          {/* Outbound Menu */}
          <Link 
            href="/dashboard/outbound" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              pathname.includes('/outbound') 
                ? 'bg-white/20 font-bold text-white shadow-inner' 
                : 'hover:bg-white/5 font-semibold text-gray-300'
            }`}
          >
            <LogOut className="w-5 h-5" />
            <span>Outbound</span>
          </Link>

          {/* Shipment Menu */}
          <Link 
            href="/dashboard/shipment" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              pathname.includes('/shipment') 
                ? 'bg-white/20 font-bold text-white shadow-inner' 
                : 'hover:bg-white/5 font-semibold text-gray-300'
            }`}
          >
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