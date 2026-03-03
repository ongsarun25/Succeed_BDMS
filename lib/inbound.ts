import { supabase } from "./supabase"
export type InboundOrder = {
  inbound_id: string;
  invoice_no: string;
  arrival_date: string;
  status: string;
  container_no: string;
  provider_id: string;
};

export async function findInboundOrder(inboundId: string): Promise<InboundOrder | null> {
  const { data, error } = await supabase
    .from("inbound_order")
    .select("*")
    .eq("inbound_id", inboundId.trim())
    .single()

  if (error || !data) {
    console.error("Inbound fetch error:", error?.message)
    return null
  }

  return data as InboundOrder
}

export type InboundPart = {
  in_detail_id: string
  serial_no: string
  condition: string
  damage_image_url: string
  time_received_by: string
  part_name: string
  part_id: string
  uom: string
}

export async function fetchInboundParts(inboundId: string): Promise<InboundPart[]> {
  const { data, error } = await supabase
    .from("inbound_detail")
    .select(`
      in_detail_id,
      serial_no,
      condition,
      damage_image_url,
      time_received_by,
      part_obj (
        part_id,
        part_master (
          part_name,
          uom
        )
      )
    `)
    .eq("inbound_id", inboundId)

  if (error || !data) {
    console.error("Fetch parts error:", error?.message)
    return []
  }

  return data.map((row: any) => ({
    in_detail_id: row.in_detail_id,
    serial_no: row.serial_no,
    condition: row.condition,
    damage_image_url: row.damage_image_url ?? "",
    time_received_by: row.time_received_by ?? "",
    part_id: row.part_obj?.part_id ?? "-",
    part_name: row.part_obj?.part_master?.part_name ?? "-",
    uom: row.part_obj?.part_master?.uom ?? "-",
  }))
}

export async function updatePartConditions(
  updates: { in_detail_id: string; condition: string }[],
  inbound_id: string  // ← add this parameter
): Promise<{ success: boolean; error?: string }> {

  // 1. Update all part conditions in parallel
  const results = await Promise.all(
    updates.map(({ in_detail_id, condition }) =>
      supabase
        .from("inbound_detail")
        .update({ condition })
        .eq("in_detail_id", in_detail_id)
    )
  )

  const failed = results.find(({ error }) => error)
  if (failed?.error) {
    console.error("Update error:", failed.error.message)
    return { success: false, error: failed.error.message }
  }

  // 2. Mark inbound_order as Completed
  console.log("🔵 Updating status for inbound_id:", inbound_id)
  const { data: statusData, error: statusError } = await supabase
    .from("inbound_order")
    .update({ status: "Completed" })
    .eq("inbound_id", inbound_id)
    .select()  // ← add this to force response

  console.log("🟢 Status update result:", statusData)  // ← add this
  console.log("🔴 Status update error:", statusError)  // ← add this

  if (statusError) {
    console.error("Status update error:", statusError.message)
    return { success: false, error: statusError.message }
  }

  return { success: true }
}

export async function createInboundOrder(input: {
  container_no: string
  provider_id: string
  parts: { part_id: string; quantity: number; invoice_no: string }[]
}): Promise<{ success: boolean; inbound_id?: string; error?: string }> {

  // 1. Generate running inbound_id
  const now = new Date()
  const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`

  const { data: latest } = await supabase
    .from("inbound_order")
    .select("inbound_id")
    .like("inbound_id", `INB-${yyyymm}%`)
    .order("inbound_id", { ascending: false })
    .limit(1)

  const lastNum = latest?.[0]?.inbound_id
    ? parseInt(latest[0].inbound_id.split("-")[2])
    : 0
  const newNum = String(lastNum + 1).padStart(4, "0")
  const inbound_id = `INB-${yyyymm}-${newNum}`

  // 2. Insert into inbound_order (Draft Plan)
  const { error: orderError } = await supabase
    .from("inbound_order")
    .insert({
      inbound_id,
      invoice_no: input.parts[0]?.invoice_no ?? "",
      arrival_date: new Date().toISOString().split("T")[0],
      container_no: input.container_no,
      provider_id: input.provider_id,
      status: "Draft Plan", // Changed from "Pending" to signify it's just a plan
    })

  if (orderError) {
    console.error("Order insert error:", orderError.message)
    return { success: false, error: orderError.message }
  }

  // 3. Insert into inbound_plan
  const plans = input.parts.map((p) => ({
    inbound_id,
    part_id: p.part_id,
    expected_qty: p.quantity,
  }))

  const { error: planError } = await supabase
    .from("inbound_plan")
    .insert(plans)

  if (planError) {
    console.error("Plan insert error:", planError.message)
    return { success: false, error: planError.message }
  }

  return { success: true, inbound_id }
}