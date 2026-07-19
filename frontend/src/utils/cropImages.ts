export function getCropImageUrl(name?: string): string {
  if (!name) return '/images/crops/default_agriculture.jpg';
  const lower = name.toLowerCase();
  if (lower.includes('tomato')) return '/images/crops/tomato.jpg';
  if (lower.includes('wheat')) return '/images/crops/wheat.jpg';
  if (lower.includes('rice') || lower.includes('chawal')) return '/images/crops/rice.jpg';
  if (lower.includes('potato') || lower.includes('aloo')) return '/images/crops/potato.jpg';
  if (lower.includes('onion') || lower.includes('kanda') || lower.includes('pyaaj')) return '/images/crops/onion.jpg';
  if (lower.includes('bajra')) return '/images/crops/bajra.jpg';
  if (lower.includes('cotton') || lower.includes('kapas')) return '/images/crops/cotton.jpg';
  if (lower.includes('maize')) return '/images/crops/maize.jpg';
  if (lower.includes('soybean')) return '/images/crops/soybean.jpg';
  if (lower.includes('sugarcane')) return '/images/crops/sugarcane.jpg';
  return '/images/crops/default_agriculture.jpg';
}

export function getValidImageUrl(url: string | undefined | null, cropName?: string): string {
  if (!url) return getCropImageUrl(cropName);
  // Support relative paths (starts with /) or absolute paths (http, data:)
  if (url.startsWith('/') || url.startsWith('http') || url.startsWith('data:')) {
    // If the URL is a standard non-functional mock placeholder, use our local crop illustrations instead
    if (url.includes('placehold.co') || url.includes('placeholder')) {
      return getCropImageUrl(cropName);
    }
    return url;
  }
  return getCropImageUrl(cropName);
}
