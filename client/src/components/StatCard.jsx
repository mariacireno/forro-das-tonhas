export default function StatCard({ label, value, sub, color = 'bg-tonha-amber', icon }) {
  return (
    <div className="card flex items-start gap-4">
      <div className={`${color} rounded-xl p-3 flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-tonha-brown/60 mb-0.5">{label}</p>
        <p className="text-xl font-bold text-tonha-brown">{value}</p>
        {sub && <p className="text-xs text-tonha-brown/50 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}
