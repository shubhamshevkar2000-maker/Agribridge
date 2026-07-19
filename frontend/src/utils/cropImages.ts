export function getCropImageUrl(name?: string): string {
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600" fill="none"><rect width="800" height="600" fill="%231E293B"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-size="32" font-weight="bold" fill="%2364748B">No Image Available</text></svg>`;
}

export function getValidImageUrl(url: string | undefined | null, cropName?: string): string {
  if (!url) return getCropImageUrl(cropName);
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return getCropImageUrl(cropName);
}
