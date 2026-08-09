import { useMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

export function MediaImage({
  path,
  alt,
  className,
  ratio = "aspect-[4/3]",
}: {
  path?: string | null;
  alt: string;
  className?: string;
  ratio?: string;
}) {
  const { data: url, isLoading } = useMediaUrl(path);

  return (
    <div className={cn("overflow-hidden bg-muted", ratio, className)}>
      {url ? (
        <img
          src={url}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
        />
      ) : (
        <div
          className={cn(
            "h-full w-full bg-paper bg-secondary",
            isLoading && "animate-pulse",
          )}
          aria-hidden
        />
      )}
    </div>
  );
}
