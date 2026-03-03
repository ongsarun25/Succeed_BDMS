'use client';

import Link from "next/link";
import { Truck, PackageCheck, Building2, UserPlus, MapPin, KeyRound, Anchor, Send, User, PackageOpen } from "lucide-react";

export default function ShipmentMenuPage() {
  const primaryActions = [
    {
      title: "Warehouse Dispatch",
      description: "ยืนยันการนำสินค้าออกจากคลัง และจัดสรรไปตามรอบรถ",
      icon: <Send className="w-12 h-12 text-white" />,
      href: "/dashboard/shipment/dispatch",
      bgClass: "bg-gradient-to-br from-indigo-500 to-purple-600",
      hoverClass: "hover:shadow-indigo-500/30",
    },
    {
      title: "Delivery Process",
      description: "ยืนยันการรับสินค้าที่จุดหมายปลายทาง พร้อมบันทึกลายเซ็น",
      icon: <PackageCheck className="w-12 h-12 text-white" />,
      href: "/dashboard/shipment/process",
      bgClass: "bg-gradient-to-br from-orange-500 to-red-600",
      hoverClass: "hover:shadow-orange-500/30",
    }
  ];

  const logisticsActions = [
    {
      title: "Logistics Providers",
      description: "จัดการข้อมูลบริษัทขนส่งหรือพาร์ทเนอร์",
      icon: <Building2 className="w-8 h-8 text-blue-600 mb-3" />,
      href: "/dashboard/shipment/provider",
      color: "border-blue-100 hover:border-blue-300 hover:shadow-blue-100"
    },
    {
      title: "Customers Directory",
      description: "จัดการข้อมูลลูกค้าและจุดหมายปลายทาง",
      icon: <UserPlus className="w-8 h-8 text-emerald-600 mb-3" />,
      href: "/dashboard/shipment/customer",
      color: "border-emerald-100 hover:border-emerald-300 hover:shadow-emerald-100"
    },
    {
      title: "Drivers Database",
      description: "จัดการรายชื่อพนักงานขับรถขนส่ง",
      icon: <User className="w-8 h-8 text-orange-600 mb-3" />,
      href: "/dashboard/shipment/driver",
      color: "border-orange-100 hover:border-orange-300 hover:shadow-orange-100"
    },
    {
      title: "Create Shipment Run",
      description: "สร้างรอบการจัดส่ง และกำหนดรถพร้อมคนขับ",
      icon: <PackageOpen className="w-8 h-8 text-purple-600 mb-3" />,
      href: "/dashboard/shipment/create",
      color: "border-purple-100 hover:border-purple-300 hover:shadow-purple-100"
    },
    {
      title: "Active Shipments (Log)",
      description: "ตรวจสอบประวัติและสถานะรอบรถที่กำลังดำเนินการ",
      icon: <Truck className="w-8 h-8 text-indigo-600 mb-3" />,
      href: "/dashboard/shipment/log",
      color: "border-indigo-100 hover:border-indigo-300 hover:shadow-indigo-100"
    }
  ];

  return (
    <div className="w-full h-full min-h-[85vh] flex flex-col items-center p-6 lg:p-12 animate-in fade-in zoom-in-95 duration-700">

      {/* Header Section */}
      <div className="w-full max-w-5xl text-center mb-12">
        <div className="inline-flex items-center justify-center p-4 bg-orange-50 rounded-full mb-6 border-4 border-white shadow-sm ring-1 ring-gray-100">
          <Anchor className="w-10 h-10 text-orange-600 drop-shadow-sm" />
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight mb-4 flex items-center justify-center gap-4">
          Shipment Hub
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium">
          ศูนย์กลางการจัดการกระจายสินค้าและพาร์ทเนอร์ขนส่ง
        </p>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Primary Focus Area: Delivery Operations */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          {primaryActions.map((action, idx) => (
            <div key={idx} className="group h-full">
              <Link href={action.href} className={`relative block rounded-[40px] p-8 md:p-10 text-white shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden h-full flex flex-col justify-between ${action.bgClass} ${action.hoverClass}`}>

                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

                <div className="relative z-10 flex flex-col h-full items-start gap-6">
                  <div className="flex w-full justify-between items-start">
                    <div className="p-5 bg-white/20 backdrop-blur-md rounded-3xl shadow-lg border border-white/20">
                      {action.icon}
                    </div>
                    <div className="hidden md:flex items-center justify-center w-16 h-16 bg-white/20 rounded-full border border-white/20 backdrop-blur-sm group-hover:bg-white transition-colors duration-300 shrink-0">
                      <span className="text-3xl text-white group-hover:text-gray-900 transition-colors drop-shadow-md">→</span>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <h2 className="text-3xl font-black mb-3 opacity-95 leading-tight">{action.title}</h2>
                    <p className="text-white/80 text-lg font-medium max-w-sm leading-relaxed">{action.description}</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Secondary Focus Area: Logistics Management */}
        <div className="lg:col-span-12 mt-4">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <KeyRound className="w-6 h-6 text-gray-400" /> Logistics Management
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {logisticsActions.map((action: any, i: number) => (
              <Link
                key={i}
                href={action.href}
                className={`flex flex-col p-8 bg-white border-2 rounded-[32px] transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${action.color} group`}
              >
                <div className="transform group-hover:scale-110 transition-transform duration-300 origin-left">
                  {action.icon}
                </div>
                <h4 className="text-xl font-black text-gray-800 mb-2">{action.title}</h4>
                <p className="text-gray-500 font-medium text-sm leading-relaxed">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}