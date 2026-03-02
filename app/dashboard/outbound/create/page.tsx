'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CreateOutboundPage() {
  const router = useRouter();
  const [fileName, setFileName] = useState<string>("");

  // จำลองการอัปโหลดไฟล์
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName) {
      alert("Please upload an excel file first.");
      return;
    }
    // ถ้ามีไฟล์แล้ว ให้ไปหน้า Detail เพื่อพรีวิวข้อมูล
    router.push('/dashboard/outbound/create/detail');
  };

  return (
    <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold text-[#1a237e] mb-12 text-center drop-shadow-sm">
          Create Outbound
        </h1>
        
        <form onSubmit={handleNext}>
          <div className="space-y-4 max-w-xl mx-auto">
            
            <label className="text-2xl font-bold text-gray-900 mb-2 ml-2 block">
              Upload excel file
            </label>
            
            {/* ซ่อน input file จริงๆ ไว้ แล้วทำ UI ขึ้นมาครอบเพื่อให้เหมือน Mockup */}
            <div className="relative">
              <input
                type="file"
                id="excel-upload"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <label 
                htmlFor="excel-upload"
                className="w-full px-6 py-4 bg-white rounded-3xl shadow-sm border border-gray-100 focus-within:ring-4 focus-within:ring-blue-100 transition-all flex items-center cursor-pointer min-h-[64px]"
              >
                <span className={`text-lg ${fileName ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                  {fileName ? fileName : "Attach"}
                </span>
              </label>
            </div>

          </div>

          <div className="flex justify-between items-center mt-16 px-4">
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