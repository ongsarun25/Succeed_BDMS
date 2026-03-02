'use client'; 

import { useState } from "react";
import { useRouter } from "next/navigation"; 
import { Search, PackageSearch } from "lucide-react";

export default function ConfirmationSearchPage() {
  const router = useRouter();
  const [inboundId, setInboundId] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const idToSearch = inboundId.trim().toUpperCase(); 
    
    if (idToSearch !== "") {
      // โยนค่าผ่าน URL ไปหน้า Detail
      router.push(`/inbound/confirmation/detail?id=${idToSearch}`);
    }
  };

  return (
    <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-[32px] shadow-lg border border-gray-100 p-12 max-w-2xl w-full mx-auto text-center">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <PackageSearch className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Find Inbound Order</h2>
        <p className="text-gray-500 mb-8">Please enter or scan the Inbound ID / PO Number to proceed with confirmation.</p>
        
        <form onSubmit={handleSearch} className="flex flex-col gap-3 max-w-md mx-auto">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={inboundId}
                onChange={(e) => setInboundId(e.target.value)}
                className="block w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition text-lg"
                placeholder="e.g. 001 or INB-001"
                required
              />
            </div>
            <button 
              type="submit"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition text-lg"
            >
              Search
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}