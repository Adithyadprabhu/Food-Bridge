"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

type DonatedItem = {
  id: string;
  foodType: string;
  category: string;
  quantity: string;
  status: string;
};

export default function DonorDashboard() {
  const [category, setCategory] = useState("Veg");
  const [foodType, setFoodType] = useState("");
  const [quantity, setQuantity] = useState("12");
  const [donorName, setDonorName] = useState("");
  const [contact, setContact] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!auth.currentUser) {
      alert("Please log in to donate food.");
      return;
    }

    try {
      await addDoc(collection(db, "donations"), {
        donorId: auth.currentUser.uid,
        donorName: donorName || "Local Donor Partner",
        contact: contact || "+1 234-567-890",
        pickupLocation: pickupLocation || "Zone B, Market Square",
        foodType: foodType || "General Food Waste",
        category,
        quantity: `Serves ${quantity}`,
        status: "Pending Match",
        createdAt: serverTimestamp()
      });
      
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 3000);
      setFoodType("");
      setQuantity("12");
      setCategory("Veg");
      setDonorName("");
      setContact("");
      setPickupLocation("");
      setImagePreview(null);
    } catch (error) {
      console.error("Error adding donation:", error);
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen">
      <Sidebar />
      <div className="md:ml-72 min-h-screen pb-32 md:pb-0">
        <TopBar title="Food Bridge" />

        <main className="pt-8 px-4 max-w-3xl mx-auto space-y-8">
            
          <div className="space-y-6">
            
            {/* Schedule Donation Form */}
              <section id="donation-form" className="bg-surface-container-lowest rounded-[16px] shadow-[0_20px_40px_rgba(0,0,0,0.04)] p-6 md:p-8 border border-emerald-50 relative overflow-hidden">
                {isSubmitted && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-primary animate-pulse"></div>
                )}
                
                <div className="mb-8">
                  <h2 className="text-h2 font-h2 text-primary">Schedule a Donation</h2>
                  <p className="text-body-md font-body-md text-outline mt-2">Provide details about your surplus food to help us find the best match.</p>
                </div>

                {isSubmitted ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="material-symbols-outlined text-[32px]">check_circle</span>
                    </div>
                    <h3 className="text-xl font-bold text-emerald-900 mb-2">Donation Scheduled Successfully!</h3>
                    <p className="text-emerald-700">Thank you for contributing. We&apos;re matching your donation with nearby NGOs right now.</p>
                    <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                      <button 
                        onClick={() => setIsSubmitted(false)}
                        className="px-6 py-2 bg-white text-emerald-800 border border-emerald-200 font-bold rounded-lg hover:bg-emerald-100 transition-colors"
                      >
                        Schedule Another
                      </button>
                      <a href="/donor/listings" className="px-6 py-2 bg-emerald-700 text-white font-bold rounded-lg hover:bg-emerald-800 transition-colors">
                        View Listings
                      </a>
                    </div>
                  </div>
                ) : (
                  <form className="space-y-8" onSubmit={handleSubmit}>
                    {/* Image Upload Area */}
                    <div className="group relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-outline-variant rounded-xl bg-surface-container-low hover:bg-white hover:border-primary transition-all overflow-hidden cursor-pointer">
                      {imagePreview ? (
                        <>
                          <img src={imagePreview} alt="Food preview" className="absolute inset-0 w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <p className="text-white font-bold flex items-center gap-2"><span className="material-symbols-outlined">edit</span> Change Photo</p>
                          </div>
                          <input className="absolute inset-0 opacity-0 cursor-pointer" type="file" accept="image/*" onChange={handleImageChange} />
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[48px] text-primary mb-2">cloud_upload</span>
                          <p className="text-body-lg font-h3 text-on-surface">Upload Food Photo</p>
                          <p className="text-label-sm font-label-sm text-outline mt-1">AI will verify quality & portion size</p>
                          <input className="absolute inset-0 opacity-0 cursor-pointer" type="file" accept="image/*" onChange={handleImageChange} />
                        </>
                      )}
                    </div>

                    {/* Donor Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface-container-lowest p-6 rounded-xl border border-slate-100">
                      <div className="md:col-span-2">
                        <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
                          <span className="material-symbols-outlined">storefront</span>
                          Donor Details
                        </h3>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Donor / Organization Name</label>
                        <input 
                          type="text" 
                          value={donorName}
                          onChange={(e) => setDonorName(e.target.value)}
                          placeholder="e.g. City Bakery"
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium text-slate-700" 
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Contact Number</label>
                        <input 
                          type="tel" 
                          value={contact}
                          onChange={(e) => setContact(e.target.value)}
                          placeholder="e.g. +1 234-567-890"
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium text-slate-700" 
                          required 
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 mb-1">Exact Pickup Location</label>
                        <input 
                          type="text" 
                          value={pickupLocation}
                          onChange={(e) => setPickupLocation(e.target.value)}
                          placeholder="e.g. 123 Main St, Back Alley Door"
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium text-slate-700" 
                          required 
                        />
                      </div>
                    </div>

                    {/* Food Category */}
                    <div>
                      <label className="text-label-sm font-label-sm text-primary uppercase tracking-wider mb-4 block">Food Category</label>
                      <div className="flex flex-wrap gap-3">
                        <button 
                          type="button"
                          onClick={() => setCategory("Veg")}
                          className={`px-6 py-3 rounded-full border transition-all font-semibold flex items-center gap-2 ${category === "Veg" ? "bg-tertiary-fixed text-on-tertiary-fixed border-transparent" : "bg-surface-container-high text-on-surface-variant border-transparent hover:border-primary"}`}
                        >
                          <span className="material-symbols-outlined text-[18px]">eco</span> Veg
                        </button>
                        <button 
                          type="button"
                          onClick={() => setCategory("Non-Veg")}
                          className={`px-6 py-3 rounded-full border transition-all font-semibold flex items-center gap-2 ${category === "Non-Veg" ? "bg-tertiary-fixed text-on-tertiary-fixed border-transparent" : "bg-surface-container-high text-on-surface-variant border-transparent hover:border-primary"}`}
                        >
                          <span className="material-symbols-outlined text-[18px]">kebab_dining</span> Non-Veg
                        </button>
                        <button 
                          type="button"
                          onClick={() => setCategory("Packaged")}
                          className={`px-6 py-3 rounded-full border transition-all font-semibold flex items-center gap-2 ${category === "Packaged" ? "bg-tertiary-fixed text-on-tertiary-fixed border-transparent" : "bg-surface-container-high text-on-surface-variant border-transparent hover:border-primary"}`}
                        >
                          <span className="material-symbols-outlined text-[18px]">inventory_2</span> Packaged
                        </button>
                      </div>
                    </div>

                    {/* Smart Quantity Slider */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <label className="text-label-sm font-label-sm text-primary uppercase tracking-wider">Estimated Quantity</label>
                        <span className="text-h3 font-h3 text-primary" id="serves-value">Serves {quantity} people</span>
                      </div>
                      <input 
                        className="w-full h-3 bg-secondary-container rounded-lg appearance-none cursor-pointer accent-primary" 
                        max="100" 
                        min="1" 
                        type="range" 
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                      />
                      <div className="flex justify-between text-label-sm text-outline px-1">
                        <span>1 person</span>
                        <span>100+ people</span>
                      </div>
                    </div>

                    {/* Expiry Predictor & Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-4 transition-all">
                        <span className="material-symbols-outlined text-emerald-700 bg-white p-2 rounded-lg shadow-sm">timer</span>
                        <div>
                          <p className="text-label-sm font-bold text-emerald-800">Expiry Prediction</p>
                          <p className="text-body-md font-medium text-emerald-600 transition-all">
                            {category === "Veg" && "Likely safe for 12+ hours"}
                            {category === "Non-Veg" && "Likely safe for 4 more hours"}
                            {category === "Packaged" && "Likely safe for 3+ days"}
                          </p>
                          <p className="text-[12px] text-emerald-500 mt-1">Based on category & current temp</p>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-surface-container-high border border-outline-variant/30 flex items-start gap-4">
                        <span className="material-symbols-outlined text-outline bg-white p-2 rounded-lg shadow-sm">restaurant</span>
                        <div className="w-full">
                          <p className="text-label-sm font-bold text-on-surface mb-1">Food Type</p>
                          <input 
                            className="bg-white border border-outline-variant rounded-md px-3 py-2 text-body-md w-full focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" 
                            placeholder="e.g. Steamed Rice, Salad" 
                            type="text" 
                            value={foodType}
                            onChange={(e) => setFoodType(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button className="w-full bg-primary hover:bg-primary-container text-white py-5 rounded-xl font-bold text-body-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98]" type="submit">
                      Donate Now
                    </button>
                  </form>
                )}
              </section>
            </div>
        </main>

      </div>
      <BottomNav />
    </div>
  );
}
