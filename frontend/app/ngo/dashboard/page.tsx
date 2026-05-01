"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import ClaimModal from "@/components/ngo/ClaimModal";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query } from "firebase/firestore";

interface FoodItem {
  id: string;
  title: string;
  quantity: string;
  category: string;
  donor: string;
  img: string;
  distance: string;
  expiryStr: string;
}

export default function NgoDashboard() {
  const [selectedItem, setSelectedItem] = useState<{id: string, title: string} | null>(null);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [stats, setStats] = useState({ available: 0, active: 12, received: 1200, urgent: 0 });

  useEffect(() => {
    const q = query(collection(db, "donations"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: FoodItem[] = [];
      let availableCount = 0;
      let urgentCount = 0;
      let activeCount = 0;
      let receivedCount = 0;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        
        if (data.status === "Active Match") {
          activeCount++;
        } else if (data.status === "Delivered") {
          // Estimate 25 meals per delivered donation
          receivedCount += 25; 
        }

        if (data.status === "Pending Match") {
          availableCount++;
          
          let img = "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop";
          if (data.category === "Veg") img = "https://images.unsplash.com/photo-1596482163155-276c1251c6b1?w=600&h=400&fit=crop";
          if (data.category === "Non-Veg") img = "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=600&h=400&fit=crop";
          if (data.category === "Packaged") img = "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=600&h=400&fit=crop";

          const hash = Array.from(doc.id).reduce((s, c) => Math.imul(31, s) + c.charCodeAt(0) | 0, 0);
          const distance = (Math.abs(hash % 10) + 0.5).toFixed(1);
          const expiryHours = Math.abs(hash % 24) + 1;
          if (expiryHours < 5) urgentCount++;

          items.push({
            id: doc.id,
            title: data.foodType,
            quantity: data.quantity,
            category: data.category || "Mixed",
            donor: data.donorName || "Local Donor Partner",
            img,
            distance: `${distance} miles`,
            expiryStr: `Expiring: ${expiryHours}h`
          });
        }
      });
      
      items.sort((a, b) => {
        const aExp = parseInt(a.expiryStr.replace(/\D/g, ''));
        const bExp = parseInt(b.expiryStr.replace(/\D/g, ''));
        return aExp - bExp;
      });

      setFoodItems(items);
      setStats({ 
        available: availableCount, 
        active: activeCount, 
        received: receivedCount, 
        urgent: urgentCount 
      });
    });
    return () => unsubscribe();
  }, []);

  const handleClaim = (id: string, title: string) => {
    setSelectedItem({id, title});
  };

  return (
    <div className="bg-background text-on-surface font-body-md">
      <Sidebar />
      <div className="md:ml-72 min-h-screen pb-32 md:pb-0">
        <TopBar title="Food Bridge" />

        <main className="max-w-7xl mx-auto px-4 pb-24 pt-6">
          {/* Summary Cards: Bento Grid */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between">
              <span className="text-xs font-medium text-outline mb-1 uppercase tracking-widest">Total Available</span>
              <span className="text-3xl font-bold text-primary font-['Work_Sans']">{stats.available}</span>
              <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full w-fit">
                <span className="material-symbols-outlined text-[12px]">trending_up</span>
                <span>Real-time</span>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between">
              <span className="text-xs font-medium text-outline mb-1 uppercase tracking-widest">Requests Made</span>
              <span className="text-3xl font-bold text-primary font-['Work_Sans']">{stats.active}</span>
              <span className="text-[10px] font-medium text-slate-500 mt-2">Pending Approval</span>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between">
              <span className="text-xs font-medium text-outline mb-1 uppercase tracking-widest">Meals Received</span>
              <span className="text-3xl font-bold text-primary font-['Work_Sans']">{stats.received > 1000 ? `${(stats.received/1000).toFixed(1)}k` : stats.received}</span>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-primary h-full w-[85%] rounded-full"></div>
              </div>
            </div>
            <div className="bg-error-container p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-error/10 flex flex-col justify-between">
              <span className="text-xs font-medium text-error mb-1 uppercase tracking-widest">Urgent/Near Expiry</span>
              <span className="text-3xl font-bold text-error font-['Work_Sans']">{stats.urgent}</span>
              <div className="mt-2 flex items-center gap-1 text-[10px] text-error font-bold">
                <span className="material-symbols-outlined text-[14px]">warning</span>
                <span>Action Required</span>
              </div>
            </div>
          </section>

          <div className="space-y-8">
            {/* Urgent Near You */}
            <section>
              <div className="flex justify-between items-end mb-4">
                <h2 className="text-2xl font-bold text-primary font-['Work_Sans']">Urgent Near You</h2>
                <button className="text-sm font-bold text-emerald-600 hover:underline">View All</button>
              </div>
              <div className="flex overflow-x-auto gap-4 pb-4 -mx-2 px-2 no-scrollbar">
                {foodItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="min-w-[280px] bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] overflow-hidden border border-slate-100 shrink-0">
                    <div className="p-4 relative">
                      <div className="absolute top-4 right-4 bg-error text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                        <span className="material-symbols-outlined text-[12px]">schedule</span>
                        {item.expiryStr}
                      </div>
                      <h3 className="font-bold text-primary mb-1">{item.title}</h3>
                      <p className="text-xs font-medium text-outline mb-4">{item.quantity} • {item.donor}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-primary">{item.distance} away</span>
                        <button onClick={() => handleClaim(item.id, item.title)} className="bg-emerald-100 text-emerald-800 text-xs px-4 py-1.5 rounded-lg font-bold hover:bg-emerald-200 transition-colors">Claim Now</button>
                      </div>
                    </div>
                  </div>
                ))}
                {foodItems.length === 0 && (
                  <div className="text-outline text-sm italic py-8 px-4">No urgent food available right now.</div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
      <BottomNav />

      <ClaimModal 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
        itemId={selectedItem?.id || ""}
        itemName={selectedItem?.title || ""} 
      />
    </div>
  );
}
