"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/auth";
import Image from "next/image";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        username: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.firstName || !form.lastName || !form.username || !form.password) {
            setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
            return;
        }

        setLoading(true);
        setError("");

        const result = await registerUser(form);

        setLoading(false);

        if (result.error) {
            setError(result.error);
            return;
        }

        // Success → Redirect to login page
        alert("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
        router.push("/");
    };

    return (
        <div className="w-full flex-1 flex flex-col items-center justify-center min-h-[80vh]">
            <div className="w-full max-w-md flex flex-col items-center">
                <div className="mb-6">
                    <Image src="/logo.png" alt="Logo" width={300} height={200} priority />
                </div>

                <div className="w-full bg-white/20 backdrop-blur-md border border-white/10 shadow-2xl rounded-[40px] p-10">
                    <h2 className="text-2xl font-extrabold text-black mb-6">สมัครสมาชิก (Register)</h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="flex gap-4">
                            <input
                                type="text"
                                name="firstName"
                                placeholder="ชื่อ (First Name)"
                                value={form.firstName}
                                onChange={handleChange}
                                className="w-full px-5 py-4 rounded-[20px] bg-white text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <input
                                type="text"
                                name="lastName"
                                placeholder="นามสกุล (Last Name)"
                                value={form.lastName}
                                onChange={handleChange}
                                className="w-full px-5 py-4 rounded-[20px] bg-white text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>

                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={form.username}
                            onChange={handleChange}
                            className="w-full px-5 py-4 rounded-[20px] bg-white text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />

                        <input
                            type="password"
                            name="password"
                            placeholder="Password (อย่างน้อย 6 ตัวอักษร)"
                            value={form.password}
                            onChange={handleChange}
                            className="w-full px-5 py-4 rounded-[20px] bg-white text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />

                        {error && (
                            <p className="text-red-500 text-sm font-semibold text-center bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>
                        )}

                        <div className="flex justify-between items-center pt-4">
                            <Link
                                href="/"
                                className="px-6 py-2 bg-white rounded-full text-sm font-semibold text-gray-600 shadow-md hover:bg-gray-50 transition"
                            >
                                ย้อนกลับ
                            </Link>

                            <button
                                type="submit"
                                disabled={loading}
                                className="p-3 bg-blue-600 rounded-xl shadow-md hover:bg-blue-700 transition flex items-center justify-center disabled:opacity-50 disabled:bg-gray-400"
                            >
                                {loading ? (
                                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                                ) : (
                                    <ArrowRight className="w-6 h-6 text-white" strokeWidth={3} />
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
