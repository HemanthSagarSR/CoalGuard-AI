import { useQuery } from "@/lib/local-api";
import { api } from "@/lib/local-api";
import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { ShieldCheck, Filter } from "lucide-react";

const statusBg: Record<string, string> = {
  PENDING: "bg-[#FFF8E1] text-[#F57F17]",
  IN_PROGRESS: "bg-[#E3F2FD] text-[#1565C0]",
  COMPLETED: "bg-[#E8F5E9] text-[#2E7D32]",
  OVERDUE: "bg-[#FFEBEE] text-[#C62828]",
};
const priorityBg: Record<string, string> = {
  LOW: "bg-[#E8F5E9] text-[#2E7D32]",
  MEDIUM: "bg-[#FFF8E1] text-[#F57F17]",
  HIGH: "bg-[#FFF3E0] text-[#E65100]",
  CRITICAL: "bg-[#FFEBEE] text-[#C62828]",
};

export default function CompliancePage() {
  const compliance = useQuery(api.compliance.list);
  const stats = useQuery(api.compliance.getStats);
  const mines = useQuery(api.mines.list);
  const [filterMine, setFilterMine] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  if (!compliance || !stats || !mines) {
    return <AppLayout><div className="flex items-center justify-center h-64 text-muted-foreground animate-pulse">Loading compliance data...</div></AppLayout>;
  }

  const filtered = compliance.filter((c: any) => {
    if (filterMine !== "all" && c.mineId !== filterMine) return false;
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    if (filterCategory !== "all" && c.category !== filterCategory) return false;
    return true;
  });

  const mineName = (id: string) => mines.find((m: any) => m._id === id)?.name || id;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Compliance Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Track statutory requirements and compliance status</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Total", value: stats.total },
            { label: "Pending", value: stats.pending },
            { label: "In Progress", value: stats.inProgress },
            { label: "Completed", value: stats.completed },
            { label: "Overdue", value: stats.overdue },
          ].map((s) => (
            <div key={s.label} className="clay-card text-center">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="clay-card">
          <Progress value={stats.percentage} className="h-3 mb-2" />
          <p className="text-xs text-center text-muted-foreground">Overall Compliance: {stats.percentage}%</p>
        </div>

        {/* Filters */}
        <div className="clay-card flex flex-wrap gap-3 items-center">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select value={filterMine} onChange={(e) => setFilterMine(e.target.value)} className="clay-input text-xs rounded-xl px-3 py-1.5">
            <option value="all">All Mines</option>
            {mines.map((m: any) => <option key={m._id} value={m._id}>{m.name}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="clay-input text-xs rounded-xl px-3 py-1.5">
            <option value="all">All Statuses</option>
            {["PENDING", "IN_PROGRESS", "COMPLETED", "OVERDUE"].map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="clay-input text-xs rounded-xl px-3 py-1.5">
            <option value="all">All Categories</option>
            {["Safety", "Environment", "Labour", "Production", "Regulatory"].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="clay-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/40">
                  <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase">Requirement</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase">Mine</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase">Category</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase">Priority</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c: any) => (
                  <tr key={c._id} className="border-b border-white/30 hover:bg-white/30 transition-colors">
                    <td className="py-3 px-3 font-medium">{c.title}</td>
                    <td className="py-3 px-3 text-muted-foreground text-xs">{mineName(c.mineId)}</td>
                    <td className="py-3 px-3 text-xs">{c.category}</td>
                    <td className="py-3 px-3">
                      <span className={`clay-badge px-2 py-0.5 rounded-xl text-[10px] font-bold ${priorityBg[c.priority]}`}>{c.priority}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`clay-badge px-2 py-0.5 rounded-xl text-[10px] font-bold ${statusBg[c.status]}`}>{c.status.replace("_", " ")}</span>
                    </td>
                    <td className="py-3 px-3 text-xs text-muted-foreground">{new Date(c.dueDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <div className="text-center py-8 text-muted-foreground text-sm">No compliance items match filters</div>}
        </div>
      </div>
    </AppLayout>
  );
}
