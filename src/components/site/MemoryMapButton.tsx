import { lazy, Suspense, useState } from "react";
import { Compass } from "lucide-react";

const MemoryMapExperience = lazy(() => import("./MemoryMapExperience"));

export function MemoryMapButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="ذاكرة المكان — استكشف الخريطة التاريخية"
        className="group fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-[max(1.25rem,env(safe-area-inset-left))] z-40 flex items-center gap-2 rounded-full border border-border bg-card/95 px-3.5 py-2.5 text-xs font-medium text-foreground shadow-md backdrop-blur-sm transition-all hover:border-primary hover:text-primary sm:px-4 sm:text-sm"
      >
        <Compass className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:rotate-12" />
        <span className="hidden sm:inline">ذاكرة المكان</span>
      </button>

      {open ? (
        <Suspense fallback={null}>
          <MemoryMapExperience onClose={() => setOpen(false)} />
        </Suspense>
      ) : null}
    </>
  );
}
