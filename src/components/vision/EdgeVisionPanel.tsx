import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Camera,
  CircleDot,
  HardHat,
  RefreshCw,
  ShieldCheck,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import { visionUrl, type VisionHealth, type VisionState } from "@/lib/vision-api";

const severityStyles: Record<string, string> = {
  LOW: "bg-[#E8F5E9] text-[#2E7D32]",
  MEDIUM: "bg-[#FFF8E1] text-[#F57F17]",
  HIGH: "bg-[#FFF3E0] text-[#E65100]",
  CRITICAL: "bg-[#FFEBEE] text-[#C62828]",
};

export default function EdgeVisionPanel() {
  const [state, setState] = useState<VisionState | null>(null);
  const [health, setHealth] = useState<VisionHealth | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const response = await fetch(visionUrl("/api/vision/state"), {
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const next: VisionState = await response.json();
        if (cancelled) return;
        setState(next);
        setLastUpdated(Date.now());
        setError(next.error);
        setHealth({
          status: next.error ? "degraded" : "ok",
          service: "coalguard-edge-cv",
          model_loaded: next.model_loaded,
          demo_mode: next.demo_mode,
          source: next.source,
          error: next.error,
        });
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Edge CV unavailable");
        setHealth(null);
      }
    };

    void poll();
    const timer = window.setInterval(() => void poll(), 2000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const severity = state?.vision.severity || "LOW";
  const streamUrl = useMemo(() => visionUrl("/api/vision/stream"), []);

  return (
    <section className="clay-card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-[#5B7F6E]" />
            <h2 className="text-sm font-bold">Edge Vision Safety Feed</h2>
            <span className="clay-badge px-2 py-0.5 rounded-xl text-[9px] font-bold uppercase tracking-wider">
              Member 2 • CV
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            OpenCV + YOLO PPE observations feeding the Digital Twin.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          {health ? (
            <>
              <Wifi className="h-3.5 w-3.5 text-[#2E7D32]" />
              <span className="text-[#2E7D32] font-semibold">
                {health.demo_mode ? "Demo inference" : health.model_loaded ? "YOLO online" : "Backend online"}
              </span>
            </>
          ) : (
            <>
              <WifiOff className="h-3.5 w-3.5 text-[#C62828]" />
              <span className="text-[#C62828] font-semibold">Edge CV offline</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Metric icon={Users} label="Workers" value={state?.vision.workers_detected ?? "—"} />
        <Metric icon={HardHat} label="PPE Violations" value={state?.vision.missing_ppe_count ?? "—"} danger={severity === "HIGH" || severity === "CRITICAL"} />
        <Metric icon={AlertTriangle} label="Missing Helmets" value={state?.vision.missing_helmet_count ?? "—"} danger={(state?.vision.missing_helmet_count || 0) > 0} />
        <Metric icon={ShieldCheck} label="Missing Vests" value={state?.vision.missing_vest_count ?? "—"} danger={(state?.vision.missing_vest_count || 0) > 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.6fr)_minmax(260px,0.8fr)] gap-4">
        <div className="rounded-2xl overflow-hidden clay-inset min-h-[280px] bg-black/10">
          {health ? (
            <img
              src={streamUrl}
              alt="Live annotated edge computer vision feed"
              className="w-full h-full min-h-[280px] object-cover"
            />
          ) : (
            <div className="h-[280px] flex items-center justify-center text-center px-6">
              <div>
                <WifiOff className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-semibold">Waiting for Edge CV</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Start the FastAPI service on localhost:8000 to show the camera feed.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="clay-inset rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Digital Twin Input</p>
            <span className={`clay-badge px-2 py-0.5 rounded-xl text-[10px] font-bold ${severityStyles[severity]}`}>
              {severity}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <Row label="Source" value={state?.source || "—"} />
            <Row label="Unauthorized zone" value={state?.vision.unauthorized_zone ? "YES" : "NO"} />
            <Row label="Model" value={state?.model_loaded ? "YOLOv8" : state?.demo_mode ? "Synthetic demo" : "—"} />
            <Row label="Last update" value={lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : "—"} />
          </div>

          {error && (
            <div className="rounded-xl bg-[#FFF3E0] text-[#E65100] px-3 py-2 text-[11px] flex items-start gap-2">
              <CircleDot className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="text-[10px] text-muted-foreground leading-relaxed">
            CV observations are inputs to the Digital Twin. They do not bypass the deterministic safety shell.
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  danger = false,
}: {
  icon: typeof Users;
  label: string;
  value: number | string;
  danger?: boolean;
}) {
  return (
    <div className="clay-inset rounded-2xl p-3">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${danger ? "text-[#FF4757]" : "text-[#5B7F6E]"}`} />
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <p className={`text-2xl font-bold mt-1 ${danger ? "text-[#C62828]" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-right truncate max-w-[180px]">{value}</span>
    </div>
  );
}
