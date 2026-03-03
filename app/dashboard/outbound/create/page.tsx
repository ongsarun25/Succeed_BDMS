'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, UploadCloud } from "lucide-react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { supabase } from "@/lib/auth";
import { useEffect } from "react";

type ExcelItem = {
  PartID?: string;
  ['Part ID']?: string;
  part_id?: string;
  Qty?: number;
  qty?: number;
};

export default function CreateOutboundPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [customerId, setCustomerId] = useState("");
  const [shipmentId, setShipmentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }

      const { data } = await supabase
        .from('app_user')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (!data || data.role !== 'Manager') {
        alert("Access Denied: คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (เฉพาะผู้จัดการเท่านั้น)");
        router.push('/dashboard/outbound');
      } else {
        setRoleLoading(false);
      }
    };

    checkRole();
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !shipmentId) {
      alert("Please fill in Customer ID and Shipment ID");
      return;
    }
    if (!file) {
      alert("Please upload an excel file containing Part IDs and Qty.");
      return;
    }

    setLoading(true);

    try {
      // 1. Read Excel
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Use header: 1 to get a 2D array of rows, so we don't rely on specific column names
      const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (rows.length === 0) {
        alert("The uploaded file is empty.");
        setLoading(false);
        return;
      }

      // Convert rows back into ExcelItem format.
      // We assume Part ID is in the first column (index 0) and Qty is in the second (index 1) or third (index 2).
      // If the first row contains text like "Part", we skip it as a header.
      const items: ExcelItem[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        // Check if first row is a header
        if (i === 0 && typeof row[0] === 'string' && (row[0].toLowerCase().includes('part') || row[0].toLowerCase().includes('id'))) {
          continue; // Skip header row
        }

        const partId = String(row[0] || '').trim();
        // The image showed qty might be in column C (index 2) or B (index 1)
        // Let's check which column has the number
        let rawQty = row[1];
        if (rawQty === undefined && row.length > 2) {
          rawQty = row[2];
        }

        const reqQty = Number(rawQty);

        if (partId && !isNaN(reqQty) && reqQty > 0) {
          items.push({ PartID: partId, Qty: reqQty });
        }
      }

      if (items.length === 0) {
        alert("No valid Part ID and Quantity rows found. Please check your Excel format.");
        setLoading(false);
        return;
      }

      // 2. Generate Outbound ID
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const newOutboundId = `OUT-${dateStr}-${randomNum}`;

      const reservedSerials: string[] = [];

      // 3. Find available stock for each Part ID
      for (const item of items) {
        const partId = item.PartID || item['Part ID'] || item.part_id;
        const reqQty = Number(item.Qty || item.qty);

        if (!partId || isNaN(reqQty) || reqQty <= 0) continue;

        // Query available stock for this part
        const { data: availableStock, error: stockError } = await supabase
          .from('current_stock')
          .select(`
            serial_no,
            part_obj!inner(part_id)
          `)
          .eq('status', 'Available')
          .eq('part_obj.part_id', partId)
          .limit(reqQty);

        if (stockError) {
          throw new Error(`Error fetching stock for ${partId}: ${stockError.message}`);
        }

        if (!availableStock || availableStock.length < reqQty) {
          throw new Error(`Not enough available stock for Part: ${partId}. Requested: ${reqQty}, Available: ${availableStock?.length || 0}`);
        }

        // Add to reservation list
        availableStock.forEach(stock => {
          reservedSerials.push(stock.serial_no);
        });
      }

      // 4. Create Outbound Order (Header)
      const { error: headerError } = await supabase
        .from('outbound_order')
        .insert({
          outbound_id: newOutboundId,
          order_date: new Date().toISOString().split('T')[0],
          customer_id: customerId,
          shipment_id: shipmentId,
          outstatus: 'Pending',
          pod_status: 'Pending'
        });

      if (headerError) throw headerError;

      // 5. Create Outbound Details (Line Items)
      const detailsToInsert = reservedSerials.map(serial => ({
        outbound_id: newOutboundId,
        serial_no: serial,
        // Trigger `trg_outbound_stock_update` will automatically set current_stock.status to 'In Transit'
      }));

      const { error: detailsError } = await supabase
        .from('outbound_detail')
        .insert(detailsToInsert);

      if (detailsError) throw detailsError;

      alert(`✅ Created Outbound Order: ${newOutboundId} successfully! Automatically reserved ${reservedSerials.length} items.`);
      router.push('/dashboard/outbound/order');

    } catch (err: any) {
      console.error(err);
      alert(`Error creating order: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (roleLoading) {
    return (
      <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium text-lg">Verifying Access Level...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold text-[#1a237e] mb-12 text-center drop-shadow-sm flex items-center justify-center gap-4">
          <UploadCloud className="w-12 h-12 text-blue-600" />
          Create Outbound Order
        </h1>

        <form onSubmit={handleCreateOrder} className="bg-white rounded-[32px] p-8 md:p-10 shadow-lg border border-gray-100 flex flex-col relative">

          {loading && (
            <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center rounded-[32px]">
              <Loader2 className="w-12 h-12 text-[#1a237e] animate-spin mb-4" />
              <p className="text-lg font-medium text-gray-600">Processing Order & Reserving Stock...</p>
            </div>
          )}

          <div className="space-y-8">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-lg font-bold text-gray-900 mb-2 ml-2 block">Customer ID</label>
                <input
                  type="text"
                  required
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  placeholder="e.g. CUST-001"
                  className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-lg transition-all"
                />
              </div>

              <div>
                <label className="text-lg font-bold text-gray-900 mb-2 ml-2 block">Shipment ID</label>
                <input
                  type="text"
                  required
                  value={shipmentId}
                  onChange={(e) => setShipmentId(e.target.value)}
                  placeholder="e.g. SHIP-001"
                  className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-lg transition-all"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <label className="text-lg font-bold text-gray-900 mb-2 ml-2 block flex justify-between items-center">
                <span>Excel Item List</span>
                <a href="#" className="text-sm text-blue-500 hover:underline font-medium">Download Template</a>
              </label>

              <div className="relative">
                <input
                  type="file"
                  id="excel-upload"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="excel-upload"
                  className="w-full px-6 py-8 bg-gray-50 rounded-[24px] border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 focus-within:ring-4 focus-within:ring-blue-100 transition-all flex flex-col items-center justify-center cursor-pointer min-h-[140px] group"
                >
                  <UploadCloud className={`w-10 h-10 mb-3 ${file ? 'text-blue-500' : 'text-gray-400 group-hover:text-blue-400'} transition-colors`} />
                  <span className={`text-lg text-center ${file ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
                    {file ? file.name : "Click to attach Excel file (.xlsx)"}
                  </span>
                  {!file && <span className="text-sm text-gray-400 mt-1">Columns config: PartID, Qty</span>}
                </label>
              </div>
            </div>

          </div>

          <div className="flex justify-between items-center mt-12">
            <Link
              href="/dashboard/outbound"
              className="w-16 h-16 bg-white rounded-[24px] shadow-md border border-gray-100 flex items-center justify-center hover:bg-gray-50 hover:shadow-lg transition-all hover:-translate-x-1"
            >
              <ArrowLeft className="w-8 h-8 text-black stroke-[3px]" />
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="h-16 px-8 bg-blue-600 rounded-[24px] shadow-md border border-blue-500 flex items-center gap-3 hover:bg-blue-700 hover:shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale"
            >
              <span className="text-xl font-bold text-white">Process Order</span>
              <Save className="w-6 h-6 text-white" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}