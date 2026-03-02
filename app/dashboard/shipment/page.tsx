'use client';

import Link from "next/link";
// นำเข้า Icon ใหม่ให้ตรงกับหัวข้อ (Building2 สำหรับ Provider, UserPlus สำหรับ Customer)
import { Truck, PackageCheck, Building2, UserPlus } from "lucide-react";

export default function ShipmentMenuPage() {
  const menuItems = [
    {
      title: "Shipping",
      description: "Process outbound orders for shipping", // ปรับคำอธิบายให้เข้ากับ Shipping
      icon: <PackageCheck className="w-10 h-10 mb-4 text-orange-600" />,
      href: "/dashboard/shipment/process", 
      color: "hover:border-orange-500 hover:shadow-orange-100"
    },
    {
      title: "Add New Provider",
      description: "Register a new logistics provider", // คำอธิบายสำหรับการเพิ่ม Provider
      icon: <Building2 className="w-10 h-10 mb-4 text-blue-600" />, // เปลี่ยนไอคอนเป็นตึก/บริษัท
      href: "/dashboard/shipment/provider", // เตรียมลิงก์เผื่อสร้างหน้าเพิ่ม Provider
      color: "hover:border-blue-500 hover:shadow-blue-100"
    },
    {
      title: "Add New Customer",
      description: "Add a new customer profile to the system", // คำอธิบายสำหรับการเพิ่ม Customer
      icon: <UserPlus className="w-10 h-10 mb-4 text-emerald-600" />, // เปลี่ยนไอคอนเป็นเพิ่มผู้ใช้งาน
      href: "/dashboard/shipment/customer", // เตรียมลิงก์เผื่อสร้างหน้าเพิ่ม Customer
      color: "hover:border-emerald-500 hover:shadow-emerald-100"
    }
  ];

  return (
    <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-4xl text-center">
        
        {/* ไอคอนหัวข้อหลัก รูปรถบรรทุก */}
        <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-orange-100">
          <Truck className="w-10 h-10" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-[#1a237e] mb-4 drop-shadow-sm">
          Shipment
        </h1>
        <p className="text-gray-500 mb-12 text-lg">Please select a process to continue</p>

        {/* Grid เมนู */}
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
              <p className="text-gray-500 text-sm text-center">{item.description}</p>
            </Link>
          ))}
        </div>
        
      </div>
    </div>
  );
}