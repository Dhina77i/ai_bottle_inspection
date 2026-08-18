import { motion } from "framer-motion";
import { Code2, Cpu, Database, Layers, Wifi, ShieldCheck, Sparkles } from "lucide-react";

const stack = [
  { name: "YOLOv8", icon: Sparkles },
  { name: "PyTorch", icon: Cpu },
  { name: "WebSocket", icon: Wifi },
  { name: "FastAPI", icon: Code2 },
  { name: "SQLite", icon: Database },
  { name: "React", icon: Layers },
  { name: "Tailwind", icon: ShieldCheck }
];

export default function TechStackSection() {
  return (
    <section className="relative py-24" id="tech-stack">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-12 max-w-2xl">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Technology stack</p>
          <h2 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">Built on powerful AI and modern infrastructure.</h2>
          <p className="mt-4 text-lg leading-8 text-slate-300">A premium foundation for scalable industrial inspection and realtime analytics.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stack.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.18)] backdrop-blur-xl transition hover:border-cyan-400/30"
              >
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-500 to-cyan-400 text-white shadow-[0_24px_70px_rgba(56,189,248,0.22)]">
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-semibold text-white">{item.name}</h3>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
