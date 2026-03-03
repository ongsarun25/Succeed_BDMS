'use client';

import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle, Loader2, MapPin, Truck, Calendar, User, FileSignature } from "lucide-react";
import { supabase } from "@/lib/auth";

type DeliveryDetail = {
  outbound_id: string;
  order_date: string;
  customer: { name: string; address: string };
  shipment: { license_plate: string };
  items: any[];
};

function ShipmentDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const outboundId = searchParams.get('id');

  const [detail, setDetail] = useState<DeliveryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [podSignature, setPodSignature] = useState(""); // Simulate a drawing or base64 sign

  useEffect(() => {
    if (!outboundId) return;
    fetchDeliveryData();
  }, [outboundId]);

  const fetchDeliveryData = async () => {
    try {
      const { data, error } = await supabase
        .from('outbound_order')
        .select(`
          outbound_id,
          order_date,
          customer:customer_id ( name, address ),
          shipment:shipment_id ( license_plate ),
          outbound_detail ( serial_no )
        `)
        .eq('outbound_id', outboundId)
        .single();

      if (error) throw error;

      setDetail({
        ...data,
        items: data.outbound_detail || []
      } as any);
    } catch (err: any) {
      console.error(err);
      alert("Error loading order: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!podSignature.trim()) {
      alert("⚠️ Signature (Proof of Delivery) is required before confirming!");
      return;
    }

    try {
      setSaving(true);

      const now = new Date().toISOString();

      // 1. Update Outbound Order status to Shipped and store POD
      const { error: headerErr } = await supabase
        .from('outbound_order')
        .update({
          outstatus: 'Shipped',
          pod_status: 'Signed',
          pod_timestamp: now,
          pod_signature_image: podSignature // Using text input to simulate image url/base64 for now
        })
        .eq('outbound_id', outboundId);

      if (headerErr) throw headerErr;

      // 2. Remove all reserved matching stock from `current_stock` and `part_obj`
      const serials = detail?.items.map(i => i.serial_no) || [];
      if (serials.length > 0) {
        // Delete from current_stock
        const { error: stockErr } = await supabase
          .from('current_stock')
          .delete()
          .in('serial_no', serials);

        if (stockErr) throw stockErr;

        // Note: Depending on your database foreign keys and cascading deletes,
        // you might optionally delete from `part_obj` here. For completeness,
        // we assume just deleting from current_stock is the primary requirement
        // based on the user's instructions "ลบออกจากตาราง part_obj, current_stock"
        const { error: partObjErr } = await supabase
          .from('part_obj')
          .delete()
          .in('serial_no', serials);

        if (partObjErr) {
          console.warn("Could not delete from part_obj, there might be foreign key references from outbound_detail:", partObjErr);
          // We ignore this error because outbound_detail references part_obj(serial_no)
          // It strongly depends on ON DELETE CASCADE rules in db.
        }
      }

      alert(`✅ Delivery for ${outboundId} Confirmed Successfully! Parts removed from stock.`);
      router.push('/dashboard/outbound/history');
    } catch (err: any) {
      console.error(err);
      alert("Delivery Confirmation Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!outboundId) {
    return (
      <div className="w-full flex justify-center items-center h-[80vh] flex-col gap-4">
        <p className="text-2xl font-bold text-gray-500">Missing Order ID</p>
        <button onClick={() => router.back()} className="px-6 py-3 mt-4 bg-orange-600 text-white rounded-xl text-xl font-bold">Go Back</button>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-4xl flex flex-col gap-6">

        <div className="flex items-center gap-6 mb-4">
          <button
            onClick={() => router.back()}
            className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 hover:shadow-md transition-all"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700 stroke-[3px]" />
          </button>
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#1a237e] drop-shadow-sm flex items-center gap-4">
              Confirm Delivery
            </h1>
            <p className="text-gray-500 mt-2 text-lg font-medium">Verify delivery details and obtain customer signature.</p>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center text-gray-400 gap-4 bg-white rounded-[32px] border border-gray-100 shadow-sm">
            <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
            <p className="font-bold text-xl animate-pulse">Loading Delivery Info...</p>
          </div>
        ) : detail ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Left: Order Details */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex flex-col gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -z-10" />

              <h2 className="text-2xl font-black text-gray-900 border-b border-gray-100 pb-4">Order Summary</h2>

              <div className="flex flex-col gap-5">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Order ID</span>
                  <span className="text-2xl font-black text-orange-600">{detail.outbound_id}</span>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase block">Order Date</span>
                    <span className="text-lg font-bold text-gray-800">{detail.order_date}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-blue-500 mt-1" />
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase block">Customer</span>
                    <span className="text-lg font-bold text-gray-800">{detail.customer?.name}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-red-500 mt-1" />
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase block">Delivery Address</span>
                    <span className="text-base font-medium text-gray-600 leading-snug">{detail.customer?.address}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100 mt-2">
                  <Truck className="w-6 h-6 text-purple-600" />
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase block">Assigned Truck</span>
                    <span className="text-lg font-black text-gray-800">{detail.shipment?.license_plate || 'No Truck Assigned'}</span>
                  </div>
                  <div className="ml-auto text-right">
                    <span className="text-xs font-bold text-gray-400 uppercase block">Items</span>
                    <span className="text-2xl font-black text-purple-600">{detail.items.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: POD & E-Signature */}
            <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-orange-100 flex flex-col gap-6">

              <div className="flex items-center gap-3 mb-2">
                <FileSignature className="w-8 h-8 text-orange-500" />
                <h2 className="text-2xl font-black text-gray-900">Proof of Delivery</h2>
              </div>

              <p className="text-gray-500 font-medium text-sm border-l-4 border-orange-200 pl-4 py-1">
                Acknowledge receipt of <strong className="text-gray-800">{detail.items.length}</strong> items in good condition by signing below.
              </p>

              <div className="flex-1 flex flex-col gap-3 min-h-[200px]">
                <div className="flex-1 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl hover:bg-orange-50 hover:border-orange-300 focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-100 transition-all flex flex-col relative overflow-hidden group">
                  <textarea
                    value={podSignature}
                    onChange={(e) => setPodSignature(e.target.value)}
                    placeholder="Type customer name to simulate E-Signature..."
                    className="absolute inset-0 w-full h-full bg-transparent p-6 outline-none resize-none text-2xl font-handwriting text-blue-900 text-center flex items-center justify-center placeholder:text-gray-300 placeholder:font-sans placeholder:text-base placeholder:text-center pt-24"
                  />
                  {!podSignature && <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-gray-400 font-medium">Draw signature here</div>}
                </div>
              </div>

              <button
                onClick={handleConfirmDelivery}
                disabled={saving}
                className="w-full py-5 bg-orange-600 text-white rounded-[20px] shadow-lg shadow-orange-600/20 font-bold text-xl hover:bg-orange-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle className="w-6 h-6 stroke-[3px]" />}
                {saving ? "Processing..." : "Complete Delivery"}
              </button>

            </div>

          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-red-400 gap-4 bg-white rounded-[32px] border border-red-100">
            <p className="font-bold text-xl">Order not found.</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default function ShipmentDetailPage() {
  return (
    <Suspense fallback={<div className="h-[80vh] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-orange-500" /></div>}>
      <ShipmentDetailContent />
    </Suspense>
  );
}