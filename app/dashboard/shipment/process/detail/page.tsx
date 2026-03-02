'use client';

import { Suspense, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle } from "lucide-react";

function ShipmentDetailContent() {
  const router = useRouter();
  const [isConfirmed, setIsConfirmed] = useState(false);
  
  // จำลองข้อมูลที่จะแสดงผลในหน้านี้ (Mock Data)
  const [shippingDetail, setShippingDetail] = useState({
    shippingId: "SHP-001234",
    provideId: "PRV-9876",
    driverName: "Somchai Jaidee",
    license: "กท-5566",
    deliveryDate: "2026-03-05",
  });

  const handleConfirm = () => {
    setIsConfirmed(true);
    setTimeout(() => {
      alert(`✅ Confirmed Successfully!`);
      router.push('/dashboard/shipment'); // กลับไปหน้าเมนู
    }, 500);
  };

  return (
    <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in slide-in-from-right-8 duration-500">
      <div className="w-full max-w-3xl text-center">
        
        <h1 className="text-4xl md:text-5xl font-bold text-[#1a237e] mb-10 drop-shadow-sm">
          Shipping Detail
        </h1>

        <div className="bg-white rounded-[32px] shadow-lg border border-gray-100 p-8 md:p-12 flex flex-col gap-8 relative text-left">
          
          <div className="flex flex-col gap-6 bg-gray-50/50 p-6 md:p-8 rounded-3xl border border-gray-100">
            
            {/* ข้อมูลที่แสดงผล */}
            {[
              { label: "Shipping ID", value: shippingDetail.shippingId },
              { label: "Provide ID", value: shippingDetail.provideId },
              { label: "Driver Name", value: shippingDetail.driverName },
              { label: "License", value: shippingDetail.license },
              { label: "Delivery Date", value: shippingDetail.deliveryDate },
            ].map((item, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-gray-200 pb-4 last:border-0 last:pb-0 gap-2">
                <span className="text-xl font-bold text-gray-500">
                  {item.label}
                </span>
                <span className={`text-2xl font-bold ${item.label === 'Shipping ID' ? 'text-blue-600' : 'text-gray-900'}`}>
                  {item.value}
                </span>
              </div>
            ))}

          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center w-full mt-4">
            <button 
              onClick={() => router.back()}
              className="w-16 h-16 bg-white rounded-[24px] shadow-md border border-gray-100 flex items-center justify-center hover:bg-gray-50 hover:shadow-lg transition-all hover:-translate-x-1"
            >
              <ArrowLeft className="w-8 h-8 text-black stroke-[3px]" />
            </button>
            
            <button 
              onClick={handleConfirm}
              disabled={isConfirmed}
              className="h-16 px-8 bg-white rounded-[24px] shadow-md border border-gray-100 flex items-center gap-3 hover:bg-green-50 hover:shadow-lg hover:border-green-200 transition-all hover:translate-x-1 group disabled:opacity-50"
            >
              <span className="text-xl font-bold text-gray-800 group-hover:text-green-700">Confirm</span>
              <CheckCircle className="w-8 h-8 text-black stroke-[3px] group-hover:text-green-600 transition-colors" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function ShipmentDetailPage() {
  return (
    <Suspense fallback={<div className="text-xl font-bold text-gray-500 text-center">Loading Detail...</div>}>
      <ShipmentDetailContent />
    </Suspense>
  );
}