'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useInboundCreate } from "@/app/context/InboundCreateContext";
import { createInboundOrder } from "@/lib/inbound";

export default function CreateInboundDetailPage() {
  const router = useRouter();
  const { data } = useInboundCreate();
  const [isCreated, setIsCreated] = useState(false);
  const [generatedId, setGeneratedId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!data.parts.length) router.replace("/dashboard/inbound/create");
  }, [data]);

  const handleCreate = async () => {
    console.log("🔵 handleCreate called, parts:", data.parts)  // ← add this
    console.log("🔵 container_no:", data.container_no, "provider_id:", data.provider_id)  // ← add this
    setSaving(true);
    setError("");

    const result = await createInboundOrder({
      container_no: data.container_no,
      provider_id: data.provider_id,
      parts: data.parts,
    });

    setSaving(false);

    if (!result.success) {
      setError(result.error ?? "Failed to create inbound.");
      return;
    }

    setGeneratedId(result.inbound_id!);
    setIsCreated(true);
  };

  const handleBack = () => {
    if (isCreated) {
      router.push("/dashboard");
    } else {
      router.push("/dashboard/inbound/create");
    }
  };

  return (
    <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in slide-in-from-right-8 duration-300">
      <div className="w-full max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold text-[#1a237e] mb-8 text-center drop-shadow-sm">
          New Inbound
        </h1>

        <div className="bg-white rounded-[32px] shadow-lg border border-gray-100 p-8 md:p-12 min-h-[400px] flex flex-col relative">

          {/* Header */}
          <div className="grid grid-cols-2 text-2xl font-bold text-gray-900 mb-6 px-4">
            <div>Part ID</div>
            <div className="text-right sm:text-left sm:pl-10">Quantity</div>
          </div>

          {/* Data from Excel via context */}
          <div className="flex-1 space-y-4 px-4">
            {data.parts.map((item: any, index: number) => (
              <div key={index} className="grid grid-cols-2 text-xl font-medium text-gray-700">
                <div>{item.part_id}</div>
                <div className="text-right sm:text-left sm:pl-10">{item.quantity}</div>
              </div>
            ))}
          </div>

          {/* Generated Inbound ID */}
          {isCreated && (
            <div className="mt-10 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-2xl font-bold text-gray-900">Inbound ID :</span>
                <span className="text-2xl font-bold text-[#1a237e]">{generatedId}</span>
                <span className="text-green-500 font-medium text-xl flex items-center gap-1 ml-2">
                  created <Check className="w-6 h-6 stroke-[3px]" />
                </span>
              </div>
            </div>
          )}

          {error && <p className="text-red-500 font-semibold mt-4">{error}</p>}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 px-2">
          <button
            onClick={handleBack}
            className="w-16 h-16 bg-white rounded-[24px] shadow-md border border-gray-100 flex items-center justify-center hover:bg-gray-50 hover:shadow-lg transition-all hover:-translate-x-1 z-10"
          >
            <ArrowLeft className="w-8 h-8 text-black stroke-[3px]" />
          </button>

          {!isCreated ? (
            <div className="flex flex-col items-center">
              <span className="text-green-500 font-bold mb-2 animate-pulse">Create</span>
              <button
                onClick={handleCreate}
                disabled={saving}
                className="w-16 h-16 bg-white rounded-[24px] shadow-md border border-gray-100 flex items-center justify-center hover:bg-gray-50 hover:shadow-lg transition-all hover:translate-x-1 z-10 disabled:opacity-50"
              >
                {saving
                  ? <span className="text-xs font-bold text-gray-400">...</span>
                  : <ArrowRight className="w-8 h-8 text-black stroke-[3px]" />
                }
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push("/dashboard")}
              className="h-16 bg-white border border-gray-100 rounded-[24px] shadow-sm flex items-center justify-center px-8 gap-3 hover:bg-gray-50 hover:shadow-md transition-all active:scale-95 z-10 animate-in zoom-in duration-300"
            >
              <span className="text-[#3ea043] font-bold text-3xl">Done</span>
              <Check className="w-8 h-8 text-[#3ea043] stroke-[4px]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}