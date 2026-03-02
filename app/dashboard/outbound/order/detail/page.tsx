'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, FileText, Calendar, Activity, User, Home, Loader2 } from "lucide-react";
import { Suspense, useState, useEffect } from "react";
import { supabase } from "@/lib/auth";

type OrderData = {
  outbound_id: string;
  order_date: string;
  outstatus: string;
  customer_id: string;
};

function OrderDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const outboundId = searchParams.get('id') || 'Unknown';

  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      if (!outboundId || outboundId === 'Unknown') {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('outbound_order')
        .select('*')
        .eq('outbound_id', outboundId)
        .single();

      if (error) {
        console.error("Error fetching outbound order:", error);
      } else {
        setOrderData(data);
      }
      setLoading(false);
    }
    fetchOrder();
  }, [outboundId]);

  const getStatusStyle = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s === 'completed' || s === 'shipped') return 'bg-green-100 text-green-700 border-green-300';
    if (s === 'pending' || s === 'wait' || s === 'picking') return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    return 'bg-gray-100 text-gray-700 border-gray-300';
  };

  return (
    <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in slide-in-from-right-8 duration-500">
      <div className="w-full max-w-2xl text-center">

        <h1 className="text-4xl md:text-5xl font-bold text-[#1a237e] mb-12 drop-shadow-sm flex items-center justify-center gap-4">
          <FileText className="w-12 h-12 text-blue-600" />
          Order Detail
        </h1>

        <div className="bg-white rounded-[32px] shadow-lg border border-gray-100 p-8 md:p-12 text-left relative min-h-[300px]">
          {loading && (
            <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center rounded-[32px]">
              <Loader2 className="w-12 h-12 text-[#1a237e] animate-spin mb-4" />
              <p className="text-lg font-medium text-gray-600">Loading Order Data...</p>
            </div>
          )}

          {!loading && !orderData ? (
            <div className="text-center text-gray-400 font-medium py-10 text-lg">
              No order found for ID: {outboundId}
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-6 gap-2">
                <span className="text-2xl font-bold text-gray-500 flex items-center gap-3">
                  <FileText className="w-7 h-7 text-blue-400" />
                  Outbound ID
                </span>
                <span className="text-3xl font-extrabold text-[#1a237e]">{orderData?.outbound_id || outboundId}</span>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-6 gap-2">
                <span className="text-2xl font-bold text-gray-500 flex items-center gap-3">
                  <Calendar className="w-7 h-7 text-blue-400" />
                  Order Date
                </span>
                <span className="text-2xl font-bold text-gray-800">{orderData?.order_date || '-'}</span>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-6 gap-2">
                <span className="text-2xl font-bold text-gray-500 flex items-center gap-3">
                  <User className="w-7 h-7 text-blue-400" />
                  Customer ID
                </span>
                <span className="text-2xl font-bold text-gray-800">{orderData?.customer_id || '-'}</span>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between pt-2 gap-4">
                <span className="text-2xl font-bold text-gray-500 flex items-center gap-3">
                  <Activity className="w-7 h-7 text-blue-400" />
                  Status
                </span>
                <span className={`px-6 py-2 rounded-full text-xl font-bold border-2 shadow-sm ${getStatusStyle(orderData?.outstatus || '')}`}>
                  {orderData?.outstatus || 'Unknown'}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center w-full mt-8 px-2">
          <button
            onClick={() => router.back()}
            className="w-16 h-16 bg-white rounded-[24px] shadow-md border border-gray-100 flex items-center justify-center hover:bg-gray-50 hover:shadow-lg transition-all hover:-translate-x-1"
          >
            <ArrowLeft className="w-8 h-8 text-black stroke-[3px]" />
          </button>

          <button
            onClick={() => router.push('/dashboard/outbound')}
            className="h-16 px-8 bg-blue-600 rounded-[24px] shadow-md border border-blue-500 flex items-center gap-3 hover:bg-blue-700 hover:shadow-lg transition-all hover:translate-x-1 group"
          >
            <span className="text-xl font-bold text-white">Next to Home</span>
            <Home className="w-7 h-7 text-white stroke-[2.5px]" />
          </button>
        </div>

      </div>
    </div>
  );
}

export default function OutboundOrderDetailPage() {
  return (
    <Suspense fallback={<div className="text-xl font-bold text-gray-500 text-center mt-20">Loading Order Detail...</div>}>
      <OrderDetailContent />
    </Suspense>
  );
}