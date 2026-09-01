import { useQuery } from "@/lib/local-api";
import { api } from "@/lib/local-api";
import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  Mountain,
  AlertTriangle,
  ShieldX,
  Clock,
  Search,
  TrendingUp,
  TrendingDown,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { Link } from "react-router";

const riskColors: Record<string, string> = {
  LOW: "#6BCB77",
  MEDIUM: "#FFD93D",
  HIGH: "#FF8C32",
  CRITICAL: "#FF4757",
};

const riskBg: Record<string, string> = {
  LOW: "bg-[#E8F5E9] text-[#2E7D32]",
  MEDIUM: "bg-[#FFF8E1] text-[#F57F17]",
  HIGH: "bg-[#FFF3E0] text-[#E65100]",
  CRITICAL: "bg-[#FFEBEE] text-[#C62828]",
};

export default function Dashboard() {
  const mines = useQuery(api.mines.list);
  const mineStats = useQuery(api.mines.getStats);
  const complianceStats = useQuery(api.compliance.getStats);
  const violationStats = useQuery(api.violations.getStats);
  const inspectionCount = useQuery(api.inspections.getCount);
  const alerts = useQuery(api.alerts.listUnread);

  if (!mines || !mineStats || !complianceStats || !violationStats) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground animate-pulse">Loading dashboard...</div>
        </div>
      </AppLayout>
    );
  }

  const sortedMines = [...mines].sort((a: any, b: any) => b.riskScore - a.riskScore);

  const riskDistribution = [
    { name: "CRITICAL", value: mines.filter((m: any) => m.riskLevel === "CRITICAL").length, color: "#FF4757" },
    { name: "HIGH", value: mines.filter((m: any) => m.riskLevel === "HIGH").length, color: "#FF8C32" },
    { name: "MEDIUM", value: mines.filter((m: any) => m.riskLevel === "MEDIUM").length, color: "#FFD93D" },
    { name: "LOW", value: mines.filter((m: any) => m.riskLevel === "LOW").length, color: "#6BCB77" },
  ];

  const complianceByCategory = [
    { name: "Safety", completed: 65, pending: 35 },
    { name: "Environment", completed: 70, pending: 30 },
    { name: "Labour", completed: 80, pending: 20 },
    { name: "Production", completed: 60, pending: 40 },
    { name: "Regulatory", completed: 75, pending: 25 },
  ];

  const trendData = [
    { month: "Jun", risk: 52, compliance: 68 },
    { month: "Jul", risk: 56, compliance: 65 },
    { month: "Aug", risk: 61, compliance: 62 },
    { month: "Sep", risk: 58, compliance: 64 },
    { month: "Oct", risk: 65, compliance: 60 },
    { month: "Nov", risk: 63, compliance: 63 },
  ];

  const kpis = [
    { label: "Total Mines", value: mineStats.total, icon: Mountain, color: "#5B7F6E", bg: "bg-[#5B7F6E]/10" },
    { label: "High Risk Mines", value: mineStats.highRisk, icon: AlertTriangle, color: "#FF8C32", bg: "bg-[#FF8C32]/10" },
    { label: "Open Violations", value: violationStats.open, icon: ShieldX, color: "#FF4757", bg: "bg-[#FF4757]/10" },
    { label: "Overdue Actions", value: violationStats.overdue || mineStats.totalOverdue, icon: Clock, color: "#C75050", bg: "bg-[#C75050]/10" },
    { label: "Inspections", value: inspectionCount || 0, icon: Search, color: "#8B7EC8", bg: "bg-[#8B7EC8]/10" },
    { label: "Compliance Rate", value: `${complianceStats.percentage}%`, icon: Activity, color: "#6BCB77", bg: "bg-[#6BCB77]/10" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Governance Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Coal mine compliance & risk monitoring overview</p>
          </div>
          <div className="clay-badge px-3 py-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Demo Environment — Synthetic Data
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="clay-card text-center">
                <div className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl ${kpi.bg}`}>
                  <kpi.icon className="h-5 w-5" style={{ color: kpi.color }} />
                </div>
                <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Risk Distribution */}
          <div className="clay-card">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="text-sm font-semibold">Risk Distribution</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={160}>
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {riskDistribution.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {riskDistribution.map((r) => (
                    <div key={r.name} className="flex items-center gap-2 text-xs">
                      <div className="h-3 w-3 rounded-lg" style={{ background: r.color }} />
                      <span className="text-muted-foreground">{r.name}</span>
                      <span className="font-bold ml-auto">{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </div>

          {/* Compliance by Category */}
          <div className="clay-card">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="text-sm font-semibold">Compliance by Category</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={complianceByCategory} layout="vertical" barGap={0}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#5B7F6E" radius={[0, 6, 6, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </div>

          {/* Risk Trend */}
          <div className="clay-card">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="text-sm font-semibold">6-Month Trend</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={trendData}>
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="risk" stroke="#FF8C32" fill="#FF8C3220" strokeWidth={2} />
                  <Area type="monotone" dataKey="compliance" stroke="#5B7F6E" fill="#5B7F6E20" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </div>
        </div>

        {/* Mine Risk Overview Table */}
        <div className="clay-card">
          <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Mine Risk Overview</CardTitle>
            <Link to="/mines" className="text-xs text-[#5B7F6E] hover:underline font-medium">View All →</Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/40">
                    <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mine</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">State</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Risk Score</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Level</th>
                    <th className="text-center py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Violations</th>
                    <th className="text-center py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Overdue</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Compliance</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedMines.map((mine: any) => (
                    <tr key={mine._id} className="border-b border-white/30 hover:bg-white/30 transition-colors">
                      <td className="py-3 px-3">
                        <Link to={`/mines/${mine._id}`} className="font-medium text-foreground hover:text-[#5B7F6E] transition-colors">
                          {mine.name}
                        </Link>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">{mine.state}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full overflow-hidden bg-white/50">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${mine.riskScore}%`,
                                background: riskColors[mine.riskLevel] || "#ccc",
                              }}
                            />
                          </div>
                          <span className="font-mono text-xs font-bold">{mine.riskScore}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center rounded-xl px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider clay-badge ${riskBg[mine.riskLevel] || ""}`}>
                          {mine.riskLevel}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-mono text-xs font-semibold">{mine.openViolations}</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`font-mono text-xs font-semibold ${mine.overdueActions > 0 ? "text-[#FF4757]" : ""}`}>
                          {mine.overdueActions}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <Progress value={mine.compliancePercentage} className="h-2 w-20" />
                          <span className="text-xs text-muted-foreground">{mine.compliancePercentage}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </div>

        {/* Recent Alerts */}
        {alerts && alerts.length > 0 && (
          <div className="clay-card">
            <CardHeader className="p-0 pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">Recent Alerts</CardTitle>
              <Link to="/alerts" className="text-xs text-[#5B7F6E] hover:underline font-medium">View All →</Link>
            </CardHeader>
            <CardContent className="p-0 space-y-2">
              {alerts.slice(0, 5).map((alert: any) => (
                <div key={alert._id} className="clay-inset flex items-center gap-3 px-4 py-3">
                  <div className={`h-2 w-2 rounded-full ${alert.severity === "CRITICAL" ? "bg-[#FF4757]" : alert.severity === "HIGH" ? "bg-[#FF8C32]" : "bg-[#FFD93D]"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{alert.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{alert.message}</p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] clay-badge ${riskBg[alert.severity] || ""}`}>
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
