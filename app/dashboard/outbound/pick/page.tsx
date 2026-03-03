'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ClipboardCheck, Loader2, Package, Calendar } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/auth";

type PendingOrder = {
  outbound_id: string;
  order_date: string;
  customer: { name: string };
};

export default function OutboundPickPage() {
  const router = useRouter();
  const [pickId, setPickId] = useState("");
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const fetchPendingOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('outbound_order')
        .select(`
          outbound_id,
          order_date,
          customer:customer_id ( name )
        `)
        .eq('outstatus', 'Pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPendingOrders(data as any[]);
    } catch (err) {
      console.error("Error fetching pending orders", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = (e: React.FormEvent, selectedId?: string) => {
    if (e) e.preventDefault();

    const targetId = selectedId || pickId.trim();
    if (!targetId) {
      alert("Please enter Pick List ID or select from the list below.");
      return;
    }

    router.push(`/dashboard/outbound/pick/detail?id=${targetId}`);
  };

  return (
    <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in slide-in-from-right-8 duration-500">
      <div className="w-full max-w-4xl flex flex-col gap-10">

        <h1 className="text-4xl md:text-5xl font-bold text-[#1a237e] drop-shadow-sm flex items-center justify-center gap-4 text-center">
          <ClipboardCheck className="w-12 h-12 text-blue-600" />
          Outbound Pick
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Left: Manual Input */}
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Scan or Enter ID</h2>
            <form onSubmit={(e) => handleNext(e)} className="flex flex-col gap-8 relative">
              <div className="w-full">
                <input
                  type="text"
                  value={pickId}
                  onChange={(e) => setPickId(e.target.value)}
                  placeholder="e.g. OUT-202610-001"
                  className="w-full px-6 py-5 bg-gray-50 rounded-2xl border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-xl transition-all font-medium text-gray-800"
                  autoFocus
                />
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center w-full">
                <Link
                  href="/dashboard/outbound"
                  className="w-16 h-16 bg-white rounded-[24px] shadow-sm border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:shadow-md transition-all hover:-translate-x-1"
                >
                  <ArrowLeft className="w-8 h-8 text-black stroke-[3px]" />
                </Link>

                <button
                  type="submit"
                  className="w-16 h-16 bg-blue-600 rounded-[24px] shadow-sm border border-blue-500 flex items-center justify-center hover:bg-blue-700 hover:shadow-md transition-all hover:translate-x-1 text-white"
                >
                  <ArrowRight className="w-8 h-8 stroke-[3px]" />
                </button>
              </div>
            </form>
          </div>

          {/* Right: Pending List */}
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 min-h-[400px] flex flex-col">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex justify-between items-center px-2">
              <span>Pending Orders</span>
              <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-black">
                {pendingOrders.length}
              </span>
            </h2>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                  <p className="font-medium animate-pulse">Loading orders...</p>
                </div>
              ) : pendingOrders.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
                  <Package className="w-12 h-12 text-gray-300" />
                  <p className="font-medium">No pending orders to pick.</p>
                </div>
              ) : (
                pendingOrders.map(order => (
                  <div
                    key={order.outbound_id}
                    onClick={(e) => handleNext(e, order.outbound_id)}
                    className="group bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 p-4 rounded-2xl cursor-pointer transition-all flex flex-col gap-2 relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-black text-lg text-gray-900 group-hover:text-blue-700">{order.outbound_id}</span>
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 absolute right-4 top-4">
                        <ArrowRight className="w-4 h-4 text-blue-600 stroke-[3px]" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-medium text-gray-500 mt-1">
                      <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-gray-200">
                        <Calendar className="w-3.5 h-3.5" />
                        {order.order_date}
                      </div>
                      <span className="truncate pr-8">{order.customer?.name}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}