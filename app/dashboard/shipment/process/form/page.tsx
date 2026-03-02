'use client';

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

function ShipmentFormContent() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    serialNo: "",
    partId: "",
    location: "",
    inboundId: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    // เช็คว่ากรอกข้อมูลครบไหม (ปรับแก้ได้ตามต้องการว่าบังคับกรอกอันไหนบ้าง)
    if (!formData.serialNo || !formData.partId || !formData.location || !formData.inboundId) {
      alert("Please fill in all fields.");
      return;
    }
    
    // ส่งข้อมูลไปหน้า Detail ผ่าน URL Parameters
    const queryParams = new URLSearchParams({
      serialNo: formData.serialNo,
      partId: formData.partId,
      location: formData.location,
      inboundId: formData.inboundId
    }).toString();

    router.push(`/dashboard/shipment/process/detail?${queryParams}`);
  };

  return (
    <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-2xl">
        
        <h1 className="text-4xl md:text-5xl font-bold text-[#1a237e] mb-12 text-center drop-shadow-sm">
          Shipping Info
        </h1>
        
        <form onSubmit={handleNext} className="relative">
          <div className="space-y-6 max-w-xl mx-auto">
            
            {/* กล่อง Serial No */}
            <div>
              <label className="text-2xl font-bold text-gray-900 mb-2 ml-2 block">
                Serial No
              </label>
              <input
                type="text"
                name="serialNo"
                value={formData.serialNo}
                onChange={handleChange}
                placeholder="e.g. SN-998877"
                className="w-full px-6 py-4 bg-white rounded-3xl shadow-sm border border-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all text-lg min-h-[64px] text-gray-800"
              />
            </div>

            {/* กล่อง Part ID */}
            <div>
              <label className="text-2xl font-bold text-gray-900 mb-2 ml-2 block">
                Part ID
              </label>
              <input
                type="text"
                name="partId"
                value={formData.partId}
                onChange={handleChange}
                placeholder="e.g. PART-102"
                className="w-full px-6 py-4 bg-white rounded-3xl shadow-sm border border-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all text-lg min-h-[64px] text-gray-800"
              />
            </div>

            {/* กล่อง Location */}
            <div>
              <label className="text-2xl font-bold text-gray-900 mb-2 ml-2 block">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Zone A, Shelf 3"
                className="w-full px-6 py-4 bg-white rounded-3xl shadow-sm border border-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all text-lg min-h-[64px] text-gray-800"
              />
            </div>

            {/* กล่อง Inbound ID */}
            <div>
              <label className="text-2xl font-bold text-gray-900 mb-2 ml-2 block">
                Inbound ID
              </label>
              <input
                type="text"
                name="inboundId"
                value={formData.inboundId}
                onChange={handleChange}
                placeholder="e.g. INB-54321"
                className="w-full px-6 py-4 bg-white rounded-3xl shadow-sm border border-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all text-lg min-h-[64px] text-gray-800"
              />
            </div>

          </div>

          <div className="flex justify-between items-center mt-12 px-4">
            <button 
              type="button"
              onClick={() => router.back()}
              className="w-16 h-16 bg-white rounded-[24px] shadow-md border border-gray-100 flex items-center justify-center hover:bg-gray-50 hover:shadow-lg transition-all hover:-translate-x-1"
            >
              <ArrowLeft className="w-8 h-8 text-black stroke-[3px]" />
            </button>
            
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

export default function ShipmentFormPage() {
  return (
    <Suspense fallback={<div className="text-xl font-bold text-center">Loading Form...</div>}>
      <ShipmentFormContent />
    </Suspense>
  );
}