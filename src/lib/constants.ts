export const MAIN_NAV = [
  { to: "/", label: "الرئيسية" },
  { to: "/history", label: "التاريخ" },
  { to: "/locations", label: "المناطق" },
  { to: "/map", label: "الخريطة" },
  { to: "/archive", label: "الأرشيف" },
  { to: "/people", label: "الشخصيات" },
  { to: "/articles", label: "المقالات" },
  { to: "/ads", label: "الإعلانات" },
] as const;

export const VERIFICATION_LABELS: Record<string, string> = {
  verified: "موثّق بمصدر",
  oral: "رواية شفهية",
  unverified: "قيد التوثيق",
};

export const LOCATION_KINDS = ["منطقة", "قرية", "موضع", "معلم"] as const;

export const CONTENT_TYPE_LABELS: Record<string, string> = {
  photo: "صورة قديمة",
  document: "وثيقة",
  story: "رواية أو قصة",
  info: "معلومة تاريخية",
  correction: "تصحيح معلومة",
  location: "معلومة عن موقع",
};

export const AD_STATUS_LABELS: Record<string, string> = {
  pending: "قيد المراجعة",
  approved: "معتمد",
  rejected: "مرفوض",
  paused: "متوقف",
};

export const COMMENT_STATUS_LABELS: Record<string, string> = {
  pending: "قيد المراجعة",
  approved: "معتمد",
  rejected: "مرفوض",
};
