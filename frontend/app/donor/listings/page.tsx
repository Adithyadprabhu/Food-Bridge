"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";

type Listing = {
  id: string;
  foodType: string;
  category: string;
  quantity: string;
  status: string;
};

export default function DonorListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [editItem, setEditItem] = useState<Listing | null>(null);
  const [deleteItem, setDeleteItem] = useState<Listing | null>(null);
  const [editForm, setEditForm] = useState<Listing | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const q = query(collection(db, "donations"), where("donorId", "==", user.uid));
        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const list: Listing[] = [];
          snapshot.forEach((document) => {
            list.push({ id: document.id, ...document.data() } as Listing);
          });
          setListings(list);
        });
        return () => unsubscribeSnapshot();
      } else {
        setListings([]);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const openEdit = (item: Listing) => {
    setEditItem(item);
    setEditForm({ ...item });
  };

  const saveEdit = async () => {
    if (!editForm) return;
    try {
      const docRef = doc(db, "donations", editForm.id);
      await updateDoc(docRef, {
        foodType: editForm.foodType,
        category: editForm.category,
        quantity: editForm.quantity,
        status: editForm.status
      });
      setEditItem(null);
      setEditForm(null);
    } catch (error) {
      console.error("Error updating listing:", error);
    }
  };

  const confirmDelete = async () => {
    if (!deleteItem) return;
    try {
      await deleteDoc(doc(db, "donations", deleteItem.id));
      setDeleteItem(null);
    } catch (error) {
      console.error("Error deleting listing:", error);
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen">
      <Sidebar />
      <div className="md:ml-72 min-h-screen pb-32 md:pb-0">
        <TopBar title="Food Bridge" />

        <main className="pt-8 px-4 max-w-7xl mx-auto space-y-8">
          <section className="bg-surface-container-lowest rounded-[16px] shadow-[0_20px_40px_rgba(0,0,0,0.04)] p-6 md:p-8 border border-emerald-50">
            <div className="mb-6 flex justify-between items-end">
              <div>
                <h2 className="text-h2 font-h2 text-primary">Listed Food</h2>
                <p className="text-body-md font-body-md text-outline mt-2">All your donations across the platform.</p>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">{listings.length} Total</span>
            </div>

            <div className="space-y-4">
              {listings.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                  <span className="material-symbols-outlined text-5xl mb-3 block">inventory_2</span>
                  <p className="font-semibold">No food listings yet.</p>
                </div>
              )}
              {listings.map((item) => (
                <div key={item.id} className="p-5 rounded-xl border border-outline-variant/50 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                  {/* Food Info */}
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 shrink-0 rounded-lg flex items-center justify-center ${
                      item.category === "Veg" ? "bg-emerald-50 text-emerald-600" :
                      item.category === "Non-Veg" ? "bg-orange-50 text-orange-600" :
                      "bg-blue-50 text-blue-600"
                    }`}>
                      <span className="material-symbols-outlined">
                        {item.category === "Veg" ? "eco" : item.category === "Non-Veg" ? "kebab_dining" : "inventory_2"}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-on-surface text-lg">{item.foodType}</h3>
                      <div className="flex flex-wrap gap-2 text-sm text-outline mt-1">
                        <span className="font-semibold text-primary">{item.category}</span>
                        <span>•</span>
                        <span>{item.quantity}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status + Actions */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full flex items-center gap-1 ${
                      item.status === "Delivered" ? "bg-emerald-100 text-emerald-800" :
                      item.status === "Active Match" ? "bg-blue-100 text-blue-800" :
                      "bg-yellow-50 text-yellow-700"
                    }`}>
                      <span className="material-symbols-outlined text-[14px]">
                        {item.status === "Delivered" ? "check_circle" : item.status === "Active Match" ? "sync" : "pending"}
                      </span>
                      {item.status}
                    </span>

                    {/* Edit Button */}
                    <button
                      onClick={() => openEdit(item)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                      Edit
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => setDeleteItem(item)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
      <BottomNav />

      {/* ── Edit Modal ── */}
      {editItem && editForm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", padding: "1rem" }}>
          <div style={{ backgroundColor: "#fff", borderRadius: "1.25rem", boxShadow: "0 25px 60px rgba(0,0,0,0.15)", width: "100%", maxWidth: "520px", padding: "2rem" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="material-symbols-outlined" style={{ color: "#065f46" }}>edit</span>
              </div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#064e3b", fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0 }}>Edit Listing</h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Food Type */}
              <div>
                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b7280", marginBottom: "0.5rem" }}>Food Type</label>
                <input
                  style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "0.75rem", padding: "0.75rem 1rem", fontSize: "0.875rem", color: "#1f2937", backgroundColor: "#f9fafb", outline: "none", boxSizing: "border-box" }}
                  value={editForm.foodType}
                  onChange={(e) => setEditForm({ ...editForm, foodType: e.target.value })}
                  placeholder="e.g. Mixed Seasonal Berries"
                />
              </div>

              {/* Category + Quantity */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b7280", marginBottom: "0.5rem" }}>Category</label>
                  <select
                    style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "0.75rem", padding: "0.75rem 1rem", fontSize: "0.875rem", color: "#1f2937", backgroundColor: "#f9fafb", outline: "none", boxSizing: "border-box" }}
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  >
                    <option>Veg</option>
                    <option>Non-Veg</option>
                    <option>Packaged</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b7280", marginBottom: "0.5rem" }}>Quantity</label>
                  <input
                    style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "0.75rem", padding: "0.75rem 1rem", fontSize: "0.875rem", color: "#1f2937", backgroundColor: "#f9fafb", outline: "none", boxSizing: "border-box" }}
                    value={editForm.quantity}
                    onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                    placeholder="e.g. Serves 4"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b7280", marginBottom: "0.5rem" }}>Status</label>
                <select
                  style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: "0.75rem", padding: "0.75rem 1rem", fontSize: "0.875rem", color: "#1f2937", backgroundColor: "#f9fafb", outline: "none", boxSizing: "border-box" }}
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option>Pending Match</option>
                  <option>Active Match</option>
                  <option>Delivered</option>
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "2rem" }}>
              <button
                onClick={() => { setEditItem(null); setEditForm(null); }}
                style={{ flex: 1, padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb", fontSize: "0.875rem", fontWeight: 700, color: "#4b5563", backgroundColor: "#fff", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                style={{ flex: 1, padding: "0.75rem", borderRadius: "0.75rem", border: "none", fontSize: "0.875rem", fontWeight: 700, color: "#fff", backgroundColor: "#059669", cursor: "pointer" }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteItem && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", padding: "1rem" }}>
          <div style={{ backgroundColor: "#fff", borderRadius: "1.25rem", boxShadow: "0 25px 60px rgba(0,0,0,0.15)", width: "100%", maxWidth: "400px", padding: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="material-symbols-outlined" style={{ color: "#dc2626" }}>delete</span>
              </div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#111827", fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0 }}>Delete Listing?</h2>
            </div>
            <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1.5rem", lineHeight: 1.5 }}>
              Are you sure you want to delete <span style={{ fontWeight: 700, color: "#374151" }}>{deleteItem.foodType}</span>? This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => setDeleteItem(null)}
                style={{ flex: 1, padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #e5e7eb", fontSize: "0.875rem", fontWeight: 700, color: "#4b5563", backgroundColor: "#fff", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{ flex: 1, padding: "0.75rem", borderRadius: "0.75rem", border: "none", fontSize: "0.875rem", fontWeight: 700, color: "#fff", backgroundColor: "#ef4444", cursor: "pointer" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
