'use client';

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/auth";
import { ArrowLeft, Box, CheckCircle2, AlertTriangle, ScanBarcode, FileQuestion } from "lucide-react";
import Link from "next/link";
import { InboundOrder, findInboundOrder } from "@/lib/inbound";

type PlanItem = {
    part_id: string;
    expected_qty: number;
    part_master?: { part_name: string; };
    received_qty?: number;
};

export default function UnloadScanPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [order, setOrder] = useState<InboundOrder | null>(null);
    const [plans, setPlans] = useState<PlanItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [selectedPart, setSelectedPart] = useState("");
    const [serialNo, setSerialNo] = useState("");
    const [condition, setCondition] = useState("Available");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [scanMessage, setScanMessage] = useState({ text: "", type: "" });
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        fetchOrderAndPlans();
    }, [id]);

    const fetchOrderAndPlans = async () => {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const { data: userData } = await supabase.from('app_user').select('role').eq('user_id', session.user.id).single();
            if (userData) setRole(userData.role);
        }

        const orderData = await findInboundOrder(id);
        if (orderData) setOrder(orderData);

        const { data: planData } = await supabase
            .from("inbound_plan")
            .select(`part_id, expected_qty, part_master (part_name)`)
            .eq("inbound_id", id);

        const { data: detailData } = await supabase
            .from("inbound_detail")
            .select(`serial_no, part_obj!inner ( part_id )`)
            .eq("inbound_id", id);

        if (planData) {
            const groupedPlans = planData.reduce((acc: any[], p: any) => {
                const existing = acc.find((item: any) => item.part_id === p.part_id);
                if (existing) {
                    existing.expected_qty += p.expected_qty;
                } else {
                    const received = detailData?.filter((d: any) => d.part_obj.part_id === p.part_id).length || 0;
                    acc.push({
                        part_id: p.part_id,
                        expected_qty: p.expected_qty,
                        part_master: p.part_master,
                        received_qty: received
                    });
                }
                return acc;
            }, []);
            setPlans(groupedPlans);

            // Smart auto-select logic
            setSelectedPart(current => {
                const currentItem = groupedPlans.find((p: any) => p.part_id === current);
                // If there's no selection, or if the current selection is fully received, find the next incomplete item
                if (!current || (currentItem && currentItem.received_qty >= currentItem.expected_qty)) {
                    const nextIncomplete = groupedPlans.find((p: any) => p.received_qty < p.expected_qty);
                    return nextIncomplete ? nextIncomplete.part_id : (groupedPlans[0]?.part_id || "");
                }
                // Otherwise, keep the current selection
                return current;
            });
        }
        setLoading(false);
    };

    const handleScanSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!serialNo || !selectedPart) return;

        setIsSubmitting(true);
        setScanMessage({ text: "", type: "" });

        try {
            const currentPlan = plans.find(p => p.part_id === selectedPart);
            if (currentPlan && (currentPlan.received_qty || 0) >= currentPlan.expected_qty) {
                throw new Error(`Cannot receive more! Expected ${currentPlan.expected_qty}, already received ${(currentPlan.received_qty || 0)}.`);
            }

            const { data: { session } } = await supabase.auth.getSession();
            const userId = session?.user?.id;

            const { error: partErr } = await supabase
                .from("part_obj")
                .upsert({ serial_no: serialNo, part_id: selectedPart }, { onConflict: "serial_no" });

            if (partErr) throw new Error("Failed to register Part Serial: " + partErr.message);

            const { error: detailErr } = await supabase
                .from("inbound_detail")
                .insert({
                    inbound_id: id,
                    serial_no: serialNo,
                    condition: condition,
                    inspector_user_id: userId,
                    time_received_by: new Date().toISOString()
                });

            if (detailErr) throw new Error(detailErr.message.includes("duplicate") ? "This Serial is already scanned!" : detailErr.message);

            setScanMessage({ text: `Successfully received serial: ${serialNo}`, type: "success" });
            setSerialNo("");
            setCondition("Available");
            await fetchOrderAndPlans();

        } catch (err: any) {
            setScanMessage({ text: err.message, type: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCompleteOrder = async () => {
        if (!confirm("Are you sure you want to Complete this Inbound process? You won't be able to scan more items.")) return;
        await supabase.from("inbound_order").update({ status: "Received" }).eq("inbound_id", id);
        router.push("/dashboard/inbound/unload");
    }

    const handleCancelOrder = async () => {
        if (!confirm("Are you sure you want to Cancel this Inbound Plan? This action cannot be undone.")) return;
        await supabase.from("inbound_order").update({ status: "Cancelled" }).eq("inbound_id", id);
        router.push("/dashboard/inbound/unload");
    }

    if (loading) return <div className="p-10 text-center">Loading Data...</div>;
    const isAllFulfilled = plans.every(p => (p.received_qty || 0) >= p.expected_qty);

    return (
        <div className="w-full h-full p-6 max-w-6xl mx-auto flex flex-col gap-6 animate-in slide-in-from-right-8">

            <div className="flex items-center justify-between bg-white p-6 rounded-[24px] shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-bold text-[#1a237e] flex items-center gap-3">
                        <ScanBarcode className="w-8 h-8 text-blue-600" /> Unload & Receiving
                    </h1>
                    <p className="text-gray-500 font-medium text-lg mt-1">Inbound ID: <span className="text-blue-600 font-bold">{id}</span></p>
                </div>
                <Link href="/dashboard/inbound/unload" className="w-14 h-14 bg-gray-50 rounded-full flex flex-col items-center justify-center hover:bg-gray-100 transition-colors border border-gray-200">
                    <ArrowLeft className="w-6 h-6 text-gray-700" />
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Box className="w-6 h-6 text-indigo-500" /> Expected Plan
                    </h2>

                    <div className="space-y-4">
                        {plans.map((p, idx) => {
                            const isDone = (p.received_qty || 0) >= p.expected_qty;
                            const isSelected = selectedPart === p.part_id;
                            return (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedPart(p.part_id)}
                                    className={`p-4 rounded-[20px] border-2 cursor-pointer transition-all flex items-center flex-wrap justify-between gap-4 
                                        ${isDone ? 'border-green-200 bg-green-50 opacity-60' :
                                            isSelected ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-100 scale-[1.02]' : 'border-gray-200 bg-white hover:border-blue-300'}`}
                                >
                                    <div>
                                        <p className="font-bold text-lg text-gray-900">{p.part_id}</p>
                                        <p className="text-sm text-gray-500">{p.part_master?.part_name || "Unknown Part"}</p>
                                    </div>
                                    <div className="flex items-center gap-4 text-center">
                                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 min-w-[80px]">
                                            <span className="text-xs text-gray-400 block font-bold uppercase tracking-wider">Received</span>
                                            <span className={`text-xl font-bold ${isDone ? 'text-green-600' : 'text-blue-600'}`}>{p.received_qty}</span>
                                        </div>
                                        <span className="text-gray-400 font-bold">/</span>
                                        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 min-w-[80px]">
                                            <span className="text-xs text-gray-400 block font-bold uppercase tracking-wider">Expected</span>
                                            <span className="text-xl font-bold text-gray-700">{p.expected_qty}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    <form onSubmit={handleScanSubmit} className="bg-[#1a237e] p-8 rounded-[32px] shadow-lg text-white">
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <ScanBarcode className="w-6 h-6 text-blue-300" /> Scan Next Item
                        </h2>

                        <div className="space-y-5">
                            <div>
                                <label className="text-sm font-bold text-blue-200 uppercase tracking-widest block mb-2">1. Select Part (from plan)</label>
                                <select
                                    value={selectedPart}
                                    onChange={(e) => setSelectedPart(e.target.value)}
                                    className="w-full p-4 rounded-2xl bg-white/10 border-2 border-white/20 text-white font-semibold outline-none focus:border-blue-400 [&>option]:text-black"
                                >
                                    {plans.map(p => (
                                        <option key={p.part_id} value={p.part_id}>{p.part_id} - {p.part_master?.part_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-blue-200 uppercase tracking-widest block mb-2">2. Visual QC Condition</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button type="button" onClick={() => setCondition("Available")} className={`p-3 rounded-2xl font-bold border-2 transition-all flex items-center justify-center gap-2 ${condition === "Available" ? 'bg-green-500 border-green-400 text-white shadow-lg scale-105' : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20'}`}>
                                        <CheckCircle2 className="w-5 h-5" /> Available (Good)
                                    </button>
                                    <button type="button" onClick={() => setCondition("Damaged")} className={`p-3 rounded-2xl font-bold border-2 transition-all flex items-center justify-center gap-2 ${condition === "Damaged" ? 'bg-red-500 border-red-400 text-white shadow-lg scale-105' : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20'}`}>
                                        <AlertTriangle className="w-5 h-5" /> Damaged
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-blue-200 uppercase tracking-widest block mb-2">3. Scan Serial Number</label>
                                <input
                                    type="text"
                                    value={serialNo}
                                    onChange={(e) => setSerialNo(e.target.value)}
                                    placeholder="Click here & scan barcode..."
                                    autoFocus
                                    className={`w-full p-5 rounded-2xl font-bold text-xl outline-none focus:ring-4 ring-blue-400/50 bg-white text-black`}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || !serialNo}
                                className={`w-full py-4 mt-2 font-bold text-xl rounded-2xl shadow-md disabled:opacity-50 transition-colors bg-blue-500 hover:bg-blue-400 text-white`}
                            >
                                {isSubmitting ? "Receiving..." : "Register Item"}
                            </button>

                            {scanMessage.text && (
                                <div className={`p-4 rounded-xl font-medium mt-4 text-center ${scanMessage.type === 'success' ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}`}>
                                    {scanMessage.text}
                                </div>
                            )}
                        </div>
                    </form>

                    {isAllFulfilled ? (
                        <div className="bg-green-50 border-2 border-green-200 p-8 rounded-[32px] flex flex-col items-center justify-center text-center shadow-sm">
                            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                            <h3 className="text-2xl font-bold text-green-800 mb-2">All Items Received!</h3>
                            <p className="text-green-700 font-medium mb-6">The received quantities match the initial plan.</p>
                            <button
                                onClick={handleCompleteOrder}
                                className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-md transition-all active:scale-95"
                            >
                                Complete Inbound Order
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white border-2 border-gray-100 p-6 rounded-[32px] flex items-center justify-between shadow-sm">
                            {role?.toLowerCase() === 'manager' && (
                                <button onClick={handleCancelOrder} className="px-6 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl transition-colors">
                                    Cancel Plan
                                </button>
                            )}
                            <button onClick={handleCompleteOrder} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors ml-auto">
                                Force Complete Early
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
