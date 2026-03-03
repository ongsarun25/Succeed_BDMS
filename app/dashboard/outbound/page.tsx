'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ClipboardCheck, PackagePlus, Box } from "lucide-react";
import { supabase } from "@/lib/auth";

export default function OutboundMenuPage() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from('app_user')
          .select('role')
          .eq('user_id', session.user.id)
          .single();
        if (data) setRole(data.role);
      }
    };
    fetchRole();
  }, []);
  const menuItems = [
    {
      title: "1. Create Outbound",
      description: "นำเข้าไฟล์ Excel เพื่อสร้างใบเบิกจ่ายและจองสต็อกอัตโนมัติ",
      icon: <PackagePlus className="w-10 h-10 mb-4 text-purple-600" />,
      href: "/dashboard/outbound/create",
      color: "hover:border-purple-500 hover:shadow-purple-100"
    },
    {
      title: "2. Outbound Pick",
      description: "ดูรายการอะไหล่และตำแหน่งบนชั้นวาง เพื่อไปหยิบของตามออเดอร์",
      icon: <ClipboardCheck className="w-10 h-10 mb-4 text-blue-600" />,
      href: "/dashboard/outbound/pick",
      color: "hover:border-blue-500 hover:shadow-blue-100"
    },
    {
      title: "3. Outbound History",
      description: "ตรวจสอบประวัติการเบิกจ่าย และสถานะสินค้าที่ออกจากคลัง",
      icon: <Box className="w-10 h-10 mb-4 text-emerald-600" />,
      href: "/dashboard/outbound/history",
      color: "hover:border-emerald-500 hover:shadow-emerald-100"
    }
  ];

  // Filter out the 'Create Outbound' menu if the user is not a Manager
  const visibleMenuItems = menuItems.filter(item => {
    if (item.href === "/dashboard/outbound/create" && role !== 'Manager') {
      return false; // Hide this menu from Staff
    }
    return true;
  });

  return (
    <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-4xl text-center">

        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-blue-100">
          <Package className="w-10 h-10" />
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-[#1a237e] mb-4 drop-shadow-sm">
          Outbound
        </h1>
        <p className="text-gray-500 mb-12 text-lg">เลือกระบวนการทำงานเพื่อดำเนินการต่อ</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
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
              <p className="text-gray-500 text-sm">{item.description}</p>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}