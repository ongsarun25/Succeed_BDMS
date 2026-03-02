'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ClipboardCheck } from "lucide-react";
import Link from "next/link";

export default function OutboundPickPage() {
  const router = useRouter();
  const [pickId, setPickId] = useState("");

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickId.trim()) {
      alert("Please enter Pick List ID or Order Number");
      return;
    }
    // สั่งเปลี่ยนหน้าไปที่ detail (เดี๋ยวเราสร้างโฟลเดอร์ detail ทีหลัง)
    router.push(`/dashboard/outbound/pick/detail?id=${pickId}`);
  };

  return (
    <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in slide-in-from-right-8 duration-500">
      <div className="w-full max-w-2xl text-center">
        
        <h1 className="text-4xl md:text-5xl font-bold text-[#1a237e] mb-12 drop-shadow-sm flex items-center justify-center gap-4">
          <ClipboardCheck className="w-12 h-12 text-blue-600" />
          Outbound Pick
        </h1>
        
        <form onSubmit={handleNext} className="max-w-md mx-auto flex flex-col items-center gap-8 relative">
          
          <div className="w-full text-left">
            <label className="block text-2xl font-bold text-gray-900 mb-4 pl-2">
              Pick List ID / Order No.
            </label>
            <input
              type="text"
              value={pickId}
              onChange={(e) => setPickId(e.target.value)}
              placeholder="e.g. PK-00123"
              className="w-full px-6 py-5 bg-white rounded-3xl shadow-sm border border-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-xl transition-all font-medium text-gray-800"
              autoFocus
            />
          </div>
          
          {/* ปุ่ม Navigation ด้านล่าง */}
          <div className="flex justify-between items-center w-full mt-8">
            <Link 
              href="/dashboard/outbound" 
              className="w-16 h-16 bg-white rounded-[24px] shadow-md border border-gray-100 flex items-center justify-center hover:bg-gray-50 hover:shadow-lg transition-all hover:-translate-x-1"
            >
              <ArrowLeft className="w-8 h-8 text-black stroke-[3px]" />
            </Link>
            
            <button 
              type="submit"
              className="w-16 h-16 bg-white rounded-[24px] shadow-md border border-gray-100 flex items-center justify-center hover:bg-gray-50 hover:shadow-lg transition-all hover:translate-x-1"
            >
              <ArrowRight className="w-8 h-8 text-black stroke-[3px]" />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}