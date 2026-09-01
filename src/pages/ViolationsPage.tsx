import { useQuery } from "@/lib/local-api";
import { api } from "@/lib/local-api";
import AppLayout from "@/components/AppLayout";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";

const severityBg: Record<string, string> = {
  LOW: "bg-[#E8F5E9] text-[#2E7D32]", MEDIUM: "bg-[#FFF8E1] text-[#F57F17]",
  HIGH: "bg-[#FFF3E0] text-[#E65100]", CRITICAL: "bg-[#FFEBEE] text-[#C62828]",
};
const statusBg: Record<string, string> = {
  OPEN: "bg-[#FFEBEE] text-[#C62828]", IN_PROGRESS: "bg-[#E3F2FD] text-[#1565C0]",
  RESOLVED: "bg-[#E8F5E9] text-[#2E7D32]", ESCALATED: "bg-[#FFEBEE] text-[#9C1B1B]",
};

export default function ViolationsPage() {
  const violations = useQuery(api.violations.list);
  const stats = useQuery(api.violations.getStats);
  const mines = useQuery(api.mines.list);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");

  if (!violations || !stats || !mines) {
    return <AppLayout><div className="flex items-center justify-center h-64 text-muted-foreground animate-pulse">Loading violations...</div></AppLayout>;
  }

  const mineName = (id: string) => mines.find((m: any) => m._id === id)?.name || id;

  const filtered = violations.filter((v: any) => {
    if (filterStatus !== "all" && v.status !== filterStatus) return false;
    if (filterSeverity !== "all" && v.severity !== filterSeverity) return false;
    return true;
  }).sort((a: any, b: any) => {
    const order: Record<string, number> = { ESCALATED: 0, OPEN: 1, IN_PROGRESS: 2, RESOLVED: 3 };
    return (order[a.status] || 4) - (order[b.status] || 4);
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Violations & Corrective Actions</h1>
          <p className="text-sm text-muted-foreground mt-1">Track violations from inspection to resolution</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Total", value: stats.total, color: "" },
            { label: "Open", value: stats.open, color: "text-[#FF4757]" },
            { label: "In Progress", value: stats.inProgress, color: "text-[#1565C0]" },
            { label: "Escalated", value: stats.escalated, color: "text-[#9C1B1B]" },
            { label: "Resolved", value: stats.resolved, color: "text-[#2E7D32]" },
          ].map((s) => (
            <div key={s.label} className="clay-card text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="clay-card flex flex-wrap gap-3 items-center">
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="clay-input text-xs rounded-xl px-3 py-1.5">
            <option value="all">All Statuses</option>
            {["OPEN", "IN_PROGRESS", "RESOLVED", "ESCALATED"].map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>
          <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} className="clay-input text-xs rounded-xl px-3 py-1.5">
            <option value="all">All Severities</option>
            {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="space-y-3">
          {filtered.map((v: any) => {
            const isOverdue = v.status !== "RESOLVED" && v.deadline < Date.now();
            return (
              <div key={v._id} className={`clay-card ${isOverdue ? "border-l-4 border-l-[#FF4757]" : ""}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{v.violationId}</span>
                    <span className={`clay-badge px-2 py-0.5 rounded-xl text-[10px] font-bold ${severityBg[v.severity]}`}>{v.severity}</span>
                    <span className={`clay-badge px-2 py-0.5 rounded-xl text-[10px] font-bold ${statusBg[v.status]}`}>{v.status.replace("_", " ")}</span>
                    {isOverdue && <span className="clay-badge px-2 py-0.5 rounded-xl text-[10px] font-bold bg-[#FF4757] text-white">OVERDUE</span>}
                  </div>
                </div>
                <h3 className="text-sm font-bold mb-1">{v.description}</h3>
                <p className="text-xs text-muted-foreground mb-2">Corrective Action: {v.correctiveAction}</p>
                <div className="flex flex-wrap gap-4 text-[11px] text-muted-foreground">
                  <span>⛏ {mineName(v.mineId)}</span>
                  <span>👤 {v.assignedPerson}</span>
                  <span>📋 {v.category}</span>
                  <span>📅 Due: {new Date(v.deadline).toLocaleDateString()}</span>
                  {v.resolutionDate && <span>✅ Resolved: {new Date(v.resolutionDate).toLocaleDateString()}</span>}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div className="clay-card text-center py-8 text-muted-foreground text-sm">No violations match filters</div>}
        </div>
      </div>
    </AppLayout>
  );
}
