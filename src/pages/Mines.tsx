import { useQuery } from "@/lib/local-api";
import { api } from "@/lib/local-api";
import AppLayout from "@/components/AppLayout";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { Mountain, MapPin, Search } from "lucide-react";
import { useState, useMemo } from "react";

const riskColors: Record<string, string> = {
  LOW: "#6BCB77", MEDIUM: "#FFD93D", HIGH: "#FF8C32", CRITICAL: "#FF4757",
};
const riskBg: Record<string, string> = {
  LOW: "bg-[#E8F5E9] text-[#2E7D32]",
  MEDIUM: "bg-[#FFF8E1] text-[#F57F17]",
  HIGH: "bg-[#FFF3E0] text-[#E65100]",
  CRITICAL: "bg-[#FFEBEE] text-[#C62828]",
};

export default function Mines() {
  const mines = useQuery(api.mines.list);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"risk" | "name" | "compliance">("risk");
  const [filterRisk, setFilterRisk] = useState("all");

  if (!mines) {
    return <AppLayout><div className="flex items-center justify-center h-64 text-muted-foreground animate-pulse">Loading mines...</div></AppLayout>;
  }

  const filtered = useMemo(() => {
    let result = [...mines];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((m: any) =>
        m.name.toLowerCase().includes(q) ||
        m.mineId.toLowerCase().includes(q) ||
        m.state.toLowerCase().includes(q) ||
        m.district.toLowerCase().includes(q) ||
        m.subsidiary.toLowerCase().includes(q)
      );
    }
    if (filterRisk !== "all") {
      result = result.filter((m: any) => m.riskLevel === filterRisk);
    }
    result.sort((a: any, b: any) => {
      if (sortBy === "risk") return b.riskScore - a.riskScore;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return a.compliancePercentage - b.compliancePercentage;
    });
    return result;
  }, [mines, search, sortBy, filterRisk]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mine Catalog</h1>
          <p className="text-sm text-muted-foreground mt-1">{mines.length} mines across India</p>
        </div>

        {/* Search and filters */}
        <div className="clay-card flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, ID, state, district, or subsidiary..."
              className="clay-input w-full pl-9 text-xs"
            />
          </div>
          <select value={filterRisk} onChange={(e) => setFilterRisk(e.target.value)} className="clay-input text-xs rounded-xl px-3 py-1.5">
            <option value="all">All Risk Levels</option>
            {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          {(["risk", "name", "compliance"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`clay-badge px-3 py-1.5 text-xs font-medium transition-colors capitalize ${
                sortBy === s ? "bg-[#5B7F6E] text-white" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sort: {s}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="clay-card text-center py-12">
            <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No mines match your search</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((mine: any, i: number) => (
            <motion.div
              key={mine._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Link to={`/mines/${mine._id}`}>
                <div className="clay-card cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="clay-badge flex h-8 w-8 items-center justify-center rounded-xl bg-[#5B7F6E]/10">
                        <Mountain className="h-4 w-4 text-[#5B7F6E]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-foreground group-hover:text-[#5B7F6E] transition-colors">{mine.name}</h3>
                        <p className="text-[11px] text-muted-foreground">{mine.mineId} · {mine.subsidiary}</p>
                      </div>
                    </div>
                    <span className={`clay-badge inline-flex items-center rounded-xl px-2 py-0.5 text-[10px] font-bold uppercase ${riskBg[mine.riskLevel]}`}>
                      {mine.riskLevel}
                    </span>
                  </div>

                  <div className="clay-inset rounded-xl p-3 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Risk Score</span>
                      <span className="text-lg font-bold" style={{ color: riskColors[mine.riskLevel] }}>{mine.riskScore}</span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden bg-white/50">
                      <div className="h-full rounded-full transition-all" style={{ width: `${mine.riskScore}%`, background: riskColors[mine.riskLevel] }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold text-foreground">{mine.openViolations}</p>
                      <p className="text-[10px] text-muted-foreground">Violations</p>
                    </div>
                    <div>
                      <p className={`text-lg font-bold ${mine.overdueActions > 0 ? "text-[#FF4757]" : "text-foreground"}`}>{mine.overdueActions}</p>
                      <p className="text-[10px] text-muted-foreground">Overdue</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-foreground">{mine.compliancePercentage}%</p>
                      <p className="text-[10px] text-muted-foreground">Compliance</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {mine.district}, {mine.state}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
