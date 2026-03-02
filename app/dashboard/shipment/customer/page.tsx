'use client';

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, UserPlus } from "lucide-react";

function CustomerFormContent() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
  });

  // แก้จาก HTMLTextAreaElement กลับเป็น HTMLInputElement ธรรมดา
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.address || !formData.phone) {
      alert("Please fill in all fields.");
      return;
    }
    
    const queryParams = new URLSearchParams({
      name: formData.name,
      email: formData.email,
      address: formData.address,
      phone: formData.phone,
    }).toString();

    router.push(`/dashboard/shipment/customer/detail?${queryParams}`);
  };

  return (
    <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-2xl">
        
        <h1 className="text-4xl md:text-5xl font-bold text-[#1a237e] mb-12 text-center drop-shadow-sm flex justify-center items-center gap-4">
          <UserPlus className="w-12 h-12 text-emerald-500" />
          Add New Customer
        </h1>
        
        <form onSubmit={handleNext} className="relative">
          <div className="space-y-6 max-w-xl mx-auto">
            
            {/* Name */}
            <div>
              <label className="text-2xl font-bold text-gray-900 mb-2 ml-2 block">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. John Doe"
                className="w-full px-6 py-4 bg-white rounded-3xl shadow-sm border border-gray-100 focus:outline-none focus:ring-4 focus:ring-emerald-100 transition-all text-lg min-h-[64px] text-gray-800"
                autoFocus
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-2xl font-bold text-gray-900 mb-2 ml-2 block">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. john@example.com"
                className="w-full px-6 py-4 bg-white rounded-3xl shadow-sm border border-gray-100 focus:outline-none focus:ring-4 focus:ring-emerald-100 transition-all text-lg min-h-[64px] text-gray-800"
              />
            </div>

            {/* Address (เปลี่ยนเป็น Input บรรทัดเดียวแล้ว) */}
            <div>
              <label className="text-2xl font-bold text-gray-900 mb-2 ml-2 block">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="e.g. 123 Main St, Bangkok 10110"
                className="w-full px-6 py-4 bg-white rounded-3xl shadow-sm border border-gray-100 focus:outline-none focus:ring-4 focus:ring-emerald-100 transition-all text-lg min-h-[64px] text-gray-800"
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
                placeholder="e.g. 089-987-6543"
                className="w-full px-6 py-4 bg-white rounded-3xl shadow-sm border border-gray-100 focus:outline-none focus:ring-4 focus:ring-emerald-100 transition-all text-lg min-h-[64px] text-gray-800"
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

export default function AddCustomerPage() {
  return (
    <Suspense fallback={<div className="text-xl font-bold text-center">Loading...</div>}>
      <CustomerFormContent />
    </Suspense>
  );
}