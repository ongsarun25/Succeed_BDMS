'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function TransferMockupPage() {
  const [serialNo, setSerialNo] = useState("");
  const router = useRouter();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (serialNo.trim() !== "") {
      // สั่งเปลี่ยนหน้าไปที่โฟลเดอร์ detail และแนบค่า serial ไปกับ URL ด้วย
      router.push(`/inbound/transfer/detail?serial=${serialNo}`);
    }
  };

  return (
    <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-[#1a237e] mb-12 drop-shadow-sm">
          Transfer (Internal)
        </h1>
        
        <form onSubmit={handleNext} className="max-w-md mx-auto flex flex-col items-center gap-8">
          <div className="w-full text-left">
            <label className="block text-xl font-bold text-gray-900 mb-4 pl-2">
              Serial No
            </label>
            <input
              type="text"
              value={serialNo}
              onChange={(e) => setSerialNo(e.target.value)}
              placeholder="Please Insert Serial No"
              className="w-full px-6 py-5 bg-white rounded-2xl shadow-sm border border-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-lg transition-all"
              required
            />
          </div>
          
          <button 
            type="submit"
            className="w-20 h-20 bg-white rounded-[24px] shadow-md border border-gray-100 flex items-center justify-center hover:bg-gray-50 hover:shadow-lg transition-all hover:scale-105"
          >
            <ArrowRight className="w-10 h-10 text-black stroke-[3px]" />
          </button>
        </form>
      </div>
    </div>
  );
}