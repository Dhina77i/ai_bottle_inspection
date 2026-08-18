import { motion } from "framer-motion";
import { ArrowRight, BarChart3, CircleDot, HardDrive, Server, ShieldCheck } from "lucide-react";

const steps = [
  { title: "Upload Video", icon: ArrowRight },
  { title: "AI Detection", icon: ShieldCheck },
  { title: "Defect Analysis", icon: CircleDot },
  { title: "Database Storage", icon: Server },
  { title: "Analytics Dashboard", icon: BarChart3 },
  { title: "Export Reports", icon: HardDrive }
];

export default function WorkflowSection() {
  return (
    <section className="relative py-24" id="workflow">
      <div className="pointer-events-none absolute left-0 top-0 h-full w-full bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.12),_transparent_30%)]" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-12 max-w-2xl">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Industrial workflow</p>
          <h2 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">From capture to insight in a seamless pipeline.</h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">A concise operational flow engineered for enterprise teams and real-time decision-making.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="relative rounded-[28px] border border-white/10 bg-slate-950/70 p-6 text-center shadow-[0_20px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl"
              >
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-500 to-cyan-400 text-white shadow-[0_24px_80px_rgba(56,189,248,0.22)]">
                  <Icon size={22} />
                </div>
                <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Step {index + 1}</p>
                <h3 className="mt-4 text-lg font-semibold text-white">{step.title}</h3>
                {index < steps.length - 1 && (
                  <div className="pointer-events-none absolute -right-3 top-1/2 hidden h-[2px] w-6 translate-y-[-50%] rounded-full bg-cyan-300/60 lg:block" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
