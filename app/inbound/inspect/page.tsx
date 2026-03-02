'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react"; // เปลี่ยนเป็น Check
import Link from "next/link";

export default function InspectPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    serialNumber: "",
    type: "", // จะเก็บค่า 'damage' หรือ 'not_found'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    
    // เช็คว่ากรอกข้อมูลครบไหม
    if (!form.serialNumber.trim()) {
      alert("Please insert Serial Number.");
      return;
    }
    if (!form.type) {
      alert("Please select a type.");
      return;
    }

    // แจ้งเตือนเมื่อกดผ่าน (หรือสามารถเปลี่ยนให้โยนไปหน้า Detail อื่นๆ ได้ในอนาคต)
    alert(`Inspect Recorded!\nSerial Number: ${form.serialNumber}\nType: ${form.type}`);
    
    // บันทึกเสร็จเด้งกลับไปหน้า Inbound หลัก
    router.push('/dashboard');
  };

  return (
    <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold text-[#1a237e] mb-12 text-center drop-shadow-sm">
          Inspect
        </h1>
        
        <form onSubmit={handleNext} className="relative">
          <div className="space-y-8 max-w-xl mx-auto">
            
            {/* ช่องกรอก Serial Number */}
            <div className="flex flex-col">
              <label className="text-2xl font-bold text-gray-900 mb-3 ml-2">
                Serial Number
              </label>
              <input
                type="text"
                name="serialNumber"
                value={form.serialNumber}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-white rounded-3xl shadow-sm border border-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-lg transition-all"
                placeholder="Please Insert Serial Number"
              />
            </div>

            {/* Dropdown เลือก Type (จัด Layout แบบแนวนอนตาม Mockup) */}
            <div className="flex items-center gap-6 mt-4 ml-2">
              <label className="text-2xl font-bold text-gray-900">
                type
              </label>
              <div className="relative">
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="appearance-none bg-[#e0e0e0] text-gray-700 font-medium px-6 py-3 pr-12 rounded-lg cursor-pointer hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg shadow-sm"
                >
                  <option value="" disabled hidden>Drop down</option>
                  <option value="damage">Damage</option>
                  <option value="not_found">Not Found</option>
                </select>
                {/* Custom Dropdown Arrow */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-600">
                  <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

          </div>

          {/* ปุ่มซ้ายขวา */}
          <div className="flex justify-between items-center mt-16 px-4">
            <Link 
              href="/dashboard" 
              className="w-16 h-16 bg-white rounded-[24px] shadow-md border border-gray-100 flex items-center justify-center hover:bg-gray-50 hover:shadow-lg transition-all hover:-translate-x-1"
            >
              <ArrowLeft className="w-8 h-8 text-black stroke-[3px]" />
            </Link>
            
            {/* เปลี่ยนเป็นปุ่ม Done สีเขียว และยังคง type="submit" ไว้เพื่อให้ Form ทำงาน */}
            <button 
              type="submit"
              className="h-16 bg-white border border-gray-100 rounded-[24px] shadow-sm flex items-center justify-center px-8 gap-3 hover:bg-gray-50 hover:shadow-md transition-all active:scale-95"
            >
              <span className="text-[#3ea043] font-bold text-3xl">Done</span>
              <Check className="w-8 h-8 text-[#3ea043] stroke-[4px]" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}