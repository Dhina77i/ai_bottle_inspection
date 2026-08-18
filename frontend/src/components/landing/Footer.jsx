import { Github, Linkedin, Mail, Globe, FileText } from "lucide-react";
import logoUrl from "../../assets/logo.png";

const links = [
  { label: "Documentation", href: "#documentation" },
  { label: "Privacy Policy", href: "#privacy" },
  { label: "Terms", href: "#terms" },
  { label: "Contact", href: " info@seewise.ai" }
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-slate-950/80 py-16 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr] xl:grid-cols-[1.8fr_1fr]">
          <div className="space-y-6">
            <div>
              <img
                src={logoUrl}
                alt="SeeWise Logo"
                className="h-9 w-auto object-contain"
              />
              <p className="mt-2 text-slate-400">Industrial AI for real-time inspection.</p>
            </div>
            <p className="max-w-xl text-slate-400">SeeWise.ai brings premium computer vision workflows to manufacturing quality assurance with enterprise-grade analytics, live monitoring, and automation.</p>
            <div className="flex flex-wrap gap-3 text-slate-400">
              <a href="https://github.com" className="inline-flex items-center gap-2 text-sm transition hover:text-white"><Github size={16} /> GitHub</a>
              <a href="https://linkedin.com" className="inline-flex items-center gap-2 text-sm transition hover:text-white"><Linkedin size={16} /> LinkedIn</a>
              <a href="mailto:hello@seewise.ai" className="inline-flex items-center gap-2 text-sm transition hover:text-white"><Mail size={16} /> Email</a>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Quick links</p>
              <div className="mt-5 space-y-3">
                {links.map((link) => (
                  <a key={link.label} href={link.href} className="block text-sm text-slate-400 transition hover:text-white">
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Resources</p>
              <div className="mt-5 space-y-3">
                <a href="#reports" className="block text-sm text-slate-400 transition hover:text-white">Reports</a>
                <a href="#analytics-preview" className="block text-sm text-slate-400 transition hover:text-white">Analytics</a>
                <a href="#workflow" className="block text-sm text-slate-400 transition hover:text-white">Workflow</a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-sm text-slate-500">© 2026 SeeWise.ai. All rights reserved.</div>
      </div>
    </footer>
  );
}
