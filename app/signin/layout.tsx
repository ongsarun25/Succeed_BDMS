// app/signin/layout.tsx
"use client";
import { RegisterProvider } from "@/app/context/RegisterContext";

export default function SigninLayout({ children }: { children: React.ReactNode }) {
  return (
    <RegisterProvider>
      {children}
    </RegisterProvider>
  );
}