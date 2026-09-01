import { useQuery } from "@/lib/local-api";
import { api } from "@/lib/local-api";
import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useParams, Link } from "react-router";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Shield, Leaf, Users, HardHat, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { useState } from "react";

const riskColors: Record<string, string> = {
  LOW: "#6BCB77", MEDIUM: "#FFD93D", HIGH: "#FF8C32", CRITICAL: "#FF4757",
};
const riskBg: Record<string, string> = {
  LOW: "bg-[#E8F5E9] text-[#2E7D32]",
  MEDIUM: "bg-[#FFF8E1] text-[#F57F17]",
  HIGH: "bg-[#FFF3E0] text-[#E65100]",
  CRITICAL: "bg-[#FFEBEE] text-[#C62828]",
};
const severityBg: Record<string, string> = {
  LOW: "bg-[#E8F5E9] text-[#2E7D32]", MEDIUM: "bg-[#FFF8E1] text-[#F57F17]",
  HIGH: "bg-[#FFF3E0] text-[#E65100]", CRITICAL: "bg-[#FFEBEE] text-[#C62828]",
};

type Tab = "overview" | "safety" | "environment" | "labour" | "contractors" | "timeline";

export default function MineDetail() {
  const { mineId } = useParams<{ mineId: string }>();
  const mine = useQuery(api.mines.get, mineId ? { mineId: mineId as any } : "skip");
  const violations = useQuery(api.violations.listByMine, mineId ? { mineId: mineId as any } : "skip");
  const inspections = useQuery(api.inspections.listByMine, mineId ? { mineId: mineId as any } : "skip");
  const compliance = useQuery(api.compliance.listByMine, mineId ? { mineId: mineId as any } : "skip");
  const contractors = useQuery(api.contractors.listByMine, mineId ? { mineId: mineId as any } : "skip");
  const risk = useQuery(api.risk.calculateMineRisk, mineId ? { mineId: mineId as any } : "skip");
  const [tab, setTab] = useState<Tab>("overview");

  if (!mine) {
    return <AppLayout><div className="flex items-center justify-center h-64 text-muted-foreground animate-pulse">Loading mine details...</div></AppLayout>;
  }

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "overview", label: "Overview", icon: Shield },
    { key: "safety", label: "Safety", icon: AlertTriangle },
    { key: "environment", label: "Environment", icon: Leaf },
    { key: "labour", label: "Labour", icon: HardHat },
    { key: "contractors", label: "Contractors", icon: Users },
    { key: "timeline", label: "Timeline", icon: Clock },
  ];

  const safetyViolations = violations?.filter((v: any) => v.category === "Safety") || [];
  const envViolations = violations?.filter((v: any) => v.category === "Environment") || [];
  const labourViolations = violations?.filter((v: any) => v.category === "Labour") || [];
  const recentInspections = inspections?.slice(0, 5) || [];
  const timeline = [
    ...(inspections?.map((i: any) => ({ type: "inspection", date: i.createdAt, title: `${i.inspectionType} inspection`, detail: i.description, severity: i.severity })) || []),
    ...(violations?.map((v: any) => ({ type: "violation", date: v.createdAt, title: v.violationId, detail: v.description, severity: v.severity })) || []),
  ].sort((a, b) => b.date - a.date).slice(0, 10);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Back + Header */}
        <div>
          <Link to="/mines" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors">
            <ArrowLeft className="h-3 w-3" /> Back to Mines
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{mine.name}</h1>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {mine.district}, {mine.state} • {mine.mineId} • {mine.subsidiary}
              </p>
            </div>
            <span className={`clay-badge inline-flex items-center rounded-xl px-3 py-1 text-xs font-bold uppercase ${riskBg[mine.riskLevel]}`}>
              {mine.riskLevel}
            </span>
          </div>
        </div>

        {/* Risk Score Banner */}
        <div className="clay-card">
          <div className="flex items-center gap-6">
            <div className="clay-inset flex h-24 w-24 items-center justify-center rounded-3xl">
              <div className="text-center">
                <p className="text-3xl font-black" style={{ color: riskColors[mine.riskLevel] }}>{mine.riskScore}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Risk Score</p>
              </div>
            </div>
            <div className="flex-1">
              {risk && (
                <p className="text-sm text-foreground leading-relaxed">{risk.explanation}</p>
              )}
              {risk?.recommendedActions && risk.recommendedActions.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Recommended Actions</p>
                  {risk.recommendedActions.slice(0, 3).map((action: string, i: number) => (
                    <p key={i} className="text-xs text-foreground flex items-start gap-1.5">
                      <span className="text-[#5B7F6E] mt-0.5">•</span> {action}
                    </p>
                  ))}
                </div>
              )}
            </div>
            <div className="clay-inset rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold">{mine.compliancePercentage}%</p>
              <p className="text-[10px] text-muted-foreground">Compliance</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`clay-badge flex items-center gap-1.5 px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                tab === t.key ? "bg-[#5B7F6E] text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === "overview" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Risk Score", value: mine.riskScore, color: riskColors[mine.riskLevel] },
              { label: "Open Violations", value: mine.openViolations, color: mine.openViolations > 0 ? "#FF4757" : "#6BCB77" },
              { label: "Overdue Actions", value: mine.overdueActions, color: mine.overdueActions > 0 ? "#FF4757" : "#6BCB77" },
              { label: "Compliance", value: `${mine.compliancePercentage}%`, color: "#5B7F6E" },
            ].map((stat) => (
              <div key={stat.label} className="clay-card text-center">
                <p className="text-3xl font-black" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
            <div className="col-span-2 md:col-span-4 clay-card">
              <h3 className="text-sm font-semibold mb-3">Production</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Current: {(mine.currentProduction / 1000000).toFixed(1)}M tonnes</span>
                    <span className="text-muted-foreground">Capacity: {(mine.productionCapacity / 1000000).toFixed(1)}M tonnes</span>
                  </div>
                  <Progress value={(mine.currentProduction / mine.productionCapacity) * 100} className="h-3" />
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "safety" && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="clay-card text-center">
                <p className="text-2xl font-bold text-[#FF4757]">{safetyViolations.length}</p>
                <p className="text-xs text-muted-foreground">Safety Violations</p>
              </div>
              <div className="clay-card text-center">
                <p className="text-2xl font-bold">{recentInspections.filter((i: any) => i.inspectionType === "Safety").length}</p>
                <p className="text-xs text-muted-foreground">Safety Inspections</p>
              </div>
              <div className="clay-card text-center">
                <p className="text-2xl font-bold">{safetyViolations.filter((v: any) => v.status === "OPEN").length}</p>
                <p className="text-xs text-muted-foreground">Recurring Issues</p>
              </div>
            </div>
            {safetyViolations.map((v: any) => (
              <div key={v._id} className="clay-card flex items-start gap-3">
                <div className={`clay-badge px-2 py-0.5 rounded-xl text-[10px] font-bold ${severityBg[v.severity]}`}>{v.severity}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{v.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">Status: {v.status} • Deadline: {new Date(v.deadline).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {safetyViolations.length === 0 && <div className="clay-card text-center py-8 text-muted-foreground text-sm">No safety violations recorded</div>}
          </div>
        )}

        {tab === "environment" && (
          <div className="space-y-4">
            <div className="clay-card text-center">
              <p className="text-2xl font-bold">{envViolations.length}</p>
              <p className="text-xs text-muted-foreground">Environmental Observations</p>
            </div>
            {envViolations.map((v: any) => (
              <div key={v._id} className="clay-card flex items-start gap-3">
                <div className={`clay-badge px-2 py-0.5 rounded-xl text-[10px] font-bold ${severityBg[v.severity]}`}>{v.severity}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{v.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">Status: {v.status}</p>
                </div>
              </div>
            ))}
            {envViolations.length === 0 && <div className="clay-card text-center py-8 text-muted-foreground text-sm">No environmental observations</div>}
          </div>
        )}

        {tab === "labour" && (
          <div className="space-y-4">
            <div className="clay-card text-center">
              <p className="text-2xl font-bold">{labourViolations.length}</p>
              <p className="text-xs text-muted-foreground">Labour-Related Issues</p>
            </div>
            {labourViolations.map((v: any) => (
              <div key={v._id} className="clay-card flex items-start gap-3">
                <div className={`clay-badge px-2 py-0.5 rounded-xl text-[10px] font-bold ${severityBg[v.severity]}`}>{v.severity}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{v.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">Status: {v.status}</p>
                </div>
              </div>
            ))}
            {labourViolations.length === 0 && <div className="clay-card text-center py-8 text-muted-foreground text-sm">No labour issues recorded</div>}
          </div>
        )}

        {tab === "contractors" && (
          <div className="space-y-4">
            {contractors && contractors.length > 0 ? contractors.map((c: any) => (
              <div key={c._id} className="clay-card">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-bold">{c.name}</h4>
                    <p className="text-xs text-muted-foreground">{c.serviceType} • {c.contactPerson}</p>
                  </div>
                  <span className={`clay-badge px-2 py-0.5 rounded-xl text-[10px] font-bold ${c.riskScore > 70 ? "bg-[#FFEBEE] text-[#C62828]" : c.riskScore > 40 ? "bg-[#FFF8E1] text-[#F57F17]" : "bg-[#E8F5E9] text-[#2E7D32]"}`}>
                    Risk: {c.riskScore}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center mt-3">
                  <div className="clay-inset rounded-xl p-2">
                    <p className="text-sm font-bold">{c.violations}</p>
                    <p className="text-[10px] text-muted-foreground">Violations</p>
                  </div>
                  <div className="clay-inset rounded-xl p-2">
                    <p className="text-sm font-bold">{c.pendingActions}</p>
                    <p className="text-[10px] text-muted-foreground">Pending</p>
                  </div>
                  <div className="clay-inset rounded-xl p-2">
                    <p className={`text-sm font-bold ${c.status === "UNDER_REVIEW" ? "text-[#FF4757]" : "text-[#6BCB77]"}`}>{c.status}</p>
                    <p className="text-[10px] text-muted-foreground">Status</p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="clay-card text-center py-8 text-muted-foreground text-sm">No contractors assigned</div>
            )}
          </div>
        )}

        {tab === "timeline" && (
          <div className="space-y-3">
            {timeline.map((event, i) => (
              <div key={i} className="clay-card flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className={`h-3 w-3 rounded-full ${event.type === "violation" ? "bg-[#FF4757]" : "bg-[#8B7EC8]"}`} />
                  {i < timeline.length - 1 && <div className="w-px h-8 bg-border" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase text-muted-foreground">{event.type}</span>
                    {event.severity && (
                      <span className={`clay-badge px-1.5 py-0 rounded text-[9px] font-bold ${severityBg[event.severity]}`}>{event.severity}</span>
                    )}
                  </div>
                  <p className="text-sm font-medium mt-1">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{event.detail}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{new Date(event.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {timeline.length === 0 && <div className="clay-card text-center py-8 text-muted-foreground text-sm">No activity recorded</div>}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
