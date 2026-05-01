"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const allMobileNavItems = [
  { href: "/donor/dashboard", icon: "dashboard", label: "Home", role: "donor" },
  { href: "/donor/listings", icon: "list_alt", label: "Food", role: "donor" },
  { href: "/donor/requests", icon: "assignment", label: "Requests", role: "donor" },
  { href: "/donor/delivery", icon: "local_shipping", label: "Delivery", role: "donor" },
  { href: "/ngo/available", icon: "inventory_2", label: "Available", role: "ngo" },
  { href: "/ngo/requests", icon: "swap_horiz", label: "Requests", role: "ngo" },
  { href: "/ngo/activity", icon: "history", label: "Activity", role: "ngo" },

  { href: "/map", icon: "explore", label: "Map", role: "all" },
  { href: "/admin/dashboard", icon: "task_alt", label: "Tasks", role: "admin" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [activeRole, setActiveRole] = useState("donor");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
    let role = "donor";
    if (pathname.startsWith("/ngo")) {
      role = "ngo";
      localStorage.setItem("userRole", "ngo");
    } else if (pathname.startsWith("/admin")) {
      role = "admin";
      localStorage.setItem("userRole", "admin");
    } else if (pathname.startsWith("/donor")) {
      role = "donor";
      localStorage.setItem("userRole", "donor");
    } else {
      role = localStorage.getItem("userRole") || "donor";
    }
    setActiveRole(role);
  }, [pathname]);

  const mobileNavItems = allMobileNavItems.filter(item => item.role === activeRole || item.role === "all");

  if (!mounted) {
    return <nav className="md:hidden fixed bottom-0 left-0 w-full h-20 z-50 bg-white/95 backdrop-blur-lg rounded-t-[24px] shadow-[0_-8px_30px_rgb(0,0,0,0.04)] border-t border-gray-100"></nav>;
  }

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-6 pb-6 pt-3 bg-white/95 backdrop-blur-lg rounded-t-[24px] shadow-[0_-8px_30px_rgb(0,0,0,0.04)] border-t border-gray-100">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center tap-highlight-transparent active:scale-90 transition-all ${
                isActive
                  ? "text-emerald-700 bg-emerald-50 rounded-2xl px-4 py-1"
                  : "text-gray-400 hover:text-emerald-500"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span className={`font-['Plus_Jakarta_Sans'] text-[11px] font-bold uppercase tracking-wider ${isActive ? 'mt-1' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Floating Action Button for Mobile */}
      <button className="md:hidden fixed bottom-28 right-6 w-14 h-14 bg-primary text-on-primary rounded-full shadow-xl flex items-center justify-center active:scale-90 transition-transform z-40">
        <span className="material-symbols-outlined text-[28px]">add</span>
      </button>
    </>
  );
}
