import { useQuery } from "@/lib/local-api";
import { api } from "@/lib/local-api";
import AppLayout from "@/components/AppLayout";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Brain, TrendingUp, AlertTriangle } from "lucide-react";
import { Link } from "react-router";

const riskColors: Record<string, string> = {
  LOW: "#6BCB77", MEDIUM: "#FFD93D", HIGH: "#FF8C32", CRITICAL: "#FF4757",
};
const riskBg: Record<string, string> = {
  LOW: "bg-[#E8F5E9] text-[#2E7D32]", MEDIUM: "bg-[#FFF8E1] text-[#F57F17]",
  HIGH: "bg-[#FFF3E0] text-[#E65100]", CRITICAL: "bg-[#FFEBEE] text-[#C62828]",
};

export default function RiskPage() {
  const mines = useQuery(api.mines.list);

  if (!mines) {
    return <AppLayout><div className="flex items-center justify-center h-64 text-muted-foreground animate-pulse">Loading risk intelligence...</div></AppLayout>;
  }

  const sorted = [...mines].sort((a: any, b: any) => b.riskScore - a.riskScore);
  const critical = sorted.filter((m: any) => m.riskLevel === "CRITICAL");
  const high = sorted.filter((m: any) => m.riskLevel === "HIGH");

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Risk Intelligence</h1>
          <p className="text-sm text-muted-foreground mt-1">AI-powered risk assessment and scoring engine</p>
        </div>

        {/* Methodology */}
        <div className="clay-card">
          <div className="flex items-center gap-3 mb-3">
            <Brain className="h-5 w-5 text-[#8B7EC8]" />
            <h3 className="text-sm font-bold">Risk Scoring Methodology</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { factor: "Safety Violations", weight: "25%" },
              { factor: "Overdue Actions", weight: "20%" },
              { factor: "Recurring Violations", weight: "15%" },
              { factor: "Environmental Issues", weight: "10%" },
              { factor: "Labour Issues", weight: "10%" },
              { factor: "Contractor Risk", weight: "10%" },
              { factor: "Compliance Rate", weight: "10%" },
            ].map((f) => (
              <div key={f.factor} className="clay-inset rounded-xl p-3 text-center">
                <p className="text-xs font-medium text-foreground">{f.factor}</p>
                <p className="text-lg font-bold text-[#8B7EC8]">{f.weight}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Critical/High Alert */}
        {critical.length > 0 && (
          <div className="clay-card border-l-4 border-l-[#FF4757]">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-[#FF4757]" />
              <h3 className="text-sm font-bold text-[#C62828]">{critical.length} CRITICAL Mines Require Immediate Attention</h3>
            </div>
            <div className="space-y-2">
              {critical.map((m: any) => (
                <Link key={m._id} to={`/mines/${m._id}`} className="clay-inset flex items-center justify-between rounded-xl px-4 py-3 hover:bg-white/50 transition-colors">
                  <div>
                    <p className="text-sm font-bold">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.openViolations} violations • {m.overdueActions} overdue actions</p>
                  </div>
                  <span className="text-2xl font-black text-[#FF4757]">{m.riskScore}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All mines risk ranking */}
        <div className="clay-card">
          <h3 className="text-sm font-bold mb-4">All Mines — Risk Ranking</h3>
          <div className="space-y-3">
            {sorted.map((mine: any, i: number) => (
              <motion.div
                key={mine._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link to={`/mines/${mine._id}`} className="clay-inset flex items-center gap-4 rounded-xl px-4 py-3 hover:bg-white/50 transition-colors">
                  <span className="text-sm font-bold text-muted-foreground w-6">#{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold">{mine.name}</p>
                      <span className={`clay-badge px-2 py-0 rounded-xl text-[9px] font-bold ${riskBg[mine.riskLevel]}`}>{mine.riskLevel}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-2 rounded-full overflow-hidden bg-white/50 max-w-xs">
                        <div className="h-full rounded-full" style={{ width: `${mine.riskScore}%`, background: riskColors[mine.riskLevel] }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{mine.compliancePercentage}% compliance</span>
                    </div>
                  </div>
                  <span className="text-2xl font-black" style={{ color: riskColors[mine.riskLevel] }}>{mine.riskScore}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
