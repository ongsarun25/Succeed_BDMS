"use client";
import React, { createContext, useContext, useState } from "react";

type InboundDataType = {
    parts: any[];
    container_no: string;
    provider_id: string;
};

type InboundCreateContextType = {
    data: InboundDataType;
    setData: (update: Partial<InboundDataType>) => void;
};

const InboundCreateContext = createContext<InboundCreateContextType | null>(null);

export default function InboundCreateProvider({ children }: { children: React.ReactNode }) {
    const [data, setInternalData] = useState<InboundDataType>({
        parts: [],
        container_no: "",
        provider_id: "",
    });

    const setData = (update: Partial<InboundDataType>) => {
        setInternalData((prev) => ({ ...prev, ...update }));
    };

    return (
        <InboundCreateContext.Provider value={{ data, setData }}>
            {children}
        </InboundCreateContext.Provider>
    );
}

export function useInboundCreate() {
    const context = useContext(InboundCreateContext);
    if (!context) throw new Error("useInboundCreate must be used within InboundCreateProvider");
    return context;
}
