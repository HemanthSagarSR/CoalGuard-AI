import { useQuery } from "@/lib/local-api";
import { api } from "@/lib/local-api";
import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, AlertTriangle, Lock } from "lucide-react";
import { motion } from "framer-motion";

const actionIcons: Record<string, string> = {
  USER_LOGIN: "🔑", MINE_CREATED: "⛏", INSPECTION_CREATED: "🔍",
  VIOLATION_CREATED: "⚠️", COMPLIANCE_UPDATED: "📋", VIOLATION_ESCALATED: "🔺",
  CORRECTIVE_ACTION_COMPLETED: "✅", RISK_SCORE_UPDATED: "📊", AUDIT_CHECK: "🔒",
  SYSTEM_INIT: "🚀",
};

export default function AuditTrailPage() {
  const logs = useQuery(api.audit.list);
  const integrity = useQuery(api.audit.verifyIntegrity);

  if (!logs || !integrity) {
    return <AppLayout><div className="flex items-center justify-center h-64 text-muted-foreground animate-pulse">Verifying audit trail...</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tamper-Evident Audit Trail</h1>
          <p className="text-sm text-muted-foreground mt-1">Immutable record of all system actions with hash chain verification</p>
        </div>

        {/* Integrity Status */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`clay-card border-l-4 ${integrity.valid ? "border-l-[#6BCB77]" : "border-l-[#FF4757]"}`}
        >
          <div className="flex items-center gap-4">
            <div className={`clay-inset flex h-14 w-14 items-center justify-center rounded-2xl ${
              integrity.valid ? "bg-[#E8F5E9]" : "bg-[#FFEBEE]"
            }`}>
              {integrity.valid ? (
                <CheckCircle className="h-7 w-7 text-[#2E7D32]" />
              ) : (
                <AlertTriangle className="h-7 w-7 text-[#C62828]" />
              )}
            </div>
            <div>
              <h3 className={`text-lg font-bold ${integrity.valid ? "text-[#2E7D32]" : "text-[#C62828]"}`}>
                {integrity.status}
              </h3>
              <p className="text-xs text-muted-foreground">
                {integrity.totalRecords} records verified • Hash chain: {integrity.valid ? "Intact" : "Broken"}
              </p>
            </div>
            <div className="ml-auto clay-badge flex items-center gap-1.5 px-3 py-1.5">
              <Lock className="h-3.5 w-3.5 text-[#8B7EC8]" />
              <span className="text-xs font-medium">SHA-256 Chain</span>
            </div>
          </div>
        </motion.div>

        {/* Audit Log Timeline */}
        <div className="clay-card">
          <h3 className="text-sm font-bold mb-4">Activity Log</h3>
          <div className="space-y-3">
            {logs.map((log: any, i: number) => (
              <motion.div
                key={log._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="clay-inset flex items-start gap-4 rounded-xl px-4 py-3"
              >
                <div className="flex flex-col items-center">
                  <span className="text-lg">{actionIcons[log.action] || "📝"}</span>
                  {i < logs.length - 1 && <div className="w-px h-6 bg-border mt-1" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase text-muted-foreground">{log.action.replace(/_/g, " ")}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{log.entity}: {log.entityId}</span>
                  </div>
                  {log.details && <p className="text-sm mt-1">{log.details}</p>}
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                    <span>👤 {log.userName}</span>
                    <span>🕐 {new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <code className="text-[9px] bg-white/50 px-2 py-0.5 rounded-lg text-muted-foreground">
                      prev: {log.previousHash.slice(0, 12)}...
                    </code>
                    <code className="text-[9px] bg-[#5B7F6E]/10 px-2 py-0.5 rounded-lg text-[#5B7F6E]">
                      hash: {log.currentHash.slice(0, 12)}...
                    </code>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
