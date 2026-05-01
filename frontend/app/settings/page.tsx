"use client";

import { useState } from "react";
import Link from "next/link";
import TopBar from "@/components/layout/TopBar";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [locationTracking, setLocationTracking] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 md:pl-72 flex flex-col">
        <TopBar title="Settings" />
        
        <main className="flex-1 p-4 md:p-8 pb-24 max-w-4xl mx-auto w-full">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-extrabold text-emerald-900 font-['Plus_Jakarta_Sans'] mb-2">
              Settings
            </h1>
            <p className="text-gray-500">Manage your account preferences and app settings.</p>
          </div>

          <div className="space-y-6">
            {/* Account Settings */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-emerald-800 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">person</span>
                Account Settings
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <div>
                    <p className="font-semibold text-gray-800">Email Address</p>
                    <p className="text-sm text-gray-500">sarah@example.com</p>
                  </div>
                  <button className="text-emerald-600 hover:text-emerald-700 text-sm font-bold">Edit</button>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <div>
                    <p className="font-semibold text-gray-800">Password</p>
                    <p className="text-sm text-gray-500">********</p>
                  </div>
                  <button className="text-emerald-600 hover:text-emerald-700 text-sm font-bold">Update</button>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-emerald-800 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">tune</span>
                Preferences
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-semibold text-gray-800">Push Notifications</p>
                    <p className="text-sm text-gray-500">Receive alerts for new food listings</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={notifications}
                      onChange={() => setNotifications(!notifications)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-semibold text-gray-800">Location Services</p>
                    <p className="text-sm text-gray-500">Use location for finding nearby donations</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={locationTracking}
                      onChange={() => setLocationTracking(!locationTracking)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-semibold text-gray-800">Dark Mode</p>
                    <p className="text-sm text-gray-500">Toggle dark theme for the app</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={darkMode}
                      onChange={() => setDarkMode(!darkMode)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
              <h2 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">warning</span>
                Danger Zone
              </h2>
              <p className="text-sm text-red-600 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button className="px-4 py-2 bg-white text-red-600 font-bold rounded-lg border border-red-200 hover:bg-red-600 hover:text-white transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        </main>
        
        <BottomNav />
      </div>
    </div>
  );
}
