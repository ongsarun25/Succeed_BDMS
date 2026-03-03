'use client';

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle, Truck, User, Phone, Building2 } from "lucide-react";

import { supabase } from "@/lib/auth";

function DriverDetailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [providerName, setProviderName] = useState("Loading...");

    // ดึงข้อมูลจาก URL
    const driverName = searchParams.get('driverName') || "-";
    const driverPhone = searchParams.get('driverPhone') || "-";
    const providerId = searchParams.get('providerId') || "-";

    useEffect(() => {
        // Fetch Provider Name for display purely
        const fetchProvider = async () => {
            if (providerId !== "-") {
                const { data, error } = await supabase
                    .from('logistics_provider')
                    .select('company_name')
                    .eq('provider_id', providerId)
                    .single();
                if (data && !error) {
                    setProviderName(data.company_name);
                } else {
                    setProviderName("Unknown");
                }
            }
        };
        fetchProvider();
    }, [providerId]);

    const handleConfirm = async () => {
        setIsConfirmed(true);

        try {
            const { error } = await supabase
                .from('driver')
                .insert({
                    driver_name: driverName,
                    driver_phone: driverPhone,
                    provider_id: providerId
                });

            if (error) throw error;

            alert(`✅ Driver Added Successfully!`);
            router.push('/dashboard/shipment');
        } catch (error: any) {
            console.error("Error inserting driver:", error);
            alert("Failed to add driver: " + error.message);
            setIsConfirmed(false);
        }
    };

    return (
        <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in slide-in-from-right-8 duration-500">
            <div className="w-full max-w-3xl text-center">

                <h1 className="text-4xl md:text-5xl font-bold text-[#1a237e] mb-10 drop-shadow-sm flex justify-center items-center gap-4">
                    <Truck className="w-12 h-12 text-orange-500" />
                    New Driver Detail
                </h1>

                <div className="bg-white rounded-[32px] shadow-lg border border-gray-100 p-8 md:p-12 flex flex-col gap-8 relative text-left">

                    <div className="flex flex-col gap-6 bg-orange-50/50 p-6 md:p-8 rounded-3xl border border-orange-100">

                        {/* Driver Name */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-orange-200/50 pb-4 gap-2">
                            <span className="text-xl font-bold text-gray-500 flex items-center gap-2">
                                <User className="w-6 h-6 text-orange-500" />
                                Driver Name
                            </span>
                            <span className="text-2xl font-bold text-gray-900 text-right">
                                {driverName}
                            </span>
                        </div>

                        {/* Driver Phone */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-orange-200/50 pb-4 gap-2">
                            <span className="text-xl font-bold text-gray-500 flex items-center gap-2">
                                <Phone className="w-6 h-6 text-orange-500" />
                                Phone Number
                            </span>
                            <span className="text-2xl font-bold text-gray-900 text-right">
                                {driverPhone}
                            </span>
                        </div>

                        {/* Logistics Provider */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                            <span className="text-xl font-bold text-gray-500 flex items-center gap-2 whitespace-nowrap">
                                <Building2 className="w-6 h-6 text-orange-500 shrink-0" />
                                Provider
                            </span>
                            <div className="flex flex-col sm:text-right sm:max-w-[60%]">
                                <span className="text-xl font-bold text-gray-900 leading-relaxed">
                                    {providerName}
                                </span>
                                <span className="text-md text-gray-500 font-medium">
                                    ID: {providerId}
                                </span>
                            </div>
                        </div>

                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between items-center w-full mt-4">
                        <button
                            onClick={() => router.back()}
                            className="w-16 h-16 bg-white rounded-[24px] shadow-md border border-gray-100 flex items-center justify-center hover:bg-gray-50 hover:shadow-lg transition-all hover:-translate-x-1"
                        >
                            <ArrowLeft className="w-8 h-8 text-black stroke-[3px]" />
                        </button>

                        <button
                            onClick={handleConfirm}
                            disabled={isConfirmed}
                            className="h-16 px-8 bg-white rounded-[24px] shadow-md border border-gray-100 flex items-center gap-3 hover:bg-green-50 hover:shadow-lg hover:border-green-200 transition-all hover:translate-x-1 group disabled:opacity-50"
                        >
                            <span className="text-xl font-bold text-gray-800 group-hover:text-green-700">Confirm</span>
                            <CheckCircle className="w-8 h-8 text-black stroke-[3px] group-hover:text-green-600 transition-colors" />
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default function DriverDetailPage() {
    return (
        <Suspense fallback={<div className="text-xl font-bold text-gray-500 text-center">Loading Detail...</div>}>
            <DriverDetailContent />
        </Suspense>
    );
}
