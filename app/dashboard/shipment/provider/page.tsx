'use client';

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Building2 } from "lucide-react";

function ProviderFormContent() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    contactPerson: "",
    companyName: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    // เช็คว่ากรอกข้อมูลครบไหม
    if (!formData.contactPerson || !formData.companyName || !formData.phone) {
      alert("Please fill in all fields.");
      return;
    }
    
    // ส่งข้อมูลไปหน้า Detail ผ่าน URL Parameters
    const queryParams = new URLSearchParams({
      contactPerson: formData.contactPerson,
      companyName: formData.companyName,
      phone: formData.phone,
    }).toString();

    router.push(`/dashboard/shipment/provider/create/?${queryParams}`);
  };

  return (
    <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-2xl">
        
        <h1 className="text-4xl md:text-5xl font-bold text-[#1a237e] mb-12 text-center drop-shadow-sm flex justify-center items-center gap-4">
          <Building2 className="w-12 h-12 text-blue-500" />
          Add New Provider
        </h1>
        
        <form onSubmit={handleNext} className="relative">
          <div className="space-y-6 max-w-xl mx-auto">
            
            {/* Contact Person */}
            <div>
              <label className="text-2xl font-bold text-gray-900 mb-2 ml-2 block">
                Contact Person
              </label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                placeholder="e.g. Somchai Jaidee"
                className="w-full px-6 py-4 bg-white rounded-3xl shadow-sm border border-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all text-lg min-h-[64px] text-gray-800"
              />
            </div>

            {/* Company Name */}
            <div>
              <label className="text-2xl font-bold text-gray-900 mb-2 ml-2 block">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g. Kerry Express (Thailand) Co., Ltd."
                className="w-full px-6 py-4 bg-white rounded-3xl shadow-sm border border-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all text-lg min-h-[64px] text-gray-800"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-2xl font-bold text-gray-900 mb-2 ml-2 block">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 081-234-5678"
                className="w-full px-6 py-4 bg-white rounded-3xl shadow-sm border border-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all text-lg min-h-[64px] text-gray-800"
              />
            </div>

          </div>

          <div className="flex justify-between items-center mt-12 px-4">
            <button 
              type="button"
              onClick={() => router.push('/dashboard/shipment')}
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

export default function AddProviderPage() {
  return (
    <Suspense fallback={<div className="text-xl font-bold text-center">Loading...</div>}>
      <ProviderFormContent />
    </Suspense>
  );
}