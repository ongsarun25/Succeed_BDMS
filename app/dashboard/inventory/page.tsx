'use client';

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/auth";
import { Search, Package, MapPin, Tag, Activity, RefreshCw, Filter, Undo2 } from "lucide-react";

type StockItem = {
    serial_no: string;
    condition: string;
    location_id: string | null;
    status: string;
    updated_at: string;
    part_obj: {
        part_id: string;
        part_master: {
            part_name: string;
        } | { part_name: string }[];
    } | null;
};

export default function InventoryPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [conditionFilter, setConditionFilter] = useState("");
    const [stockItems, setStockItems] = useState<StockItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const handleReturnToVendor = async (serialNo: string) => {
        if (!confirm(`Are you sure you want to Return to Vendor for serial ${serialNo}?\nThis will remove it from the stock permanently.`)) return;

        setActionLoading(serialNo);
        try {
            const { error } = await supabase
                .from('current_stock')
                .delete()
                .eq('serial_no', serialNo);

            if (error) throw error;

            await fetchStock();
        } catch (error: any) {
            console.error("Error returning to vendor:", error.message);
            alert("Failed to return: " + error.message);
        } finally {
            setActionLoading(null);
        }
    };

    const fetchStock = async () => {
        setLoading(true);
        try {
            let supabaseQuery = supabase
                .from('current_stock')
                .select(`
                    serial_no,
                    condition,
                    location_id,
                    status,
                    updated_at,
                    part_obj (
                        part_id,
                        part_master (
                            part_name
                        )
                    )
                `)
                .order('updated_at', { ascending: false })
                .limit(500);

            if (statusFilter) {
                supabaseQuery = supabaseQuery.eq('status', statusFilter);
            }
            if (conditionFilter) {
                supabaseQuery = supabaseQuery.eq('condition', conditionFilter);
            }

            const { data, error } = await supabaseQuery;

            if (error) throw error;
            setStockItems(data as unknown as StockItem[]);

        } catch (error: any) {
            console.error("Error fetching stock:", error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStock();
    }, [statusFilter, conditionFilter]);

    // Client-side search to handle both Serial No and Part ID easily
    const filteredStock = useMemo(() => {
        if (!searchTerm) return stockItems;
        const lowerQuery = searchTerm.toLowerCase();
        return stockItems.filter(item =>
            item.serial_no.toLowerCase().includes(lowerQuery) ||
            (item.part_obj?.part_id || '').toLowerCase().includes(lowerQuery) ||
            getPartName(item).toLowerCase().includes(lowerQuery)
        );
    }, [stockItems, searchTerm]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Available': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'Receiving': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'In Transit': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'Quarantine': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getConditionColor = (condition: string) => {
        if (condition === 'Damaged') return 'text-red-600 bg-red-50';
        return 'text-gray-700 bg-gray-50';
    };

    const getPartName = (item: StockItem) => {
        if (!item.part_obj?.part_master) return 'Unknown Part';
        if (Array.isArray(item.part_obj.part_master)) {
            return item.part_obj.part_master[0]?.part_name || 'Unknown Part';
        }
        return item.part_obj.part_master.part_name || 'Unknown Part';
    };

    return (
        <div className="w-full h-full p-6 max-w-[1600px] mx-auto flex flex-col gap-6 animate-in fade-in duration-300">
            {/* Header & Search */}
            <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-[#1a237e] flex items-center gap-3 drop-shadow-sm">
                        <Package className="w-8 h-8 text-indigo-500" />
                        Current Stock (สถานะคลังสินค้า)
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">Search and monitor inventory in real-time</p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center w-full lg:w-auto">
                    <div className="relative w-full md:w-80">
                        <input
                            type="text"
                            placeholder="Search Serial No. or Part ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-gray-50 text-gray-900 border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium text-sm"
                        />
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm("")}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-40">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none font-medium text-sm text-gray-700 cursor-pointer"
                            >
                                <option value="">All Statuses</option>
                                <option value="Available">Available</option>
                                <option value="Receiving">Receiving</option>
                                <option value="In Transit">In Transit</option>
                                <option value="Quarantine">Quarantine</option>
                            </select>
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        </div>

                        <div className="relative flex-1 md:w-40">
                            <select
                                value={conditionFilter}
                                onChange={(e) => setConditionFilter(e.target.value)}
                                className="w-full pl-4 pr-8 py-2.5 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none font-medium text-sm text-gray-700 cursor-pointer"
                            >
                                <option value="">All Conditions</option>
                                <option value="Good">Good</option>
                                <option value="Damaged">Damaged</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex-1 overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="font-bold text-gray-700">Inventory List ({filteredStock.length} items)</h2>
                    <button
                        onClick={() => fetchStock()}
                        className="text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" /> Refresh
                    </button>
                </div>

                <div className="flex-1 overflow-auto custom-scrollbar">
                    {loading ? (
                        <div className="w-full h-64 flex items-center justify-center text-gray-400 font-medium">
                            <span className="flex items-center gap-2">
                                <RefreshCw className="w-5 h-5 animate-spin" /> Loading stock data...
                            </span>
                        </div>
                    ) : filteredStock.length === 0 ? (
                        <div className="w-full h-64 flex flex-col items-center justify-center text-gray-400">
                            <Package className="w-12 h-12 mb-3 text-gray-300" />
                            <p className="font-medium">No items found matching your filters.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 sticky top-0 z-10 shadow-sm border-b border-gray-100">
                                    <th className="py-4 px-6 font-bold text-sm text-gray-500 uppercase tracking-wider text-nowrap">Serial No.</th>
                                    <th className="py-4 px-6 font-bold text-sm text-gray-500 uppercase tracking-wider">Item Details</th>
                                    <th className="py-4 px-6 font-bold text-sm text-gray-500 uppercase tracking-wider">Location</th>
                                    <th className="py-4 px-6 font-bold text-sm text-gray-500 uppercase tracking-wider">Condition</th>
                                    <th className="py-4 px-6 font-bold text-sm text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="py-4 px-6 font-bold text-sm text-gray-500 uppercase tracking-wider text-right">Last Updated</th>
                                    <th className="py-4 px-6 font-bold text-sm text-gray-500 uppercase tracking-wider text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredStock.map((item) => (
                                    <tr key={item.serial_no} className="hover:bg-indigo-50/30 transition-colors group">
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Tag className="w-4 h-4 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <span className="font-bold text-gray-900">{item.serial_no}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="font-medium text-gray-700 line-clamp-2 max-w-sm">
                                                <span className="text-indigo-600 block text-xs mb-1 font-bold">{item.part_obj?.part_id || 'Unknown'}</span>
                                                {getPartName(item)}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-gray-600 font-medium">
                                                <MapPin className="w-4 h-4 text-emerald-500" />
                                                {item.location_id || <span className="text-gray-400 italic">Not Assigned</span>}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-md text-sm font-bold border ${getConditionColor(item.condition)}`}>
                                                {item.condition}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor(item.status)}`}>
                                                <Activity className="w-3.5 h-3.5" />
                                                {item.status}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap text-right text-sm text-gray-400 font-medium">
                                            {new Date(item.updated_at).toLocaleString('en-GB', {
                                                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap text-center">
                                            {item.status === 'Quarantine' && (
                                                <button
                                                    onClick={() => handleReturnToVendor(item.serial_no)}
                                                    disabled={actionLoading === item.serial_no}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-bold border border-red-200 transition-colors disabled:opacity-50"
                                                    title="Return to Vendor"
                                                >
                                                    <Undo2 className="w-4 h-4" />
                                                    {actionLoading === item.serial_no ? 'Processing...' : 'Return RTV'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
