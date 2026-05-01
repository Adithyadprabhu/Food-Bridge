"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

type StepState = "done" | "active" | "pending";

interface StepperProps {
  steps: StepState[];
}

function DeliveryStepper({ steps }: StepperProps) {
  const labels = ["PENDING", "ACCEPTED", "DELIVERED"];
  const icons = ["schedule", "local_shipping", "verified"];

  return (
    <div className="flex justify-between items-center">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                step === "done"
                  ? "bg-[#006c49] border-[#006c49] text-white"
                  : step === "active"
                  ? "border-[#006c49] text-[#006c49] bg-white"
                  : "border-gray-200 text-gray-300 bg-white"
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                {step === "done" ? "check" : icons[i]}
              </span>
            </div>
            <span
              className={`text-[9px] font-black ${
                step === "pending" ? "text-gray-400" : "text-[#006c49]"
              }`}
            >
              {labels[i]}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`flex-1 h-[2px] mb-4 mx-1 transition-all ${
                step === "done" ? "bg-[#10b981]" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

const statusBadgeConfig = {
  accepted: "bg-amber-50 text-amber-600",
  pending: "bg-emerald-50 text-emerald-600",
  delivered: "bg-emerald-100 text-emerald-800",
};

interface DeliveryItem {
  id: string;
  foodType: string;
  item: string;
  donor: string;
  recipient: string;
  status: "pending" | "accepted" | "delivered";
  iconBg: string;
  iconColor: string;
  icon: string;
  steps: StepState[];
}

export default function DeliveryPage() {
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>([]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const q = query(collection(db, "donations"), where("donorId", "==", user.uid));
        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const list: DeliveryItem[] = [];
          snapshot.forEach((document) => {
            const data = document.data();
            
            let mappedStatus: "pending" | "accepted" | "delivered" = "pending";
            let steps: StepState[] = ["active", "pending", "pending"];

            if (data.status === "Active Match") {
              mappedStatus = "accepted";
              steps = ["done", "active", "pending"];
            } else if (data.status === "Delivered") {
              mappedStatus = "delivered";
              steps = ["done", "done", "done"];
            }

            let icon = "inventory_2";
            let iconBg = "bg-emerald-50";
            let iconColor = "text-emerald-600";

            if (data.category === "Veg") {
              icon = "eco";
              iconBg = "bg-emerald-50";
              iconColor = "text-emerald-600";
            } else if (data.category === "Non-Veg") {
              icon = "kebab_dining";
              iconBg = "bg-amber-50";
              iconColor = "text-amber-600";
            }

            list.push({
              id: document.id,
              foodType: (data.category || "General").toUpperCase() + " PRODUCTS",
              item: `${data.foodType} - ${data.quantity}`,
              donor: "You (Donor)",
              recipient: data.ngoRequest?.locationName || (data.status === "Pending Match" ? "Finding Match..." : "Partner NGO"),
              status: mappedStatus,
              iconBg,
              iconColor,
              icon,
              steps
            });
          });
          setDeliveries(list);
        });
        return () => unsubscribeSnapshot();
      } else {
        setDeliveries([]);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const handleMarkDelivered = async (id: string) => {
    try {
      await updateDoc(doc(db, "donations", id), {
        status: "Delivered"
      });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const activeCount = deliveries.filter(d => d.status !== "delivered").length;
  const kgDonated = deliveries.length * 25; 
  const ngosServed = new Set(deliveries.map(d => d.recipient)).size;
  const savedPercent = deliveries.length > 0 ? Math.min(98, 75 + (deliveries.length * 2)) : 0;

  const filtered = deliveries.filter((d) =>
    activeTab === "active" ? d.status !== "delivered" : d.status === "delivered"
  );

  return (
    <div className="min-h-screen bg-[#f9f9ff]">
      <Sidebar />
      <div className="md:ml-64 min-h-screen pb-24 md:pb-0">
        <TopBar title="Delivery & Status" />

        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          {/* Header row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <p className="text-sm text-gray-500">Track redistribution status across your network.</p>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
              {(["active", "completed"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-1.5 rounded-lg text-sm font-semibold transition-all capitalize ${
                    activeTab === tab
                      ? "bg-white shadow-sm text-[#006c49]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filtered.map((delivery) => (
              <div
                key={delivery.id}
                className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
              >
                {/* Card Header */}
                <div className="p-6 border-b border-gray-50 flex justify-between items-start">
                  <div className="flex gap-4">
                    <div
                      className={`h-12 w-12 rounded-xl ${delivery.iconBg} flex items-center justify-center flex-shrink-0`}
                    >
                      <span
                        className={`material-symbols-outlined ${delivery.iconColor}`}
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {delivery.icon}
                      </span>
                    </div>
                    <div>
                      <h3 className={`text-xs font-black tracking-wider ${delivery.iconColor}`}>
                        {delivery.foodType}
                      </h3>
                      <p className="text-[#151c27] font-semibold text-sm mt-0.5">{delivery.item}</p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${
                      statusBadgeConfig[delivery.status]
                    }`}
                  >
                    {delivery.status}
                  </span>
                </div>

                {/* Route */}
                <div className={`px-6 py-4 flex-grow ${delivery.status === "delivered" ? "opacity-70" : ""}`}>
                  <div className="flex items-start gap-4 mb-5">
                    <div className="flex flex-col items-center mt-1">
                      <div className="w-2 h-2 rounded-full bg-[#10b981]" />
                      <div className="w-px h-8 bg-gray-200" />
                      <div
                        className={`w-2 h-2 rounded-full ${
                          delivery.status === "delivered" ? "bg-[#10b981]" : "bg-gray-300"
                        }`}
                      />
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] text-gray-400 font-black block tracking-wider">DONOR</span>
                        <span className="font-semibold text-sm">{delivery.donor}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 font-black block tracking-wider">
                          RECIPIENT (NGO)
                        </span>
                        <span className="font-semibold text-sm">{delivery.recipient}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stepper */}
                  <div className="pt-4 border-t border-gray-50">
                    <DeliveryStepper steps={delivery.steps} />
                  </div>
                </div>

                {/* CTA */}
                <div className={`p-4 border-t ${delivery.status === "delivered" ? "bg-gray-50" : "bg-gray-50"}`}>
                  {delivery.status === "delivered" ? (
                    <button
                      disabled
                      className="w-full py-2.5 bg-gray-200 text-gray-400 rounded-xl font-bold text-sm cursor-not-allowed"
                    >
                      Transaction Complete
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleMarkDelivered(delivery.id)}
                      className="w-full py-2.5 bg-[#006c49] text-white rounded-xl font-bold text-sm shadow-sm hover:bg-[#005236] active:scale-95 transition-all"
                    >
                      Mark as Delivered
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Impact Summary Card */}
            <div className="bg-[#006c49] border border-emerald-500 rounded-2xl shadow-lg p-6 flex flex-col justify-between text-white relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="text-xl font-bold mb-2">Impact Summary</h4>
                <p className="text-emerald-100 text-sm mb-6">
                  You&apos;ve helped redistribute {kgDonated}kg of food.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "ACTIVE", value: activeCount.toString() },
                    { label: "SAVED", value: `${savedPercent}%` },
                    { label: "KG DONATED", value: kgDonated > 1000 ? `${(kgDonated/1000).toFixed(1)}k` : kgDonated.toString() },
                    { label: "NGOs SERVED", value: ngosServed.toString() },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-emerald-500/30 p-3 rounded-xl border border-emerald-400/30"
                    >
                      <span className="text-[10px] uppercase font-black tracking-widest text-emerald-200 block">
                        {stat.label}
                      </span>
                      <div className="text-2xl font-black mt-1">{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -right-10 -bottom-10 opacity-10">
                <span className="material-symbols-outlined text-[160px]">volunteer_activism</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
