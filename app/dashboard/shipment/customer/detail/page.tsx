'use client';

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle, UserPlus, User, Phone, Mail, MapPin, IdCard } from "lucide-react";

function CustomerDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [generatedId, setGeneratedId] = useState("");
  
  // ดึงข้อมูลจาก URL
  const name = searchParams.get('name') || "-";
  const email = searchParams.get('email') || "-";
  const address = searchParams.get('address') || "-";
  const phone = searchParams.get('phone') || "-";

  // จำลองการ Auto-generate Customer ID เมื่อโหลดหน้านี้
  useEffect(() => {
    // สุ่มตัวเลข 4 หลัก เช่น CUS-5678
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setGeneratedId(`CUS-${randomNum}`);
  }, []);

  const handleConfirm = () => {
    setIsConfirmed(true);
    // แจ้งเตือน และกลับไปหน้าเมนูหลัก
    setTimeout(() => {
      alert(`✅ Customer ${generatedId} Added Successfully!`);
      router.push('/dashboard/shipment');
    }, 500);
  };

  return (
    <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in slide-in-from-right-8 duration-500">
      <div className="w-full max-w-3xl text-center">
        
        <h1 className="text-4xl md:text-5xl font-bold text-[#1a237e] mb-10 drop-shadow-sm flex justify-center items-center gap-4">
          <UserPlus className="w-12 h-12 text-emerald-500" />
          New Customer Detail
        </h1>

        <div className="bg-white rounded-[32px] shadow-lg border border-gray-100 p-8 md:p-12 flex flex-col gap-8 relative text-left">
          
          <div className="flex flex-col gap-6 bg-emerald-50/50 p-6 md:p-8 rounded-3xl border border-emerald-100">
            
            {/* Customer ID (Auto-Generated) */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-emerald-200/50 pb-4 gap-2">
              <span className="text-xl font-bold text-gray-500 flex items-center gap-2">
                <IdCard className="w-6 h-6 text-emerald-500" />
                Customer ID (Generated)
              </span>
              <span className="text-2xl font-bold text-emerald-700 text-right">
                {generatedId || "Generating..."}
              </span>
            </div>

            {/* Name */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-emerald-200/50 pb-4 gap-2">
              <span className="text-xl font-bold text-gray-500 flex items-center gap-2">
                <User className="w-6 h-6 text-emerald-500" />
                Name
              </span>
              <span className="text-2xl font-bold text-gray-900 text-right">
                {name}
              </span>
            </div>

            {/* Email */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-emerald-200/50 pb-4 gap-2">
              <span className="text-xl font-bold text-gray-500 flex items-center gap-2">
                <Mail className="w-6 h-6 text-emerald-500" />
                Email
              </span>
              <span className="text-2xl font-bold text-gray-900 text-right break-all">
                {email}
              </span>
            </div>

            {/* Address */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start border-b border-emerald-200/50 pb-4 gap-2">
              <span className="text-xl font-bold text-gray-500 flex items-center gap-2 whitespace-nowrap">
                <MapPin className="w-6 h-6 text-emerald-500 shrink-0" />
                Address
              </span>
              <span className="text-xl font-bold text-gray-900 sm:text-right sm:max-w-[60%] leading-relaxed">
                {address}
              </span>
            </div>

            {/* Phone */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <span className="text-xl font-bold text-gray-500 flex items-center gap-2">
                <Phone className="w-6 h-6 text-emerald-500" />
                Phone Number
              </span>
              <span className="text-2xl font-bold text-gray-900 text-right">
                {phone}
              </span>
            </div>

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

export default function CustomerDetailPage() {
  return (
    <Suspense fallback={<div className="text-xl font-bold text-gray-500 text-center">Loading Detail...</div>}>
      <CustomerDetailContent />
    </Suspense>
  );
}