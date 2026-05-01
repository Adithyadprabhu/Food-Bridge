interface StatCardProps {
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  badge?: string;
  badgeColor?: string;
  subtitle?: string;
}

export default function StatCard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  badge,
  badgeColor = "text-emerald-500",
  subtitle,
}: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className={`p-3 ${iconBg} ${iconColor} rounded-xl`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        {badge && <span className={`${badgeColor} font-bold text-xs`}>{badge}</span>}
      </div>
      <div className="mt-4">
        <p className="text-gray-500 font-semibold text-xs uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-black text-[#151c27] mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
