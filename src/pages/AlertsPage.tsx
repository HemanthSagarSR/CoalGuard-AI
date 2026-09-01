import { useQuery, useMutation } from "@/lib/local-api";
import { api } from "@/lib/local-api";
import AppLayout from "@/components/AppLayout";
import { Bell, CheckCheck, AlertTriangle, Clock, ShieldAlert, TrendingUp } from "lucide-react";

const severityBg: Record<string, string> = {
  LOW: "bg-[#E8F5E9] text-[#2E7D32]", MEDIUM: "bg-[#FFF8E1] text-[#F57F17]",
  HIGH: "bg-[#FFF3E0] text-[#E65100]", CRITICAL: "bg-[#FFEBEE] text-[#C62828]",
};
const typeIcons: Record<string, any> = {
  CRITICAL_VIOLATION: ShieldAlert,
  OVERDUE_COMPLIANCE: Clock,
  ESCALATED_ACTION: AlertTriangle,
  RISK_INCREASE: TrendingUp,
  UPCOMING_DEADLINE: Clock,
};

export default function AlertsPage() {
  const alerts = useQuery(api.alerts.list);
  const markRead = useMutation(api.alerts.markRead);
  const markAllRead = useMutation(api.alerts.markAllRead);

  if (!alerts) {
    return <AppLayout><div className="flex items-center justify-center h-64 text-muted-foreground animate-pulse">Loading alerts...</div></AppLayout>;
  }

  const sorted = [...alerts].sort((a: any, b: any) => {
    if (a.read !== b.read) return a.read ? 1 : -1;
    return b.createdAt - a.createdAt;
  });

  const unread = alerts.filter((a: any) => !a.read).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Alerts & Notifications</h1>
            <p className="text-sm text-muted-foreground mt-1">{unread} unread alerts</p>
          </div>
          {unread > 0 && (
            <button
              onClick={() => markAllRead()}
              className="clay-button flex items-center gap-2 text-xs"
            >
              <CheckCheck className="h-4 w-4" />
              Mark All Read
            </button>
          )}
        </div>

        <div className="space-y-3">
          {sorted.map((alert: any) => {
            const Icon = typeIcons[alert.type] || Bell;
            return (
              <div
                key={alert._id}
                className={`clay-card flex items-start gap-4 ${!alert.read ? "border-l-4 border-l-[#8B7EC8]" : "opacity-70"}`}
                onClick={() => !alert.read && markRead({ id: alert._id })}
              >
                <div className={`clay-badge flex h-10 w-10 items-center justify-center rounded-xl ${
                  alert.severity === "CRITICAL" ? "bg-[#FFEBEE]" : alert.severity === "HIGH" ? "bg-[#FFF3E0]" : "bg-[#FFF8E1]"
                }`}>
                  <Icon className={`h-5 w-5 ${
                    alert.severity === "CRITICAL" ? "text-[#C62828]" : alert.severity === "HIGH" ? "text-[#E65100]" : "text-[#F57F17]"
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold">{alert.title}</h3>
                    <span className={`clay-badge px-2 py-0 rounded-xl text-[10px] font-bold ${severityBg[alert.severity]}`}>{alert.severity}</span>
                    {!alert.read && <span className="h-2 w-2 rounded-full bg-[#8B7EC8]" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{alert.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(alert.createdAt).toLocaleString()} • {alert.type.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
            );
          })}
          {sorted.length === 0 && (
            <div className="clay-card text-center py-12">
              <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No alerts</p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
