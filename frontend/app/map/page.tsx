"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot } from "firebase/firestore";

interface Route {
  id: string;
  status: string;
  donor: { name: string; address: string; top: string; left: string };
  ngo: { name: string; address: string; top: string; left: string };
  cargo: string;
  eta: string;
  distance: string;
  pathD: string;
  color: string;
}

export default function MapPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string>("");
  const [showRouteCard, setShowRouteCard] = useState(false);
  const [showCargoModal, setShowCargoModal] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "donations"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Route[] = [];
      snapshot.forEach((document) => {
        const data = document.data();
        
        // Skip Delivered items
        if (data.status === "Delivered") return;

        const id = document.id;
        
        // Deterministic pseudo-random generation for map aesthetics
        const hash = Array.from(id).reduce((s, c) => Math.imul(31, s) + c.charCodeAt(0) | 0, 0);
        
        const donorSpots = [
          { top: "45%", left: "40%", address: "123 Market St" },
          { top: "35%", left: "35%", address: "456 Greenfield Ave" },
          { top: "55%", left: "45%", address: "789 Downtown Rd" },
          { top: "50%", left: "30%", address: "900 West Blvd" },
          { top: "40%", left: "50%", address: "321 Tech Center" }
        ];
        
        const ngoSpots = [
          { top: "55%", left: "60%", address: "Zone B, Market Square" },
          { top: "45%", left: "65%", address: "Northside Community Center" },
          { top: "65%", left: "70%", address: "West End Shelter" },
          { top: "35%", left: "60%", address: "East District Hub" },
          { top: "50%", left: "55%", address: "Uptown Relief" }
        ];
        
        const dSpot = donorSpots[Math.abs(hash) % donorSpots.length];
        const nSpot = ngoSpots[Math.abs(hash * 13) % ngoSpots.length];
        
        const startX = parseInt(dSpot.left) * 10; 
        const startY = parseInt(dSpot.top) * 10;
        const endX = parseInt(nSpot.left) * 10;
        const endY = parseInt(nSpot.top) * 10;
        
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2 - 50; 
        const pathD = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;
        
        let color = "#004532";
        let eta = "15 Mins";
        
        if (data.status === "Pending Match") {
          color = "#ba1a1a";
          eta = "Pending";
        }

        list.push({
          id,
          status: data.status,
          donor: { name: "Donor Facility", address: dSpot.address, top: dSpot.top, left: dSpot.left },
          ngo: { name: "NGO Partner", address: nSpot.address, top: nSpot.top, left: nSpot.left },
          cargo: `${data.foodType} - ${data.quantity}`,
          eta,
          distance: (Math.abs(hash % 5) / 2 + 0.8).toFixed(1) + " km",
          pathD,
          color
        });
      });
      setRoutes(list);
      if (list.length > 0 && selectedRouteId === "") {
        setSelectedRouteId(list[0].id);
        setShowRouteCard(true);
      }
    });
    return () => unsubscribe();
  }, [selectedRouteId]);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const selectedRoute = routes.find(r => r.id === selectedRouteId) || routes[0];

  return (
    <div className="min-h-screen bg-[#f9f9ff] flex">
      <Sidebar />

      <main className="flex-1 md:ml-64 flex flex-col h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="flex justify-between items-center px-6 h-16 w-full bg-white border-b border-gray-200 shadow-sm z-30 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-gray-600">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="relative hidden sm:block">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-sm">
                search
              </span>
              <input
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#006c49] focus:border-[#006c49] outline-none w-64"
                placeholder="Search locations..."
                type="text"
              />
            </div>
          </div>


        </header>

        {/* Map Container */}
        <section className="flex-1 relative bg-gray-100 overflow-hidden">
          <div 
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            style={{ 
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "center center",
              transition: isDragging ? "none" : "transform 0.2s ease-out"
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Map Background */}
            <div className="absolute inset-0">
            <img
              className="w-full h-full object-cover opacity-70"
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1600&h=900&fit=crop"
              alt="City map"
              style={{ filter: "grayscale(20%) saturate(1.2)" }}
            />
            {/* Grid overlay for map feel */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(0,108,73,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,108,73,0.3) 1px, transparent 1px)",
                backgroundSize: "60px 60px",
              }}
            />
          </div>

          {/* SVG Routes Overlay */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 1000 1000" preserveAspectRatio="none">
            {routes.map((route) => {
              const isSelected = route.id === selectedRouteId;
              return (
                <g key={route.id}>
                  <path
                    d={route.pathD}
                    fill="none"
                    stroke={isSelected ? route.color : "#9ca3af"}
                    strokeWidth={isSelected ? "4" : "2"}
                    strokeDasharray={isSelected ? "12 8" : "6 6"}
                    className={isSelected ? "drop-shadow-lg" : ""}
                    style={{ opacity: isSelected ? 0.85 : 0.4 }}
                  />
                  {/* Animated pulse along route only if selected */}
                  {isSelected && (
                    <circle r="6" fill={route.color} opacity="0.9">
                      <animateMotion dur="4s" repeatCount="indefinite">
                        <mpath href={`#route-${route.id}`} />
                      </animateMotion>
                    </circle>
                  )}
                  <path
                    id={`route-${route.id}`}
                    d={route.pathD}
                    fill="none"
                  />
                </g>
              );
            })}
          </svg>

          {/* Markers */}
          {routes.map((route) => (
            <div key={route.id}>
              {/* Donor Marker */}
              <div
                className={`absolute z-20 -translate-x-1/2 -translate-y-full group cursor-pointer transition-transform ${selectedRouteId === route.id ? 'scale-110' : 'scale-90 opacity-80'}`}
                style={{ top: route.donor.top, left: route.donor.left }}
                onMouseEnter={() => setHoveredMarker(route.donor.name)}
                onMouseLeave={() => setHoveredMarker(null)}
                onClick={() => { setSelectedRouteId(route.id); setShowRouteCard(true); }}
              >
                <div className="relative flex flex-col items-center">
                  <div
                    className={`absolute -top-12 bg-white px-3 py-1.5 rounded-lg shadow-lg border border-gray-100 pointer-events-none whitespace-nowrap transition-all duration-200 ${
                      hoveredMarker === route.donor.name ? "opacity-100 -translate-y-1" : "opacity-0"
                    }`}
                  >
                    <p className="text-xs font-bold text-[#151c27]">{route.donor.name}</p>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white" />
                  </div>

                  <div className="bg-[#006c49] text-white p-2.5 rounded-full shadow-xl border-2 border-white transform hover:scale-110 transition-transform group-hover:bg-[#005236]" style={{ backgroundColor: selectedRouteId === route.id ? route.color : "#006c49" }}>
                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                      restaurant
                    </span>
                  </div>
                  <div className="w-1 h-4 bg-[#006c49] mt-px rounded-b" style={{ backgroundColor: selectedRouteId === route.id ? route.color : "#006c49" }} />
                </div>
              </div>

              {/* NGO Marker */}
              <div
                className={`absolute z-20 -translate-x-1/2 -translate-y-full group cursor-pointer transition-transform ${selectedRouteId === route.id ? 'scale-110' : 'scale-90 opacity-80'}`}
                style={{ top: route.ngo.top, left: route.ngo.left }}
                onMouseEnter={() => setHoveredMarker(route.ngo.name)}
                onMouseLeave={() => setHoveredMarker(null)}
                onClick={() => { setSelectedRouteId(route.id); setShowRouteCard(true); }}
              >
                <div className="relative flex flex-col items-center">
                  <div
                    className={`absolute -top-12 bg-white px-3 py-1.5 rounded-lg shadow-lg border border-gray-100 pointer-events-none whitespace-nowrap transition-all duration-200 ${
                      hoveredMarker === route.ngo.name ? "opacity-100 -translate-y-1" : "opacity-0"
                    }`}
                  >
                    <p className="text-xs font-bold text-[#151c27]">{route.ngo.name}</p>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white" />
                  </div>

                  <div className="bg-[#0058be] text-white p-2.5 rounded-full shadow-xl border-2 border-white transform hover:scale-110 transition-transform group-hover:bg-[#004395]">
                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                      volunteer_activism
                    </span>
                  </div>
                  <div className="w-1 h-4 bg-[#0058be] mt-px rounded-b" />
                </div>
              </div>
            </div>
          ))}
          </div>

          {/* Legend */}
          <div className="absolute bottom-8 left-6 bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-white/60 w-64 z-20">
            <h3 className="text-sm font-bold text-[#151c27] mb-4">Map Legend</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#006c49]/10 flex items-center justify-center text-[#006c49]">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
                </span>
                <span className="text-sm font-medium text-[#151c27]">Food Donors</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#0058be]/10 flex items-center justify-center text-[#0058be]">
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>volunteer_activism</span>
                </span>
                <span className="text-sm font-medium text-[#151c27]">NGO Recipients</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-px border-t-2 border-dashed border-gray-400 flex-shrink-0" />
                <span className="text-sm font-medium text-[#151c27]">Inactive Route</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-px border-t-2 border-dashed border-[#006c49] flex-shrink-0" />
                <span className="text-sm font-medium text-[#151c27]">Active Route</span>
              </div>
            </div>
          </div>

          {/* Route Details Floating Card */}
          {showRouteCard && selectedRoute && (
            <div className="absolute top-6 right-6 w-80 bg-white shadow-2xl rounded-2xl border border-gray-100 overflow-hidden z-20 animate-in slide-in-from-right-4 duration-300">
              {/* Card header */}
              <div className="p-4 text-white" style={{ backgroundColor: selectedRoute.color }}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] uppercase font-black tracking-widest opacity-80">
                      Active Redistribution
                    </p>
                    <h4 className="font-bold text-base mt-0.5">Route #{selectedRoute.id}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-white/20 text-[10px] px-2.5 py-1 rounded-full border border-white/30 uppercase font-black">
                      {selectedRoute.status}
                    </span>
                    <button
                      onClick={() => setShowRouteCard(false)}
                      className="text-white/60 hover:text-white ml-1"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Card body */}
              <div className="p-5 space-y-5">
                {/* Route */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center pt-1">
                    <div className="w-3 h-3 rounded-full border-2 bg-white z-10" style={{ borderColor: selectedRoute.color }} />
                    <div className="w-0.5 flex-1 bg-gray-200 my-1" />
                    <div className="w-3 h-3 rounded-full bg-[#0058be] z-10" />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] text-gray-400 font-black uppercase">Pickup</p>
                      <p className="text-sm font-bold text-[#151c27]">{selectedRoute.donor.name.replace(" (Donor)", "")}</p>
                      <p className="text-xs text-gray-400">{selectedRoute.donor.address}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-black uppercase">Drop-off</p>
                      <p className="text-sm font-bold text-[#151c27]">{selectedRoute.ngo.name.replace(" (NGO)", "")}</p>
                      <p className="text-xs text-gray-400">{selectedRoute.ngo.address}</p>
                    </div>
                  </div>
                </div>

                {/* Meta */}
                <div className="grid grid-cols-3 gap-3 border-t border-gray-100 pt-4">
                  <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase">ETA</p>
                    <p className="text-sm font-black" style={{ color: selectedRoute.color }}>{selectedRoute.eta}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase">Distance</p>
                    <p className="text-sm font-black text-[#151c27]">{selectedRoute.distance}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase">Cargo</p>
                    <p className="text-sm font-black text-[#151c27]">{selectedRoute.cargo}</p>
                  </div>
                </div>

                <button 
                  onClick={() => setShowCargoModal(true)}
                  className="w-full bg-gray-50 border py-3 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2" 
                  style={{ color: selectedRoute.color, borderColor: `${selectedRoute.color}33` }}
                >
                  <span className="material-symbols-outlined text-sm">info</span>
                  View Cargo Details
                </button>
              </div>
            </div>
          )}

          {/* Zoom Controls */}
          <div className="absolute bottom-8 right-6 flex flex-col gap-2 z-20">
            <button onClick={handleZoomIn} className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center text-gray-600 hover:text-[#006c49] transition-colors border border-gray-100 hover:shadow-xl">
              <span className="material-symbols-outlined">add</span>
            </button>
            <button onClick={handleZoomOut} className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center text-gray-600 hover:text-[#006c49] transition-colors border border-gray-100 hover:shadow-xl">
              <span className="material-symbols-outlined">remove</span>
            </button>
          </div>

          {/* Re-show card button if closed */}
          {!showRouteCard && (
            <div className="absolute top-6 right-6 z-20 flex flex-col gap-2">
              <button
                onClick={() => setShowRouteCard(true)}
                className="bg-white text-gray-800 border border-gray-200 px-4 py-2.5 rounded-xl shadow-lg font-bold text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">route</span>
                Show Selected Route Details
              </button>
            </div>
          )}
        </section>
      </main>

      <BottomNav />

      {/* Cargo Details Modal */}
      {showCargoModal && selectedRoute && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", padding: "1rem", animation: "fadeIn 0.2s ease-out forwards" }}>
          <div style={{ backgroundColor: "#fff", borderRadius: "1.25rem", boxShadow: "0 25px 60px rgba(0,0,0,0.15)", width: "100%", maxWidth: "400px", padding: "2rem", animation: "zoomIn 0.2s ease-out forwards" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: `${selectedRoute.color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span className="material-symbols-outlined" style={{ color: selectedRoute.color }}>inventory_2</span>
              </div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111827", fontFamily: "'Plus Jakarta Sans', sans-serif", margin: 0 }}>Cargo Details</h2>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "2.25rem" }}>
              <div>
                <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b7280", margin: "0 0 0.35rem 0" }}>Items</p>
                <p style={{ fontSize: "1rem", fontWeight: 700, color: "#1f2937", margin: 0 }}>{selectedRoute.cargo}</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                    <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b7280", margin: "0 0 0.35rem 0" }}>Weight</p>
                    <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#4b5563", margin: 0 }}>45 kg</p>
                </div>
                <div>
                    <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b7280", margin: "0 0 0.35rem 0" }}>Volume</p>
                    <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#4b5563", margin: 0 }}>0.4 m³</p>
                </div>
              </div>
              <div>
                <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b7280", margin: "0 0 0.35rem 0" }}>Handling Instructions</p>
                <div style={{ padding: "0.75rem", backgroundColor: "#f9fafb", borderRadius: "0.75rem", border: "1px solid #e5e7eb" }}>
                    <p style={{ fontSize: "0.875rem", color: "#4b5563", margin: 0 }}>Handle with care. Highly perishable. Must be transported in insulated containers and kept below 4°C.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowCargoModal(false)}
              style={{ width: "100%", padding: "0.875rem", borderRadius: "0.75rem", border: "none", fontSize: "0.875rem", fontWeight: 700, color: "#fff", backgroundColor: selectedRoute.color, cursor: "pointer", boxShadow: `0 4px 14px 0 ${selectedRoute.color}40` }}
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
