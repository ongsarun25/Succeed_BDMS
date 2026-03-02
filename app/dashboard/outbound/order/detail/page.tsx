'use client';

import { useRouter, useSearchParams } from "next/navigation";
// นำเข้า ArrowRight เพิ่มเติม
import { ArrowLeft, ArrowRight, FileText, Calendar, Activity, User, Home } from "lucide-react";
import { Suspense } from "react";

function OrderDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // รับค่า Outbound ID มาจากหน้าแรก ถ้าไม่มีให้ขึ้น Unknown
  const outboundId = searchParams.get('id') || 'Unknown';

  // ข้อมูลจำลอง (Mock Data) ตามฟิลด์ที่คุณระบุ
  const mockData = {
    requirementDate: "28/02/2026",
    status: "Wait", // ลองเปลี่ยนเป็น "Pack done" ดูได้ครับ สีจะเปลี่ยนอัตโนมัติ
    customerId: "CUST-88902"
  };

  // ฟังก์ชันปรับสีป้าย Status
  const getStatusStyle = (status: string) => {
    if (status === 'Pack done') return 'bg-green-100 text-green-700 border-green-300';
    if (status === 'Wait') return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    return 'bg-gray-100 text-gray-700 border-gray-300';
  };

  return (
    <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in slide-in-from-right-8 duration-500">
      <div className="w-full max-w-2xl text-center">
        
        {/* หัวข้อ */}
        <h1 className="text-4xl md:text-5xl font-bold text-[#1a237e] mb-12 drop-shadow-sm flex items-center justify-center gap-4">
          <FileText className="w-12 h-12 text-blue-600" />
          Order Detail
        </h1>

        {/* กล่องแสดงข้อมูล (ตาม Mockup) */}
        <div className="bg-white rounded-[32px] shadow-lg border border-gray-100 p-8 md:p-12 text-left relative">
          <div className="flex flex-col gap-8">
            
            {/* 1. Outbound ID */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-6 gap-2">
              <span className="text-2xl font-bold text-gray-500 flex items-center gap-3">
                <FileText className="w-7 h-7 text-blue-400" />
                Outbound ID
              </span>
              <span className="text-3xl font-extrabold text-[#1a237e]">{outboundId}</span>
            </div>

            {/* 2. Requirement Date */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-6 gap-2">
              <span className="text-2xl font-bold text-gray-500 flex items-center gap-3">
                <Calendar className="w-7 h-7 text-blue-400" />
                Requirement Date
              </span>
              <span className="text-2xl font-bold text-gray-800">{mockData.requirementDate}</span>
            </div>

            {/* 3. Customer ID */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-6 gap-2">
              <span className="text-2xl font-bold text-gray-500 flex items-center gap-3">
                <User className="w-7 h-7 text-blue-400" />
                Customer ID
              </span>
              <span className="text-2xl font-bold text-gray-800">{mockData.customerId}</span>
            </div>

            {/* 4. Status */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pt-2 gap-4">
              <span className="text-2xl font-bold text-gray-500 flex items-center gap-3">
                <Activity className="w-7 h-7 text-blue-400" />
                Status
              </span>
              <span className={`px-6 py-2 rounded-full text-xl font-bold border-2 shadow-sm ${getStatusStyle(mockData.status)}`}>
                {mockData.status}
              </span>
            </div>

          </div>
        </div>

        {/* Navigation Buttons: แก้ไขส่วนนี้ให้มีปุ่ม Next กลับหน้าหลัก */}
        <div className="flex justify-between items-center w-full mt-8 px-2">
          {/* ปุ่ม Back */}
          <button 
            onClick={() => router.back()}
            className="w-16 h-16 bg-white rounded-[24px] shadow-md border border-gray-100 flex items-center justify-center hover:bg-gray-50 hover:shadow-lg transition-all hover:-translate-x-1"
          >
            <ArrowLeft className="w-8 h-8 text-black stroke-[3px]" />
          </button>
          
          {/* ปุ่ม Next กลับหน้าหลัก */}
          <button 
            onClick={() => router.push('/dashboard/outbound')} // ตรงนี้เปลี่ยน path กลับไปหน้าหลักของคุณได้เลยครับ เช่น /dashboard หรือ /dashboard/outbound
            className="h-16 px-8 bg-blue-600 rounded-[24px] shadow-md border border-blue-500 flex items-center gap-3 hover:bg-blue-700 hover:shadow-lg transition-all hover:translate-x-1 group"
          >
            <span className="text-xl font-bold text-white">Next to Home</span>
            <Home className="w-7 h-7 text-white stroke-[2.5px]" />
          </button>
        </div>

      </div>
    </div>
  );
}

// หุ้มด้วย Suspense เพื่อรองรับ Next.js (ป้องกัน Error ตอน Build)
export default function OutboundOrderDetailPage() {
  return (
    <Suspense fallback={<div className="text-xl font-bold text-gray-500 text-center mt-20">Loading Order Detail...</div>}>
      <OrderDetailContent />
    </Suspense>
  );
}