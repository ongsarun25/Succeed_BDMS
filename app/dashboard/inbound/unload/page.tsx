'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/auth";
import { Truck, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { InboundOrder } from "@/lib/inbound";

export default function UnloadListPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<InboundOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPendingOrders();
    }, []);

    const fetchPendingOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("inbound_order")
            .select("*")
            .eq("status", "Draft Plan")
            .order("created_at", { ascending: false });

        if (!error && data) {
            setOrders(data);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="w-full h-[80vh] flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-500 font-medium text-lg">Loading Pending Inbound Plans...</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col items-center p-6">
            <div className="w-full max-w-5xl">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <Truck className="w-12 h-12 text-blue-600" />
                        <h1 className="text-4xl md:text-5xl font-bold text-[#1a237e] drop-shadow-sm">
                            Unload
                        </h1>
                    </div>
                    <Link
                        href="/dashboard"
                        className="w-16 h-16 bg-white rounded-[24px] shadow-md border border-gray-100 flex items-center justify-center hover:bg-gray-50 hover:-translate-x-1 transition-all"
                    >
                        <ArrowLeft className="w-8 h-8 text-black stroke-[3px]" />
                    </Link>
                </div>

                <p className="text-gray-500 mb-8 text-lg font-medium">
                    Select an incoming shipment draft to begin physical scanning & receiving.
                </p>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-[32px] p-12 shadow-sm border border-gray-100 flex flex-col items-center text-center">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <Truck className="w-12 h-12 text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">No Pending Inbounds</h3>
                        <p className="text-gray-500 text-lg">All inbound plans have been unloaded or none are drafted yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {orders.map((order) => (
                            <div
                                key={order.inbound_id}
                                onClick={() => router.push(`/dashboard/inbound/unload/${order.inbound_id}`)}
                                className="bg-white rounded-[32px] p-8 flex flex-col gap-4 shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-400 cursor-pointer transition-all hover:-translate-y-2 group"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-2xl font-bold text-[#1a237e] mb-1 group-hover:text-blue-600 transition-colors">
                                            {order.inbound_id}
                                        </h3>
                                        <p className="text-gray-500 text-sm font-medium">Inv: {order.invoice_no || "N/A"}</p>
                                    </div>
                                    <span className="px-4 py-1.5 bg-yellow-100 text-yellow-700 font-bold text-sm rounded-full">
                                        Draft
                                    </span>
                                </div>

                                <div className="space-y-2 mt-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Provider ID:</span>
                                        <span className="font-semibold text-gray-800">{order.provider_id}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Container:</span>
                                        <span className="font-semibold text-gray-800">{order.container_no}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Est. Arrival:</span>
                                        <span className="font-semibold text-gray-800">{order.arrival_date}</span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-50 text-blue-600 font-bold text-center group-hover:bg-blue-50 rounded-2xl py-3 transition-colors">
                                    Start Unload →
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
