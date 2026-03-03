'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import { useInboundCreate } from "@/app/context/InboundCreateContext";
import { supabase } from "@/lib/auth";

export default function CreateInboundPage() {
  const router = useRouter();
  const { data, setData } = useInboundCreate();
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [providers, setProviders] = useState<any[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const { data: pData, error } = await supabase.from('logistics_provider').select('provider_id, company_name');
        if (error) throw error;
        if (pData) setProviders(pData);
      } catch (err) {
        console.error("Error fetching providers:", err);
      } finally {
        setLoadingProviders(false);
      }
    };
    fetchProviders();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const workbook = XLSX.read(evt.target?.result, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet) as any[];

      console.log("🔵 Raw Excel rows:", rows)  // ← add this
      console.log("🔵 First row keys:", Object.keys(rows[0] || {}))  // ← add this

      // Parse Excel rows and handle merged/blank Part ID cells by carrying over the last seen Part ID
      const aggregatedMap = new Map<string, any>();
      let lastPartId = "";

      rows.forEach((row) => {
        let currentPartId = String(row["part_id"] ?? row["Part ID"] ?? "").trim();

        // If current row has no Part ID, use the last seen one
        if (currentPartId) {
          lastPartId = currentPartId;
        } else {
          currentPartId = lastPartId;
        }

        const quantity = Number(row["quantity"] ?? row["Quantity"] ?? 0);
        const invoice_no = String(row["invoice_no"] ?? row["Invoice No"] ?? "").trim();

        // Only process if we have a valid part ID and a positive quantity
        if (currentPartId && quantity > 0) {
          if (aggregatedMap.has(currentPartId)) {
            const existing = aggregatedMap.get(currentPartId);
            existing.quantity += quantity;
            // Optionally update invoice_no if we want the latest one, but usually it's the same
            if (invoice_no && !existing.invoice_no) {
              existing.invoice_no = invoice_no;
            }
          } else {
            aggregatedMap.set(currentPartId, {
              part_id: currentPartId,
              quantity,
              invoice_no,
            });
          }
        }
      });

      const parts = Array.from(aggregatedMap.values());

      setData({ parts })
      console.log("🟢 Parts set in context:", parts)
    };
    reader.readAsBinaryString(file);
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.parts.length) {
      setError("Please upload an Excel file first.");
      return;
    }
    if (!data.container_no.trim()) {
      setError("Please enter a Container No.");
      return;
    }
    if (!data.provider_id.trim()) {
      setError("Please enter a Provider ID.");
      return;
    }
    setError("");
    router.push("/dashboard/inbound/create/detail");
  };



  return (
    <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold text-[#1a237e] mb-10 text-center drop-shadow-sm">
          Create Inbound
        </h1>

        <form onSubmit={handleNext} className="bg-white rounded-[32px] shadow-lg p-8 space-y-6">
          {/* Excel Upload */}
          <div>
            <label className="text-xl font-bold text-gray-800 block mb-2">
              Upload Excel file
            </label>
            <div className="relative">
              <input
                type="file"
                id="excel-upload"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="excel-upload"
                className="w-full px-6 py-4 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-300 flex items-center cursor-pointer hover:border-blue-400 transition min-h-[64px]"
              >
                <span className={`text-lg ${fileName ? "text-blue-600 font-medium" : "text-gray-400"}`}>
                  {fileName || "Attach"}
                </span>
              </label>
            </div>
          </div>

          {/* Container No */}
          <div>
            <label className="text-xl font-bold text-gray-800 block mb-2">
              Container No
            </label>
            <input
              type="text"
              placeholder="e.g. CONT-H123"
              value={data.container_no}
              onChange={(e) => setData({ container_no: e.target.value })}
              className="w-full px-6 py-4 rounded-[20px] bg-gray-50 text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Provider ID */}
          <div>
            <label className="text-xl font-bold text-gray-800 block mb-2">
              Provider
            </label>
            <div className="relative">
              <select
                disabled={loadingProviders}
                value={data.provider_id}
                onChange={(e) => setData({ provider_id: e.target.value })}
                className="w-full px-6 py-4 rounded-[20px] bg-gray-50 text-black appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
              >
                <option value="" disabled>
                  {loadingProviders ? "Loading..." : "Select Provider..."}
                </option>
                {providers.map((p) => (
                  <option key={p.provider_id} value={p.provider_id}>
                    {p.provider_id} - {p.company_name}
                  </option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                {loadingProviders ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                ) : (
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                )}
              </div>
            </div>
          </div>

          {error && <p className="text-red-500 font-semibold">{error}</p>}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-4">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="w-16 h-16 bg-white rounded-[24px] shadow-md border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition hover:-translate-x-1"
            >
              <ArrowLeft className="w-8 h-8 text-black stroke-[3px]" />
            </button>
            <button
              type="submit"
              className="w-16 h-16 bg-white rounded-[24px] shadow-md border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition hover:translate-x-1"
            >
              <ArrowRight className="w-8 h-8 text-black stroke-[3px]" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}