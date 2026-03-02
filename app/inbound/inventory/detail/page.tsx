'use client';


import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react"; // นำ Check เข้ามาใช้

// Mock Database สำหรับทดสอบระบบ
const mockInventoryDB = [
  { partId: "XX50-1", serialNo: "001", location: "A01", status: "A", inboundId: "INB-101" },
  { partId: "XX50-1", serialNo: "005", location: "A02", status: "A", inboundId: "INB-101" },
  { partId: "XX30-1", serialNo: "019", location: "B05", status: "A", inboundId: "INB-102" },
  { partId: "XX40-2", serialNo: "022", location: "C01", status: "I", inboundId: "INB-103" },
  { partId: "XX40-2", serialNo: "025", location: "C04", status: "I", inboundId: "INB-104" },
];

function InventoryTableContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ดึงค่าการค้นหาจาก URL
  const searchCriteria = {
    serialNo: searchParams.get("serialNo") || "",
    partId: searchParams.get("partId") || "",
    location: searchParams.get("location") || "",
    inboundId: searchParams.get("inboundId") || "",
    status: searchParams.get("status") || ""
  };

  // Logic กรองข้อมูล: ถ้าเป็น * ให้ข้ามการกรองคอนดิชันนั้นไป (ดึงมาทั้งหมด)
  const filteredData = mockInventoryDB.filter((item) => {
    const match = (fieldValue: string, searchValue: string) => {
      if (searchValue === "*" || searchValue === "") return true;
      return fieldValue.toLowerCase().includes(searchValue.toLowerCase());
    };

    return (
      match(item.serialNo, searchCriteria.serialNo) &&
      match(item.partId, searchCriteria.partId) &&
      match(item.location, searchCriteria.location) &&
      match(item.inboundId, searchCriteria.inboundId) &&
      match(item.status, searchCriteria.status)
    );
  });

  return (
    <div className="w-full max-w-5xl animate-in slide-in-from-right-8 duration-300">
      <h1 className="text-4xl font-bold text-[#1a237e] text-center mb-10 drop-shadow-sm">
        Inventory detail
      </h1>
      
      <div className="bg-white rounded-[40px] shadow-xl p-8 relative min-h-[500px] border border-gray-100 flex flex-col">
        
        {/* Table Container */}
        <div className="overflow-x-auto flex-grow mb-16">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-100">
                <th className="py-4 px-4 text-xl font-bold text-gray-900">Part ID</th>
                <th className="py-4 px-4 text-xl font-bold text-gray-900">Serial No</th>
                <th className="py-4 px-4 text-xl font-bold text-gray-900">Location</th>
                <th className="py-4 px-4 text-xl font-bold text-gray-900">Inbound ID</th>
                <th className="py-4 px-4 text-xl font-bold text-gray-900 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((row, index) => (
                  <tr key={index} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 text-lg text-gray-600 font-medium">{row.partId}</td>
                    <td className="py-4 px-4 text-lg text-gray-600 font-medium">{row.serialNo}</td>
                    <td className="py-4 px-4 text-lg text-gray-600 font-medium">{row.location}</td>
                    <td className="py-4 px-4 text-lg text-gray-600 font-medium">{row.inboundId}</td>
                    <td className="py-4 px-4 text-lg text-center font-bold">
                      <span className={row.status === 'A' ? "text-emerald-500" : "text-red-500"}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 text-xl font-medium">
                    No matching records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ปุ่มนำทางมุมซ้าย-ขวาล่าง */}
        <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center">
          
          {/* ปุ่ม Back ซ้ายมือ */}
          <button 
            onClick={() => router.push('/inbound/inventory')}
            className="w-16 h-16 bg-white border border-gray-100 rounded-[24px] shadow-sm flex items-center justify-center hover:bg-gray-50 transition-all hover:-translate-x-1"
          >
            <ArrowLeft className="w-8 h-8 text-black stroke-[3px]" />
          </button>
          
          {/* ปุ่ม Done ขวามือ (แก้ให้ตรงตามรูปและไปหน้า inbound) */}
          <button 
            onClick={() => router.push('/dashboard')} 
            className="h-16 bg-white border border-gray-100 rounded-[24px] shadow-sm flex items-center justify-center px-8 gap-3 hover:bg-gray-50 hover:shadow-md transition-all active:scale-95"
          >
            <span className="text-[#3ea043] font-bold text-3xl">Done</span>
            <Check className="w-8 h-8 text-[#3ea043] stroke-[4px]" />
          </button>

        </div>
      </div>
    </div>
  );
}

// ครอบด้วย Suspense ตามกฎของ Next.js
export default function InventoryDetailPage() {
  return (
    <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center p-6">
      <Suspense fallback={<div className="text-xl font-bold text-gray-500">Loading inventory data...</div>}>
        <InventoryTableContent />
      </Suspense>
    </div>
  );
}