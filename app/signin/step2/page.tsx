"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRegister } from "@/app/context/RegisterContext";
import { registerUser } from "@/lib/auth";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function RegisterStep2() {
  const { data, updateData } = useRegister();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    // ✅ Validate
    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    // ✅ Call register function
    const result = await registerUser({
      firstName: data.firstName,
      lastName: data.lastName,
      username: username,
      password: password
    });

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    // ✅ Success → go to login
    router.push("/");
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="mb-6">
          <Image src="/logo.png" alt="Logo" width={300} height={200} priority />
        </div>

        <div className="w-full bg-white/20 backdrop-blur-md border border-white/10 shadow-2xl rounded-[40px] p-10">
          <h2 className="text-2xl font-extrabold text-black mb-6">Register</h2>

          <div className="space-y-5">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-5 py-4 rounded-[20px] bg-white text-black placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 rounded-[20px] bg-white text-black placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            {/* ✅ Show error if any */}
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <div className="flex justify-end pt-4">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="p-2 bg-white rounded-xl shadow-md hover:bg-gray-100 transition"
              >
                {loading ? (
                  <span className="text-sm text-gray-500">Loading...</span>
                ) : (
                  <ArrowRight className="w-6 h-6 text-black" strokeWidth={3} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}