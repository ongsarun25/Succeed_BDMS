'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Truck, Loader2 } from "lucide-react";
import { supabase } from "@/lib/auth";

export default function AddDriverPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        driverName: "",
        driverPhone: "",
        providerId: "",
    });

    const [providers, setProviders] = useState<any[]>([]);
    const [loadingProviders, setLoadingProviders] = useState(true);

    useEffect(() => {
        const fetchProviders = async () => {
            try {
                const { data, error } = await supabase.from('logistics_provider').select('provider_id, company_name');
                if (error) throw error;
                if (data) setProviders(data);
            } catch (err) {
                console.error("Error fetching providers:", err);
            } finally {
                setLoadingProviders(false);
            }
        };
        fetchProviders();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.driverName || !formData.driverPhone || !formData.providerId) {
            alert("Please fill in all fields.");
            return;
        }

        const queryParams = new URLSearchParams({
            driverName: formData.driverName,
            driverPhone: formData.driverPhone,
            providerId: formData.providerId,
        }).toString();

        router.push(`/dashboard/shipment/driver/create?${queryParams}`);
    };

    return (
        <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="w-full max-w-2xl">

                <h1 className="text-4xl md:text-5xl font-bold text-[#1a237e] mb-12 text-center drop-shadow-sm flex justify-center items-center gap-4">
                    <Truck className="w-12 h-12 text-orange-500" />
                    Add New Driver
                </h1>

                <form onSubmit={handleNext} className="relative">
                    <div className="space-y-6 max-w-xl mx-auto">

                        {/* Driver Name */}
                        <div>
                            <label className="text-xl font-bold text-gray-900 mb-2 ml-2 block">
                                Driver Name
                            </label>
                            <input
                                type="text"
                                name="driverName"
                                value={formData.driverName}
                                onChange={handleChange}
                                placeholder="e.g. Somchai Jaidee"
                                className="w-full px-6 py-4 bg-white rounded-3xl shadow-sm border border-gray-100 focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all text-lg min-h-[64px] text-gray-800"
                                autoFocus
                            />
                        </div>

                        {/* Driver Phone */}
                        <div>
                            <label className="text-xl font-bold text-gray-900 mb-2 ml-2 block">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                name="driverPhone"
                                value={formData.driverPhone}
                                onChange={handleChange}
                                placeholder="e.g. 081-234-5678"
                                className="w-full px-6 py-4 bg-white rounded-3xl shadow-sm border border-gray-100 focus:outline-none focus:ring-4 focus:ring-orange-100 transition-all text-lg min-h-[64px] text-gray-800"
                            />
                        </div>

                        {/* Provider ID Selection */}
                        <div>
                            <label className="text-xl font-bold text-gray-900 mb-2 ml-2 block">
                                Logistics Provider
                            </label>
                            <div className="relative">
                                <select
                                    name="providerId"
                                    disabled={loadingProviders}
                                    value={formData.providerId}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 rounded-3xl bg-white shadow-sm border border-gray-100 text-black appearance-none focus:outline-none focus:ring-4 focus:ring-orange-100 min-h-[64px] text-lg disabled:opacity-50"
                                >
                                    <option value="" disabled>
                                        {loadingProviders ? "Loading providers..." : "Select a Provider..."}
                                    </option>
                                    {providers.map((p) => (
                                        <option key={p.provider_id} value={p.provider_id}>
                                            {p.provider_id} - {p.company_name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                                    {loadingProviders ? (
                                        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                                    ) : (
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="flex justify-between items-center mt-12 px-4">
                        <button
                            type="button"
                            onClick={() => router.push('/dashboard/shipment')}
                            className="w-16 h-16 bg-white rounded-[24px] shadow-md border border-gray-100 flex items-center justify-center hover:bg-gray-50 hover:shadow-lg transition-all hover:-translate-x-1"
                        >
                            <ArrowLeft className="w-8 h-8 text-black stroke-[3px]" />
                        </button>

                        <button
                            type="submit"
                            className="w-16 h-16 bg-white rounded-[24px] shadow-md border border-gray-100 flex items-center justify-center hover:bg-gray-50 hover:shadow-lg transition-all hover:translate-x-1"
                        >
                            <ArrowRight className="w-8 h-8 text-black stroke-[3px]" />
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
