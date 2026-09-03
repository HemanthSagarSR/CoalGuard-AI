export type VisionSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type VisionState = {
  source: string;
  timestamp: number;
  vision: {
    workers_detected: number;
    missing_ppe_count: number;
    missing_helmet_count: number;
    missing_vest_count: number;
    unauthorized_zone: boolean;
    severity: VisionSeverity;
  };
  detections: Array<{
    class_name: string;
    confidence: number;
    bbox: [number, number, number, number];
  }>;
  worker_states: Array<{
    worker_id: number;
    bbox: [number, number, number, number];
    confidence: number;
    helmet_detected: boolean;
    vest_detected: boolean;
    missing_helmet: boolean;
    missing_vest: boolean;
  }>;
  model_loaded: boolean;
  demo_mode: boolean;
  error: string | null;
};

export type VisionHealth = {
  status: string;
  service: string;
  model_loaded: boolean;
  demo_mode: boolean;
  source: string;
  error: string | null;
};

const API_BASE = (import.meta.env.VITE_EDGE_API_URL || "").replace(/\/$/, "");

export function visionUrl(path: string) {
  return `${API_BASE}${path}`;
}

export async function getVisionState(signal?: AbortSignal): Promise<VisionState> {
  const response = await fetch(visionUrl("/api/vision/state"), {
    signal,
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Edge CV returned HTTP ${response.status}`);
  }

  return response.json();
}

export async function getVisionHealth(signal?: AbortSignal): Promise<VisionHealth> {
  const response = await fetch(visionUrl("/api/vision/health"), {
    signal,
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Edge CV health check returned HTTP ${response.status}`);
  }

  return response.json();
}
