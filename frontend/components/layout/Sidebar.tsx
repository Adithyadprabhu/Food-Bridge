"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
const allNavItems = [
  { href: "/donor/dashboard", icon: "dashboard", label: "Dashboard", role: "donor" },
  { href: "/donor/listings", icon: "list_alt", label: "List of Food", role: "donor" },
  { href: "/donor/requests", icon: "assignment", label: "Requests", role: "donor" },
  { href: "/donor/delivery", icon: "local_shipping", label: "Delivery", role: "donor" },
  
  { href: "/ngo/dashboard", icon: "dashboard", label: "Dashboard", role: "ngo" },
  { href: "/ngo/available", icon: "inventory_2", label: "Available Food", role: "ngo" },
  { href: "/ngo/requests", icon: "swap_horiz", label: "My Requests", role: "ngo" },
  { href: "/ngo/activity", icon: "history", label: "Recent Activity", role: "ngo" },

  { href: "/map", icon: "map", label: "Map", role: "all" },
  { href: "/admin/dashboard", icon: "admin_panel_settings", label: "Admin", role: "admin" },
];

export default function Sidebar() {
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

  const navItems = allNavItems.filter(item => item.role === activeRole || item.role === "all");

  if (!mounted) {
    return <aside className="hidden md:flex fixed inset-y-0 left-0 z-[60] p-4 w-72 bg-white border-r border-gray-100 h-full shadow-2xl shadow-emerald-900/5"></aside>;
  }

  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 z-[60] flex-col p-4 w-72 bg-white border-r border-gray-100 h-full shadow-2xl shadow-emerald-900/5">
      <div className="mb-8 px-4 pt-4">
        <h1 className="text-2xl font-extrabold text-emerald-800 font-['Plus_Jakarta_Sans']">Food Bridge</h1>
        <div className="mt-8 flex items-center gap-3">
          <div>
            <p className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-emerald-800 capitalize">{activeRole} Partner</p>
            <p className="text-xs text-gray-500">Impact Level: Gold</p>
          </div>
        </div>
      </div>
      <nav className="space-y-1 px-2 divide-y divide-gray-100 flex-grow">
        <div className="py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${
                  isActive
                    ? "bg-emerald-50 text-emerald-800 font-bold"
                    : "text-gray-600 hover:bg-gray-50 hover:translate-x-1"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span className="font-['Plus_Jakarta_Sans'] text-sm">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
