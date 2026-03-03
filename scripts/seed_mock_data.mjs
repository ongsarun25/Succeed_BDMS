import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yelaqhtyjfmlmgijuawp.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllbGFxaHR5amZtbG1naWp1YXdwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDcyMjc5NywiZXhwIjoyMDg2Mjk4Nzk3fQ.PUAott-X_t90YMiPSXzIp9ZLvlFZRcHCPfZY0NV98d4';

const supabase = createClient(supabaseUrl, supabaseKey);

const parts = [
    'AC-9000', 'COMP-001', 'AC-COMP-12K', 'AC-COMP-18K', 'AC-COMP-24K',
    'AC-FAN-IN', 'AC-FAN-OUT', 'AC-PCB-INV', 'AC-FIL-STD', 'AC-SEN-01',
    'RF-COMP-INV', 'RF-PCB-MAIN', 'RF-DOOR-GKS', 'RF-LAMP-LED', 'RF-FAN-FRZ',
    'WM-MTR-DRV', 'WM-PCB-MAIN', 'WM-PMP-DRN', 'WM-BLT-STD', 'WM-VLV-IN',
    'TV-SCR-55', 'TV-SCR-65', 'TV-PCB-SMT', 'TV-SPK-01', 'MW-MAG-800W',
    'MW-PLT-GLS', 'HA-CBL-2M'
];

const racks = ['SHELF-A1', 'A-01-01', 'A-01-02', 'B-01-01', 'B-01-02', 'PK-A-01', 'PK-B-01'];
const dockLoc = 'DOCK-01';
const qaLoc = 'QA-01';

async function generateMockData() {
    console.log("Generating fresh mock data for testing Current Stock...");

    const stockItems = [];
    const partObjects = [];

    // Check max numeric serial
    const { data: maxObj } = await supabase.from('part_obj').select('serial_no').order('serial_no', { ascending: false }).limit(1);
    let startSn = 4000;
    if (maxObj && maxObj.length > 0 && maxObj[0].serial_no) {
        const match = maxObj[0].serial_no.match(/\d+/);
        if (match) startSn = parseInt(match[0]) + 1;
    }

    for (let i = 1; i <= 100; i++) {
        const randStatus = Math.random();
        let status = 'Available';
        let condition = 'Good';
        let location = racks[Math.floor(Math.random() * racks.length)];

        if (randStatus < 0.15) {
            status = 'Receiving';
            location = dockLoc;
        } else if (randStatus < 0.25) {
            status = 'Quarantine';
            condition = 'Damaged';
            location = qaLoc;
        } else if (randStatus < 0.35) {
            status = 'In Transit';
            condition = 'Good';
            location = null;
        }

        const serialNo = `SN-${startSn + i}`;
        const partId = parts[Math.floor(Math.random() * parts.length)];

        partObjects.push({ serial_no: serialNo, part_id: partId });
        stockItems.push({
            serial_no: serialNo,
            condition: condition,
            location_id: location,
            status: status
        });
    }

    console.log("Inserting Part Objects...");
    const { error: poErr } = await supabase.from('part_obj').insert(partObjects);
    if (poErr) return console.error("Error inserting part objects:", poErr.message);

    console.log("Inserting Current Stock...");
    const { error: csErr } = await supabase.from('current_stock').insert(stockItems);
    if (csErr) return console.error("Error inserting current stock:", csErr.message);

    console.log(`✅ Mock data generation complete! Inserted 100 items starting from SN-${startSn + 1}.`);
}

generateMockData();
