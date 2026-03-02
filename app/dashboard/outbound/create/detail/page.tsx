'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

// จำลองข้อมูลที่อ่านมาจากไฟล์ Excel
const mockExcelData = [
  { id: 1, partId: "xxx1 - 1", qty: 5 },
  { id: 2, partId: "xxx2 - 5", qty: 12 },
  { id: 3, partId: "xxx4 - 6", qty: 30 },
];

export default function CreateOutboundDetailPage() {
  const router = useRouter();
  const [isCreated, setIsCreated] = useState(false);
  const [generatedId, setGeneratedId] = useState("");

  // ฟังก์ชันเมื่อกดลูกศรขวา
  const handleAction = () => {
    if (!isCreated) {
      // 1. ถ้ายังไม่ได้สร้าง -> ทำการสร้าง Outbound ID
      const newId = `OUT-${Math.floor(1000 + Math.random() * 9000)}`; // สุ่มเลขมาจำลอง
      setGeneratedId(newId);
      setIsCreated(true);
    } else {
      // 2. ถ้าสร้างเสร็จแล้ว (มี ID แล้ว) กดลูกศรขวาอีกรอบเพื่อกลับหน้าหลัก
      router.push('/dashboard/outbound');
    }
  };

  const handleBack = () => {
    if (isCreated) {
      // ถ้าสร้างแล้ว กดย้อนกลับไปหน้าหลักดีกว่า ไม่ควรกลับไปอัปโหลดใหม่
      router.push('/dashboard/outbound');
    } else {
      // ถ้ายังไม่สร้าง ถอยกลับไปหน้าอัปโหลดได้
      router.push('/dashboard/outbound/create');
    }
  };

  return (
    <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in slide-in-from-right-8 duration-300">
      <div className="w-full max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold text-[#1a237e] mb-8 text-center drop-shadow-sm">
          New Outbound
        </h1>

        <div className="bg-white rounded-[32px] shadow-lg border border-gray-100 p-8 md:p-12 min-h-[400px] flex flex-col relative">
          
          {/* หัวตาราง */}
          <div className="grid grid-cols-2 text-2xl font-bold text-gray-900 mb-6 px-4">
            <div>Part ID</div>
            <div className="text-right sm:text-left sm:pl-10">Quantity</div>
          </div>

          {/* ข้อมูลในตาราง */}
          <div className="flex-1 space-y-4 px-4">
            {mockExcelData.map((item) => (
              <div key={item.id} className="grid grid-cols-2 text-xl font-medium text-gray-700">
                <div>{item.partId}</div>
                <div className="text-right sm:text-left sm:pl-10">{item.qty}</div>
              </div>
            ))}
          
          </div>

          {/* ส่วนแสดง Outbound ID ด้านล่างสุด (จะโชว์เมื่อกดสร้างแล้ว) */}
          <div className={`mt-10 pt-6 border-t border-gray-100 transition-all duration-500 ${isCreated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 hidden'}`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-gray-900">Outbound ID :</span>
              <span className="text-2xl font-bold text-gray-900">{generatedId}</span>
              <span className="text-green-500 font-medium text-xl flex items-center gap-1 ml-2">
                created <Check className="w-6 h-6 stroke-[3px]" />
              </span>
            </div>
          </div>
          
        </div>

 {/* ปุ่ม Navigation ด้านล่าง */}
        <div className="flex justify-between items-center mt-8 px-2">
          
          {/* ปุ่ม Back ซ้ายมือ */}
          <button 
            onClick={handleBack}
            className="w-16 h-16 bg-white rounded-[24px] shadow-md border border-gray-100 flex items-center justify-center hover:bg-gray-50 hover:shadow-lg transition-all hover:-translate-x-1 z-10"
          >
            <ArrowLeft className="w-8 h-8 text-black stroke-[3px]" />
          </button>
          
          {/* ส่วนปุ่มขวามือ (เปลี่ยนรูปร่างตามสถานะ isCreated) */}
          {!isCreated ? (
            <div className="flex flex-col items-center">
              <span className="text-green-500 font-bold mb-2 animate-pulse">Create</span>
              <button 
                onClick={handleAction}
                className="w-16 h-16 bg-white rounded-[24px] shadow-md border border-gray-100 flex items-center justify-center hover:bg-gray-50 hover:shadow-lg transition-all hover:translate-x-1 z-10"
              >
                <ArrowRight className="w-8 h-8 text-black stroke-[3px]" />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleAction}
              className="h-16 bg-white border border-gray-100 rounded-[24px] shadow-sm flex items-center justify-center px-8 gap-3 hover:bg-gray-50 hover:shadow-md transition-all active:scale-95 z-10 animate-in zoom-in duration-300"
            >
              <span className="text-[#3ea043] font-bold text-3xl">Done</span>
              <Check className="w-8 h-8 text-[#3ea043] stroke-[4px]" />
            </button>
          )}
          
        </div>
        </div>

      </div>

  );
}