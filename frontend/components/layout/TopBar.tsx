"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

interface TopBarProps {
  title?: string;
}

export default function TopBar({ title = "Food Bridge" }: TopBarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || "User");
        setUserEmail(user.email || "");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 w-full z-50 flex justify-between items-center px-4 h-16 bg-slate-50/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold tracking-tight text-emerald-900 font-['Plus_Jakarta_Sans'] md:hidden">{title}</h1>
      </div>

      <div className="flex items-center gap-2 relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center overflow-hidden shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-transform hover:scale-105 active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">person</span>
        </button>

        {/* Profile Dropdown */}
        {isDropdownOpen && (
          <div className="absolute top-12 right-0 w-56 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-emerald-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-3 border-b border-gray-50 mb-1">
              <p className="text-sm font-bold text-emerald-900">{userName}</p>
              <p className="text-xs text-gray-500 truncate">{userEmail}</p>
            </div>
            
            <Link 
              href="/profile" 
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
              onClick={() => setIsDropdownOpen(false)}
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
              My Profile
            </Link>
            
            
            <div className="border-t border-gray-50 mt-1 pt-1">
              <button 
                onClick={async () => {
                  try {
                    await signOut(auth);
                    localStorage.removeItem("userRole");
                    window.location.href = "/login";
                  } catch (error) {
                    console.error("Sign out error", error);
                  }
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
