'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, PackageCheck, Loader2, Calendar, User, Truck } from "lucide-react";
import { supabase } from "@/lib/auth";

type ShipableOrder = {
  outbound_id: string;
  order_date: string;
  customer: { name: string; address: string };
  shipment: { license_plate: string };
};

export default function ShipmentProcessPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<ShipableOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShipableOrders();
  }, []);

  const fetchShipableOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('outbound_order')
        .select(`
          outbound_id,
          order_date,
          customer:customer_id ( name, address ),
          shipment:shipment_id ( license_plate )
        `)
        .eq('outstatus', 'Shipped')
        .eq('pod_status', 'Pending')
        .order('order_date', { ascending: true });

      if (error) throw error;
      setOrders(data as any[]);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOrder = (id: string) => {
    router.push(`/dashboard/shipment/process/detail?id=${id}`);
  };

  return (
    <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in slide-in-from-right-8 duration-500">
      <div className="w-full max-w-4xl text-center">

        <div className="flex justify-center mb-6">
          <button
            onClick={() => router.push('/dashboard/shipment')}
            className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 hover:shadow-md transition-all absolute left-6 top-6"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700 stroke-[3px]" />
          </button>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-[#1a237e] mb-4 drop-shadow-sm flex items-center justify-center gap-4">
          <Truck className="w-12 h-12 text-orange-500" />
          Ready for Delivery
        </h1>
        <p className="text-gray-500 mb-10 text-lg">Select a picked order to process delivery and signature (POD)</p>

        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 min-h-[400px] flex flex-col text-left">
          <div className="flex justify-between items-center px-4 mb-6">
            <h2 className="text-xl font-bold text-gray-800">Picked Orders Queue</h2>
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-black text-sm">{orders.length}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              <div className="col-span-full h-64 flex flex-col items-center justify-center text-gray-400 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
                <p className="font-medium animate-pulse">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="col-span-full h-64 flex flex-col items-center justify-center text-gray-400 gap-3 border-2 border-dashed border-gray-200 rounded-2xl">
                <PackageCheck className="w-16 h-16 text-gray-200" />
                <p className="font-bold text-lg text-gray-400">No orders ready for delivery.</p>
              </div>
            ) : (
              orders.map(order => (
                <div
                  key={order.outbound_id}
                  onClick={() => handleSelectOrder(order.outbound_id)}
                  className="group bg-gray-50 hover:bg-orange-50 border border-gray-100 hover:border-orange-200 p-5 rounded-2xl cursor-pointer transition-all flex flex-col gap-3 relative overflow-hidden"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-black text-xl text-gray-900 group-hover:text-orange-700">{order.outbound_id}</span>
                      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500 mt-1">
                        <Calendar className="w-3.5 h-3.5" /> {order.order_date}
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                      <ArrowRight className="w-5 h-5 text-orange-600 stroke-[3px]" />
                    </div>
                  </div>

                  <div className="h-px w-full bg-gray-200 my-1 group-hover:bg-orange-100" />

                  <div className="flex flex-col gap-2">
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="font-bold line-clamp-1">{order.customer?.name}</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-gray-500">
                      <Truck className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="font-medium line-clamp-1">{order.customer?.address}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}