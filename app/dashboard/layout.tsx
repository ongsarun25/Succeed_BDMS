'use client'; // ต้องเติมบรรทัดนี้ เพราะเราจะใช้ usePathname ซึ่งเป็น Client Hook

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogIn, LogOut, Package, UserCircle, Boxes } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<{ first_name: string; last_name: string; role: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }

      const { data: userData } = await supabase
        .from('app_user')
        .select('first_name, last_name, role')
        .eq('user_id', session.user.id)
        .single();

      if (userData) setProfile(userData);
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-[#f2f4f7] via-[#8fa3c0] to-[#0a1e4a] font-sans">

      {/* Sidebar */}
      <aside className="w-64 bg-[#0a173b] text-white flex flex-col py-8 shadow-2xl z-10 justify-between">
        <div>
          <div className="flex justify-center mb-10 px-4">
            <Image src="/logo.png" alt="Succeed Logo" width={160} height={80} priority className="object-contain" />
          </div>
          <nav className="flex flex-col gap-2 px-4">

            {/* Inbound Menu */}
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${pathname === '/dashboard'
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
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${pathname.includes('/outbound')
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
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${pathname.includes('/shipment')
                ? 'bg-white/20 font-bold text-white shadow-inner'
                : 'hover:bg-white/5 font-semibold text-gray-300'
                }`}
            >
              <Package className="w-5 h-5" />
              <span>Shipment</span>
            </Link>

            {/* Current Stock Menu */}
            <Link
              href="/dashboard/inventory"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${pathname.includes('/inventory')
                ? 'bg-white/20 font-bold text-white shadow-inner'
                : 'hover:bg-white/5 font-semibold text-gray-300'
                }`}
            >
              <Boxes className="w-5 h-5" />
              <span>Current Stock</span>
            </Link>

          </nav>
        </div>

        {/* User Profile & Logout Bottom Section */}
        <div className="px-4 mt-auto pt-8 border-t border-white/10">
          {profile ? (
            <div className="flex items-center gap-3 mb-4 px-2">
              <UserCircle className="w-10 h-10 text-blue-400" />
              <div className="flex flex-col">
                <span className="text-sm font-bold truncate max-w-[120px] leading-tight">
                  {profile.first_name || 'User'} {profile.last_name || ''}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  {profile.role || 'Staff'}
                </span>
              </div>
            </div>
          ) : (
            <div className="h-14 mb-4 animate-pulse bg-white/5 rounded-xl px-2"></div>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition font-bold"
          >
            <LogOut className="w-5 h-5" />
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative flex flex-col items-center justify-center p-8">
        {/* Render Page Content Here */}
        {children}
      </main>
    </div>
  );
}