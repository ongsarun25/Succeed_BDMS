import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase.from('outbound_detail').select('*').limit(1);
    console.log("Data:", data);
    console.log("Error:", error);

    const { data: d2, error: e2 } = await supabase.from('outbound_plan').select('*').limit(1);
    console.log("Plan error:", e2);
}

check();
