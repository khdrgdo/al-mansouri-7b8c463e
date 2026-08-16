import { MediaImage } from "./MediaImage";
import { Reveal } from "./Reveal";
import { cn } from "@/lib/utils";

/**
 * "One image, many windows".
 *
 * Renders the SAME source image several times, each fragment revealing a
 * different slice through `object-position` (and an optional `clip-path`).
 * Nothing is done to the file itself — the composition is pure CSS, so it
 * works with storage paths, signed URLs and fallbacks alike.
 */
export type Fragment = {
  /** object-position for this window, e.g. "20% 10%" */
  position: string;
  /** aspect ratio utility, e.g. "aspect-[4/5]" */
  ratio?: string;
  /** extra classes for the frame (grid placement, clip-path, etc.) */
  className?: string;
  /** optional caption rendered under the fragment */
  caption?: string;
};

export function MosaicImage({
  path,
  alt,
  fragments,
  fallbackSrc,
  className,
  priority = false,
}: {
  path?: string | null;
  alt: string;
  fragments: Fragment[];
  fallbackSrc?: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={cn("grid grid-cols-12 gap-3 md:gap-4", className)}>
      {fragments.map((f, i) => (
        <Reveal key={i} delay={i * 90} className={cn("min-w-0", f.className)}>
          <MediaImage
            path={path ?? null}
            alt={i === 0 ? alt : ""}
            {...(fallbackSrc ? { fallbackSrc } : {})}
            position={f.position}
            ratio={f.ratio ?? "aspect-[4/5]"}
            priority={priority && i === 0}
            imgClassName="hover:scale-[1.03]"
          />
          {f.caption ? (
            <p className="mt-2 text-[11px] tracking-[0.14em] text-muted-foreground">{f.caption}</p>
          ) : null}
        </Reveal>
      ))}
    </div>
  );
}

/** Default triptych used on person / event pages. */
export const PORTRAIT_TRIPTYCH: Fragment[] = [
  { position: "50% 22%", ratio: "aspect-[3/4]", className: "col-span-7", caption: "الوجه" },
  { position: "80% 55%", ratio: "aspect-square", className: "col-span-5 self-start", caption: "تفصيل" },
  {
    position: "20% 85%",
    ratio: "aspect-[16/7]",
    className: "col-span-5 col-start-8",
    caption: "الهامش",
  },
];

/** Wide, banner-like split used on historical event pages. */
export const SCENE_STRIPS: Fragment[] = [
  { position: "12% 40%", ratio: "aspect-[3/4]", className: "col-span-4" },
  { position: "50% 40%", ratio: "aspect-[3/4]", className: "col-span-4 md:mt-10" },
  { position: "88% 40%", ratio: "aspect-[3/4]", className: "col-span-4 md:mt-20" },
];
