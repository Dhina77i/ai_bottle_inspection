import { motion } from "framer-motion";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const lineData = [
  { name: "Jan", inspections: 3400, defects: 210 },
  { name: "Feb", inspections: 4100, defects: 190 },
  { name: "Mar", inspections: 4650, defects: 175 },
  { name: "Apr", inspections: 5200, defects: 162 },
  { name: "May", inspections: 5900, defects: 145 },
  { name: "Jun", inspections: 6210, defects: 132 }
];

const pieData = [
  { name: "Pass", value: 88 },
  { name: "Fail", value: 12 }
];

const heatmapGrid = Array.from({ length: 16 }).map((_, index) => ({
  intensity: Math.random() * 0.7 + 0.15
}));

const COLORS = ["#38bdf8", "#0ea5e9"];

const stats = [
  { label: "Pass Rate", value: "88%" },
  { label: "Fail Rate", value: "12%" },
  { label: "Alerts", value: "24" },
  { label: "Live Rate", value: "99.8%" }
];

export default function AnalyticsPreviewSection() {
  return (
    <section className="relative py-24" id="analytics-preview">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-12 max-w-2xl">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Analytics preview</p>
          <h2 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">Deep operational insights with advanced analytics.</h2>
          <p className="mt-4 text-lg leading-8 text-slate-300">A comprehensive visual dashboard for monitoring defect trends and system performance.</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="rounded-[32px] border border-white/10 bg-slate-950/70 p-8 shadow-[0_30px_100px_rgba(15,23,42,0.22)] backdrop-blur-xl"
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Trend overview</p>
                <h3 className="mt-3 text-2xl font-semibold text-white">Inspection performance</h3>
              </div>
              <div className="rounded-3xl bg-white/5 px-4 py-2 text-sm text-slate-300">Live updates</div>
            </div>
            <div className="h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={lineData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradientInspections" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.55} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.96)', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 16, color: '#e2e8f0' }} />
                  <Legend wrapperStyle={{ color: '#94a3b8' }} />
                  <Area type="monotone" dataKey="inspections" stroke="#38bdf8" strokeWidth={3} fill="url(#gradientInspections)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <div className="grid gap-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="rounded-[32px] border border-white/10 bg-slate-950/70 p-6 shadow-[0_30px_100px_rgba(15,23,42,0.22)] backdrop-blur-xl"
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-white">Pass/Fail split</h3>
                <span className="rounded-3xl bg-white/5 px-3 py-1 text-sm text-slate-300">Realtime</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" innerRadius={52} outerRadius={88} paddingAngle={4}>
                      {pieData.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="rounded-[32px] border border-white/10 bg-slate-950/70 p-6 shadow-[0_30px_100px_rgba(15,23,42,0.22)] backdrop-blur-xl"
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-white">Detection heatmap</h3>
                <span className="rounded-3xl bg-white/5 px-3 py-1 text-sm text-slate-300">AI layer</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {heatmapGrid.map((cell, index) => (
                  <div
                    key={index}
                    className="h-16 rounded-3xl bg-gradient-to-br from-sky-500/10 to-cyan-400/10"
                    style={{ opacity: cell.intensity, boxShadow: `0 0 ${8 + cell.intensity * 24}px rgba(56,189,248,${0.18 + cell.intensity * 0.22})` }}
                  />
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="rounded-[32px] border border-white/10 bg-slate-950/70 p-6 shadow-[0_30px_100px_rgba(15,23,42,0.22)] backdrop-blur-xl"
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-white">Live inspection feed</h3>
                <span className="rounded-3xl bg-white/5 px-3 py-1 text-sm text-slate-300">Stream</span>
              </div>
              <div className="space-y-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-3xl border border-white/10 bg-slate-950/80 p-4">
                    <p className="text-sm text-slate-400">{stat.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{stat.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
