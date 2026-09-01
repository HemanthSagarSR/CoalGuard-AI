import { useQuery } from "@/lib/local-api";
import { api } from "@/lib/local-api";
import AppLayout from "@/components/AppLayout";
import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { Link } from "react-router";

const riskColors: Record<string, string> = {
  LOW: "#6BCB77", MEDIUM: "#FFD93D", HIGH: "#FF8C32", CRITICAL: "#FF4757",
};
const riskBg: Record<string, string> = {
  LOW: "bg-[#E8F5E9] text-[#2E7D32]", MEDIUM: "bg-[#FFF8E1] text-[#F57F17]",
  HIGH: "bg-[#FFF3E0] text-[#E65100]", CRITICAL: "bg-[#FFEBEE] text-[#C62828]",
};

export default function GISMapPage() {
  const mines = useQuery(api.mines.list);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [selectedMine, setSelectedMine] = useState<any>(null);

  useEffect(() => {
    if (!mines || !mapRef.current || mapInstanceRef.current) return;
    const minesData = mines;

    let cancelled = false;

    async function initMap() {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !mapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [22.5, 82.0],
        zoom: 5,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap contributors © CARTO",
        maxZoom: 19,
      }).addTo(map);

      minesData.forEach((mine: any) => {
        const color = riskColors[mine.riskLevel] || "#ccc";
        const icon = L.divIcon({
          className: "custom-marker",
          html: `<div style="
            width: 32px; height: 32px; border-radius: 50%;
            background: ${color};
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex; align-items: center; justify-content: center;
            font-size: 11px; font-weight: bold; color: white;
          ">${mine.riskScore}</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([mine.latitude, mine.longitude], { icon }).addTo(map);
        marker.on("click", () => {
          setSelectedMine(mine);
        });

        marker.bindTooltip(mine.name, {
          permanent: false,
          direction: "top",
          offset: [0, -20],
          className: "clay-tooltip",
        });
      });

      mapInstanceRef.current = map;
    }

    initMap();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mines]);

  if (!mines) {
    return <AppLayout><div className="flex items-center justify-center h-64 text-muted-foreground animate-pulse">Loading map...</div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">GIS Risk Map</h1>
          <p className="text-sm text-muted-foreground mt-1">Geographic distribution of mines with risk indicators</p>
        </div>

        <div className="flex gap-4 h-[calc(100vh-280px)]">
          <div className="flex-1 clay-card overflow-hidden relative">
            <div ref={mapRef} className="absolute inset-0 rounded-2xl" style={{ zIndex: 1 }} />
          </div>

          {/* Mine Info Panel */}
          <div className="w-80 shrink-0 space-y-4">
            {/* Legend */}
            <div className="clay-card">
              <h3 className="text-xs font-bold mb-3 uppercase text-muted-foreground">Risk Legend</h3>
              <div className="space-y-2">
                {Object.entries(riskColors).map(([level, color]) => (
                  <div key={level} className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full" style={{ background: color }} />
                    <span className="text-xs font-medium">{level}</span>
                  </div>
                ))}
              </div>
            </div>

            {selectedMine ? (
              <div className="clay-card">
                <h3 className="text-sm font-bold mb-2">{selectedMine.name}</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Risk Score</span>
                    <span className="font-bold" style={{ color: riskColors[selectedMine.riskLevel] }}>{selectedMine.riskScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Risk Level</span>
                    <span className={`clay-badge px-2 py-0 rounded-xl text-[10px] font-bold ${riskBg[selectedMine.riskLevel]}`}>{selectedMine.riskLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Open Violations</span>
                    <span className="font-bold">{selectedMine.openViolations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Overdue Actions</span>
                    <span className="font-bold">{selectedMine.overdueActions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Compliance</span>
                    <span className="font-bold">{selectedMine.compliancePercentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">State</span>
                    <span>{selectedMine.state}</span>
                  </div>
                </div>
                <Link to={`/mines/${selectedMine._id}`} className="clay-button block text-center text-xs mt-4">
                  View Mine Details →
                </Link>
              </div>
            ) : (
              <div className="clay-card text-center py-8">
                <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Click a mine marker to view details</p>
              </div>
            )}

            {/* Mine list */}
            <div className="clay-card max-h-48 overflow-y-auto">
              <h3 className="text-xs font-bold mb-2 uppercase text-muted-foreground">All Mines ({mines.length})</h3>
              <div className="space-y-1">
                {mines.map((m: any) => (
                  <button
                    key={m._id}
                    onClick={() => setSelectedMine(m)}
                    className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-white/50 transition-colors"
                  >
                    <div className="h-2 w-2 rounded-full shrink-0" style={{ background: riskColors[m.riskLevel] }} />
                    <span className="truncate flex-1">{m.name}</span>
                    <span className="font-mono font-bold text-[10px]">{m.riskScore}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
