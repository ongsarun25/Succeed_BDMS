'use client';

import Link from "next/link";
import { Package, ClipboardCheck, PackagePlus, Box } from "lucide-react";

export default function OutboundMenuPage() {
  // สร้าง Menu list เผื่ออนาคตมีหลาย Choice
  const menuItems = [
    {
      title: "Outbound Pick",
      description: "Pick items for outbound orders",
      icon: <ClipboardCheck className="w-10 h-10 mb-4 text-blue-600" />,
      href: "/dashboard/outbound/pick",
      color: "hover:border-blue-500 hover:shadow-blue-100"
    },
    {
      title: "Outbound Order",
      description: "Outbound Order",
      icon: <Box className="w-10 h-10 mb-4 text-emerald-600" />,
      href: "/dashboard/outbound/order", // ใส่ลิงก์ในอนาคต
      color: "hover:border-emerald-500 hover:shadow-emerald-100"
    },
    {
      title: "Create Outbound",
      description: "Create new outbound orders", 
      icon: <PackagePlus className="w-10 h-10 mb-4 text-purple-600" />, // เปลี่ยนไอคอนตรงนี้
      href: "/dashboard/outbound/create", // ถ้าสร้างโฟลเดอร์แล้วก็เปลี่ยนเป็น "/dashboard/outbound/create" ได้เลยครับ
      color: "hover:border-purple-500 hover:shadow-purple-100"
    }
  ];

  return (
    <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-4xl text-center">
        
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-blue-100">
          <Package className="w-10 h-10" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-[#1a237e] mb-4 drop-shadow-sm">
          Outbound
        </h1>
        <p className="text-gray-500 mb-12 text-lg">Please select a process to continue</p>

        {/* สร้าง Grid สำหรับเมนูต่างๆ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {menuItems.map((item, index) => (
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