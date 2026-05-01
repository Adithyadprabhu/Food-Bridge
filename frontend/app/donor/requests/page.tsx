"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import { auth, db } from "@/lib/firebase";
import { collection, query, onSnapshot, doc, updateDoc } from "firebase/firestore";

export default function DonorRequests() {
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (user) {
        const q = query(collection(db, "donations"));
        const unsubscribeDb = onSnapshot(q, (snapshot) => {
          const requests: any[] = [];
          snapshot.forEach(doc => {
            const data = doc.data();
            if (data.donorId === user.uid && data.status === "NGO Requested") {
              requests.push({ id: doc.id, ...data });
            }
          });
          setIncomingRequests(requests);
        });
        return () => unsubscribeDb();
      } else {
        setIncomingRequests([]);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const handleAcceptRequest = async (id: string) => {
    try {
      await updateDoc(doc(db, "donations", id), {
        status: "Active Match"
      });
      alert("Request accepted! The NGO has been notified.");
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  const handleRejectRequest = async (id: string) => {
    try {
      await updateDoc(doc(db, "donations", id), {
        status: "Pending Match",
        ngoRequest: null
      });
      alert("Request rejected. The item is back on the market.");
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen">
      <Sidebar />
      <div className="md:ml-72 min-h-screen pb-32 md:pb-0">
        <TopBar title="Manage Requests" />
        <main className="pt-8 px-4 max-w-4xl mx-auto space-y-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-primary">Incoming NGO Requests</h2>
            
            {incomingRequests.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm text-center">
                <span className="material-symbols-outlined text-[48px] text-slate-300 mb-2">inbox</span>
                <p className="text-slate-500 font-bold">No pending requests at the moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {incomingRequests.map(req => (
                  <div key={req.id} className="bg-white p-5 rounded-xl shadow-sm border border-amber-100 flex flex-col md:flex-row gap-4 justify-between md:items-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
                    <div className="pl-2">
                      <h3 className="font-bold text-lg text-primary">{req.foodType} <span className="text-sm font-normal text-slate-500">({req.quantity})</span></h3>
                      <p className="text-sm text-slate-600 mt-1">
                        <span className="font-bold">Requested by:</span> {req.ngoRequest?.locationName || "An NGO"}
                      </p>
                      <p className="text-sm text-slate-600">
                        <span className="font-bold">Pickup time:</span> {req.ngoRequest?.pickupTime || "Not specified"}
                      </p>
                      {req.ngoRequest?.notes && (
                        <p className="text-sm text-slate-500 mt-2 italic border-l-2 border-slate-200 pl-3">&quot;{req.ngoRequest.notes}&quot;</p>
                      )}
                    </div>
                    <div className="flex gap-2 mt-2 md:mt-0 shrink-0">
                      <button onClick={() => handleRejectRequest(req.id)} className="px-4 py-2 border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors">
                        Reject
                      </button>
                      <button onClick={() => handleAcceptRequest(req.id)} className="px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-emerald-700 shadow-md transition-colors">
                        Accept Request
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
