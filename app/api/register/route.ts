import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // ✅ server-side only, safe
);

export async function POST(request: Request) {
  const { firstName, lastName, username, password } = await request.json();

  const fakeEmail = `${username}@succeed.app`;

  // 1. Create auth user
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: fakeEmail,
    password,
    email_confirm: true, // skip email confirmation
  });

  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });

  // 2. Insert into app_user
  const { error: dbError } = await supabaseAdmin
    .from("app_user")
    .insert({
      user_id: authData.user.id,
      first_name: firstName,
      last_name: lastName,
      username,
      role: "Staff",
    });

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 });

  return NextResponse.json({ success: true });
}