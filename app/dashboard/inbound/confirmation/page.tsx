'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/auth";
import { ArrowLeft, Boxes, Warehouse, RefreshCcw, ScanLine, ListChecks } from "lucide-react";
import Link from "next/link";

interface DockStock {
    serial_no: string;
    condition: string;
    status: string;
    part_obj?: {
        part_id: string;
        part_master?: { part_name: string } | { part_name: string }[];
    } | {
        part_id: string;
        part_master?: { part_name: string } | { part_name: string }[];
    }[];
}

export default function ConfirmationPage() {
    const router = useRouter();
    const [dockItems, setDockItems] = useState<DockStock[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [serialNo, setSerialNo] = useState("");
    const [locationId, setLocationId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    useEffect(() => {
        fetchDockItems();
    }, []);

    const fetchDockItems = async () => {
        setLoading(true);
        // Fetch items currently sitting in DOCK-01 (or null location but Available)
        const { data, error } = await supabase
            .from("current_stock")
            .select(`
        serial_no,
        condition,
        status,
        part_obj (
          part_id,
          part_master ( part_name )
        )
      `)
            .in("location_id", ["DOCK-01", "DOCK"])
            .in("status", ["Receiving", "Available"])
            .neq("condition", "Missing")
            .order("created_at", { ascending: false });

        if (!error && data) {
            setDockItems(data as any as DockStock[]);
        }
        setLoading(false);
    };

    const handlePutAway = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!serialNo || !locationId) return;

        setIsSubmitting(true);
        setMessage({ text: "", type: "" });

        try {
            // Validate Serial exists in dock
            const itemExists = dockItems.some(item => item.serial_no === serialNo);
            if (!itemExists) {
                throw new Error(`Serial ${serialNo} is not currently at the Receiving Dock.`);
            }

            // Update location
            const { error } = await supabase
                .from("current_stock")
                .update({ location_id: locationId, status: "Available" })
                .eq("serial_no", serialNo);

            if (error) throw new Error(error.message.includes("fk_stock_location")
                ? "Invalid Location ID. Please scan a valid rack location."
                : error.message);

            setMessage({ text: `Successfully moved ${serialNo} to ${locationId}`, type: "success" });
            setSerialNo("");

            await fetchDockItems();

        } catch (err: any) {
            setMessage({ text: err.message, type: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full h-full p-6 max-w-7xl mx-auto flex flex-col gap-6 animate-in slide-in-from-right-8">

            <div className="flex items-center justify-between bg-white p-6 rounded-[24px] shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <Warehouse className="w-12 h-12 text-emerald-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-[#1a237e] drop-shadow-sm">Put-away (การจัดเก็บ)</h1>
                        <p className="text-gray-500 font-medium text-lg mt-1">Move goods from DOCK to Racks</p>
                    </div>
                </div>
                <Link href="/dashboard" className="w-14 h-14 bg-gray-50 rounded-full flex flex-col items-center justify-center hover:bg-gray-100 transition-colors border border-gray-200">
                    <ArrowLeft className="w-6 h-6 text-gray-700" />
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                <div className="lg:col-span-5 flex flex-col gap-6">
                    <form onSubmit={handlePutAway} className="bg-emerald-700 p-8 rounded-[32px] shadow-lg text-white">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <ScanLine className="w-6 h-6 text-emerald-300" /> Scan Put-away
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-bold text-emerald-200 uppercase tracking-widest block mb-2">1. Scan Serial Number (Item)</label>
                                <input
                                    type="text"
                                    value={serialNo}
                                    onChange={(e) => setSerialNo(e.target.value)}
                                    placeholder="Barcode..."
                                    autoFocus
                                    className="w-full p-5 rounded-2xl bg-white text-black font-bold text-xl outline-none focus:ring-4 ring-emerald-400/50"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-bold text-emerald-200 uppercase tracking-widest block mb-2">2. Scan Location (Destination)</label>
                                <input
                                    type="text"
                                    value={locationId}
                                    onChange={(e) => setLocationId(e.target.value)}
                                    placeholder="Rack / Bin barcode..."
                                    className="w-full p-5 rounded-2xl bg-emerald-800 text-white placeholder-emerald-500 font-bold border border-emerald-600 outline-none focus:bg-white focus:text-black focus:ring-4 transition-colors"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || !serialNo || !locationId}
                                className="w-full py-4 mt-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xl rounded-2xl shadow-md disabled:opacity-50 transition-colors"
                            >
                                {isSubmitting ? "Moving..." : "Store Item"}
                            </button>

                            {message.text && (
                                <div className={`p-4 rounded-xl font-medium mt-4 text-center ${message.type === 'success' ? 'bg-emerald-500 border border-emerald-400 text-white' : 'bg-red-500/90 text-white'}`}>
                                    {message.text}
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                <div className="lg:col-span-7 bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <ListChecks className="w-6 h-6 text-emerald-500" /> Items at DOCK ({dockItems.length})
                        </h2>
                        <button onClick={fetchDockItems} className="p-2 text-gray-400 hover:bg-gray-50 rounded-full hover:text-emerald-600 transition-colors">
                            <RefreshCcw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 max-h-[60vh] custom-scrollbar">
                        {loading ? (
                            <div className="h-full flex items-center justify-center text-gray-400 font-medium">Loading DOCK inventory...</div>
                        ) : dockItems.length === 0 ? (
                            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8">
                                <Boxes className="w-16 h-16 text-gray-300 mb-4" />
                                <h3 className="text-2xl font-bold text-gray-500 mb-2">DOCK is Empty!</h3>
                                <p className="text-gray-400 font-medium">All received goods have been put away.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {dockItems.map((item, idx) => (
                                    <div key={idx} className="p-4 rounded-[20px] bg-gray-50 hover:bg-emerald-50 border border-gray-100 transition-colors flex items-center justify-between group cursor-pointer" onClick={() => setSerialNo(item.serial_no)}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                                                <ScanLine className="w-6 h-6 text-gray-400 group-hover:text-emerald-500" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 font-mono text-lg tracking-wider">{item.serial_no}</p>
                                                <p className="text-sm text-gray-500">
                                                    {(Array.isArray(item.part_obj) ? item.part_obj[0]?.part_id : item.part_obj?.part_id)}
                                                    -
                                                    {(() => {
                                                        const pObj = Array.isArray(item.part_obj) ? item.part_obj[0] : item.part_obj;
                                                        const pMaster = Array.isArray(pObj?.part_master) ? pObj?.part_master[0] : pObj?.part_master;
                                                        return pMaster?.part_name;
                                                    })()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-white px-4 py-1 rounded-full text-xs font-bold text-gray-500 border border-gray-200 uppercase tracking-widest shadow-sm">
                                            {item.condition}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
