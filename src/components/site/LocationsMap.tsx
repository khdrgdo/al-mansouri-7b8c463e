import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

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
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          satellite: {
            type: "raster",
            tiles: [
              "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            ],
            tileSize: 256,
            attribution: "© Esri",
            maxzoom: 18,
          },
        },
        layers: [
          {
            id: "satellite-layer",
            type: "raster",
            source: "satellite",
            minzoom: 0,
            maxzoom: 22,
          },
        ],
      },
      center: [33.9, 18.35],
      zoom: 7,
      pitch: 30,
      bearing: -10,
      scrollZoom: false,
    });

    mapRef.current = map;

    const valid = points.filter((p) => p.latitude != null && p.longitude != null);

    map.on("load", () => {
      for (const p of valid) {
        const el = document.createElement("div");
        el.style.cssText = `
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #2D8B5A;
          border: 3px solid rgba(45,139,90,0.4);
          box-shadow: 0 0 12px rgba(45,139,90,0.5);
          cursor: pointer;
          transition: all 0.2s ease;
        `;

        el.addEventListener("mouseenter", () => {
          el.style.transform = "scale(1.3)";
          el.style.boxShadow = "0 0 20px rgba(45,139,90,0.7)";
        });
        el.addEventListener("mouseleave", () => {
          el.style.transform = "scale(1)";
          el.style.boxShadow = "0 0 12px rgba(45,139,90,0.5)";
        });

        const popup = new maplibregl.Popup({ offset: 20, closeButton: false }).setHTML(`
          <div dir="rtl" style="font-family:inherit;min-width:160px;padding:4px">
            <strong>${escapeHtml(p.name)}</strong>
            ${p.kind ? `<div style="font-size:12px;color:#666;margin-top:2px">${escapeHtml(p.kind)}</div>` : ""}
            ${p.description ? `<p style="margin:6px 0 8px;font-size:12px">${escapeHtml(p.description.slice(0, 120))}</p>` : ""}
            <a href="/locations/${encodeURIComponent(p.slug)}" style="font-size:12px;color:#2D8B5A">صفحة الموقع</a>
          </div>
        `);

        new maplibregl.Marker({ element: el })
          .setLngLat([p.longitude!, p.latitude!])
          .setPopup(popup)
          .addTo(map);
      }

      if (valid.length > 0) {
        const bounds = new maplibregl.LngLatBounds();
        valid.forEach((p) => bounds.extend([p.longitude!, p.latitude!]));
        map.fitBounds(bounds, { padding: 60 });
      }
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [points]);

  return (
    <div
      ref={containerRef}
      className="h-[70vh] min-h-[420px] w-full overflow-hidden rounded-2xl border border-border"
    />
  );
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}
