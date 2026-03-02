import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function WelcomePage() {
  return (
    // 👇 เพิ่ม div คลุมด้านนอกสุดแบบเดียวกับหน้า Login และ Sign In
    <div className="w-full flex-1 flex flex-col items-center justify-center min-h-[80vh]">
      
      <div className="w-full max-w-3xl flex flex-col items-center">
        {/* Glass Card for Welcome */}
        <div className="w-full bg-white/30 backdrop-blur-md border border-white/20 shadow-2xl rounded-[40px] p-16 flex flex-col md:flex-row items-center justify-center gap-6">
          <span className="text-6xl font-normal text-white drop-shadow-sm">
            Welcome to
          </span>
          <Image src="/logo.png" alt="Succeed Logo" width={280} height={100} priority className="mt-2 md:mt-0" />
        </div>

        {/* Bottom Button */}
        <div className="mt-8">
          <Link href="/dashboard" className="block p-4 bg-white rounded-[1rem] shadow-lg hover:scale-105 transition-transform">
            <ArrowRight className="w-8 h-8 text-black" strokeWidth={4} />
          </Link>
        </div>
      </div>
      
    </div>
  );
}