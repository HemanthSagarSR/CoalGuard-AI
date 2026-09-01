import { useQuery, useMutation } from "@/lib/local-api";
import { api } from "@/lib/local-api";
import AppLayout from "@/components/AppLayout";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Search, MapPin, Clock, Plus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

const severityBg: Record<string, string> = {
  LOW: "bg-[#E8F5E9] text-[#2E7D32]", MEDIUM: "bg-[#FFF8E1] text-[#F57F17]",
  HIGH: "bg-[#FFF3E0] text-[#E65100]", CRITICAL: "bg-[#FFEBEE] text-[#C62828]",
};
const statusBg: Record<string, string> = {
  OPEN: "bg-[#FFEBEE] text-[#C62828]", IN_PROGRESS: "bg-[#E3F2FD] text-[#1565C0]",
  RESOLVED: "bg-[#E8F5E9] text-[#2E7D32]",
};

export default function InspectionsPage() {
  const { user } = useAuth();
  const inspections = useQuery(api.inspections.list);
  const mines = useQuery(api.mines.list);
  const createInspection = useMutation(api.inspections.create);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    mineId: "", inspectionType: "Safety", description: "", observations: "",
    severity: "MEDIUM", latitude: "", longitude: "",
  });

  if (!inspections || !mines) {
    return <AppLayout><div className="flex items-center justify-center h-64 text-muted-foreground animate-pulse">Loading inspections...</div></AppLayout>;
  }

  const mineName = (id: string) => mines.find((m: any) => m._id === id)?.name || id;

  const filtered = inspections.filter((i: any) => {
    if (filterType !== "all" && i.inspectionType !== filterType) return false;
    if (filterStatus !== "all" && i.status !== filterStatus) return false;
    return true;
  }).sort((a: any, b: any) => b.date - a.date);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.mineId || !form.description || !form.observations) return;
    setSubmitting(true);
    try {
      await createInspection({
        mineId: form.mineId as any,
        inspectorId: user?._id || "unknown",
        inspectorName: user?.name || "User",
        date: Date.now(),
        latitude: form.latitude ? parseFloat(form.latitude) : undefined,
        longitude: form.longitude ? parseFloat(form.longitude) : undefined,
        inspectionType: form.inspectionType,
        description: form.description,
        observations: form.observations,
        severity: form.severity,
        status: "OPEN",
      });
      toast.success("Inspection created successfully");
      setShowForm(false);
      setForm({ mineId: "", inspectionType: "Safety", description: "", observations: "", severity: "MEDIUM", latitude: "", longitude: "" });
    } catch {
      toast.error("Failed to create inspection");
    }
    setSubmitting(false);
  };

  const captureGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setForm(f => ({ ...f, latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) })),
        () => toast.error("Could not access location")
      );
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Inspections</h1>
            <p className="text-sm text-muted-foreground mt-1">{inspections.length} inspections recorded</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="clay-button flex items-center gap-2 text-xs">
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? "Cancel" : "New Inspection"}
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <form onSubmit={handleCreate} className="clay-card space-y-4">
            <h3 className="text-sm font-bold">New Inspection Report</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Mine *</label>
                <select value={form.mineId} onChange={(e) => setForm(f => ({ ...f, mineId: e.target.value }))} className="clay-input text-xs w-full" required>
                  <option value="">Select mine...</option>
                  {mines.map((m: any) => <option key={m._id} value={m._id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Inspection Type</label>
                <select value={form.inspectionType} onChange={(e) => setForm(f => ({ ...f, inspectionType: e.target.value }))} className="clay-input text-xs w-full">
                  {["Safety", "Environment", "Labour", "Equipment", "General Compliance"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Severity</label>
                <select value={form.severity} onChange={(e) => setForm(f => ({ ...f, severity: e.target.value }))} className="clay-input text-xs w-full">
                  {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">GPS Coordinates</label>
                <div className="flex gap-2">
                  <input value={form.latitude} onChange={(e) => setForm(f => ({ ...f, latitude: e.target.value }))} placeholder="Lat" className="clay-input text-xs flex-1" />
                  <input value={form.longitude} onChange={(e) => setForm(f => ({ ...f, longitude: e.target.value }))} placeholder="Lng" className="clay-input text-xs flex-1" />
                  <button type="button" onClick={captureGPS} className="clay-badge px-2 text-xs" title="Capture current location">📍</button>
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Description *</label>
              <input value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description of the inspection" className="clay-input text-xs w-full" required />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Observations *</label>
              <textarea value={form.observations} onChange={(e) => setForm(f => ({ ...f, observations: e.target.value }))} placeholder="Detailed observations from the field" className="clay-input text-xs w-full min-h-[80px]" required />
            </div>
            <button type="submit" disabled={submitting} className="clay-button flex items-center gap-2 text-xs disabled:opacity-50">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {submitting ? "Submitting..." : "Submit Inspection"}
            </button>
          </form>
        )}

        {/* Filters */}
        <div className="clay-card flex flex-wrap gap-3 items-center">
          <Search className="h-4 w-4 text-muted-foreground" />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="clay-input text-xs rounded-xl px-3 py-1.5">
            <option value="all">All Types</option>
            {["Safety", "Environment", "Labour", "Equipment", "General Compliance"].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="clay-input text-xs rounded-xl px-3 py-1.5">
            <option value="all">All Statuses</option>
            {["OPEN", "IN_PROGRESS", "RESOLVED"].map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>
        </div>

        {/* List */}
        <div className="space-y-3">
          {filtered.map((insp: any) => (
            <div key={insp._id} className="clay-card">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`clay-badge px-2 py-0.5 rounded-xl text-[10px] font-bold ${severityBg[insp.severity]}`}>{insp.severity}</span>
                  <span className="text-xs text-muted-foreground">{insp.inspectionType}</span>
                </div>
                <span className={`clay-badge px-2 py-0.5 rounded-xl text-[10px] font-bold ${statusBg[insp.status]}`}>{insp.status.replace("_", " ")}</span>
              </div>
              <h3 className="text-sm font-bold mb-1">{insp.description}</h3>
              <p className="text-xs text-muted-foreground mb-2">{insp.observations}</p>
              <div className="flex flex-wrap gap-4 text-[11px] text-muted-foreground">
                <span>⛏ {mineName(insp.mineId)}</span>
                <span>👤 {insp.inspectorName}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(insp.date).toLocaleDateString()}</span>
                {insp.latitude && (
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {insp.latitude.toFixed(4)}, {insp.longitude?.toFixed(4)}</span>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="clay-card text-center py-8 text-muted-foreground text-sm">No inspections match filters</div>}
        </div>
      </div>
    </AppLayout>
  );
}
