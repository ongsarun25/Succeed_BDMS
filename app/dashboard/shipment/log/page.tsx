'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Truck, MapPin, CalendarClock, User } from "lucide-react";
import { supabase } from "@/lib/auth";

type ShipmentData = {
    shipment_id: string;
    license_plate: string;
    depart_time: string;
    driver_name: string;
    provider_name: string;
};

export default function ActiveShipmentsLogPage() {
    const router = useRouter();
    const [shipments, setShipments] = useState<ShipmentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchShipments();
    }, []);

    const fetchShipments = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('shipment')
                .select(`
          shipment_id,
          license_plate,
          depart_time,
          driver!inner (
            driver_name,
            logistics_provider!inner ( company_name )
          )
        `)
                .order('depart_time', { ascending: false });

            if (error) throw error;

            if (data) {
                const formatted: ShipmentData[] = data.map((s: any) => ({
                    shipment_id: s.shipment_id,
                    license_plate: s.license_plate,
                    depart_time: s.depart_time,
                    driver_name: s.driver.driver_name,
                    provider_name: s.driver.logistics_provider.company_name,
                }));
                setShipments(formatted);
            }
        } catch (err) {
            console.error("Error fetching shipments:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredShipments = shipments.filter(s =>
        s.shipment_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.license_plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.driver_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.provider_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full h-full p-6 max-w-7xl mx-auto flex flex-col gap-6 animate-in slide-in-from-right-8 duration-500">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/dashboard/shipment')}
                        className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-700 stroke-[3px]" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-[#1a237e] flex items-center gap-3">
                            <Truck className="w-8 h-8 text-blue-500" />
                            Active Shipments Log
                        </h1>
                        <p className="text-gray-500 font-medium mt-1 ml-11">
                            Monitor all created and running shipments
                        </p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-[350px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by ID, plate, or driver..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-200 focus:bg-white rounded-2xl outline-none transition-all text-gray-700 font-medium placeholder:text-gray-400"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 md:p-8 min-h-[500px]">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 font-medium animate-pulse">
                        Loading shipments...
                    </div>
                ) : filteredShipments.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 font-medium">
                        No shipments found.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredShipments.map((shipment) => (
                            <div
                                key={shipment.shipment_id}
                                className="bg-gray-50 rounded-[28px] p-6 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                            Run ID
                                        </span>
                                        <h3 className="text-xl font-bold text-gray-900 mt-2">
                                            {shipment.shipment_id}
                                        </h3>
                                    </div>
                                    <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm text-gray-600 font-bold group-hover:text-blue-600 transition-colors">
                                        {shipment.license_plate}
                                    </div>
                                </div>

                                <div className="space-y-3 mt-6">
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                                            <User className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Driver</p>
                                            <p className="font-semibold text-gray-800">{shipment.driver_name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-gray-600">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                                            <MapPin className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Logistics Company</p>
                                            <p className="font-semibold text-gray-800">{shipment.provider_name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-gray-600">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                                            <CalendarClock className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Depart Time</p>
                                            <p className="font-semibold text-gray-800">
                                                {new Date(shipment.depart_time).toLocaleString('en-GB', {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div >
    );
}
