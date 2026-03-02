'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import { 
  Package, 
  Truck, 
  ClipboardCheck, 
  ArrowRightLeft, 
  Boxes, 
  Search, 
  PackagePlus 
} from "lucide-react";

export default function InboundMenuPage() {
  const router = useRouter();

  // ✅ Session Protection
  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (!session) {
        router.push("/");
      }
    };
    checkSession();
  }, [router]);

  const menuItems = [
    {
      title: "Unload",
      description: "Unload items from vehicles",
      icon: <Truck className="w-10 h-10 mb-4 text-blue-600" />,
      href: "/dashboard/unload",
      color: "hover:border-blue-500 hover:shadow-blue-100"
    },
    {
      title: "Confirmation",
      description: "Confirm received items",
      icon: <ClipboardCheck className="w-10 h-10 mb-4 text-emerald-600" />,
      href: "/inbound/confirmation",
      color: "hover:border-emerald-500 hover:shadow-emerald-100"
    },
    {
      title: "Transfer",
      description: "Transfer items to locations",
      icon: <ArrowRightLeft className="w-10 h-10 mb-4 text-orange-600" />,
      href: "/inbound/transfer",
      color: "hover:border-orange-500 hover:shadow-orange-100"
    },
    {
      title: "Inventory",
      description: "Check inbound inventory",
      icon: <Boxes className="w-10 h-10 mb-4 text-indigo-600" />,
      href: "/inbound/inventory",
      color: "hover:border-indigo-500 hover:shadow-indigo-100"
    },
    {
      title: "Inspect",
      description: "Inspect item conditions",
      icon: <Search className="w-10 h-10 mb-4 text-pink-600" />,
      href: "/inbound/inspect",
      color: "hover:border-pink-500 hover:shadow-pink-100"
    },
    {
      title: "Create Inbound",
      description: "Create new inbound orders", 
      icon: <PackagePlus className="w-10 h-10 mb-4 text-purple-600" />,
      href: "/inbound/create",
      color: "hover:border-purple-500 hover:shadow-purple-100"
    }
  ];

  return (
    <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-5xl text-center">
        
        <div className="w-20 h-20 bg-indigo-50 text-[#1a237e] rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-indigo-100">
          <Package className="w-10 h-10" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-[#1a237e] mb-4 drop-shadow-sm">
          Inbound
        </h1>
        <p className="text-gray-500 mb-12 text-lg">Please select a process to continue</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {menuItems.map((item, index) => (
            <Link 
              key={index} 
              href={item.href}
              className={`flex flex-col items-center justify-center p-8 bg-white rounded-[32px] shadow-md border-2 border-gray-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${item.color} group`}
            >
              <div className="transform group-hover:scale-110 transition-transform duration-300">
                {item.icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{item.title}</h2>
              <p className="text-gray-500 text-sm text-center">{item.description}</p>
            </Link>
          ))}
        </div>
        
      </div>
    </div>
  );
}