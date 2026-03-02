'use client'; 

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation"; 
import { CheckCircle, ArrowLeft, Check, AlertCircle } from "lucide-react";
import Link from "next/link";

// 1. ฐานข้อมูลจำลอง (Mock Database)
const mockDatabase: Record<string, any> = {
  "INB-001": {
    details: { poNumber: "INB-001", supplier: "Tech Supply Co., Ltd.", date: "27 Feb 2026", receiver: "Admin User" },
    items: [
      { id: 1, code: "ITM-001", name: "Wireless Keyboard", expected: 50, received: 50, status: "Complete" },
      { id: 2, code: "ITM-002", name: "Ergonomic Mouse", expected: 30, received: 30, status: "Complete" },
    ]
  },
  "INB-002": {
    details: { poNumber: "INB-002", supplier: "Office Plus Co.", date: "26 Feb 2026", receiver: "Staff A" },
    items: [
      { id: 1, code: "ITM-003", name: "A4 Paper (Box)", expected: 100, received: 100, status: "Complete" },
      { id: 2, code: "ITM-004", name: "Blue Pen (Pack)", expected: 20, received: 15, status: "Incomplete" },
    ]
  }
};

function ConfirmationDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchId = searchParams.get('id') || "";

  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [isNotFound, setIsNotFound] = useState(false);

  // ค้นหาข้อมูลเมื่อโหลดหน้าเว็บ
  useEffect(() => {
    if (searchId) {
      const matchedKey = Object.keys(mockDatabase).find(key => 
        key === searchId || key.includes(searchId)
      );

      if (matchedKey) {
        setCurrentOrder(mockDatabase[matchedKey]);
      } else {
        setIsNotFound(true);
      }
    }
  }, [searchId]);

  const handleConfirmAndSave = () => {
    alert("✅ Confirmation Saved Successfully!");
    router.push('/dashboard'); // เด้งกลับไปหน้า Inbound หลัก
  };

  // กรณีหาข้อมูลไม่เจอ
  if (isNotFound) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 mt-10 text-center bg-white rounded-[32px] shadow-lg border border-gray-100 py-16">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
        <p className="text-gray-500 mb-6">Could not find any order matching: <span className="font-bold text-gray-900">{searchId}</span></p>
        <Link href="/inbound/confirmation" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition">
          <ArrowLeft className="w-5 h-5" />
          Back to Search
        </Link>
      </div>
    );
  }

  // กำลังโหลด
  if (!currentOrder) {
    return <div className="text-center p-10 text-xl font-bold text-gray-500">Loading details...</div>;
  }

  // กรณีเจอข้อมูล แสดงหน้าตารางปกติ
  return (
    <div className="w-full max-w-5xl mx-auto p-6 animate-in slide-in-from-right-8 duration-300">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-[#1a237e] drop-shadow-sm">Confirmation Detail</h1>
      </div>

      <div className="bg-white rounded-[32px] shadow-lg border border-gray-100 p-8">
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <div>
            <p className="text-sm text-gray-500 font-medium">Inbound / PO Number</p>
            <p className="text-lg font-bold text-gray-900">{currentOrder.details.poNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Supplier</p>
            <p className="text-lg font-bold text-gray-900">{currentOrder.details.supplier}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Date Received</p>
            <p className="text-lg font-bold text-gray-900">{currentOrder.details.date}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Received By</p>
            <p className="text-lg font-bold text-gray-900">{currentOrder.details.receiver}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 mb-8">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-gray-600 text-sm uppercase font-semibold">
              <tr>
                <th className="p-4 border-b border-gray-200">Item Code</th>
                <th className="p-4 border-b border-gray-200">Description</th>
                <th className="p-4 border-b border-gray-200 text-center">Expected</th>
                <th className="p-4 border-b border-gray-200 text-center">Received</th>
                <th className="p-4 border-b border-gray-200">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentOrder.items.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-medium text-gray-900">{item.code}</td>
                  <td className="p-4 text-gray-700">{item.name}</td>
                  <td className="p-4 text-center text-gray-600">{item.expected}</td>
                  <td className="p-4 text-center font-bold text-blue-600">{item.received}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      item.status === 'Complete' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {item.status === 'Complete' && <Check className="w-3 h-3" />}
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <Link 
            href="/inbound/confirmation"
            className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition bg-gray-50 hover:bg-gray-100 rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Search
          </Link>
          
          <button 
            onClick={handleConfirmAndSave} 
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition"
          >
            <CheckCircle className="w-5 h-5" />
            Confirm & Save
          </button>
        </div>
        
      </div>
    </div>
  );
}

// ตามกฎของ Next.js ถ้าใช้ useSearchParams ต้องครอบด้วย Suspense
export default function ConfirmationDetailPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <ConfirmationDetailContent />
    </Suspense>
  );
}