import { useQuery } from "@/lib/local-api";
import { api } from "@/lib/local-api";
import AppLayout from "@/components/AppLayout";
import { useAuth } from "@/hooks/use-auth";
import { ShieldAlert, Users, Database, Activity } from "lucide-react";

const roleBg: Record<string, string> = {
  ADMIN: "bg-[#8B7EC8]/10 text-[#8B7EC8]",
  MINE_OFFICIAL: "bg-[#5B7F6E]/10 text-[#5B7F6E]",
  INSPECTOR: "bg-[#C4A882]/10 text-[#C4A882]",
  REGULATOR: "bg-[#FF8C32]/10 text-[#FF8C32]",
};

export default function AdminPage() {
  const { user } = useAuth();
  const mines = useQuery(api.mines.list);
  const violations = useQuery(api.violations.list);
  const compliance = useQuery(api.compliance.list);
  const inspections = useQuery(api.inspections.list);
  const auditLogs = useQuery(api.audit.list);

  if (!mines || !violations || !compliance || !inspections || !auditLogs) {
    return <AppLayout><div className="flex items-center justify-center h-64 text-muted-foreground animate-pulse">Loading admin data...</div></AppLayout>;
  }

  const demoUsers = [
    { name: "Demo Admin", email: "admin@coalguard.ai", role: "ADMIN", mines: "All" },
    { name: "Rajesh Kumar", email: "rajesh@coalguard.ai", role: "MINE_OFFICIAL", mines: "Jharia Eastern Colliery" },
    { name: "Priya Sharma", email: "priya@coalguard.ai", role: "INSPECTOR", mines: "All" },
    { name: "Vikram Patel", email: "vikram@coalguard.ai", role: "REGULATOR", mines: "All (Read-only)" },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Area</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage users, roles, and system configuration</p>
        </div>

        {/* System overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Users", value: demoUsers.length, icon: Users, color: "#5B7F6E" },
            { label: "Mines", value: mines.length, icon: Database, color: "#8B7EC8" },
            { label: "Active Violations", value: violations.filter((v: any) => v.status !== "RESOLVED").length, icon: ShieldAlert, color: "#FF4757" },
            { label: "Audit Records", value: auditLogs.length, icon: Activity, color: "#C4A882" },
          ].map((s) => (
            <div key={s.label} className="clay-card text-center">
              <s.icon className="h-5 w-5 mx-auto mb-2" style={{ color: s.color }} />
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* User management */}
        <div className="clay-card">
          <h3 className="text-sm font-bold mb-4">User Management</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/40">
                  <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase">User</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase">Email</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase">Role</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase">Assigned Mines</th>
                </tr>
              </thead>
              <tbody>
                {demoUsers.map((u, i) => (
                  <tr key={i} className="border-b border-white/30 hover:bg-white/30 transition-colors">
                    <td className="py-3 px-3 font-medium">{u.name}</td>
                    <td className="py-3 px-3 text-muted-foreground text-xs">{u.email}</td>
                    <td className="py-3 px-3">
                      <span className={`clay-badge px-2 py-0.5 rounded-xl text-[10px] font-bold ${roleBg[u.role] || ""}`}>{u.role.replace("_", " ")}</span>
                    </td>
                    <td className="py-3 px-3 text-xs text-muted-foreground">{u.mines}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Role permissions */}
        <div className="clay-card">
          <h3 className="text-sm font-bold mb-4">Role Permissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { role: "ADMIN", perms: "Full access to all features, user management, system settings, and data export." },
              { role: "MINE_OFFICIAL", perms: "View assigned mines, manage compliance requirements, review inspections, and track corrective actions." },
              { role: "INSPECTOR", perms: "Create inspection reports, log observations, submit violations, and convert findings into corrective actions." },
              { role: "REGULATOR", perms: "Read-only access to all mines, compliance data, reports, and the audit trail." },
            ].map((r) => (
              <div key={r.role} className="clay-inset rounded-xl p-4">
                <span className={`clay-badge px-2 py-0.5 rounded-xl text-[10px] font-bold ${roleBg[r.role]}`}>{r.role.replace("_", " ")}</span>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{r.perms}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="clay-card text-center py-4 text-xs text-muted-foreground">
          Demo environment — role management is illustrative
        </div>
      </div>
    </AppLayout>
  );
}
