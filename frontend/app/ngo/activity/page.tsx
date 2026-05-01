import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";

export default function NgoActivity() {
  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen">
      <Sidebar />
      <div className="md:ml-72 min-h-screen pb-32 md:pb-0">
        <TopBar title="Food Bridge" />

        <main className="max-w-4xl mx-auto px-4 mt-8 pb-24">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary mb-6 font-['Work_Sans']">Recent Activity</h1>
          </div>
          <div className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden flex flex-col">
            <div className="p-6 space-y-4">
              {/* Activity 1 */}
              <div className="flex gap-4 items-start">
                <div className="bg-emerald-50 p-2 rounded-lg text-emerald-700 shrink-0">
                  <span className="material-symbols-outlined">check_circle</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary">Donation accepted</p>
                  <p className="text-xs text-outline mt-1">City Bakery accepted your request for 10 units.</p>
                  <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold tracking-widest">2 MINS AGO</p>
                </div>
              </div>
              <hr className="border-slate-50" />
              
              {/* Activity 2 */}
              <div className="flex gap-4 items-start">
                <div className="bg-emerald-50 p-2 rounded-lg text-emerald-700 shrink-0">
                  <span className="material-symbols-outlined">notifications_active</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary">New dairy donation</p>
                  <p className="text-xs text-outline mt-1">Dairy Coop added 50 units available 2.5 miles away.</p>
                  <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold tracking-widest">15 MINS AGO</p>
                </div>
              </div>
              <hr className="border-slate-50" />
              
              {/* Activity 3 */}
              <div className="flex gap-4 items-start">
                <div className="bg-emerald-50 p-2 rounded-lg text-emerald-700 shrink-0">
                  <span className="material-symbols-outlined">local_shipping</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary">Delivery scheduled</p>
                  <p className="text-xs text-outline mt-1">Volunteer #124 is en route to pick up your order.</p>
                  <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold tracking-widest">1 HOUR AGO</p>
                </div>
              </div>
              <hr className="border-slate-50" />
              
              {/* Activity 4 */}
              <div className="flex gap-4 items-start">
                <div className="bg-error-container/50 p-2 rounded-lg text-error shrink-0">
                  <span className="material-symbols-outlined">history</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary">Summary available</p>
                  <p className="text-xs text-outline mt-1">Weekly impact report for November is ready.</p>
                  <p className="text-[10px] text-slate-400 mt-2 uppercase font-bold tracking-widest">5 HOURS AGO</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
