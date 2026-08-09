import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "media";

/** Resolve a storage path (or absolute URL) into a displayable URL. */
export function useMediaUrl(path?: string | null) {
  return useQuery({
    queryKey: ["media-url", path],
    enabled: !!path,
    staleTime: 1000 * 60 * 30,
    queryFn: async () => {
      if (!path) return null;
      if (/^https?:\/\//.test(path)) return path;
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(path, 60 * 60 * 24);
      if (error) return null;
      return data.signedUrl;
    },
  });
}

export async function resolveMediaUrl(path?: string | null) {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60 * 24);
  if (error) return null;
  return data.signedUrl;
}

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const DOC_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

export const MAX_FILE_SIZE = 15 * 1024 * 1024;

export function validateFile(file: File, kind: "image" | "document" | "any" = "any") {
  const allowed =
    kind === "image" ? IMAGE_TYPES : kind === "document" ? DOC_TYPES : [...IMAGE_TYPES, ...DOC_TYPES];
  if (!allowed.includes(file.type)) return "نوع الملف غير مسموح به.";
  if (file.size > MAX_FILE_SIZE) return "حجم الملف يتجاوز ١٥ ميجابايت.";
  return null;
}

function safeName(name: string) {
  const ext = name.includes(".") ? name.split(".").pop()!.toLowerCase().slice(0, 8) : "bin";
  return `${crypto.randomUUID()}.${ext.replace(/[^a-z0-9]/g, "")}`;
}

/** Upload a file to the media bucket. Returns the stored path. */
export async function uploadMedia(file: File, folder: string) {
  const path = `${folder}/${safeName(file.name)}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });
  if (error) throw error;
  return path;
}
