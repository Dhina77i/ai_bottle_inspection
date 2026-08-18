import { motion } from "framer-motion";

export default function CTASection() {
  return (
    <section className="relative py-24" id="cta">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),_transparent_24%)]" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-950/80 via-slate-900/60 to-slate-950/80 p-8 shadow-[0_50px_130px_rgba(15,23,42,0.25)] backdrop-blur-2xl"
        >
          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Transform quality control</p>
              <h2 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">Transform Industrial Quality Inspection with AI</h2>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">Deploy a unified inspection platform that combines realtime defect detection, predictive analytics, and automated reporting for modern manufacturing operations.</p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
              <a
                href="/app"
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 px-7 py-4 text-sm font-semibold text-slate-950 shadow-[0_24px_80px_rgba(56,189,248,0.24)] transition hover:-translate-y-0.5"
              >
                Start Free Demo
              </a>
              <a
                href="#documentation"
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-sm font-semibold text-white transition hover:border-cyan-400/30 hover:text-sky-300"
              >
                View Documentation
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
