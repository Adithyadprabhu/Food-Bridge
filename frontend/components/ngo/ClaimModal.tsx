"use client";

import React, { useState } from "react";

import { db, auth } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  itemName: string;
}

export default function ClaimModal({ isOpen, onClose, itemId, itemName }: ClaimModalProps) {
  const [quantity, setQuantity] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [locationName, setLocationName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemId) return;

    setIsSubmitting(true);
    try {
      const docRef = doc(db, "donations", itemId);
      await updateDoc(docRef, {
        status: "NGO Requested",
        ngoRequest: {
          ngoId: auth.currentUser?.uid || "unknown",
          locationName,
          quantity,
          pickupTime,
          notes,
          requestedAt: new Date().toISOString()
        }
      });
      alert(`Request submitted for ${itemName}!\nThe donor will review your request shortly.`);
      onClose();
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Failed to submit request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', padding: '1rem' }}>
      <div 
        className="bg-white rounded-2xl shadow-xl overflow-y-auto no-scrollbar"
        style={{ width: '100%', maxWidth: '28rem', maxHeight: '90vh' }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 pb-2">
            <h2 className="text-2xl font-bold text-primary font-['Work_Sans']">Request Food</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 p-1.5 rounded-full">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          
          <div className="mb-6">
            <p className="text-sm text-slate-600 font-bold mb-1">You are requesting:</p>
            <p className="text-xl font-bold text-emerald-800 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100">{itemName}</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Location / Branch Name</label>
              <input 
                type="text" 
                placeholder="e.g., Downtown Community Center" 
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium text-slate-700" 
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Quantity Needed</label>
                <input 
                  type="text" 
                  placeholder="e.g., 10 units" 
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium text-slate-700" 
                  required 
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Pickup Time</label>
                <input 
                  type="time" 
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium text-slate-700" 
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Contact Number</label>
              <input 
                type="tel" 
                placeholder="e.g., (555) 123-4567" 
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium text-slate-700" 
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Additional Notes (Optional)</label>
              <textarea 
                placeholder="Any special requirements or instructions for the donor..." 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all h-20 resize-none text-sm font-medium text-slate-700"
              ></textarea>
            </div>

            <div className="pt-4 flex gap-3 sticky bottom-0 bg-white py-2">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-3 bg-primary text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors active:scale-95 shadow-md shadow-emerald-900/10 disabled:opacity-70">
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
