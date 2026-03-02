'use client';

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, CheckSquare, Square, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type GroupedPickItem = {
  id: string; // partId + "_" + location
  partId: string;
  location: string;
  qty: number;
  isPicked: boolean;
  detailIds: string[]; // Store out_detail_id to update them later
};

function PickDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const outboundId = searchParams.get('id');

  const [items, setItems] = useState<GroupedPickItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!outboundId) return;

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

        // Map location back
        const stockMap = new Map(stockData?.map(s => [s.serial_no, s.location_id]));

        // Group data by part_id and location_id
        const groups: Record<string, GroupedPickItem> = {};

        data.forEach((row: any) => {
          const partId = row.part_obj?.part_id || 'Unknown Part';
          const location = stockMap.get(row.serial_no) || 'Unknown Location';
          const isRowPicked = !!row.time_picked_by;

          const groupId = `${partId}_${location}`;

          if (!groups[groupId]) {
            groups[groupId] = {
              id: groupId,
              partId,
              location,
              qty: 0,
              isPicked: true, // will set to false if any item is not picked
              detailIds: []
            };
          }

          groups[groupId].qty += 1;
          groups[groupId].detailIds.push(row.out_detail_id);
          if (!isRowPicked) {
            groups[groupId].isPicked = false;
          }
        });

        // Convert the object back to an array
        setItems(Object.values(groups));
      } catch (err: any) {
        console.error("Unexpected error fetching pick data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPickData();
  }, [outboundId]);

  const togglePick = (id: string) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, isPicked: !item.isPicked } : item
    ));
  };

  const handleConfirm = async () => {
    const allPicked = items.every(item => item.isPicked);
    if (!allPicked) {
      const confirmIncomplete = confirm("ยังหยิบของไม่ครบ ยืนยันที่จะทำการบันทึกหรือไม่?");
      if (!confirmIncomplete) return;
    }

    try {
      setSaving(true);

      const pickedDetailIds = items.filter(i => i.isPicked).flatMap(i => i.detailIds);
      const unpickedDetailIds = items.filter(i => !i.isPicked).flatMap(i => i.detailIds);

      if (pickedDetailIds.length > 0) {
        const { error } = await supabase
          .from('outbound_detail')
          .update({
            time_picked_by: new Date().toISOString(),
          })
          .in('out_detail_id', pickedDetailIds);

        if (error) throw error;
      }

      if (unpickedDetailIds.length > 0) {
        const { error } = await supabase
          .from('outbound_detail')
          .update({
            time_picked_by: null
          })
          .in('out_detail_id', unpickedDetailIds);

        if (error) throw error;
      }

      // If full order picked, update Outbound status
      if (allPicked) {
        await supabase
          .from('outbound_order')
          .update({ outstatus: 'Picked' })
          .eq('outbound_id', outboundId);
      }

      alert(`✅ บันทึกการหยิบของออเดอร์ ${outboundId} เรียบร้อย!`);
      router.push('/dashboard/outbound');
    } catch (error: any) {
      console.error("Error updating pick status:", error);
      alert("Error: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (!outboundId) {
    return (
      <div className="w-full flex justify-center items-center h-[80vh] flex-col gap-4">
        <p className="text-2xl font-bold text-gray-500">โปรดระบุ Outbound ID</p>
        <button onClick={() => router.back()} className="px-6 py-3 mt-4 bg-blue-600 text-white rounded-xl text-xl font-bold hover:bg-blue-700">กลับไปยังเมนูหลัก</button>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in slide-in-from-right-8 duration-500">
      <div className="w-full max-w-3xl">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1a237e] drop-shadow-sm mb-2">
            Pick Detail
          </h1>
          <p className="text-xl font-bold text-gray-600 bg-white inline-block px-6 py-2 rounded-full shadow-sm border border-gray-100">
            ID: {outboundId}
          </p>
        </div>

        {/* Box List */}
        <div className="bg-white rounded-[32px] shadow-lg border border-gray-100 p-8 min-h-[400px] flex flex-col relative">

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
              <p className="text-lg font-medium animate-pulse">กำลังโหลดข้อมูลรายการ...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
              <p className="text-xl font-medium text-red-500">ไม่พบรายการเบิกจ่ายของออเดอร์นี้</p>
              <p className="text-gray-400">กรุณาตรวจสอบ Outbound ID ให้ถูกต้อง</p>
            </div>
          ) : (
            <>
              {/* ตารางหัว */}
              <div className="grid grid-cols-12 text-xl font-bold text-gray-900 mb-6 px-4 border-b-2 border-gray-100 pb-4">
                <div className="col-span-5">Part ID</div>
                <div className="col-span-3 text-center">Location</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-center">Status</div>
              </div>

              {/* รายการ */}
              <div className="flex-1 space-y-4 px-4 overflow-y-auto max-h-[40vh]">
                {items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => togglePick(item.id)}
                    className={`grid grid-cols-12 items-center text-lg font-medium p-4 rounded-2xl cursor-pointer transition-all border-2 ${item.isPicked
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-gray-50 border-transparent hover:border-gray-200 text-gray-700'
                      }`}
                  >
                    <div className="col-span-5">{item.partId}</div>
                    <div className="col-span-3 text-center text-blue-600 font-bold">{item.location}</div>
                    <div className="col-span-2 text-center font-black text-2xl">{item.qty}</div>
                    <div className="col-span-2 flex justify-center">
                      {item.isPicked ? (
                        <CheckSquare className="w-8 h-8 text-green-500" />
                      ) : (
                        <Square className="w-8 h-8 text-gray-300" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>

        {/* ปุ่มด้านล่าง */}
        <div className="flex justify-between items-center mt-10 px-2">
          <button
            onClick={() => router.back()}
            disabled={saving || loading}
            className="w-16 h-16 bg-white rounded-[24px] shadow-md border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all hover:-translate-x-1 disabled:opacity-50"
          >
            <ArrowLeft className="w-8 h-8 text-black stroke-[3px]" />
          </button>

          <button
            onClick={handleConfirm}
            disabled={saving || loading || items.length === 0}
            className="h-16 bg-white border border-gray-100 rounded-[24px] shadow-sm flex items-center justify-center px-8 gap-3 hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-8 h-8 text-[#3ea043] animate-spin" />
                <span className="text-[#3ea043] font-bold text-xl">Saving...</span>
              </>
            ) : (
              <>
                <span className="text-[#3ea043] font-bold text-3xl">Done</span>
                <Check className="w-8 h-8 text-[#3ea043] stroke-[4px]" />
              </>
            )}
          </button>
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