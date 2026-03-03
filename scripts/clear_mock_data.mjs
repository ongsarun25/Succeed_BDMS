import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yelaqhtyjfmlmgijuawp.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllbGFxaHR5amZtbG1naWp1YXdwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDcyMjc5NywiZXhwIjoyMDg2Mjk4Nzk3fQ.PUAott-X_t90YMiPSXzIp9ZLvlFZRcHCPfZY0NV98d4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearData() {
    console.log("Starting data cleanup...");

    const tablesToDelete = [
        'inbound_detail',
        'outbound_detail',
        'current_stock',
        'inbound_plan',
        'inbound_order',
        'outbound_order',
        'part_obj'
    ];

    for (const table of tablesToDelete) {
        console.log(`Clearing ${table}...`);
        // Using neq to dummy UUID/String to effectively delete all rows, because delete() requires a filter.
        const { error } = await supabase.from(table).delete().neq('created_at', '0001-01-01T00:00:00.000Z');
        if (error) {
            console.error(`Error clearing ${table}:`, error.message);
        } else {
            console.log(`✅ Cleared ${table}`);
        }
    }

    console.log("Cleanup complete!");
}

clearData();
