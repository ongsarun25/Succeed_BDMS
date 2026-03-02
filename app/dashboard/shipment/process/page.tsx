'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, PackageCheck } from "lucide-react";

export default function ShipmentProcessPage() {
  const router = useRouter();
  const [outboundId, setOutboundId] = useState("");

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!outboundId.trim()) {
      alert("Please enter Outbound ID");
      return;
    }
    // ส่งไปสเต็ปที่ 2 (หน้าฟอร์ม)
    router.push(`/dashboard/shipment/process/form?id=${outboundId}`);
  };

  return (
    <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in slide-in-from-right-8 duration-500">
      <div className="w-full max-w-2xl text-center">
        
        <h1 className="text-4xl md:text-5xl font-bold text-[#1a237e] mb-12 drop-shadow-sm flex items-center justify-center gap-4">
          <PackageCheck className="w-12 h-12 text-orange-500" />
          Process Shipment
        </h1>
        
        <form onSubmit={handleNext} className="max-w-md mx-auto flex flex-col items-center gap-8 relative">
          
          <div className="w-full text-left">
            <label className="text-2xl font-bold text-gray-900 mb-4 pl-2 block">
              Enter Outbound ID
            </label>
            <input
              type="text"
              value={outboundId}
              onChange={(e) => setOutboundId(e.target.value)}
              placeholder="e.g. OUT-12345"
              className="w-full mt-2 px-6 py-5 bg-white rounded-3xl shadow-sm border border-gray-100 focus:outline-none focus:ring-4 focus:ring-orange-100 focus:border-orange-500 text-xl transition-all font-medium text-gray-800"
              autoFocus
            />
          </div>
          
          {/* Navigation */}
          <div className="flex justify-between items-center w-full mt-8">
            <button 
              type="button"
              onClick={() => router.push('/dashboard/shipment')}
              className="w-16 h-16 bg-white rounded-[24px] shadow-md border border-gray-100 flex items-center justify-center hover:bg-gray-50 hover:shadow-lg transition-all hover:-translate-x-1"
            >
              <ArrowLeft className="w-8 h-8 text-black stroke-[3px]" />
            </button>
            
            <button 
              type="submit"
              className="w-16 h-16 bg-white rounded-[24px] shadow-md border border-gray-100 flex items-center justify-center hover:bg-orange-50 hover:shadow-lg hover:border-orange-200 transition-all hover:translate-x-1 group"
            >
              <ArrowRight className="w-8 h-8 text-black stroke-[3px] group-hover:text-orange-600 transition-colors" />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}