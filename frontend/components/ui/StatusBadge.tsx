interface StatusBadgeProps {
  status: "pending" | "accepted" | "delivered" | "in-transit" | "urgent" | "available";
}

const statusConfig = {
  pending: { label: "Pending", className: "bg-amber-50 text-amber-600 border border-amber-100" },
  accepted: { label: "Accepted", className: "bg-emerald-50 text-emerald-600 border border-emerald-100" },
  delivered: { label: "Delivered", className: "bg-blue-50 text-blue-600 border border-blue-100" },
  "in-transit": { label: "In Transit", className: "bg-blue-50 text-blue-600 border border-blue-100" },
  urgent: { label: "Urgent", className: "bg-red-500 text-white" },
  available: { label: "Available", className: "bg-[#10b981] text-white" },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${config.className}`}
    >
      {config.label}
    </span>
  );
}
