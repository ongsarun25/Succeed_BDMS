'use client';

import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, Package, Loader2, ScanBarcode, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/auth";

type PickDetail = {
  out_detail_id: string;
  serial_no: string;
  time_picked_by: string | null;
  part_obj: { part_id: string };
  location_id: string; // From current_stock
};

type GroupedPickItem = {
  id: string; // partId + "_" + location
  partId: string;
  location: string;
  totalQty: number;
  pickedQty: number;
};

function PickDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const outboundId = searchParams.get('id');

  const [details, setDetails] = useState<PickDetail[]>([]);
  const [groupedItems, setGroupedItems] = useState<GroupedPickItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data.user?.id || null);
    });
  }, []);

  const [scanInput, setScanInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const scanInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!outboundId) return;
    fetchPickData();
  }, [outboundId]);

  const fetchPickData = async () => {
    try {
      setLoading(true);
      // Fetch details for this outbound order
      const { data, error } = await supabase
        .from('outbound_detail')
        .select(`
          out_detail_id,
          serial_no,
          time_picked_by,
          part_obj ( part_id )
        `)
        .eq('outbound_id', outboundId);

      if (error) throw error;

      if (!data || data.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch location for these serial numbers from current_stock
      const serials = data.map(d => d.serial_no).filter(Boolean);
      const { data: stockData, error: stockError } = await supabase
        .from('current_stock')
        .select('serial_no, location_id')
        .in('serial_no', serials);

      if (stockError) throw stockError;

      const stockMap = new Map(stockData?.map(s => [s.serial_no, s.location_id]));

      const formattedDetails: PickDetail[] = data.map((d: any) => ({
        out_detail_id: d.out_detail_id,
        serial_no: d.serial_no,
        time_picked_by: d.time_picked_by,
        part_obj: { part_id: d.part_obj?.part_id || 'Unknown' },
        location_id: stockMap.get(d.serial_no) || 'Unknown'
      }));

      setDetails(formattedDetails);
      updateGroupedItems(formattedDetails);

    } catch (err: any) {
      console.error("Unexpected error fetching pick data:", err);
      setErrorMsg("Failed to load pick list: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateGroupedItems = (currentDetails: PickDetail[]) => {
    const groups: Record<string, GroupedPickItem> = {};

    currentDetails.forEach(row => {
      const partId = row.part_obj.part_id;
      const location = row.location_id;
      const groupId = `${partId}_${location}`;

      if (!groups[groupId]) {
        groups[groupId] = {
          id: groupId,
          partId,
          location,
          totalQty: 0,
          pickedQty: 0
        };
      }

      groups[groupId].totalQty += 1;
      if (row.time_picked_by) {
        groups[groupId].pickedQty += 1;
      }
    });

    setGroupedItems(Object.values(groups));
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const serial = scanInput.trim();
    if (!serial) return;

    const targetDetail = details.find(d => d.serial_no === serial);

    if (!targetDetail) {
      // Attempt to Swap if not found (find an identical part that is available)
      try {
        const { data: stockData, error: stockErr } = await supabase
          .from('current_stock')
          .select('serial_no, status, part_obj!inner(part_id)')
          .eq('serial_no', serial)
          .single();

        if (stockErr) throw new Error("Stock fetch error: " + stockErr.message);

        if (stockData && stockData.status === 'Available') {
          // Find an unpicked item in this order with the same part_id
          const fetchedPartId = Array.isArray(stockData.part_obj) ? stockData.part_obj[0]?.part_id : (stockData.part_obj as any)?.part_id;
          const replaceableDetail = details.find(d => !d.time_picked_by && d.part_obj.part_id === fetchedPartId);

          if (replaceableDetail) {
            const oldSerial = replaceableDetail.serial_no;
            const now = new Date().toISOString();

            // 1. Release old serial to Available
            const { error: err1 } = await supabase.from('current_stock').update({ status: 'Available' }).eq('serial_no', oldSerial);
            if (err1) throw new Error("Release old serial failed: " + err1.message);
            // 2. Reserve new serial
            const { error: err2 } = await supabase.from('current_stock').update({ status: 'In Transit' }).eq('serial_no', serial);
            if (err2) throw new Error("Reserve new serial failed: " + err2.message);
            // 3. Update outbound_detail to use new serial and set it as picked
            const { error: err3 } = await supabase.from('outbound_detail').update({ serial_no: serial, time_picked_by: now, picker_user_id: currentUser }).eq('out_detail_id', replaceableDetail.out_detail_id);
            if (err3) throw new Error("Update outbound detail failed: " + err3.message);

            // 4. Update local state
            const updatedDetails = details.map(d =>
              d.out_detail_id === replaceableDetail.out_detail_id
                ? { ...d, serial_no: serial, time_picked_by: now }
                : d
            );
            setDetails(updatedDetails);
            updateGroupedItems(updatedDetails);

            setSuccessMsg(`Picked & Swapped: ${serial}`);
            setScanInput("");
            if (scanInputRef.current) scanInputRef.current.focus();
            return;
          } else {
            const fetchedPartId = Array.isArray(stockData.part_obj) ? stockData.part_obj[0]?.part_id : (stockData.part_obj as any)?.part_id;
            throw new Error(`Part ${fetchedPartId} needs picking, but no matching unpicked slots left in this order.`);
          }
        } else {
          throw new Error(`Cannot swap: Serial ${serial} has status '${stockData?.status || 'Unknown'}', expected 'Available'.`);
        }
      } catch (err: any) {
        console.error("Swap check failed", err);
        setErrorMsg(`Swap error: ${err.message}`);
        setScanInput("");
        return;
      }
    }

    if (targetDetail.time_picked_by) {
      setErrorMsg(`Serial ${serial} has already been picked!`);
      setScanInput("");
      return;
    }

    // Mark as picked
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('outbound_detail')
        .update({ time_picked_by: now, picker_user_id: currentUser })
        .eq('out_detail_id', targetDetail.out_detail_id);

      if (error) throw error;

      // Update local state
      const updatedDetails = details.map(d =>
        d.out_detail_id === targetDetail.out_detail_id
          ? { ...d, time_picked_by: now }
          : d
      );
      setDetails(updatedDetails);
      updateGroupedItems(updatedDetails);

      setSuccessMsg(`Picked: ${serial}`);
      setScanInput("");

      // Keep focus on input for next scan
      if (scanInputRef.current) {
        scanInputRef.current.focus();
      }

    } catch (err: any) {
      setErrorMsg("Failed to update: " + err.message);
    }
  };

  const handleConfirm = async () => {
    const allPicked = details.every(d => d.time_picked_by !== null);

    if (!allPicked) return; // Strict block: Cannot finish if not complete

    try {
      setSaving(true);

      await supabase
        .from('outbound_order')
        .update({ outstatus: 'Picked' })
        .eq('outbound_id', outboundId);

      alert(`✅ Finished picking for Order ${outboundId}!`);
      router.push('/dashboard/outbound/history');
    } catch (error: any) {
      console.error("Error updating pick status:", error);
      alert("Error: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm("Are you sure you want to CANCEL this entire Outbound Order? All reservations will be removed and stock returned to Available.")) return;

    try {
      setSaving(true);
      const serials = details.map(d => d.serial_no);
      if (serials.length > 0) {
        await supabase.from('current_stock').update({ status: 'Available' }).in('serial_no', serials);
      }

      await supabase.from('outbound_detail').delete().eq('outbound_id', outboundId);
      await supabase.from('outbound_order').delete().eq('outbound_id', outboundId);

      alert(`Order ${outboundId} cancelled successfully.`);
      router.push('/dashboard/outbound/pick');
    } catch (error: any) {
      console.error("Error cancelling order:", error);
      alert("Error: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (!outboundId) {
    return (
      <div className="w-full flex justify-center items-center h-[80vh] flex-col gap-4">
        <p className="text-2xl font-bold text-gray-500">Missing Outbound ID</p>
        <button onClick={() => router.back()} className="px-6 py-3 mt-4 bg-blue-600 text-white rounded-xl text-xl font-bold hover:bg-blue-700">Go Back</button>
      </div>
    );
  }

  const totalRequired = details.length;
  const totalPicked = details.filter(d => d.time_picked_by).length;
  const progressPercent = totalRequired === 0 ? 0 : Math.round((totalPicked / totalRequired) * 100);

  return (
    <div className="w-full h-full p-6 max-w-5xl mx-auto flex flex-col items-center animate-in fade-in duration-300">
      {/* Header */}
      <div className="w-full flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1a237e] flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-500" />
            Pick Outbound Order
          </h1>
          <p className="text-gray-500 font-medium mt-1 text-lg">Order ID: <span className="text-blue-600 font-bold">{outboundId}</span></p>
        </div>

        {/* Progress Circle */}
        <div className="flex items-center gap-4 bg-blue-50 px-6 py-4 rounded-2xl border border-blue-100">
          <div className="flex flex-col text-right">
            <span className="text-sm font-bold text-blue-400 uppercase tracking-widest">Progress</span>
            <span className="text-3xl font-black text-blue-700">{totalPicked} / {totalRequired}</span>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-blue-200 flex items-center justify-center relative overflow-hidden bg-white">
            <div
              className="absolute bottom-0 left-0 w-full bg-blue-500 transition-all duration-500"
              style={{ height: `${progressPercent}%` }}
            />
            <span className="relative z-10 font-bold text-sm text-gray-800 mix-blend-hard-light">{progressPercent}%</span>
          </div>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Side: Scanner Input & Status */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <form onSubmit={handleScan} className="bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col">
            <label className="text-xl font-bold text-gray-900 mb-4 block flex items-center gap-2">
              <ScanBarcode className="w-6 h-6 text-blue-600" />
              Scan Serial Number
            </label>
            <input
              ref={scanInputRef}
              type="text"
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              placeholder="Aim scanner here..."
              className="w-full px-5 py-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 focus:outline-none focus:border-blue-500 focus:bg-blue-50 text-xl font-medium transition-all text-center placeholder:text-gray-400"
              autoFocus
              disabled={loading || totalPicked === totalRequired}
            />
            <button
              type="submit"
              className="mt-4 w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors hidden"
              disabled={loading || !scanInput}
            >
              Scan
            </button>

            {/* Scan Feedback */}
            {errorMsg && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
                <p className="font-medium text-sm">{errorMsg}</p>
              </div>
            )}
            {successMsg && (
              <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-xl border border-green-200 flex items-center gap-3 animate-in fade-in zoom-in-95">
                <CheckCircle2 className="w-6 h-6 shrink-0" />
                <p className="font-bold">{successMsg}</p>
              </div>
            )}
            {totalPicked === totalRequired && totalRequired > 0 && (
              <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-xl border border-green-300 flex flex-col items-center justify-center gap-2 animate-in zoom-in-95">
                <CheckCircle2 className="w-10 h-10" />
                <p className="font-black text-lg text-center">All items picked!</p>
              </div>
            )}
          </form>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="flex-1 py-4 bg-white text-gray-700 rounded-[20px] shadow-sm border border-gray-200 font-bold hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleConfirm}
              disabled={saving || loading || totalRequired === 0 || totalPicked < totalRequired}
              className={`flex-[2] py-4 rounded-[20px] shadow-md font-bold text-white transition-all flex items-center justify-center gap-2 ${totalPicked === totalRequired
                ? 'bg-green-600 hover:bg-green-700 shadow-green-600/20'
                : 'bg-gray-400 cursor-not-allowed'
                }`}
            >
              {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Check className="w-6 h-6 stroke-[3px]" />}
              {saving ? "Saving..." : "Finish Picking"}
            </button>
          </div>

          <button
            onClick={handleCancelOrder}
            disabled={saving || loading}
            className="w-full py-3 bg-red-50 text-red-600 rounded-[20px] border border-red-200 font-bold hover:bg-red-100 transition-colors"
          >
            Cancel Entire Order
          </button>
        </div>

        {/* Right Side: Pick List visually grouped */}
        <div className="lg:col-span-2 bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-xl font-bold text-gray-800">Picking Plan</h2>
            <p className="text-sm text-gray-500 font-medium">Locations and quantities to pick</p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar max-h-[60vh]">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                <p className="font-medium animate-pulse">Loading pick list...</p>
              </div>
            ) : groupedItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
                <Package className="w-12 h-12 text-gray-300" />
                <p className="font-medium text-lg">No items to pick for this order.</p>
              </div>
            ) : (
              groupedItems.map(group => {
                const isCompleted = group.pickedQty === group.totalQty;
                return (
                  <div
                    key={group.id}
                    className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${isCompleted
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white border-gray-100 hover:border-blue-100 hover:shadow-sm'
                      }`}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-gray-500 text-sm font-bold uppercase tracking-wider">Part ID</span>
                      <span className={`text-xl font-black ${isCompleted ? 'text-green-800' : 'text-gray-900'}`}>{group.partId}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs font-bold border border-gray-200">
                          Location
                        </span>
                        <span className="text-blue-600 font-bold">{group.location}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-baseline gap-1">
                        <span className={`text-4xl font-black ${isCompleted ? 'text-green-600' : 'text-blue-600'}`}>{group.pickedQty}</span>
                        <span className="text-xl font-bold text-gray-400">/ {group.totalQty}</span>
                      </div>
                      {isCompleted && (
                        <span className="flex items-center gap-1 text-sm font-bold text-green-600 bg-green-100 px-2.5 py-1 rounded-lg">
                          <CheckCircle2 className="w-4 h-4" /> Picked
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function OutboundPickDetailPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>}>
      <PickDetailContent />
    </Suspense>
  );
}