'use client';

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle, Loader2, MapPin, Truck, Calendar, User, Send } from "lucide-react";
import { supabase } from "@/lib/auth";

type DispatchDetail = {
    outbound_id: string;
    order_date: string;
    customer: { name: string; address: string };
    shipment: { license_plate: string };
    items: any[];
};

function DispatchDetailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const outboundId = searchParams.get('id');

    const [detail, setDetail] = useState<DispatchDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!outboundId) return;
        fetchDispatchData();
    }, [outboundId]);

    const fetchDispatchData = async () => {
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

    const handleConfirmDispatch = async () => {
        try {
            setSaving(true);

            // Update Outbound Order status to Shipped
            const { error: headerErr } = await supabase
                .from('outbound_order')
                .update({ outstatus: 'Shipped' })
                .eq('outbound_id', outboundId);

            if (headerErr) throw headerErr;

            alert(`✅ Dispatch for ${outboundId} Confirmed! The order is now on the truck.`);
            router.push('/dashboard/shipment/dispatch');
        } catch (err: any) {
            console.error(err);
            alert("Dispatch Confirmation Error: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (!outboundId) {
        return (
            <div className="w-full flex justify-center items-center h-[80vh] flex-col gap-4">
                <p className="text-2xl font-bold text-gray-500">Missing Order ID</p>
                <button onClick={() => router.back()} className="px-6 py-3 mt-4 bg-indigo-600 text-white rounded-xl text-xl font-bold">Go Back</button>
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
                            Confirm Dispatch
                        </h1>
                        <p className="text-gray-500 mt-2 text-lg font-medium">Verify order details before it leaves the warehouse.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="h-64 flex flex-col items-center justify-center text-gray-400 gap-4 bg-white rounded-[32px] border border-gray-100 shadow-sm">
                        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
                        <p className="font-bold text-xl animate-pulse">Loading Dispatch Info...</p>
                    </div>
                ) : detail ? (
                    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex flex-col gap-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 rounded-bl-full -z-10" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex flex-col gap-5">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Order ID</span>
                                    <span className="text-3xl font-black text-indigo-600">{detail.outbound_id}</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <span className="text-xs font-bold text-gray-400 uppercase block">Order Date</span>
                                        <span className="text-lg font-bold text-gray-800">{detail.order_date}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-5">
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
                            </div>
                        </div>

                        <div className="w-full h-px bg-gray-100" />

                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
                                    <Truck className="w-8 h-8 text-purple-600" />
                                </div>
                                <div>
                                    <span className="text-sm font-bold text-gray-500 uppercase block">Assigned Truck</span>
                                    <span className="text-2xl font-black text-gray-900">{detail.shipment?.license_plate || 'No Truck Assigned'}</span>
                                </div>
                            </div>

                            <div className="text-center md:text-right">
                                <span className="text-sm font-bold text-gray-500 uppercase block">Total Items Loaded</span>
                                <span className="text-4xl font-black text-emerald-600">{detail.items.length}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleConfirmDispatch}
                            disabled={saving}
                            className="mt-4 w-full py-5 bg-indigo-600 text-white rounded-[20px] shadow-lg shadow-indigo-600/20 font-bold text-xl hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                            {saving ? "Processing..." : "Confirm Dispatch"}
                        </button>

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

export default function DispatchDetailPage() {
    return (
        <Suspense fallback={<div className="h-[80vh] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-500" /></div>}>
            <DispatchDetailContent />
        </Suspense>
    );
}
