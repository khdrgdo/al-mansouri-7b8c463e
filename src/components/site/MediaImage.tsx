import { useMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

/**
 * Unified image surface for the archive.
 * - `path` is a storage path (resolved to a signed URL) or an absolute URL.
 * - `fallbackSrc` keeps editorial compositions intact while real media is missing.
 * - `position` controls which slice of the image is visible (object-position),
 *   which is how the cropped/hidden-fragment compositions are built.
 */
export function MediaImage({
  path,
  alt,
  className,
  imgClassName,
  ratio = "aspect-[4/3]",
  position = "center",
  fallbackSrc,
  priority = false,
  grain = true,
}: {
  path?: string | null;
  alt: string;
  className?: string;
  imgClassName?: string;
  ratio?: string;
  position?: string;
  fallbackSrc?: string;
  priority?: boolean;
  grain?: boolean;
}) {
  const { data: url, isLoading } = useMediaUrl(path);
  const src = url ?? fallbackSrc;

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted",
        grain && "grain",
        ratio,
        className,
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          style={{ objectPosition: position }}
          className={cn(
            "h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
            imgClassName,
          )}
        />
      ) : (
        <div
          className={cn(
            "flex h-full w-full items-end bg-sand bg-paper p-4",
            isLoading && "animate-pulse",
          )}
          aria-hidden
        >
          <span className="text-[10px] font-medium tracking-widest text-sand-foreground/60">
            صورة قيد الأرشفة
          </span>
        </div>
      )}
    </div>
  );
}
