import { useEffect, useMemo, useRef, useState } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import { Link } from "@tanstack/react-router";
import { X, Compass } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getMemoryMapData } from "@/lib/public.functions";
import { useIsMobile } from "@/hooks/use-mobile";
import { VERIFICATION_LABELS } from "@/lib/constants";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

type MMLocation = {
  id: string;
  slug: string;
  name: string;
  kind: string | null;
  description: string | null;
  latitude: number;
  longitude: number;
  verification: string;
};
type MMPeriod = {
  id: string;
  location_id: string;
  from_year: number;
  to_year: number | null;
  label: string;
  description: string | null;
  sources: string | null;
  verification: string;
};

const VERIFICATION_DOT: Record<string, string> = {
  verified: "✓",
  oral: "◐",
  unverified: "○",
};

export default function MemoryMapExperience({ onClose }: { onClose: () => void }) {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<globalThis.Map<string, LeafletMarker> | null>(null);

  const [mode, setMode] = useState<"current" | "historical">("current");
  const [year, setYear] = useState<number | null>(null);
  const [selected, setSelected] = useState<MMLocation | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["memory-map"],
    queryFn: () => getMemoryMapData(),
    staleTime: Infinity,
  });

  const locations = useMemo(() => (data?.locations ?? []) as MMLocation[], [data]);
  const periods = useMemo(() => (data?.periods ?? []) as MMPeriod[], [data]);

  const yearRange = useMemo(() => {
    if (periods.length === 0) return null;
    const currentYear = new Date().getFullYear();
    const years = periods.flatMap((p) => [p.from_year, p.to_year ?? currentYear]);
    const min = Math.min(...years);
    const max = Math.max(...years);
    if (min === max) return null; // not enough range to build a meaningful timeline
    return { min, max };
  }, [periods]);

  const periodsByLocation = useMemo(() => {
    const map = new globalThis.Map<string, MMPeriod[]>();
    for (const p of periods) {
      const list = map.get(p.location_id) ?? [];
      list.push(p);
      map.set(p.location_id, list);
    }
    return map;
  }, [periods]);

  // Which locations are visible for the current mode/year.
  const visibleLocations = useMemo(() => {
    if (mode === "current" || year === null) return locations;
    return locations.filter((loc) => {
      const own = periodsByLocation.get(loc.id) ?? [];
      return own.some(
        (p) => p.from_year <= year && year <= (p.to_year ?? new Date().getFullYear()),
      );
    });
  }, [locations, mode, year, periodsByLocation]);

  // Init map once data is ready.
  useEffect(() => {
    if (isLoading || !containerRef.current || mapRef.current) return;
    let cancelled = false;

    (async () => {
      const L = await import("leaflet");
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        scrollWheelZoom: true,
        zoomControl: !isMobile,
      }).setView([18.35, 33.9], 7);
      mapRef.current = map;

      const tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 18,
      }).addTo(map);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Leaflet's tile pane element isn't in its own public types
      (tileLayer as any).getContainer()?.classList.add("memory-map-tiles");

      markersRef.current = new globalThis.Map<string, LeafletMarker>();

      if (locations.length > 0) {
        const bounds = L.latLngBounds(locations.map((p) => [p.latitude, p.longitude]));
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 11 });
      }
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  // Sync markers whenever the visible set changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    let cancelled = false;

    (async () => {
      const L = await import("leaflet");
      if (cancelled || !mapRef.current) return;
      const existing = markersRef.current ?? new globalThis.Map<string, LeafletMarker>();

      const visibleIds = new Set(visibleLocations.map((l) => l.id));
      for (const [id, marker] of existing) {
        if (!visibleIds.has(id)) {
          marker.remove();
          existing.delete(id);
        }
      }

      for (const loc of visibleLocations) {
        if (existing.has(loc.id)) continue;
        const isSelected = selected?.id === loc.id;
        const icon = L.divIcon({
          className: "",
          html: markerHtml(isSelected),
          iconSize: [isSelected ? 18 : 12, isSelected ? 18 : 12],
          iconAnchor: [isSelected ? 9 : 6, isSelected ? 9 : 6],
        });
        const marker = L.marker([loc.latitude, loc.longitude], { icon, title: loc.name }).addTo(
          map,
        );
        marker.on("click", () => setSelected(loc));
        existing.set(loc.id, marker);
      }

      markersRef.current = existing;
    })();

    return () => {
      cancelled = true;
    };
  }, [visibleLocations, selected?.id]);

  // Fly to selection.
  useEffect(() => {
    if (!selected || !mapRef.current) return;
    mapRef.current.flyTo(
      [selected.latitude, selected.longitude],
      Math.max(mapRef.current.getZoom(), 10),
      {
        duration: 0.9,
      },
    );
  }, [selected]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const selectedPeriods = selected ? (periodsByLocation.get(selected.id) ?? []) : [];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-ink text-ink-foreground" dir="rtl">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-ink-foreground/10 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-2">
          <Compass className="h-4 w-4 text-gold" aria-hidden />
          <span className="font-display text-sm tracking-wide">ذاكرة المكان</span>
        </div>

        {yearRange ? (
          <div className="flex items-center gap-1 rounded-full border border-ink-foreground/15 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setMode("current")}
              className={`rounded-full px-3 py-1 transition-colors ${mode === "current" ? "bg-gold text-gold-foreground" : "text-ink-foreground/70"}`}
            >
              الحالي
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("historical");
                setYear((y) => y ?? yearRange.max);
              }}
              className={`rounded-full px-3 py-1 transition-colors ${mode === "historical" ? "bg-gold text-gold-foreground" : "text-ink-foreground/70"}`}
            >
              عبر الزمن
            </button>
          </div>
        ) : null}

        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق"
          className="rounded-full p-2 text-ink-foreground/70 transition-colors hover:bg-ink-foreground/10 hover:text-ink-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Map */}
      <div className="relative flex-1">
        <div ref={containerRef} className="h-full w-full" />

        {!isLoading && locations.length === 0 ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6">
            <div className="pointer-events-auto max-w-sm rounded-md border border-ink-foreground/15 bg-ink/90 p-6 text-center backdrop-blur-sm">
              <p className="font-display text-lg leading-relaxed text-ink-foreground">
                ذاكرة المكان تنمو بمساهماتكم.
              </p>
              <p className="mt-2 text-sm leading-7 text-ink-foreground/70">
                بعض المناطق والفترات التاريخية ما زالت قيد التوثيق.
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Timeline */}
      {mode === "historical" && yearRange && year !== null ? (
        <div className="border-t border-ink-foreground/10 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto flex max-w-2xl items-center gap-4">
            <span className="w-12 shrink-0 text-xs text-ink-foreground/60" dir="ltr">
              {yearRange.min}
            </span>
            <input
              type="range"
              min={yearRange.min}
              max={yearRange.max}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-ink-foreground/15 accent-gold"
              aria-label="السنة المختارة"
            />
            <span className="w-12 shrink-0 text-xs text-ink-foreground/60" dir="ltr">
              {yearRange.max}
            </span>
          </div>
          <p className="mt-2 text-center font-display text-sm text-gold" dir="ltr">
            {year}
          </p>
        </div>
      ) : mode === "historical" && !yearRange ? (
        <div className="border-t border-ink-foreground/10 px-5 py-4 text-center text-xs text-ink-foreground/50">
          الخط الزمني قيد التوثيق — لا تتوفر بيانات فترات كافية بعد.
        </div>
      ) : null}

      {/* Selected location panel */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side={isMobile ? "bottom" : "left"} className="bg-paper">
          {selected ? (
            <>
              <SheetHeader className="text-right">
                <SheetTitle className="font-display text-xl">{selected.name}</SheetTitle>
                {selected.kind ? (
                  <SheetDescription className="text-right">{selected.kind}</SheetDescription>
                ) : null}
              </SheetHeader>

              <div className="grid gap-4 px-4 pb-6">
                {selected.description ? (
                  <p className="text-sm leading-7 text-muted-foreground">{selected.description}</p>
                ) : null}

                {selectedPeriods.length > 0 ? (
                  <div className="grid gap-3">
                    {selectedPeriods.map((p) => (
                      <div key={p.id} className="border-r-2 border-primary/40 pr-3">
                        <p className="text-xs font-medium text-primary" dir="ltr">
                          {p.from_year} — {p.to_year ?? "اليوم"}
                        </p>
                        <p className="mt-1 text-sm font-medium text-foreground">{p.label}</p>
                        {p.description ? (
                          <p className="mt-1 text-xs leading-6 text-muted-foreground">
                            {p.description}
                          </p>
                        ) : null}
                        <p className="mt-1 text-xs text-muted-foreground">
                          {VERIFICATION_DOT[p.verification] ?? "○"}{" "}
                          {VERIFICATION_LABELS[p.verification] ?? p.verification}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {VERIFICATION_DOT[selected.verification] ?? "○"}{" "}
                    {VERIFICATION_LABELS[selected.verification] ?? selected.verification}
                  </p>
                )}

                <Link
                  to="/locations/$slug"
                  params={{ slug: selected.slug }}
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  استكشف المكان ←
                </Link>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function markerHtml(selected: boolean): string {
  if (selected) {
    return `<span style="display:block;width:18px;height:18px;border-radius:9999px;background:#c9a24b;box-shadow:0 0 0 6px rgba(201,162,75,.3),0 0 12px rgba(201,162,75,.6)"></span>`;
  }
  return `<span style="display:block;width:12px;height:12px;border-radius:9999px;background:#8a7a5c;opacity:0.85;box-shadow:0 0 0 3px rgba(138,122,92,.2)"></span>`;
}
