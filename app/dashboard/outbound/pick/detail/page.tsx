'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, CheckSquare, Square } from "lucide-react";
import Link from "next/link";

// ข้อมูลจำลอง (Mock Data) สำหรับรายการที่ต้องไปหยิบ
const initialPickItems = [
  { id: 1, partId: "PART-A001", location: "A-01-02", qty: 50, isPicked: false },
  { id: 2, partId: "PART-B005", location: "B-03-05", qty: 20, isPicked: false },
  { id: 3, partId: "PART-C012", location: "C-01-10", qty: 15, isPicked: false },
];

export default function OutboundPickDetailPage() {
  const router = useRouter();
  const [items, setItems] = useState(initialPickItems);
  
  // สมมติว่ารับ Outbound ID มาจากหน้าก่อนหน้า
  const outboundId = "OUT-889922"; 

  // ฟังก์ชันสลับสถานะการหยิบ (ติ๊กถูก)
  const togglePick = (id: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, isPicked: !item.isPicked } : item
    ));
  };

  const handleConfirm = () => {
    // เช็คว่าติ๊กหยิบครบทุกอันหรือยัง (ถ้าอยากบังคับให้หยิบครบถึงจะผ่านได้)
    const allPicked = items.every(item => item.isPicked);
    if (!allPicked) {
      const confirmIncomplete = confirm("You haven't picked all items. Are you sure you want to finish?");
      if (!confirmIncomplete) return;
    }

    alert(`✅ Confirmed Pick for ${outboundId}!`);
    // พอยืนยันเสร็จ เด้งกลับไปหน้าเมนู Outbound หลัก
    router.push('/dashboard/outbound'); 
  };

  return (
    <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in slide-in-from-right-8 duration-500">
      <div className="w-full max-w-3xl">
        
        {/* หัวข้อ */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1a237e] drop-shadow-sm mb-2">
            Pick Detail
          </h1>
          <p className="text-xl font-bold text-gray-600 bg-white inline-block px-6 py-2 rounded-full shadow-sm border border-gray-100">
            ID: {outboundId}
          </p>
        </div>

        {/* กล่องแสดงรายการสินค้า */}
        <div className="bg-white rounded-[32px] shadow-lg border border-gray-100 p-8 min-h-[400px] flex flex-col">
          
          {/* หัวตาราง */}
          <div className="grid grid-cols-12 text-xl font-bold text-gray-900 mb-6 px-4 border-b-2 border-gray-100 pb-4">
            <div className="col-span-5">Part ID</div>
            <div className="col-span-3 text-center">Location</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-2 text-center">Status</div>
          </div>

          {/* รายการสินค้า */}
          <div className="flex-1 space-y-4 px-4 overflow-y-auto max-h-[40vh]">
            {items.map((item) => (
              <div 
                key={item.id} 
                onClick={() => togglePick(item.id)}
                className={`grid grid-cols-12 items-center text-lg font-medium p-4 rounded-2xl cursor-pointer transition-all border-2 ${
                  item.isPicked 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-gray-50 border-transparent hover:border-gray-200 text-gray-700'
                }`}
              >
                <div className="col-span-5">{item.partId}</div>
                <div className="col-span-3 text-center text-blue-600 font-bold">{item.location}</div>
                <div className="col-span-2 text-center">{item.qty}</div>
                <div className="col-span-2 flex justify-center">
                  {item.isPicked ? (
                    <CheckSquare className="w-8 h-8 text-green-500" />
                  ) : (
                    <Square className="w-8 h-8 text-gray-300" />
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>

{/* ปุ่ม Navigation ด้านล่าง */}
        <div className="flex justify-between items-center mt-10 px-2">
          
          {/* ปุ่ม Back */}
          <button 
            onClick={() => router.back()}
            className="w-16 h-16 bg-white rounded-[24px] shadow-md border border-gray-100 flex items-center justify-center hover:bg-gray-50 hover:shadow-lg transition-all hover:-translate-x-1"
          >
            <ArrowLeft className="w-8 h-8 text-black stroke-[3px]" />
          </button>
          
          {/* ปุ่ม Done (แทนที่ปุ่ม Confirm เดิม) */}
          <button 
            onClick={handleConfirm}
            className="h-16 bg-white border border-gray-100 rounded-[24px] shadow-sm flex items-center justify-center px-8 gap-3 hover:bg-gray-50 hover:shadow-md transition-all active:scale-95"
          >
            <span className="text-[#3ea043] font-bold text-3xl">Done</span>
            <Check className="w-8 h-8 text-[#3ea043] stroke-[4px]" />
          </button>

        </div>
        </div>

      </div>

  );
}