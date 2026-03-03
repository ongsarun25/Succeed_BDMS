'use client';

import { useState } from "react";
import { supabase } from "@/lib/auth";
import { ArrowLeft, ArrowRightLeft, ScanBarcode, Box, MapPin } from "lucide-react";
import Link from "next/link";

interface TransferHistory {
    serial_no: string;
    old_location: string;
    new_location: string;
    time: string;
}

export default function TransferPage() {
    // Form State
    const [serialNo, setSerialNo] = useState("");
    const [scannedItem, setScannedItem] = useState<any>(null);
    const [newLocation, setNewLocation] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });
    const [history, setHistory] = useState<TransferHistory[]>([]);

    const handleLookupSerial = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && serialNo) {
            setMessage({ text: "", type: "" });
            setScannedItem(null);

            const { data, error } = await supabase
                .from("current_stock")
                .select(`
                    serial_no,
                    condition,
                    location_id,
                    part_obj (
                        part_id,
                        part_master ( part_name )
                    )
                `)
                .eq("serial_no", serialNo)
                .single();

            if (error || !data) {
                setMessage({ text: `Serial ${serialNo} not found in inventory.`, type: "error" });
            } else {
                setScannedItem(data);
                setNewLocation(""); // reset new location input focus
            }
        }
    };

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!scannedItem || !newLocation) return;

        setIsSubmitting(true);
        setMessage({ text: "", type: "" });

        try {
            // Update location
            const { error } = await supabase
                .from("current_stock")
                .update({ location_id: newLocation })
                .eq("serial_no", scannedItem.serial_no);

            if (error) throw new Error(error.message.includes("fk_stock_location")
                ? "Invalid Location ID. Please scan a valid rack location."
                : error.message);

            setMessage({ text: `Successfully moved ${scannedItem.serial_no} to ${newLocation}`, type: "success" });

            // Add to history
            setHistory(prev => [{
                serial_no: scannedItem.serial_no,
                old_location: scannedItem.location_id || 'Unknown',
                new_location: newLocation,
                time: new Date().toLocaleTimeString()
            }, ...prev]);

            setScannedItem(null);
            setSerialNo("");
            setNewLocation("");

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
                    <ArrowRightLeft className="w-12 h-12 text-orange-500" />
                    <div>
                        <h1 className="text-3xl font-bold text-[#1a237e] drop-shadow-sm">Location Transfer (ย้ายสินค้า)</h1>
                        <p className="text-gray-500 font-medium text-lg mt-1">Move items between racks or zones</p>
                    </div>
                </div>
                <Link href="/dashboard" className="w-14 h-14 bg-gray-50 rounded-full flex flex-col items-center justify-center hover:bg-gray-100 transition-colors border border-gray-200">
                    <ArrowLeft className="w-6 h-6 text-gray-700" />
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className="bg-[#e65100] p-8 rounded-[32px] shadow-lg text-white">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <ScanBarcode className="w-6 h-6 text-orange-300" /> Scan to Transfer
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-bold text-orange-200 uppercase tracking-widest block mb-2">1. Scan Serial Number</label>
                                <input
                                    type="text"
                                    value={serialNo}
                                    onChange={(e) => setSerialNo(e.target.value)}
                                    onKeyDown={handleLookupSerial}
                                    placeholder="Scan Item Barcode & Press Enter..."
                                    autoFocus
                                    className="w-full p-5 rounded-2xl bg-white text-black font-bold text-xl outline-none focus:ring-4 ring-orange-400/50"
                                />
                            </div>

                            {scannedItem && (
                                <div className="bg-white/10 p-5 rounded-2xl border border-white/20 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Box className="w-5 h-5 text-orange-200" />
                                        <span className="font-bold text-lg">{scannedItem.part_obj?.part_id || 'Unknown Part'}</span>
                                    </div>
                                    <p className="text-orange-100 text-sm mb-4">
                                        {Array.isArray(scannedItem.part_obj?.part_master)
                                            ? scannedItem.part_obj.part_master[0]?.part_name
                                            : scannedItem.part_obj?.part_master?.part_name}
                                    </p>

                                    <div className="flex items-center justify-between bg-black/20 p-3 rounded-xl">
                                        <div className="flex items-center gap-2 text-orange-200">
                                            <MapPin className="w-4 h-4" />
                                            <span className="text-sm font-medium uppercase tracking-wider">Current Location</span>
                                        </div>
                                        <span className="font-bold text-xl text-white">{scannedItem.location_id || 'Not Assigned'}</span>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleTransfer} className="transition-all duration-300 mt-6">
                                <label className="text-sm font-bold text-orange-200 uppercase tracking-widest block mb-2">2. Scan New Location</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={newLocation}
                                        onChange={(e) => setNewLocation(e.target.value)}
                                        disabled={!scannedItem}
                                        placeholder={scannedItem ? "Rack / Bin barcode..." : "Scan Serial Number first..."}
                                        className={`w-full p-5 rounded-2xl font-bold border-2 outline-none transition-colors ${scannedItem
                                                ? "bg-[#ff9800] text-black placeholder-orange-800 border-[#ffcc80] focus:bg-white focus:text-black focus:border-white focus:ring-4"
                                                : "bg-orange-800/50 text-orange-300 placeholder-orange-400/50 border-orange-700 cursor-not-allowed"
                                            }`}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !scannedItem || !newLocation}
                                    className="w-full py-4 mt-6 bg-white text-[#e65100] hover:bg-orange-50 font-bold text-xl rounded-2xl shadow-md disabled:opacity-50 transition-colors cursor-pointer disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? "Moving..." : "Confirm Transfer"}
                                </button>
                            </form>

                            {message.text && (
                                <div className={`p-4 rounded-xl font-medium mt-4 text-center ${message.type === 'success' ? 'bg-orange-400 border border-orange-300 text-white' : 'bg-red-500/90 text-white'}`}>
                                    {message.text}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-7 bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col h-full">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-6">
                        <ArrowRightLeft className="w-6 h-6 text-orange-500" /> Recent Transfers
                    </h2>

                    <div className="flex-1 overflow-y-auto pr-2">
                        {history.length === 0 ? (
                            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8">
                                <Box className="w-16 h-16 text-gray-300 mb-4" />
                                <h3 className="text-2xl font-bold text-gray-500 mb-2">No Recent Activity</h3>
                                <p className="text-gray-400 font-medium">Transferred items will appear here during this session.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {history.map((item, idx) => (
                                    <div key={idx} className="p-5 rounded-[20px] bg-orange-50/50 border border-orange-100 flex items-center justify-between">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-bold text-gray-900 font-mono text-lg">{item.serial_no}</span>
                                            <span className="text-gray-400 text-sm">{item.time}</span>
                                        </div>

                                        <div className="flex items-center gap-4 text-center bg-white p-2 px-4 rounded-2xl border border-gray-100 shadow-sm">
                                            <div>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">From</span>
                                                <span className="font-bold text-gray-700">{item.old_location}</span>
                                            </div>
                                            <ArrowRightLeft className="w-4 h-4 text-gray-300" />
                                            <div>
                                                <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider block">To</span>
                                                <span className="font-bold text-orange-600">{item.new_location}</span>
                                            </div>
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
