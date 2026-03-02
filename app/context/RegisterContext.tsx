// /context/RegisterContext.tsx
"use client";
import { createContext, useContext, useState } from "react";

type RegisterData = {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
};

type RegisterContextType = {
  data: RegisterData;
  updateData: (newData: Partial<RegisterData>) => void;
};

const RegisterContext = createContext<RegisterContextType | null>(null);

export function RegisterProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<RegisterData>({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
  });

  const updateData = (newData: Partial<RegisterData>) => {
    setData((prev) => ({ ...prev, ...newData }));
  };

  console.log("Provider rendering, updateData:", typeof updateData);

  return (
    <RegisterContext.Provider value={{ data, updateData }}>
      {children}
    </RegisterContext.Provider>
  );
}

export function useRegister() {
  const context = useContext(RegisterContext);
  console.log("Context data:", context);
  console.log("Data:", context?.data);
  if (!context) throw new Error("useRegister must be used within RegisterProvider");
  return context;
}