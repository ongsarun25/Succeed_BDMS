'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function InventorySearchPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    serialNo: "",
    partId: "",
    location: "",
    inboundId: "",
    status: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    
    // เช็คเงื่อนไข: ถ้าว่างเปล่าทุกช่อง จะไม่ยอมให้ไปต่อ
    const isAllBlank = Object.values(form).every(val => val.trim() === "");
    
    if (isAllBlank) {
      alert("กรุณาระบุข้อมูลที่ต้องการค้นหา หรือใส่เครื่องหมาย * เพื่อเรียกดูทั้งหมด");
      return;
    }

    // แปลงข้อมูลใน Form เป็น URL Parameters แล้วส่งไปหน้า Detail
    const queryParams = new URLSearchParams(form).toString();
    router.push(`/inbound/inventory/detail?${queryParams}`);
  };

  return (
    <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold text-[#1a237e] mb-10 text-center drop-shadow-sm">
          Inventory
        </h1>
        
        <form onSubmit={handleNext} className="relative">
          <div className="space-y-6 max-w-xl mx-auto">
            
            {/* ฟอร์ม Input ทั้ง 5 ช่อง */}
            {[
              { label: "Serial No", name: "serialNo" },
              { label: "Part ID", name: "partId" },
              { label: "Location", name: "location" },
              { label: "Inbound ID", name: "inboundId" },
              { label: "Status", name: "status" }
            ].map((field) => (
              <div key={field.name} className="flex flex-col">
                <label className="text-xl font-bold text-gray-900 mb-2 ml-2">
                  {field.label}
                </label>
                <input
                  type="text"
                  name={field.name}
                  value={form[field.name as keyof typeof form]}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-white rounded-3xl shadow-sm border border-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-lg transition-all"
                  placeholder="Insert value or * for all"
                />
              </div>
            ))}
          </div>

          {/* ปุ่มซ้ายขวา */}
          <div className="flex justify-between items-center mt-12 px-4">
            <Link 
              href="/dashboard" // ปรับ URL กลับหน้าหลักตามต้องการ
              className="w-16 h-16 bg-white rounded-[24px] shadow-md border border-gray-100 flex items-center justify-center hover:bg-gray-50 hover:shadow-lg transition-all hover:scale-105"
            >
              <ArrowLeft className="w-8 h-8 text-black stroke-[3px]" />
            </Link>
            
            <button 
              type="submit"
              className="w-16 h-16 bg-white rounded-[24px] shadow-md border border-gray-100 flex items-center justify-center hover:bg-gray-50 hover:shadow-lg transition-all hover:scale-105"
            >
              <ArrowRight className="w-8 h-8 text-black stroke-[3px]" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}