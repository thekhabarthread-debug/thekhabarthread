export function optimizedImageUrl(value, width = 1200, aspect = "") {
  const url = String(value || "");
  if (!url.startsWith("https://res.cloudinary.com/") || !url.includes("/image/upload/")) {
    return url;
  }
  const safeWidth = Math.min(2400, Math.max(320, Number(width) || 1200));
  const crop =
    aspect === "social"
      ? `c_fill,g_auto,w_${safeWidth},h_${Math.round(safeWidth * 0.525)},`
      : `c_limit,w_${safeWidth},`;
  return url.replace("/image/upload/", `/image/upload/${crop}q_auto:good,f_auto/`);
}
