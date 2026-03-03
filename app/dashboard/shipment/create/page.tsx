'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarClock, Loader2, PackageOpen } from "lucide-react";
import { supabase } from "@/lib/auth";

export default function CreateShipmentPage() {
    const router = useRouter();

    const [formData, setFormData] = useState({
        licensePlate: "",
        departDate: "",
        departTime: "",
        driverId: "",
    });

    const [drivers, setDrivers] = useState<any[]>([]);
    const [loadingDrivers, setLoadingDrivers] = useState(true);

    useEffect(() => {
        const fetchDrivers = async () => {
            try {
                const { data, error } = await supabase
                    .from('driver')
                    .select(`
            driver_id, 
            driver_name,
            logistics_provider ( company_name )
          `);
                if (error) throw error;
                if (data) {
                    const formatted = data.map((d: any) => ({
                        id: d.driver_id,
                        name: d.driver_name,
                        provider: d.logistics_provider?.company_name || "Unknown Provider"
                    }));
                    setDrivers(formatted);
                }
            } catch (err) {
                console.error("Error fetching drivers:", err);
            } finally {
                setLoadingDrivers(false);
            }
        };
        fetchDrivers();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.licensePlate || !formData.departDate || !formData.departTime || !formData.driverId) {
            alert("Please fill in all fields.");
            return;
        }

        // Combine Date and Time into a proper ISO string roughly
        const combinedDateTime = `${formData.departDate}T${formData.departTime}:00`;

        const queryParams = new URLSearchParams({
            licensePlate: formData.licensePlate,
            departTime: combinedDateTime,
            driverId: formData.driverId,
        }).toString();

        router.push(`/dashboard/shipment/create/detail?${queryParams}`);
    };

    return (
        <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="w-full max-w-2xl">

                <h1 className="text-4xl md:text-5xl font-bold text-[#1a237e] mb-12 text-center drop-shadow-sm flex justify-center items-center gap-4">
                    <PackageOpen className="w-12 h-12 text-indigo-500" />
                    Create Shipment Run
                </h1>

                <form onSubmit={handleNext} className="relative">
                    <div className="space-y-6 max-w-xl mx-auto">

                        {/* License Plate */}
                        <div>
                            <label className="text-xl font-bold text-gray-900 mb-2 ml-2 block">
                                Truck License Plate
                            </label>
                            <input
                                type="text"
                                name="licensePlate"
                                value={formData.licensePlate}
                                onChange={handleChange}
                                placeholder="e.g. 1AB-2345 Bangkok"
                                className="w-full px-6 py-4 bg-white rounded-3xl shadow-sm border border-gray-100 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all text-lg min-h-[64px] text-gray-800"
                                autoFocus
                            />
                        </div>

                        {/* Depart Date & Time */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xl font-bold text-gray-900 mb-2 ml-2 block">
                                    Depart Date
                                </label>
                                <input
                                    type="date"
                                    name="departDate"
                                    value={formData.departDate}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 bg-white rounded-3xl shadow-sm border border-gray-100 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all text-lg min-h-[64px] text-gray-800"
                                />
                            </div>
                            <div>
                                <label className="text-xl font-bold text-gray-900 mb-2 ml-2 block">
                                    Depart Time
                                </label>
                                <input
                                    type="time"
                                    name="departTime"
                                    value={formData.departTime}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 bg-white rounded-3xl shadow-sm border border-gray-100 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all text-lg min-h-[64px] text-gray-800"
                                />
                            </div>
                        </div>

                        {/* Driver Selection */}
                        <div>
                            <label className="text-xl font-bold text-gray-900 mb-2 ml-2 block">
                                Assigned Driver
                            </label>
                            <div className="relative">
                                <select
                                    name="driverId"
                                    disabled={loadingDrivers}
                                    value={formData.driverId}
                                    onChange={handleChange}
                                    className="w-full px-6 py-4 rounded-3xl bg-white shadow-sm border border-gray-100 text-black appearance-none focus:outline-none focus:ring-4 focus:ring-indigo-100 min-h-[64px] text-lg disabled:opacity-50"
                                >
                                    <option value="" disabled>
                                        {loadingDrivers ? "Loading drivers..." : "Select a Driver..."}
                                    </option>
                                    {drivers.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.name} ({d.provider})
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                                    {loadingDrivers ? (
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
