import { useQuery } from "@/lib/local-api";
import { api } from "@/lib/local-api";
import AppLayout from "@/components/AppLayout";
import { FileBarChart, Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const riskColors: Record<string, string> = {
  LOW: "#6BCB77", MEDIUM: "#FFD93D", HIGH: "#FF8C32", CRITICAL: "#FF4757",
};

export default function ReportsPage() {
  const mines = useQuery(api.mines.list);
  const violations = useQuery(api.violations.list);
  const compliance = useQuery(api.compliance.list);
  const inspections = useQuery(api.inspections.list);
  const complianceStats = useQuery(api.compliance.getStats);
  const violationStats = useQuery(api.violations.getStats);

  if (!mines || !violations || !compliance || !inspections || !complianceStats || !violationStats) {
    return <AppLayout><div className="flex items-center justify-center h-64 text-muted-foreground animate-pulse">Loading reports...</div></AppLayout>;
  }

  const violationByCategory = [
    { name: "Safety", count: violations.filter((v: any) => v.category === "Safety").length },
    { name: "Environment", count: violations.filter((v: any) => v.category === "Environment").length },
    { name: "Labour", count: violations.filter((v: any) => v.category === "Labour").length },
    { name: "Equipment", count: violations.filter((v: any) => v.category === "Equipment").length },
    { name: "Regulatory", count: violations.filter((v: any) => v.category === "Regulatory").length },
  ];

  const mineRiskData = mines.map((m: any) => ({
    name: m.name.length > 15 ? m.name.substring(0, 15) + "..." : m.name,
    risk: m.riskScore,
  })).sort((a: any, b: any) => b.risk - a.risk);

  const complianceByStatus = [
    { name: "Completed", value: complianceStats.completed, color: "#6BCB77" },
    { name: "In Progress", value: complianceStats.inProgress, color: "#1565C0" },
    { name: "Pending", value: complianceStats.pending, color: "#FFD93D" },
    { name: "Overdue", value: complianceStats.overdue, color: "#FF4757" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
            <p className="text-sm text-muted-foreground mt-1">Governance and compliance reporting</p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Mines", value: mines.length, color: "#5B7F6E" },
            { label: "Open Violations", value: violationStats.open, color: "#FF4757" },
            { label: "Compliance Rate", value: `${complianceStats.percentage}%`, color: "#6BCB77" },
            { label: "Total Inspections", value: inspections.length, color: "#8B7EC8" },
          ].map((s) => (
            <div key={s.label} className="clay-card text-center">
              <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Violations by Category */}
          <div className="clay-card">
            <h3 className="text-sm font-bold mb-4">Violations by Category</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={violationByCategory}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#8B7EC8" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Compliance Status */}
          <div className="clay-card">
            <h3 className="text-sm font-bold mb-4">Compliance Status Distribution</h3>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={complianceByStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {complianceByStatus.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {complianceByStatus.map((s) => (
                  <div key={s.name} className="flex items-center gap-2 text-xs">
                    <div className="h-3 w-3 rounded-lg" style={{ background: s.color }} />
                    <span className="text-muted-foreground">{s.name}</span>
                    <span className="font-bold ml-auto">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mine Risk Ranking */}
          <div className="clay-card lg:col-span-2">
            <h3 className="text-sm font-bold mb-4">Mine Risk Score Ranking</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mineRiskData} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={130} />
                <Tooltip />
                <Bar dataKey="risk" radius={[0, 6, 6, 0]} barSize={18}>
                  {mineRiskData.map((entry: any, idx: number) => {
                    let color = "#6BCB77";
                    if (entry.risk > 80) color = "#FF4757";
                    else if (entry.risk > 60) color = "#FF8C32";
                    else if (entry.risk > 30) color = "#FFD93D";
                    return <Cell key={idx} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="clay-card text-center py-4 text-xs text-muted-foreground">
          Demo Environment — Data shown is synthetic
        </div>
      </div>
    </AppLayout>
  );
}
