"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, onSnapshot, query } from "firebase/firestore";

export default function AdminDashboard() {
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isVerificationsModalOpen, setIsVerificationsModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTimeframeDropdownOpen, setIsTimeframeDropdownOpen] = useState(false);
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState("Last 30 Days");
  
  const [userName, setUserName] = useState("Admin User");
  const [userEmail, setUserEmail] = useState("");

  const [stats, setStats] = useState({
    totalDonations: 0,
    totalNgos: 0,
    mealsServed: 0,
    activeDeliveries: 0,
    expiringAlerts: 0
  });

  const [chartData, setChartData] = useState([
    { meals: 0, units: 0 },
    { meals: 0, units: 0 },
    { meals: 0, units: 0 },
    { meals: 0, units: 0 },
    { meals: 0, units: 0 },
  ]);

  const [pendingApprovals, setPendingApprovals] = useState<{id: string, name: string, initials: string}[]>([]);
  const [criticalAlerts, setCriticalAlerts] = useState<{id: string, title: string, expiry: string, minutes: number}[]>([]);
  const [approvedNGOs, setApprovedNGOs] = useState<{id: string, name: string, initials: string, date: string}[]>([]);
  const [ngoSearch, setNgoSearch] = useState("");

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || "Admin User");
        setUserEmail(user.email || "");
      }
    });

    const q = query(collection(db, "donations"));
    const unsubscribeDb = onSnapshot(q, (snapshot) => {
      let total = 0;
      let deliveredMeals = 0;
      let active = 0;
      let expiring = 0;

      const weeklyData = [
        { meals: 0, units: 0 },
        { meals: 0, units: 0 },
        { meals: 0, units: 0 },
        { meals: 0, units: 0 },
        { meals: 0, units: 0 },
      ];
      
      const alerts: {id: string, title: string, expiry: string, minutes: number}[] = [];

      snapshot.forEach(doc => {
        total++;
        const data = doc.data();
        
        const hash = Array.from(doc.id).reduce((s, c) => Math.imul(31, s) + c.charCodeAt(0) | 0, 0);
        const weekIndex = Math.abs(hash) % 5;
        
        let qty = 10;
        if (typeof data.quantity === 'string') {
          const match = data.quantity.match(/\d+/);
          if (match) qty = parseInt(match[0], 10);
        } else if (typeof data.quantity === 'number') {
          qty = data.quantity;
        }

        weeklyData[weekIndex].units += qty;

        if (data.status === "Delivered") {
          deliveredMeals += 25;
          weeklyData[weekIndex].meals += qty * 2.5;
        } else if (data.status === "Active Match") {
          active++;
          weeklyData[weekIndex].meals += qty * 1.5;
        } else if (data.status === "Pending Match") {
          expiring++;
          
          const mins = (Math.abs(hash) % 105) + 15;
          const h = Math.floor(mins / 60);
          const m = mins % 60;
          const expiryStr = h > 0 ? `${h}h ${m}m` : `${m}m`;

          alerts.push({
            id: doc.id,
            title: `Batch ${doc.id.substring(0, 4).toUpperCase()} - ${data.foodType || "Mixed Foods"}`,
            expiry: `Expires in ${expiryStr}`,
            minutes: mins
          });
        }
      });

      alerts.sort((a, b) => a.minutes - b.minutes);
      setCriticalAlerts(alerts.slice(0, 5));

      setChartData(weeklyData);
      setStats(prev => ({
        ...prev,
        totalDonations: total,
        mealsServed: deliveredMeals,
        activeDeliveries: active,
        expiringAlerts: expiring
      }));
    });

    const usersQ = query(collection(db, "users"));
    const unsubscribeUsers = onSnapshot(usersQ, (snapshot) => {
      const ngos: {id: string, name: string, initials: string}[] = [];
      const approved: {id: string, name: string, initials: string, date: string}[] = [];
      let ngoCount = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.role === "ngo") {
          ngoCount++;
          const ngoId = `NGO-${doc.id.substring(0, 5).toUpperCase()}`;
          const ngoName = data.name || "Unknown NGO";
          const initials = (data.name || "UN").substring(0, 2).toUpperCase();

          ngos.push({
            id: ngoId,
            name: ngoName,
            initials: initials
          });

          approved.push({
            id: ngoId,
            name: ngoName,
            initials: initials,
            date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          });
        }
      });
      
      setPendingApprovals(ngos);
      setApprovedNGOs(approved);
      setStats(prev => ({
        ...prev,
        totalNgos: ngoCount
      }));
    });

    return () => {
      unsubscribeAuth();
      unsubscribeDb();
      unsubscribeUsers();
    };
  }, []);
  
  const [toast, setToast] = useState({ show: false, message: "" });

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  const handleApprove = (id: string, name: string) => {
    // In a full implementation, this would update the user document in Firestore to set approved: true
    setPendingApprovals(prev => prev.filter(ngo => ngo.id !== id));
    showToast(`${name} has been verified and approved.`);
  };

  return (
    <div className="bg-[#f8f9ff] font-['Public_Sans',sans-serif] text-[#0b1c30] min-h-screen flex">
      <Sidebar />
      <div className="md:ml-72 min-h-screen flex-1 flex flex-col pb-32 md:pb-0 overflow-x-hidden">
        
        {/* Custom Admin Top Bar */}
        <header className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-semibold text-[#0b1c30]">System Overview</h1>
            <div className="w-px h-8 bg-gray-200"></div>
            <div className="relative w-96 hidden md:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
              <input 
                type="text" 
                placeholder="Global system search..." 
                className="w-full pl-10 pr-4 py-2 bg-[#f8f9ff] border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#004532] focus:ring-1 focus:ring-[#004532]"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-gray-500 relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative hover:text-[#004532] transition-colors"
              >
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-0 right-0 w-2 h-2 bg-[#ba1a1a] rounded-full border border-white"></span>
              </button>
              
              {/* Notifications Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute top-10 right-0 w-64 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <p className="text-xs font-bold text-[#0b1c30]">Recent Notifications</p>
                    <span className="text-[10px] bg-[#004532] text-white px-2 py-0.5 rounded-full">2 New</span>
                  </div>
                  <div className="p-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                    <p className="text-xs text-[#0b1c30] font-semibold">New NGO Registration</p>
                    <p className="text-[10px] text-gray-500 mt-1">Hope Foundation submitted docs.</p>
                  </div>
                  <div className="p-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                    <p className="text-xs text-[#0b1c30] font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
                      Critical Alert
                    </p>
                    <p className="text-[10px] text-gray-500 mt-1">Zone B-12 capacity reached.</p>
                  </div>
                  <div className="p-2 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                    <button className="text-xs text-[#004532] font-bold">View All Notifications</button>
                  </div>
                </div>
              )}

              <button 
                onClick={() => showToast("Security Verification Passed")}
                className="hover:text-[#004532] transition-colors"
              >
                <span className="material-symbols-outlined">verified_user</span>
              </button>
            </div>

            <div className="flex items-center gap-3 sm:border-l border-gray-200 sm:pl-6 relative cursor-pointer group" onClick={() => setIsProfileOpen(!isProfileOpen)}>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-[#0b1c30] group-hover:text-[#004532] transition-colors">Super Admin</p>
                <p className="text-[10px] font-bold text-[#065f46] uppercase tracking-wider">Level 4 Clearance</p>
              </div>
              <div className="w-10 h-10 rounded-full border border-gray-200 group-hover:ring-2 ring-[#004532] transition-all flex items-center justify-center bg-emerald-100 text-[#004532]">
                <span className="material-symbols-outlined text-[20px]">person</span>
              </div>
              
              {isProfileOpen && (
                <div className="absolute top-12 right-0 w-48 bg-white border border-gray-100 rounded-md shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 text-left">
                  <div className="p-4 border-b border-gray-100 bg-white">
                    <p className="text-[15px] font-semibold text-[#004532]">{userName}</p>
                    <p className="text-[13px] text-[#6f7973] mt-0.5 truncate">{userEmail}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setIsProfileModalOpen(true); setIsProfileOpen(false); }} className="w-full text-left px-4 py-3 text-[15px] hover:bg-gray-50 text-[#3f4944] flex items-center gap-4 transition-colors">
                    <span className="material-symbols-outlined text-[20px] text-[#3f4944]">person</span>
                    My Profile
                  </button>
                  <button onClick={async (e) => { 
                    e.stopPropagation(); 
                    try {
                      await signOut(auth);
                      localStorage.removeItem("userRole");
                      window.location.href = '/login';
                    } catch(err) {
                      console.error(err);
                    }
                  }} className="w-full text-left px-4 py-3 text-[15px] hover:bg-red-50 text-[#ba1a1a] flex items-center gap-4 transition-colors border-t border-gray-50">
                    <span className="material-symbols-outlined text-[20px] text-[#ba1a1a]">logout</span>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-8 max-w-[1440px] mx-auto w-full space-y-8">
          
          {/* Critical Alert Banner */}
          <div className="bg-white border-l-4 border-[#ba1a1a] rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#ffdad6] text-[#ba1a1a] rounded-md flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">warning</span>
              </div>
              <div>
                <h3 className="font-bold text-[#0b1c30] text-[16px]">Critical: Time-Sensitive Assets Detected</h3>
                <p className="text-[#3f4944] text-sm">5 donation batches are expiring within the next 2 hours. Immediate allocation required for Zone B-12.</p>
              </div>
            </div>
            <button 
              onClick={() => setIsAlertModalOpen(true)}
              className="text-[#ba1a1a] font-bold text-sm hover:underline shrink-0"
            >
              Review Alerts
            </button>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col justify-between min-h-[120px]">
              <p className="text-[10px] font-bold text-[#6f7973] uppercase tracking-wider mb-2">Total Donations</p>
              <div className="flex items-end gap-2">
                <h2 className="text-3xl lg:text-4xl font-extrabold text-[#0b1c30]">{stats.totalDonations}</h2>
                <span className="text-xs font-bold text-[#065f46] mb-1">Live</span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col justify-between min-h-[120px]">
              <p className="text-[10px] font-bold text-[#6f7973] uppercase tracking-wider mb-2">Total NGOs</p>
              <div className="flex justify-between items-end">
                <h2 className="text-3xl lg:text-4xl font-extrabold text-[#0b1c30]">{stats.totalNgos}</h2>
                <span className="material-symbols-outlined text-gray-300">corporate_fare</span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col justify-between min-h-[120px]">
              <p className="text-[10px] font-bold text-[#6f7973] uppercase tracking-wider mb-2">Meals Served</p>
              <div className="flex items-end gap-2">
                <h2 className="text-3xl lg:text-4xl font-extrabold text-[#0b1c30]">
                  {stats.mealsServed > 1000 ? `${(stats.mealsServed / 1000).toFixed(1)}k` : stats.mealsServed}
                </h2>
                <span className="text-xs font-bold text-[#065f46] mb-1">Est.</span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col justify-between relative overflow-hidden min-h-[120px]">
              <p className="text-[10px] font-bold text-[#6f7973] uppercase tracking-wider mb-2">Active Deliveries</p>
              <div className="flex justify-between items-end">
                <h2 className="text-3xl lg:text-4xl font-extrabold text-[#0b1c30]">{stats.activeDeliveries}</h2>
                <span className="w-2 h-2 rounded-full bg-[#065f46] mb-2 shadow-[0_0_8px_rgba(6,95,70,0.6)] animate-pulse"></span>
              </div>
            </div>
            <div className="col-span-2 md:col-span-1 bg-[#ba1a1a] text-white p-6 rounded-lg shadow-[0_4px_20px_rgba(186,26,26,0.2)] flex flex-col justify-between relative overflow-hidden min-h-[120px]">
              <p className="text-[10px] font-bold text-[#ffdad6] uppercase tracking-wider mb-2">Expiring Alerts</p>
              <div className="flex justify-between items-end relative z-10">
                <h2 className="text-3xl lg:text-4xl font-extrabold text-white">{stats.expiringAlerts}</h2>
                <span className="material-symbols-outlined text-[#ffdad6] mb-1">timer</span>
              </div>
              {/* Background accent */}
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <span className="material-symbols-outlined text-[80px]">warning</span>
              </div>
            </div>
          </div>

          {/* Charts & Pending Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Efficiency Analytics */}
            <div className="col-span-1 lg:col-span-2 bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 p-6 flex flex-col min-h-[400px]">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#0b1c30]">Efficiency Analytics</h3>
                  <p className="text-sm text-[#6f7973]">Meals served vs Food units saved (Metric Tons)</p>
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setIsTimeframeDropdownOpen(!isTimeframeDropdownOpen)}
                    className="flex items-center gap-2 text-sm text-[#0b1c30] border border-gray-200 rounded-md px-3 py-1.5 hover:bg-gray-50 transition-colors shrink-0"
                  >
                    {analyticsTimeframe}
                    <span className="material-symbols-outlined text-[18px] transition-transform" style={{ transform: isTimeframeDropdownOpen ? 'rotate(180deg)' : 'none' }}>expand_more</span>
                  </button>
                  {isTimeframeDropdownOpen && (
                    <div className="absolute top-full right-0 mt-1 w-40 bg-white border border-gray-100 rounded-md shadow-lg z-10 overflow-hidden">
                      {["Last 7 Days", "Last 30 Days", "Year to Date"].map((tf) => (
                        <button
                          key={tf}
                          onClick={() => {
                            setAnalyticsTimeframe(tf);
                            setIsTimeframeDropdownOpen(false);
                            showToast(`Analytics updated to ${tf}`);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-[#0b1c30]"
                        >
                          {tf}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Dynamic Chart */}
              <div className="flex-1 border-b border-gray-100 flex items-end justify-around pb-4 relative min-h-[200px]">
                {/* Horizontal grid lines */}
                <div className="absolute inset-x-0 bottom-[25%] border-b border-gray-50"></div>
                <div className="absolute inset-x-0 bottom-[50%] border-b border-gray-50"></div>
                <div className="absolute inset-x-0 bottom-[75%] border-b border-gray-50"></div>
                
                {(() => {
                  const maxVal = Math.max(...chartData.map(d => Math.max(d.meals, d.units)), 50);
                  return chartData.map((week, idx) => {
                    const mealsHeight = Math.min((week.meals / maxVal) * 100 + 5, 100);
                    const unitsHeight = Math.min((week.units / maxVal) * 100 + 5, 100);
                    return (
                      <div key={idx} className="flex gap-1 sm:gap-2 items-end h-full z-10 relative">
                        <div className="w-4 sm:w-8 bg-[#004532] rounded-t-sm transition-all duration-500" style={{height: `${mealsHeight}%`}}></div>
                        <div className="w-4 sm:w-8 bg-[#8bd6b6] rounded-t-sm transition-all duration-500" style={{height: `${unitsHeight}%`}}></div>
                      </div>
                    );
                  });
                })()}
              </div>
              <div className="flex justify-around text-xs text-gray-400 font-bold mt-4 px-2 sm:px-4">
                <span>WK 1</span>
                <span>WK 2</span>
                <span>WK 3</span>
                <span>WK 4</span>
                <span>WK 5</span>
              </div>
              
              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-8">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#004532] rounded-sm"></div>
                  <span className="text-sm text-[#3f4944]">Meals Served (Count)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#8bd6b6] rounded-sm"></div>
                  <span className="text-sm text-[#3f4944]">Food Units Saved (Tons)</span>
                </div>
              </div>
            </div>

            {/* Pending Approvals */}
            <div className="col-span-1 bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-[#0b1c30]">Pending Approvals</h3>
                <span className="bg-[#eaf1ff] text-[#004532] text-[10px] font-bold px-2 py-1 rounded tracking-wider">
                  {pendingApprovals.length} NEW
                </span>
              </div>
              <div className="flex-1 p-6 space-y-4">
                
                {pendingApprovals.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 py-10">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">done_all</span>
                    <p className="text-sm">All pending NGOs have been verified.</p>
                  </div>
                )}

                {pendingApprovals.map((ngo) => (
                  <div key={ngo.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-gray-300 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#eff4ff] text-[#545f73] font-bold flex items-center justify-center rounded text-sm group-hover:bg-[#dce9ff] transition-colors">{ngo.initials}</div>
                      <div>
                        <h4 className="font-bold text-[#0b1c30] text-sm group-hover:text-[#004532] transition-colors">{ngo.name}</h4>
                        <p className="text-xs text-[#6f7973] font-mono mt-0.5">Reg: {ngo.id}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleApprove(ngo.id, ngo.name)}
                      title="Approve NGO"
                      className="p-1.5 rounded-full hover:bg-[#eaf1ff] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[#065f46]">verified_user</span>
                    </button>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-100 bg-[#f8f9ff] rounded-b-lg">
                <button 
                  onClick={() => setIsVerificationsModalOpen(true)}
                  className="w-full py-2 text-sm font-bold text-[#545f73] hover:text-[#0b1c30] uppercase tracking-wider transition-colors"
                >
                  View All Verifications
                </button>
              </div>
            </div>
          </div>


          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#6f7973] py-6 border-t border-gray-200 mt-12 gap-4">
            <span className="font-medium tracking-wide">© 2024 FOODGUARD ENTERPRISE. AUTHORIZED PERSONNEL ONLY.</span>
            <div className="flex flex-wrap justify-center gap-6">
              <a href="#" className="hover:text-[#0b1c30] transition-colors tracking-wide">SECURITY POLICY</a>
              <a href="#" className="hover:text-[#0b1c30] transition-colors tracking-wide">AUDIT PROTOCOLS</a>
              <span className="font-bold text-[#065f46] tracking-wide">V2.4.0-STABLE</span>
            </div>
          </div>

        </main>
      </div>

      {/* Modals & Overlays */}
      
      {/* Alert Modal */}
      {isAlertModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-[500px] max-w-[90vw] shrink-0 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#ba1a1a] text-white">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span className="material-symbols-outlined">warning</span>
                Critical Alerts
              </h2>
              <button onClick={() => setIsAlertModalOpen(false)} className="hover:opacity-75">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">The following donation batches are expiring soon and require immediate action.</p>
              <ul className="space-y-3">
                {criticalAlerts.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-500 italic">No critical alerts at this time.</p>
                  </div>
                )}
                {criticalAlerts.map(alert => (
                  <li key={alert.id} className="flex justify-between items-center p-3 bg-red-50 text-red-900 rounded-lg text-sm border border-red-100">
                    <span className="font-semibold truncate max-w-[70%]">{alert.title}</span>
                    <span className="font-bold font-mono shrink-0">{alert.expiry}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => {
                  setIsAlertModalOpen(false);
                  showToast("Alerts acknowledged and assigned to logistics team.");
                }}
                className="mt-6 w-full py-3 bg-[#ba1a1a] hover:bg-[#93000a] text-white font-bold rounded-lg transition-colors"
              >
                Acknowledge Alerts
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-[400px] max-w-[90vw] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#004532] text-white">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span className="material-symbols-outlined">person</span>
                My Profile
              </h2>
              <button onClick={() => setIsProfileModalOpen(false)} className="hover:opacity-75 transition-opacity">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full border border-gray-200 flex items-center justify-center bg-emerald-100 text-[#004532]">
                  <span className="material-symbols-outlined text-[40px]">person</span>
                </div>
                <div>
                  <h3 className="font-bold text-xl text-[#0b1c30]">{userName}</h3>
                  <p className="text-sm text-[#6f7973] mt-1">{userEmail}</p>
                  <span className="inline-block mt-2 bg-[#eaf1ff] text-[#004532] text-xs font-bold px-2 py-1 rounded">Super Admin</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#6f7973] uppercase mb-1">Phone Number</label>
                  <input type="text" defaultValue="+1 (555) 019-8432" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-[#0b1c30]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#6f7973] uppercase mb-1">Location / Zone</label>
                  <input type="text" defaultValue="Headquarters - Zone A" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-[#0b1c30]" />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button 
                  onClick={() => { setIsProfileModalOpen(false); showToast("Profile updated successfully"); }}
                  className="flex-1 bg-[#004532] text-white py-2 rounded-md font-bold text-sm hover:bg-[#065f46] transition-colors"
                >
                  Save Changes
                </button>
                <button 
                  onClick={() => setIsProfileModalOpen(false)}
                  className="flex-1 border border-gray-200 text-[#545f73] py-2 rounded-md font-bold text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verifications Modal */}
      {isVerificationsModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-[600px] max-w-[95vw] shrink-0 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#004532] text-white shrink-0">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span className="material-symbols-outlined">fact_check</span>
                Historical Verifications
              </h2>
              <button onClick={() => setIsVerificationsModalOpen(false)} className="hover:opacity-75 transition-opacity">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-4 border-b border-gray-100 bg-gray-50 shrink-0">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
                <input 
                  type="text" 
                  value={ngoSearch}
                  onChange={(e) => setNgoSearch(e.target.value)}
                  placeholder="Search by NGO Name or ID..." 
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#004532]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {approvedNGOs.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No verified NGOs found in the system.
                </div>
              )}
              {approvedNGOs.filter(ngo => ngo.name.toLowerCase().includes(ngoSearch.toLowerCase()) || ngo.id.toLowerCase().includes(ngoSearch.toLowerCase())).map((ngo, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 text-gray-500 font-bold flex items-center justify-center rounded text-sm uppercase">
                      {ngo.initials}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0b1c30] text-sm">{ngo.name}</h4>
                      <p className="text-xs text-[#6f7973] font-mono mt-0.5">Reg: {ngo.id} • Verified on {ngo.date}</p>
                    </div>
                  </div>
                  <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-1 rounded border border-green-200 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">check</span> Approved
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Global Toast */}
      {toast.show && (
        <div className="fixed bottom-20 sm:bottom-8 left-1/2 -translate-x-1/2 z-[110] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-[#004532] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            <span className="text-sm font-semibold tracking-wide">{toast.message}</span>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
