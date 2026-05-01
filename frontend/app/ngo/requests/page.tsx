"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query } from "firebase/firestore";

type RequestStatus = 'Pending' | 'Accepted' | 'Delivered';

interface RequestItem {
  id: string;
  title: string;
  status: RequestStatus;
  timeAgo: string;
  donorName: string;
  contact?: string;
  pickupLocation?: string;
}

export default function NgoRequests() {
  const [activeTab, setActiveTab] = useState<'Ongoing' | 'Completed'>('Ongoing');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [requestsData, setRequestsData] = useState<RequestItem[]>([]);
  const [selectedDetails, setSelectedDetails] = useState<RequestItem | null>(null);

  useEffect(() => {
    const q = query(collection(db, "donations"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: RequestItem[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        let mappedStatus: RequestStatus = 'Pending';
        if (data.status === 'Active Match') mappedStatus = 'Accepted';
        if (data.status === 'Delivered') mappedStatus = 'Delivered';

        items.push({
          id: doc.id,
          title: `${data.quantity} of ${data.foodType}`,
          status: mappedStatus,
          timeAgo: 'Just now',
          donorName: data.donorName || 'Local Donor Partner',
          contact: data.contact || '+1 234-567-890',
          pickupLocation: data.pickupLocation || 'Zone B, Market Square',
        });
      });
      setRequestsData(items);
    });
    return () => unsubscribe();
  }, []);

  const filteredRequests = requestsData.filter(req => {
    if (activeTab === 'Ongoing') {
      return req.status === 'Pending' || req.status === 'Accepted';
    } else {
      return req.status === 'Delivered';
    }
  });

  const handleAction = (action: string, donorName: string) => {
    setToastMessage(`${action} ${donorName}...`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen relative">
      <Sidebar />
      <div className="md:ml-72 min-h-screen pb-32 md:pb-0">
        <TopBar title="Food Bridge" />

        <main className="max-w-4xl mx-auto px-4 mt-8 pb-24">
          {/* Header & Tabs */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary mb-6 font-['Work_Sans']">Request Management</h1>
            <div className="flex p-1 bg-slate-100 rounded-xl max-w-[240px] gap-1">
              <button 
                onClick={() => setActiveTab('Ongoing')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  activeTab === 'Ongoing' 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-slate-500 hover:text-primary'
                }`}
              >
                Ongoing
              </button>
              <button 
                onClick={() => setActiveTab('Completed')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  activeTab === 'Completed' 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-slate-500 hover:text-primary'
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          {/* Request Cards Grid */}
          <div className="grid gap-6">
            {filteredRequests.length === 0 && (
              <div className="py-12 text-center bg-white rounded-xl border border-slate-100 shadow-sm">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">inbox</span>
                <p className="text-slate-500 font-medium">No {activeTab.toLowerCase()} requests found.</p>
              </div>
            )}

            {filteredRequests.map(req => (
              <div 
                key={req.id} 
                className={`bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden ${req.status === 'Delivered' ? 'opacity-80' : ''}`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-on-surface mb-1 font-['Work_Sans']">Requested: {req.title}</h3>
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <span className="material-symbols-outlined text-[16px] mr-1">
                          {req.status === 'Delivered' ? 'verified' : 'schedule'}
                        </span>
                        {req.status === 'Delivered' ? `Delivered ${req.timeAgo}` : `${req.status} ${req.timeAgo}`}
                      </div>
                    </div>
                    
                    {/* Status Pill */}
                    {req.status === 'Pending' && (
                      <div className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Pending
                      </div>
                    )}
                    {req.status === 'Accepted' && (
                      <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Accepted
                      </div>
                    )}
                    {req.status === 'Delivered' && (
                      <div className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        Delivered
                      </div>
                    )}
                  </div>

                  {/* Details Grid */}
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className={`flex items-start gap-3 p-3 rounded-lg ${req.status === 'Accepted' ? 'bg-emerald-50/30' : 'bg-slate-50'}`}>
                      <span className="material-symbols-outlined text-primary">
                        {req.status === 'Accepted' ? 'store' : req.status === 'Delivered' ? 'agriculture' : 'business'}
                      </span>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Donor</p>
                        <p className="font-semibold text-primary">{req.donorName}</p>
                      </div>
                    </div>
                    
                    {req.contact && (
                      <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                        <span className="material-symbols-outlined text-primary">call</span>
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Contact</p>
                          <p className="font-semibold text-primary">{req.contact}</p>
                        </div>
                      </div>
                    )}

                    {req.pickupLocation && (
                      <div className={`flex items-start gap-3 p-3 rounded-lg ${req.status === 'Accepted' ? 'bg-emerald-50/30' : 'bg-slate-50'}`}>
                        <span className="material-symbols-outlined text-primary">pin_drop</span>
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Pickup</p>
                          <p className="font-semibold text-primary text-sm">{req.pickupLocation}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-4 border-t border-slate-50">
                    {req.status === 'Pending' && (
                      <>
                        <button 
                          onClick={() => handleAction('Opening map for', req.donorName)}
                          className="flex items-center gap-2 text-primary font-semibold hover:underline"
                        >
                          <span className="material-symbols-outlined">location_on</span>
                          View Pickup Location
                        </button>
                        <button 
                          onClick={() => handleAction('Opening chat with', req.donorName)}
                          className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-container transition-colors active:scale-95 duration-200"
                        >
                          Message Donor
                        </button>
                      </>
                    )}
                    
                    {req.status === 'Accepted' && (
                      <>
                        <div className="flex gap-4">
                          <a 
                            href={req.contact ? `tel:${req.contact.replace(/[^0-9+]/g, '')}` : "#"}
                            className="flex items-center gap-2 text-primary font-semibold hover:underline"
                          >
                            <span className="material-symbols-outlined">call</span>
                            Call
                          </a>
                          <a 
                            href={`https://maps.google.com/?q=${encodeURIComponent(req.pickupLocation || req.donorName)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-primary font-semibold hover:underline"
                          >
                            <span className="material-symbols-outlined">map</span>
                            Directions
                          </a>
                        </div>
                        <button 
                          onClick={() => setSelectedDetails(req)}
                          className="w-full sm:w-auto px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-container transition-colors active:scale-95 duration-200 shadow-lg shadow-emerald-900/10"
                        >
                          View Pickup Details
                        </button>
                      </>
                    )}

                    {req.status === 'Delivered' && (
                      <>
                        <span className="text-xs text-slate-400 italic">Redistribution successful</span>
                        <button 
                          onClick={() => handleAction('Initiating re-order with', req.donorName)}
                          className="text-primary font-bold text-sm px-4 py-2 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                          Re-order
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
      <BottomNav />
      
      {/* Toast Notification Overlay */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-slate-900 text-white px-6 py-3 rounded-xl shadow-xl font-medium flex items-center gap-3 border border-slate-700">
            <span className="material-symbols-outlined text-emerald-400">info</span>
            {toastMessage}
          </div>
        </div>
      )}

      {/* Pickup Details Modal */}
      {selectedDetails && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', padding: '1rem' }}>
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200" style={{ width: '100%', maxWidth: '28rem' }}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primary font-['Work_Sans']">Pickup Instructions</h2>
                <button onClick={() => setSelectedDetails(null)} className="text-slate-400 hover:text-slate-600 bg-slate-50 p-1.5 rounded-full transition-colors">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              
              <div className="space-y-5">
                <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="material-symbols-outlined text-emerald-600 mt-0.5">inventory_2</span>
                  <div>
                    <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-0.5">Approved Items</p>
                    <p className="font-bold text-emerald-900 text-lg">{selectedDetails.title}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Donor Name</p>
                    <p className="font-semibold text-slate-800">{selectedDetails.donorName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Contact</p>
                    <p className="font-semibold text-slate-800">{selectedDetails.contact}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pickup Location</p>
                  <p className="font-semibold text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-100">{selectedDetails.pickupLocation}</p>
                </div>
                
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Special Instructions</p>
                  <p className="text-sm text-slate-600 italic">&quot;Please arrive at the back entrance by the loading dock. Ring the buzzer for assistance.&quot;</p>
                </div>
              </div>
              
              <div className="mt-8 flex gap-3">
                <a href={`https://maps.google.com/?q=${encodeURIComponent(selectedDetails.pickupLocation || selectedDetails.donorName)}`} target="_blank" rel="noreferrer" className="flex-1 flex justify-center items-center gap-2 py-3 border-2 border-primary text-primary rounded-xl font-bold hover:bg-emerald-50 transition-colors">
                  <span className="material-symbols-outlined">map</span> Navigate
                </a>
                <button onClick={() => setSelectedDetails(null)} className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-900/10">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
