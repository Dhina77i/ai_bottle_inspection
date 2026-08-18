import { motion } from "framer-motion";

export default function StatCard({ label, value = 0, icon: Icon, tone = "cyan", change = null }) {
  return (
    <motion.div
      className={`stat-card glass ${tone}`}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
    >
      <div className="stat-left">
        <div className="stat-icon-glow">
          <div className="stat-icon">{Icon && <Icon size={18} />}</div>
        </div>
        <div className="stat-content">
          <div className="stat-label-row">
            <span className="stat-label">{label}</span>
            {change !== null && (
              <span className={`stat-change ${change >= 0 ? 'up' : 'down'}`}>{change > 0 ? `+${change}%` : `${change}%`}</span>
            )}
          </div>
          <strong className="stat-value">{Number(value || 0).toLocaleString()}</strong>
        </div>
      </div>
    </motion.div>
  );
}
