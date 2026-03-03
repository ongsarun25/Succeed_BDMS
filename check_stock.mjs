import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yelaqhtyjfmlmgijuawp.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllbGFxaHR5amZtbG1naWp1YXdwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDcyMjc5NywiZXhwIjoyMDg2Mjk4Nzk3fQ.PUAott-X_t90YMiPSXzIp9ZLvlFZRcHCPfZY0NV98d4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStock() {
    const { data: stockData, error: stockErr } = await supabase.from('current_stock').select('*').limit(20);
    console.log('Stock Data:', stockData);
    if (stockErr) console.error(stockErr);

    const { data: detailData, error: detailErr } = await supabase.from('inbound_detail').select('*').limit(20);
    console.log('Inbound Detail Data:', detailData);
    if (detailErr) console.error(detailErr);
}

checkStock();
