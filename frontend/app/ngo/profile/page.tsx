import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";

export default function NgoProfile() {
  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen">
      <Sidebar />
      <div className="md:ml-72 min-h-screen pb-32 md:pb-0">
        <TopBar title="Food Bridge" />

        <main className="max-w-6xl mx-auto px-4 pt-8 pb-32">
          {/* Profile Header Bento Style */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
            <div className="md:col-span-8 bg-surface-container-lowest p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-sm flex-shrink-0">
                <img alt="NGO Building" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=400&fit=crop" />
              </div>
              <div className="flex-grow text-center md:text-left">
                <h2 className="text-2xl font-bold text-primary mb-1 font-['Work_Sans']">Community Outreach Foundation</h2>
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-slate-600 mb-4">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-lg">location_on</span>
                    <span className="text-sm font-bold">San Francisco, CA</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-lg text-amber-400">star</span>
                    <span className="text-sm font-bold">4.9</span>
                    <span className="text-xs opacity-60">(128 reviews)</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-semibold">Certified Partner</span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">Tier 1 Logistics</span>
                </div>
              </div>
            </div>

            {/* Statistics Grid */}
            <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-6">
              <div className="bg-emerald-900 text-white p-6 rounded-xl shadow-lg flex flex-col justify-center">
                <span className="text-xs opacity-80 uppercase tracking-widest font-bold">Meals Served</span>
                <h3 className="text-3xl font-bold font-['Work_Sans']">42,850+</h3>
                <div className="mt-2 w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-300 h-full w-[85%] rounded-full"></div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col justify-center">
                <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Active Volunteers</span>
                <h3 className="text-3xl font-bold text-primary font-['Work_Sans']">312</h3>
                <p className="text-xs text-emerald-700 mt-1 font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">trending_up</span> 
                  +12% this month
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Settings Menu */}
            <div className="lg:col-span-1 space-y-6">
              <section className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-lg font-bold text-primary flex items-center gap-2 font-['Work_Sans']">
                    <span className="material-symbols-outlined">settings</span>
                    Account Settings
                  </h3>
                </div>
                <div className="flex flex-col">
                  <button className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-slate-500">person_edit</span>
                      <span className="font-medium text-slate-700">Edit Profile</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">chevron_right</span>
                  </button>
                  <button className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group border-t border-slate-50">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-slate-500">description</span>
                      <span className="font-medium text-slate-700">Manage Documents</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">chevron_right</span>
                  </button>
                  <button className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group border-t border-slate-50">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-slate-500">security</span>
                      <span className="font-medium text-slate-700">Security & Privacy</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">chevron_right</span>
                  </button>
                  <button className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group border-t border-slate-50">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-slate-500">help_center</span>
                      <span className="font-medium text-slate-700">Support Center</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">chevron_right</span>
                  </button>
                </div>
              </section>

              <button className="w-full py-4 bg-white border border-error/20 text-error rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-error/5 transition-colors active:scale-95 shadow-sm">
                <span className="material-symbols-outlined">logout</span>
                Logout
              </button>
            </div>

            {/* Notifications & Interactive Section */}
            <div className="lg:col-span-2 space-y-6">
              <section className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-lg font-bold text-primary flex items-center gap-2 font-['Work_Sans']">
                    <span className="material-symbols-outlined">notifications_active</span>
                    Notification Settings
                  </h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800">Alerts for nearby food</h4>
                      <p className="text-xs text-slate-500 mt-1">Real-time push notifications when food is available within 5 miles.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input className="sr-only peer" type="checkbox" defaultChecked />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800">Expiry warnings</h4>
                      <p className="text-xs text-slate-500 mt-1">Get notified 24 hours before claimed food items reach their expiry date.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input className="sr-only peer" type="checkbox" defaultChecked />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800">Weekly Impact Summary</h4>
                      <p className="text-xs text-slate-500 mt-1">Email digest of your organization&apos;s contributions and reached targets.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input className="sr-only peer" type="checkbox" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>
              </section>

              {/* Documents Section */}
              <section className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-100 p-6">
                <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2 font-['Work_Sans']">
                  <span className="material-symbols-outlined">folder_shared</span>
                  Verification Documents
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="material-symbols-outlined text-emerald-700 mr-3">verified_user</span>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Tax ID (501c3)</p>
                      <p className="text-[10px] text-slate-500">Verified • Dec 2023</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="material-symbols-outlined text-emerald-700 mr-3">health_and_safety</span>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Health Permit</p>
                      <p className="text-[10px] text-slate-500">Verified • Jan 2024</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
