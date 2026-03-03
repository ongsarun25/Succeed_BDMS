'use client';

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle, Building2, User, Phone, IdCard } from "lucide-react";

import { supabase } from "@/lib/auth";

function ProviderDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [generatedId, setGeneratedId] = useState("");

  // ดึงข้อมูลจาก URL
  const contactPerson = searchParams.get('contactPerson') || "-";
  const companyName = searchParams.get('companyName') || "-";
  const phone = searchParams.get('phone') || "-";

  // จำลองการ Auto-generate Provider ID เมื่อโหลดหน้านี้
  useEffect(() => {
    // สุ่มตัวเลข 4 หลัก เช่น PRV-8492 (ในการใช้งานจริง ส่วนนี้จะมาจาก Backend)
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setGeneratedId(`PRV-${randomNum}`);
  }, []);

  const handleConfirm = async () => {
    setIsConfirmed(true);

    try {
      const { error } = await supabase
        .from('logistics_provider')
        .insert({
          provider_id: generatedId,
          company_name: companyName,
          contact_person: contactPerson,
          phone: phone
        });

      if (error) throw error;

      alert(`✅ Provider ${generatedId} Added Successfully!`);
      router.push('/dashboard/shipment');
    } catch (error: any) {
      console.error("Error inserting provider:", error);
      alert("Failed to add provider: " + error.message);
      setIsConfirmed(false);
    }
  };

  return (
    <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in slide-in-from-right-8 duration-500">
      <div className="w-full max-w-3xl text-center">

        <h1 className="text-4xl md:text-5xl font-bold text-[#1a237e] mb-10 drop-shadow-sm flex justify-center items-center gap-4">
          <Building2 className="w-12 h-12 text-blue-500" />
          New Provider Detail
        </h1>

        <div className="bg-white rounded-[32px] shadow-lg border border-gray-100 p-8 md:p-12 flex flex-col gap-8 relative text-left">

          <div className="flex flex-col gap-6 bg-blue-50/50 p-6 md:p-8 rounded-3xl border border-blue-100">

            {/* Provider ID (Auto-Generated) */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-blue-200/50 pb-4 gap-2">
              <span className="text-xl font-bold text-gray-500 flex items-center gap-2">
                <IdCard className="w-6 h-6 text-blue-500" />
                Provider ID (Generated)
              </span>
              <span className="text-2xl font-bold text-blue-700 text-right">
                {generatedId || "Generating..."}
              </span>
            </div>

            {/* Company Name */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-blue-200/50 pb-4 gap-2">
              <span className="text-xl font-bold text-gray-500 flex items-center gap-2">
                <Building2 className="w-6 h-6 text-blue-500" />
                Company Name
              </span>
              <span className="text-2xl font-bold text-gray-900 text-right">
                {companyName}
              </span>
            </div>

            {/* Contact Person */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-blue-200/50 pb-4 gap-2">
              <span className="text-xl font-bold text-gray-500 flex items-center gap-2">
                <User className="w-6 h-6 text-blue-500" />
                Contact Person
              </span>
              <span className="text-2xl font-bold text-gray-900 text-right">
                {contactPerson}
              </span>
            </div>

            {/* Phone */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <span className="text-xl font-bold text-gray-500 flex items-center gap-2">
                <Phone className="w-6 h-6 text-blue-500" />
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

export default function ProviderDetailPage() {
  return (
    <Suspense fallback={<div className="text-xl font-bold text-gray-500 text-center">Loading Detail...</div>}>
      <ProviderDetailContent />
    </Suspense>
  );
}