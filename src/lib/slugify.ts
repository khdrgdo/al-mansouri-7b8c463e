/** Basic slugify that keeps Arabic letters (unlike typical Latin-only slugifiers). */
export function slugify(input: string): string {
  return (
    input
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\p{L}\p{N}-]+/gu, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 120) || "بدون-عنوان"
  );
}

export function slugWithSuffix(base: string): string {
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}
