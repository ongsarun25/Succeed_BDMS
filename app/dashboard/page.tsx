'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, supabase } from "@/lib/auth";
import Link from "next/link";
import {
  Package,
  Truck,
  ClipboardCheck,
  ArrowRightLeft,
  Boxes,
  Search,
  PackagePlus
} from "lucide-react";

export default function InboundMenuPage() {
  const router = useRouter();

  const [role, setRole] = useState<string | null>(null);

  // ✅ Session Protection & Role Fetching
  useEffect(() => {
    const checkSessionAndRole = async () => {
      const session = await getSession();
      if (!session) {
        router.push("/");
        return;
      }

      const { data } = await supabase
        .from('app_user')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (data) setRole(data.role);
    };
    checkSessionAndRole();
  }, [router]);

  const menuItems = [
    {
      title: "Create Inbound",
      description: "นำเข้า Invoice ล่วงหน้าเพื่อสร้างแผนรับของ (Inbound Plan)",
      icon: <PackagePlus className="w-10 h-10 mb-4 text-purple-600" />,
      href: "/dashboard/inbound/create",
      color: "hover:border-purple-500 hover:shadow-purple-100",
      managerOnly: true
    },
    {
      title: "Unload",
      description: "สแกนรับสินค้าลงจากรถ และตรวจสอบสภาพหน้างาน (QC)",
      icon: <Truck className="w-10 h-10 mb-4 text-blue-600" />,
      href: "/dashboard/inbound/unload",
      color: "hover:border-blue-500 hover:shadow-blue-100",
      managerOnly: false
    },
    {
      title: "Put-away",
      description: "นำของจากจุดรับ (DOCK) ไปเก็บเข้าชั้นวางในคลัง",
      icon: <ClipboardCheck className="w-10 h-10 mb-4 text-emerald-600" />,
      href: "/dashboard/inbound/confirmation",
      color: "hover:border-emerald-500 hover:shadow-emerald-100",
      managerOnly: false
    },
    {
      title: "Transfer",
      description: "ย้ายตำแหน่งสินค้าภายในคลัง (Location Transfer)",
      icon: <ArrowRightLeft className="w-10 h-10 mb-4 text-orange-600" />,
      href: "/dashboard/inbound/transfer",
      color: "hover:border-orange-500 hover:shadow-orange-100",
      managerOnly: false
    }
  ];

  const visibleMenuItems = menuItems.filter(item => {
    if (item.managerOnly && role?.toLowerCase() !== 'manager') return false;
    return true;
  });

  return (
    <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-5xl text-center">

        <div className="w-20 h-20 bg-indigo-50 text-[#1a237e] rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-indigo-100">
          <Package className="w-10 h-10" />
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-[#1a237e] mb-4 drop-shadow-sm">
          Inbound
        </h1>
        <p className="text-gray-500 mb-12 text-lg">เลือกระบวนการทำงานเพื่อดำเนินการต่อ</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {visibleMenuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`flex flex-col items-center justify-center p-8 bg-white rounded-[32px] shadow-md border-2 border-gray-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${item.color} group`}
            >
              <div className="transform group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{item.title}</h2>
              <p className="text-gray-500 text-sm text-center">{item.description}</p>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}