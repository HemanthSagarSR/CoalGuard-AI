import { useQuery } from "@/lib/local-api";
import { api } from "@/lib/local-api";
import AppLayout from "@/components/AppLayout";
import { Users } from "lucide-react";

export default function ContractorsPage() {
  const contractors = useQuery(api.contractors.list);
  const mines = useQuery(api.mines.list);

  if (!contractors || !mines) {
    return <AppLayout><div className="flex items-center justify-center h-64 text-muted-foreground animate-pulse">Loading contractors...</div></AppLayout>;
  }

  const mineName = (id: string) => mines.find((m: any) => m._id === id)?.name || id;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contractor Management</h1>
          <p className="text-sm text-muted-foreground mt-1">{contractors.length} contractors across all mines</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {contractors.map((c: any) => (
            <div key={c._id} className="clay-card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="clay-badge flex h-9 w-9 items-center justify-center rounded-xl bg-[#C4A882]/20">
                    <Users className="h-4 w-4 text-[#C4A882]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">{c.name}</h3>
                    <p className="text-[11px] text-muted-foreground">{c.serviceType}</p>
                  </div>
                </div>
                <span className={`clay-badge px-2 py-0.5 rounded-xl text-[10px] font-bold ${
                  c.riskScore > 70 ? "bg-[#FFEBEE] text-[#C62828]" : c.riskScore > 40 ? "bg-[#FFF8E1] text-[#F57F17]" : "bg-[#E8F5E9] text-[#2E7D32]"
                }`}>Risk: {c.riskScore}</span>
              </div>
              <div className="clay-inset rounded-xl p-3 mb-3">
                <p className="text-xs text-muted-foreground mb-1">Assigned to: {mineName(c.mineId)}</p>
                <p className="text-xs text-muted-foreground">Contact: {c.contactPerson}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="clay-inset rounded-xl p-2">
                  <p className={`text-lg font-bold ${c.violations > 0 ? "text-[#FF4757]" : "text-[#2E7D32]"}`}>{c.violations}</p>
                  <p className="text-[10px] text-muted-foreground">Violations</p>
                </div>
                <div className="clay-inset rounded-xl p-2">
                  <p className={`text-lg font-bold ${c.pendingActions > 0 ? "text-[#FF8C32]" : "text-[#2E7D32]"}`}>{c.pendingActions}</p>
                  <p className="text-[10px] text-muted-foreground">Pending</p>
                </div>
                <div className="clay-inset rounded-xl p-2">
                  <p className={`text-lg font-bold ${c.status === "UNDER_REVIEW" ? "text-[#C62828]" : "text-[#2E7D32]"}`}>
                    {c.status === "UNDER_REVIEW" ? "⚠ Review" : "✓ Active"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Status</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
