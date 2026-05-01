"use client";

import { useState, useMemo, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import ClaimModal from "@/components/ngo/ClaimModal";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query } from "firebase/firestore";

interface AvailableFoodItem {
  id: string;
  title: string;
  type: string;
  category: string;
  quantity: string;
  donor: string;
  distance: number;
  expiryStr: string;
  img: string;
  desc: string;
}

const AVAILABLE_FILTERS = ['Distance: <5km', 'Food: Veg', 'Food: Bakery', 'Expiry: Today', '24h'];

export default function NgoAvailable() {
  const [selectedItem, setSelectedItem] = useState<{id: string, title: string} | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>(['Distance: <5km']);
  const [allFoodItems, setAllFoodItems] = useState<AvailableFoodItem[]>([]);

  useEffect(() => {
    const q = query(collection(db, "donations"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: AvailableFoodItem[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.status === "Pending Match") {
          let img = "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop";
          if (data.category === "Veg") img = "https://images.unsplash.com/photo-1596482163155-276c1251c6b1?w=600&h=400&fit=crop";
          if (data.category === "Non-Veg") img = "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=600&h=400&fit=crop";
          if (data.category === "Packaged") img = "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=600&h=400&fit=crop";

          const hash = Array.from(doc.id).reduce((s, c) => Math.imul(31, s) + c.charCodeAt(0) | 0, 0);
          const distance = parseFloat((Math.abs(hash % 10) + 0.5).toFixed(1));
          const expiryHours = Math.abs(hash % 24) + 1;

          items.push({
            id: doc.id,
            title: data.foodType,
            type: data.category || "Mixed",
            category: (data.category || "MIXED").toUpperCase(),
            quantity: data.quantity,
            donor: data.donorName || "Local Donor Partner",
            distance,
            expiryStr: `Expiring in ${expiryHours}h`,
            img,
            desc: `${data.quantity} available for redistribution.`
          });
        }
      });
      setAllFoodItems(items);
    });
    return () => unsubscribe();
  }, []);

  const handleClaim = (id: string, title: string) => {
    setSelectedItem({id, title});
  };

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter) 
        : [...prev, filter]
    );
  };

  const filteredItems = useMemo(() => {
    return allFoodItems.filter(item => {
      let match = true;
      
      // Filter by food type
      const foodFilters = activeFilters.filter(f => f.startsWith('Food: '));
      if (foodFilters.length > 0) {
        const itemFoodType = `Food: ${item.type}`;
        if (!foodFilters.includes(itemFoodType)) {
          match = false;
        }
      }

      // Filter by distance
      if (activeFilters.includes('Distance: <5km') && item.distance >= 5) {
        match = false;
      }

      return match;
    });
  }, [activeFilters]);

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen">
      <Sidebar />
      <div className="md:ml-72 min-h-screen pb-32 md:pb-0">
        <TopBar title="Food Bridge" />

        <main className="min-h-screen pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
            {/* Search and View Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-2xl">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
                <input className="w-full pl-12 pr-4 py-3 bg-white border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-body-md" placeholder="Search food types..." type="text"/>
              </div>
            </div>
            
            {/* Filter Pills */}
            <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
              <div className="flex items-center gap-2 border-r border-outline-variant pr-4 mr-2 hidden md:flex shrink-0">
                <span className="material-symbols-outlined text-outline text-sm">filter_list</span>
                <span className="font-label-sm text-outline">Filters</span>
              </div>
              
              {AVAILABLE_FILTERS.map(filter => {
                const isActive = activeFilters.includes(filter);
                return (
                  <button 
                    key={filter}
                    onClick={() => toggleFilter(filter)}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full font-label-sm transition-colors border ${
                      isActive 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                        : 'bg-white text-on-surface-variant border-outline-variant hover:border-primary'
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
            
            {/* Asymmetric Grid for Food Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-4">
              {filteredItems.map(item => (
                <div key={item.id} className="group bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
                  <div className="p-6 flex-1 flex flex-col relative">
                    <div className={
                      item.expiryStr.includes('2h') || item.expiryStr.includes('5h') 
                        ? "absolute top-6 right-6 px-3 py-1 bg-error-container text-error rounded-full font-label-sm flex items-center gap-1"
                        : "absolute top-6 right-6 px-3 py-1 bg-slate-100 text-primary rounded-full font-label-sm flex items-center gap-1"
                    }>
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      {item.expiryStr}
                    </div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-xl text-primary font-['Work_Sans']">{item.title}</h3>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold uppercase tracking-wider">{item.category}</span>
                    </div>
                    <p className="text-slate-600 text-sm mb-4">{item.desc}</p>
                    <div className="flex items-center gap-2 mb-6 mt-auto">
                      <span className="material-symbols-outlined text-slate-400">
                        {item.category === 'VEG' ? 'local_grocery_store' : item.category === 'BAKERY' ? 'store' : 'soup_kitchen'}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">{item.donor} • {item.distance}km away</span>
                    </div>
                    <button onClick={() => handleClaim(item.id, item.title)} className="w-full py-3 bg-primary text-on-primary rounded-lg font-bold hover:bg-opacity-90 active:scale-[0.98] transition-all">
                      Request Food
                    </button>
                  </div>
                </div>
              ))}

              {/* Skeleton/Placeholder for layout */}
              {filteredItems.length > 0 && (
                <div className="hidden xl:flex bg-emerald-50/50 rounded-xl border-2 border-dashed border-emerald-200 items-center justify-center p-6">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-emerald-300 text-5xl mb-2">more_horiz</span>
                    <p className="text-sm font-bold text-emerald-600">Discover more listings as they arrive</p>
                  </div>
                </div>
              )}

              {filteredItems.length === 0 && (
                <div className="col-span-full py-16 text-center bg-white rounded-xl border border-slate-100 shadow-sm">
                  <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">search_off</span>
                  <h3 className="text-lg font-bold text-slate-700 font-['Work_Sans']">No matching food found</h3>
                  <p className="text-slate-500 mt-1">Try adjusting your filters to see more results.</p>
                </div>
              )}
            </div>
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
