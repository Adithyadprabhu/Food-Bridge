"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Profile Form State
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
    role: "donor"
  });

  // Fetch real-time user data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            setProfile({
              name: data.name || "",
              email: data.email || user.email || "",
              phone: data.phone || "",
              organization: data.organization || "",
              role: data.role || "donor"
            });
          } else {
            // Fallback to auth details
            setProfile(prev => ({ ...prev, name: user.displayName || "", email: user.email || "" }));
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUserId(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Preference State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, {
        name: profile.name,
        phone: profile.phone,
        organization: profile.organization,
        // Usually we don't update email here as it requires Firebase Auth update too
      });
      
      setIsEditing(false);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-background text-on-surface min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface min-h-screen">
      <Sidebar />
      <div className="md:ml-72 min-h-screen pb-32 md:pb-0">
        <TopBar title="My Profile" />

        <main className="pt-8 px-4 max-w-4xl mx-auto space-y-8">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-center gap-6 bg-surface-container-lowest rounded-[24px] shadow-sm p-8 border border-emerald-50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-emerald-600 to-teal-500 opacity-10"></div>
            
            <div className="text-center md:text-left z-10 w-full pl-6 py-4">
              <h1 className="text-3xl font-extrabold text-emerald-900 font-['Plus_Jakarta_Sans']">{profile.name || "User Profile"}</h1>
              {profile.organization && <p className="text-emerald-700 font-medium mb-3">{profile.organization}</p>}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-widest">
                <span className="material-symbols-outlined text-[14px]">stars</span>
                {profile.role === "donor" ? "Donor" : profile.role === "ngo" ? "NGO Partner" : "Administrator"}
              </div>
            </div>
          </div>

          {/* Impact Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 text-center">
              <span className="material-symbols-outlined text-emerald-600 text-4xl mb-2">volunteer_activism</span>
              <h3 className="text-3xl font-bold text-emerald-900">45</h3>
              <p className="text-sm font-medium text-emerald-700 uppercase tracking-wider">Donations Made</p>
            </div>
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 text-center">
              <span className="material-symbols-outlined text-blue-600 text-4xl mb-2">restaurant</span>
              <h3 className="text-3xl font-bold text-blue-900">1,250</h3>
              <p className="text-sm font-medium text-blue-700 uppercase tracking-wider">Meals Provided</p>
            </div>
            <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100 text-center">
              <span className="material-symbols-outlined text-orange-600 text-4xl mb-2">co2</span>
              <h3 className="text-3xl font-bold text-orange-900">320kg</h3>
              <p className="text-sm font-medium text-orange-700 uppercase tracking-wider">CO2 Saved</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Form Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-[24px] shadow-sm p-8 border border-gray-100">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold text-emerald-900">Personal Details</h2>
                  {!isEditing && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 font-bold text-sm transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                      Edit
                    </button>
                  )}
                </div>

                {isSaved && (
                  <div className="mb-6 p-4 bg-emerald-50 text-emerald-800 rounded-xl flex items-center gap-3 animate-in fade-in">
                    <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                    <span className="font-medium">Profile updated successfully!</span>
                  </div>
                )}

                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                      <input 
                        type="text" 
                        disabled={!isEditing}
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-70 disabled:cursor-not-allowed text-gray-800 font-medium"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                      <input 
                        type="email" 
                        disabled={!isEditing}
                        value={profile.email}
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-70 disabled:cursor-not-allowed text-gray-800 font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
                      <input 
                        type="tel" 
                        disabled={!isEditing}
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-70 disabled:cursor-not-allowed text-gray-800 font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Organization</label>
                      <input 
                        type="text" 
                        disabled={!isEditing}
                        value={profile.organization}
                        onChange={(e) => setProfile({...profile, organization: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-70 disabled:cursor-not-allowed text-gray-800 font-medium"
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="pt-4 flex gap-3 justify-end border-t border-gray-100">
                      <button 
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-container transition-all active:scale-[0.98]"
                      >
                        Save Changes
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Preferences Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-[24px] shadow-sm p-8 border border-gray-100">
                <h2 className="text-xl font-bold text-emerald-900 mb-6">Preferences</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-800">Email Alerts</p>
                      <p className="text-xs text-gray-500 mt-1">Updates on matches</p>
                    </div>
                    <button 
                      onClick={() => setEmailAlerts(!emailAlerts)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${emailAlerts ? 'bg-primary' : 'bg-gray-200'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${emailAlerts ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-800">SMS Notifications</p>
                      <p className="text-xs text-gray-500 mt-1">Urgent driver updates</p>
                    </div>
                    <button 
                      onClick={() => setSmsAlerts(!smsAlerts)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${smsAlerts ? 'bg-primary' : 'bg-gray-200'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${smsAlerts ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100">
                  <button className="w-full py-3 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                    Delete Account
                  </button>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
