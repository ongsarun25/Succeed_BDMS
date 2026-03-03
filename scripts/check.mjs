import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yelaqhtyjfmlmgijuawp.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllbGFxaHR5amZtbG1naWp1YXdwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDcyMjc5NywiZXhwIjoyMDg2Mjk4Nzk3fQ.PUAott-X_t90YMiPSXzIp9ZLvlFZRcHCPfZY0NV98d4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: parts } = await supabase.from('part_master').select('part_id');
    console.log("Parts:", parts);

    const { data: locs } = await supabase.from('location').select('location_id');
    console.log("Locations:", locs);
}
check();
