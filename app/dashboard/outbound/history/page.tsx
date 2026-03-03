'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Box, CheckCircle2, Clock, Calendar, Truck, Package, Search } from "lucide-react";
import { supabase } from "@/lib/auth";
import Link from "next/link";

type OutboundOrder = {
    outbound_id: string;
    order_date: string;
    outstatus: string;
    pod_status: string;
    updated_at: string;
    customer: { name: string };
    shipment: { license_plate: string };
    raw_details: { count: number }[]; // Just to get a count
    outbound_detail?: {
        part_obj: { part_master: { part_name: string } }
    }[];
};

export default function OutboundHistoryPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<OutboundOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    useEffect(() => {
        fetchOrders();
    }, [statusFilter]);

    const fetchOrders = async () => {
        try {
            setLoading(true);

            let query = supabase
                .from('outbound_order')
                .select(`
          outbound_id,
          order_date,
          outstatus,
          pod_status,
          updated_at,
          customer:customer_id ( name ),
          shipment:shipment_id ( license_plate ),
          outbound_detail ( part_obj ( part_master ( part_name ) ) )
        `)
                .order('created_at', { ascending: false });

            if (statusFilter !== "All") {
                query = query.eq('outstatus', statusFilter);
            }

            const { data, error } = await query;

            if (error) throw error;
            setOrders(data as any[]);
        } catch (err) {
            console.error("Error fetching orders:", err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Picked': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Shipped': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'Delivered': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const filteredOrders = orders.filter(o =>
        o.outbound_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full h-full p-6 max-w-7xl mx-auto flex flex-col gap-6 animate-in fade-in duration-300">

            {/* Header & Controls */}
            <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <Link href="/dashboard/outbound" className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                            <ArrowLeft className="w-6 h-6 text-gray-600" />
                        </Link>
                        <h1 className="text-3xl font-bold text-[#1a237e] flex items-center gap-3">
                            <Box className="w-8 h-8 text-emerald-500" />
                            Outbound History
                        </h1>
                    </div>
                    <p className="text-gray-500 font-medium ml-14">ติดตามสถานะและประวัติการเบิกจ่ายสินค้า</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search ID or Customer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none min-w-[250px] font-medium"
                        />
                        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-700 min-w-[150px] cursor-pointer"
                    >
                        <option value="All">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Picked">Picked</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                    </select>
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full h-64 flex flex-col items-center justify-center text-gray-400">
                        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="font-bold">Loading History...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="col-span-full h-64 bg-white rounded-[24px] border border-gray-100 border-dashed flex flex-col items-center justify-center text-gray-400">
                        <Box className="w-16 h-16 text-gray-300 mb-4" />
                        <p className="font-bold text-xl">No orders found.</p>
                    </div>
                ) : (
                    filteredOrders.map(order => {
                        // Calculate item count from the array length or count object
                        const itemCount = Array.isArray(order.outbound_detail) ? order.outbound_detail.length : 0;

                        // Group items by part name to show quantities
                        const itemSummary = (order.outbound_detail || []).reduce((acc: any, curr: any) => {
                            const po = Array.isArray(curr.part_obj) ? curr.part_obj[0] : curr.part_obj;
                            const pm = po && (Array.isArray(po.part_master) ? po.part_master[0] : po.part_master);
                            const name = pm?.part_name || 'Unknown Part';
                            acc[name] = (acc[name] || 0) + 1;
                            return acc;
                        }, {});

                        return (
                            <div key={order.outbound_id} className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-emerald-200 transition-all group flex flex-col gap-4 relative overflow-hidden">

                                {/* Status Badge */}
                                <div className="absolute top-6 right-6 flex flex-col gap-2 items-end">
                                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getStatusStyle(order.outstatus)}`}>
                                        {order.outstatus}
                                    </span>
                                    {order.pod_status === 'Signed' && (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200 uppercase tracking-widest">
                                            <CheckCircle2 className="w-3 h-3" /> POD Signed
                                        </span>
                                    )}
                                </div>

                                {/* ID & Date */}
                                <div>
                                    <h3 className="font-black text-xl text-gray-900 group-hover:text-emerald-700 transition-colors mb-1">
                                        {order.outbound_id}
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                                        <Calendar className="w-4 h-4" /> {order.order_date}
                                    </div>
                                </div>

                                <div className="w-full h-px bg-gray-100" />

                                {/* Details */}
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                            <Package className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase">Customer</p>
                                            <p className="font-bold text-gray-800 leading-tight">{order.customer?.name || 'Unknown'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                                            <Truck className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <div className="flex-1 flex justify-between items-center">
                                            <div>
                                                <p className="text-xs font-bold text-gray-400 uppercase">Shipment</p>
                                                <p className="font-bold text-gray-800 leading-tight">{order.shipment?.license_plate || 'Not Assigned'}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-gray-400 uppercase">Items</p>
                                                <p className="font-black text-emerald-600 text-lg">{itemCount}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Item Summary List */}
                                    {Object.keys(itemSummary).length > 0 && (
                                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex flex-col gap-1.5 mt-2">
                                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Items List</p>
                                            {Object.entries(itemSummary).map(([name, qty]) => (
                                                <div key={name} className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-700 font-medium truncate pr-4">{name}</span>
                                                    <span className="font-bold text-gray-900 bg-white px-2 py-0.5 rounded shadow-sm border border-gray-100 shrink-0">x{qty as number}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                </div>

                                {/* POD Info if available */}
                                {order.pod_status === 'Signed' && (
                                    <div className="mt-2 bg-gradient-to-r from-orange-50 to-transparent p-3 rounded-xl border border-orange-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-orange-800">
                                            <CheckCircle2 className="w-5 h-5" />
                                            <span className="font-bold text-sm">Delivery Confirmed</span>
                                        </div>
                                        <span className="text-xs font-medium text-orange-600/70">{new Date(order.updated_at).toLocaleString()}</span>
                                    </div>
                                )}

                            </div>
                        );
                    })
                )}
            </div>

        </div>
    );
}
