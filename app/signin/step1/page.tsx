"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRegister } from "@/app/context/RegisterContext";
import Image from "next/image";
import { ArrowRight } from "lucide-react";


export default function RegisterStep1() {
  const { updateData } = useRegister();
  const router = useRouter();
  console.log("Full context:", useRegister());
  console.log("updateData type:", typeof updateData);
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");


  const handleNext = () => {
    console.log("context check:", useRegister());
    // ✅ Validate before moving
    if (!firstName || !lastName) {
      alert("Please fill in all fields");
      return;
    }
    
    // ✅ Save to context
    updateData({ firstName, lastName });
    
    // ✅ Go to step 2
    router.push("/signin/step2");
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="mb-6">
          <Image src="/logo.png" alt="Logo" width={300} height={200} priority />
        </div>

        <div className="w-full bg-white/20 backdrop-blur-md border border-white/10 shadow-2xl rounded-[40px] p-10">
          <h2 className="text-2xl font-extrabold text-black mb-6">Register</h2>

          <div className="space-y-5">
            <input
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-5 py-4 rounded-[20px] bg-white text-black placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-5 py-4 rounded-[20px] bg-white text-black placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <div className="flex justify-end pt-4">
              <button
                onClick={handleNext}
                className="p-2 bg-white rounded-xl shadow-md hover:bg-gray-100 transition"
              >
                <ArrowRight className="w-6 h-6 text-black" strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}