import { motion } from "framer-motion";
import { Cpu, Eye, Activity, BarChart3 } from "lucide-react";

const features = [
  {
    title: "AI Vision Intelligence",
    description: "Detect anomalies with precision and industrial confidence.",
    icon: Eye,
    gradient: "from-sky-500 to-cyan-400"
  },
  {
    title: "Real-time Inspection",
    description: "Process video streams instantly with millisecond latency.",
    icon: Activity,
    gradient: "from-violet-500 to-fuchsia-500"
  },
  {
    title: "Live Monitoring",
    description: "Track inspection status with live alerts and dashboards.",
    icon: Cpu,
    gradient: "from-emerald-400 to-cyan-500"
  },
  {
    title: "Advanced Analytics",
    description: "Visualize defect trends and operational insights.",
    icon: BarChart3,
    gradient: "from-blue-500 to-sky-500"
  }
];

export default function FeaturesSection() {
  return (
    <section className="relative py-24" id="features">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-12 max-w-2xl">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Core capabilities</p>
          <h2 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">Premium feature sets for industrial inspection.</h2>
          <p className="mt-4 text-lg leading-8 text-slate-300">A modern platform designed to accelerate quality control and empower operational teams with intelligent insights.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="group rounded-[28px] border border-white/10 bg-slate-950/70 p-8 shadow-[0_30px_90px_rgba(15,23,42,0.18)] transition hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-slate-900/85"
              >
                <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br ${feature.gradient} text-white shadow-[0_24px_70px_rgba(56,189,248,0.22)]`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-300">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
