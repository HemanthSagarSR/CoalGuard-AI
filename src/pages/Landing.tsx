import { motion } from "framer-motion";
import { Link } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Shield,
  Mountain,
  Brain,
  Map,
  Search,
  AlertTriangle,
  ScrollText,
  ArrowRight,
  Users,
} from "lucide-react";

const features = [
  { icon: Mountain, title: "Mine Catalog", desc: "Browse all mines in one place with risk scores, compliance status, and production data." },
  { icon: Shield, title: "Compliance Tracking", desc: "Monitor statutory requirements, deadlines, and completion rates across categories." },
  { icon: Search, title: "Field Inspections", desc: "Create inspection reports with GPS, severity levels, and convert findings into corrective actions." },
  { icon: AlertTriangle, title: "Violation Management", desc: "Track violations from discovery to resolution with automated escalation." },
  { icon: Brain, title: "AI Risk Engine", desc: "Weighted scoring across safety, compliance, and operational factors." },
  { icon: Map, title: "GIS Map", desc: "Interactive geographic view of all mines with risk-level indicators." },
  { icon: ScrollText, title: "Audit Trail", desc: "Tamper-evident logging for accountability and data integrity." },
  { icon: Users, title: "Role-Based Access", desc: "Differentiated access for administrators, mine officials, inspectors, and regulators." },
];

const stats = [
  { value: "12+", label: "Coal Mines" },
  { value: "100%", label: "Visibility" },
  { value: "24/7", label: "Monitoring" },
  { value: "Real-time", label: "Risk Alerts" },
];

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen bg-[#EDE8E3] overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#EDE8E3]/80 backdrop-blur-xl border-b border-white/30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#5B7F6E] text-white shadow-lg">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">CoalGuard AI-V1</h1>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Governance Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth" className="clay-button text-sm !py-2 !px-5">
              Sign In <ArrowRight className="inline h-3.5 w-3.5 ml-1" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-xs font-medium text-[#5B7F6E] bg-[#5B7F6E]/10 rounded-full">
              <div className="h-1.5 w-1.5 rounded-full bg-[#6BCB77] animate-pulse" />
              AI-Powered Governance
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-foreground leading-tight mb-6">
              From scattered records to{" "}
              <span className="text-[#5B7F6E]">clear decisions</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              A single platform for compliance tracking, field inspections,
              violation management, and risk intelligence across Indian coal mining operations.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/auth" className="clay-button text-base !py-3 !px-8 flex items-center gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16"
          >
            {stats.map((s, i) => (
              <div key={i} className="clay-card text-center">
                <p className="text-3xl font-black text-[#5B7F6E]">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-white/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-3">Platform Capabilities</h2>
            <p className="text-muted-foreground">Everything you need to manage coal mine governance in one place</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="clay-card h-full">
                  <div className="clay-inset flex h-12 w-12 items-center justify-center rounded-2xl mb-4">
                    <f.icon className="h-5 w-5 text-[#5B7F6E]" />
                  </div>
                  <h3 className="text-sm font-bold mb-2">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-12">How It Works</h2>
          <div className="clay-card">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { step: "01", title: "Collect", desc: "Inspections, compliance records, and violation reports flow into the platform from the field and the office." },
                { step: "02", title: "Analyze", desc: "The AI risk engine scores each mine across seven weighted factors to surface at-risk operations." },
                { step: "03", title: "Act", desc: "Dashboards, alerts, and the AI assistant drive governance decisions and corrective actions." },
              ].map((s, i) => (
                <div key={i} className="clay-inset rounded-2xl p-6 text-center">
                  <p className="text-4xl font-black text-[#5B7F6E]/20 mb-2">{s.step}</p>
                  <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="clay-card">
            <Shield className="h-12 w-12 text-[#5B7F6E] mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">Ready to Transform Mine Governance?</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-lg mx-auto">
              Centralized data, AI-powered risk intelligence, and transparent audit trails
              for safer, more compliant operations.
            </p>
            <Link to="/auth" className="clay-button inline-flex items-center gap-2 text-sm !py-3 !px-8">
              Start Now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#5B7F6E]" />
            <span className="text-sm font-bold">CoalGuard AI-V1</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Demo environment — data shown is synthetic</p>
        </div>
      </footer>
    </div>
  );
}
