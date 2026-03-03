"use client";
import React, { createContext, useContext, useState } from "react";

type UnloadContextType = {
    inboundOrder: any;
    setInboundOrder: (order: any) => void;
};

const UnloadContext = createContext<UnloadContextType | null>(null);

export default function UnloadProvider({ children }: { children: React.ReactNode }) {
    const [inboundOrder, setInboundOrder] = useState<any>(null);

    return (
        <UnloadContext.Provider value={{ inboundOrder, setInboundOrder }}>
            {children}
        </UnloadContext.Provider>
    );
}

export function useUnload() {
    const context = useContext(UnloadContext);
    if (!context) throw new Error("useUnload must be used within UnloadProvider");
    return context;
}
