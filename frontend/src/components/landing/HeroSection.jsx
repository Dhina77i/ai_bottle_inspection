import { motion } from "framer-motion";
import { ArrowRight, Play, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const chartData = [
  { name: "1m", value: 82 },
  { name: "2m", value: 86 },
  { name: "3m", value: 89 },
  { name: "4m", value: 87 },
  { name: "5m", value: 91 },
  { name: "6m", value: 94 }
];
const defectData = [
  { name: "Minor", value: 55 },
  { name: "Critical", value: 25 },
  { name: "Accepted", value: 20 }
];
const COLORS = ["#38bdf8", "#0ea5e9", "#22c55e"];
const metrics = [
  { label: "Total Inspections", value: "12.4k" },
  { label: "Defects Detected", value: "238" },
  { label: "Accuracy", value: "98.7%" },
  { label: "Uptime", value: "99.95%" }
];
const recent = [
  { id: "BW-124", status: "Critical", color: "bg-fuchsia-500/15 text-fuchsia-200" },
  { id: "BW-203", status: "Minor", color: "bg-cyan-500/15 text-cyan-200" },
  { id: "BW-317", status: "Accepted", color: "bg-emerald-500/15 text-emerald-200" }
];

export default function HeroSection() {
  return (
    <section id="home" className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute -left-24 top-20 h-[420px] w-[420px] rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-[420px] w-[420px] rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 lg:px-8 xl:flex-row xl:items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <p className="mb-6 inline-flex rounded-full bg-white/5 px-4 py-2 text-sm uppercase tracking-[0.32em] text-cyan-200 ring-1 ring-white/10 backdrop-blur-xl">
            Industrial AI for quality assurance
          </p>
          <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl">
            AI Powered Water Bottle Inspection System
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
            Real-time defect detection using computer vision and deep learning. Built for industrial automation and quality assurance.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href="/app"
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 px-7 py-4 text-sm font-semibold text-slate-950 shadow-[0_24px_80px_rgba(56,189,248,0.24)] transition hover:-translate-y-0.5"
            >
              Start Inspection
            </a>
            <a
              href="#analytics-preview"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-sm font-semibold text-white transition hover:border-sky-400/40 hover:text-sky-300"
            >
              <Play size={16} />
              View Live Demo
            </a>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { title: "High Accuracy", icon: ShieldCheck },
              { title: "Real-Time Processing", icon: TrendingUp },
              { title: "Industrial Ready", icon: Sparkles },
              { title: "Smart Analytics", icon: ArrowRight }
            ].map((item) => (
              <div key={item.title} className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 shadow-[0_30px_90px_rgba(15,23,42,0.15)] backdrop-blur-xl">
                <item.icon className="mb-4 h-7 w-7 text-cyan-300" />
                <p className="text-sm font-semibold text-white">{item.title}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-full max-w-3xl"
        >
          <div className="rounded-[32px] border border-white/10 bg-slate-950/75 p-7 shadow-[0_40px_120px_rgba(15,23,42,0.3)] backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-sm text-slate-300">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-3.5 w-3.5 rounded-full bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.35)]" />
                <span>Live inspection dashboard</span>
              </div>
              <span className="rounded-2xl bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-400">
                Real-time status
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {metrics.map((metric) => (
                <div key={metric.label} className="rounded-3xl border border-white/10 bg-slate-950/85 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.25)] backdrop-blur-xl">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{metric.label}</p>
                  <p className="mt-4 text-3xl font-semibold text-white">{metric.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_0.7fr]">
              <div className="rounded-3xl border border-white/10 bg-slate-950/85 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.25)] backdrop-blur-xl">
                <div className="mb-3 flex items-center justify-between text-sm text-slate-400">
                  <span>Throughput</span>
                  <span>+12% vs last hour</span>
                </div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <Tooltip contentStyle={{ background: "rgba(15,23,42,0.96)", border: "1px solid rgba(148,163,184,0.16)", borderRadius: 16, color: "#e2e8f0" }} />
                      <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/85 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.25)] backdrop-blur-xl">
                <div className="mb-3 flex items-center justify-between text-sm text-slate-400">
                  <span>Defect Mix</span>
                  <span className="text-white">Live</span>
                </div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={defectData} dataKey="value" innerRadius={40} outerRadius={68} paddingAngle={2}>
                        {defectData.map((entry, index) => (
                          <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[28px] border border-white/10 bg-slate-950/85 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.2)] backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between text-sm text-slate-400">
                <span className="font-semibold text-white">Recent detections</span>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-400">Live feed</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {recent.map((item) => (
                  <div key={item.id} className={`rounded-3xl border border-white/10 p-4 ${item.color}`}>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-300">{item.id}</p>
                    <p className="mt-4 text-lg font-semibold text-white">{item.status}</p>
                    <div className="mt-6 h-24 rounded-3xl bg-white/5" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
