import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ✅ Register - Supabase hashes password automatically
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
}

// ✅ Login
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

// ✅ Logout
export async function signOut() {
  await supabase.auth.signOut();
}

// ✅ Register with Supabase Auth
export async function registerUser(data: {
  firstName: string
  lastName: string
  username: string
  password: string
}) {
  // Supabase Auth requires email format
  // We convert username → fake email for storage
  const fakeEmail = `${data.username}@succeed.app`

  const { data: authData, error } = await supabase.auth.signUp({
    email: fakeEmail,
    password: data.password,
    options: {
      data: {
        first_name: data.firstName,
        last_name: data.lastName,
        username: data.username,
      }
    }
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, user: authData.user }
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