import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";

export type MapPoint = {
  id: string;
  slug: string;
  name: string;
  kind: string | null;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
};

export default function LocationsMap({ points }: { points: MapPoint[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = await import("leaflet");
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView(
        [18.35, 33.9],
        8,
      );
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 18,
      }).addTo(map);

      const icon = L.divIcon({
        className: "",
        html: `<span style="display:block;width:14px;height:14px;border-radius:9999px;background:#1f5c4b;box-shadow:0 0 0 4px rgba(31,92,75,.25)"></span>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      const valid = points.filter((p) => p.latitude != null && p.longitude != null);
      const markers = valid.map((p) =>
        L.marker([p.latitude!, p.longitude!], { icon, title: p.name }).bindPopup(
          `<div dir="rtl" style="font-family:inherit;min-width:160px">
             <strong>${escapeHtml(p.name)}</strong>
             ${p.kind ? `<div style="font-size:12px;color:#666">${escapeHtml(p.kind)}</div>` : ""}
             ${p.description ? `<p style="margin:6px 0 8px;font-size:12px">${escapeHtml(p.description.slice(0, 120))}</p>` : ""}
             <a href="/locations/${encodeURIComponent(p.slug)}" style="font-size:12px;color:#1f5c4b">صفحة الموقع</a>
           </div>`,
        ),
      );

      markers.forEach((m) => m.addTo(map));

      if (valid.length > 0) {
        map.fitBounds(
          L.latLngBounds(valid.map((p) => [p.latitude!, p.longitude!] as [number, number])),
          { padding: [40, 40], maxZoom: 12 },
        );
      }
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [points]);

  return <div ref={containerRef} className="h-[70vh] min-h-[420px] w-full rounded-lg border border-border" />;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}
