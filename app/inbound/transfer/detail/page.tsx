'use client';

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

// สร้าง Component ย่อยเพื่อดึงค่าจาก URL
function DetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // ดึงค่า ?serial=... จาก URL ถ้าไม่มีให้แสดงเป็น ขีดแดช (-)
  const serialNo = searchParams.get('serial') || "-";
  
  const [newLocation, setNewLocation] = useState("");

  const handleTransfer = () => {
    if (newLocation.trim() === "") {
      alert("Please insert Transfer to Location");
      return;
    }
    alert(`✅ ย้ายรหัส ${serialNo} ไปที่ ${newLocation} เรียบร้อยแล้ว!`);
    router.push('/dashboard'); // ทำเสร็จแล้วเด้งกลับหน้าแรก
  };

  return (
    <div className="w-full max-w-3xl animate-in slide-in-from-right-8 duration-300">
      <h1 className="text-4xl font-bold text-[#1a237e] text-center mb-10 drop-shadow-sm">
        Transfer detail
      </h1>
      
      <div className="bg-white rounded-[40px] shadow-xl p-8 md:p-12 relative min-h-[450px] border border-gray-100">
        
        <div className="space-y-8 max-w-lg mx-auto text-xl font-bold text-gray-800 pt-4">
          <div className="grid grid-cols-2 items-center">
            <span>Serial No</span>
            <span className="text-gray-500 font-medium">{serialNo}</span>
          </div>
          
          <div className="grid grid-cols-2 items-center">
            <span>Part ID</span>
            <span className="text-gray-500 font-medium">xx1-2</span>
          </div>
          
          <div className="grid grid-cols-2 items-center">
            <span>Location</span>
            <span className="text-gray-500 font-medium">A05</span>
          </div>
          
          <div className="grid grid-cols-2 items-center pt-6">
            <span>Transfer to location</span>
            <input
              type="text"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value.toUpperCase())}
              className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 text-lg font-medium transition-all"
              placeholder="e.g. B12"
            />
          </div>
        </div>

        <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end mt-12">
          <button 
            onClick={() => router.push('/inbound/transfer')}
            className="w-16 h-16 bg-white border border-gray-200 rounded-2xl shadow-sm flex items-center justify-center hover:bg-gray-50 transition-all hover:-translate-x-1"
          >
            <ArrowLeft className="w-8 h-8 text-black stroke-[3px]" />
          </button>
          
          <button 
            onClick={handleTransfer}
            className="px-8 py-4 bg-emerald-500 text-white rounded-2xl shadow-md font-bold text-xl hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            Transfer
          </button>
        </div>
      </div>
    </div>
  );
}

// หน้าหลักต้องครอบด้วย Suspense เพื่อให้ Next.js ทำงานกับ useSearchParams ได้อย่างสมบูรณ์
export default function TransferDetailPage() {
  return (
    <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center p-6">
      <Suspense fallback={<div className="text-xl font-bold text-gray-500">Loading details...</div>}>
        <DetailContent />
      </Suspense>
    </div>
  );
}