import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function registerUser(data: {
  firstName: string
  lastName: string
  username: string
  password: string
}) {
  try {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json().catch(() => ({ error: "Server error (Invalid JSON)" }));

    if (!response.ok) return { success: false, error: result.error || "Unknown server error" };
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Network error" };
  }
}

// ✅ Login with Supabase Auth
export async function findUser(username: string, password: string) {
  const fakeEmail = `${username}@succeed.app`

  const { data, error } = await supabase.auth.signInWithPassword({
    email: fakeEmail,
    password: password,
  })

  if (error || !data.user) {
    return null
  }

  return data.user
}

// ✅ Logout
export async function logoutUser() {
  await supabase.auth.signOut()
}

// ✅ Get current session
export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}