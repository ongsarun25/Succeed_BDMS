import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { firstName, lastName, username, password } = await request.json();

    const fakeEmail = `${username}@succeed.app`;

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      return NextResponse.json(
        { error: "ระบบทำงานผิดพลาด: ไม่พบ SUPABASE_SERVICE_ROLE_KEY ในไฟล์ .env.local โปรดตั้งค่าก่อนใช้งาน" },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey,
    );

    // 1. Create auth user with User Metadata
    // The PostgreSQL trigger (handle_new_user) will automatically copy this data to public.app_user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: fakeEmail,
      password,
      email_confirm: true, // skip email confirmation
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        username: username,
        role: 'Staff'
      }
    });

    if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });

    return NextResponse.json({ success: true, user: authData.user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unknown error occurred" }, { status: 500 });
  }
}