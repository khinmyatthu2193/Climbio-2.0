export function getPublicShopUrl(slug: string, currentPublicUrl?: string) {
  const configuredBase = import.meta.env.VITE_PUBLIC_APP_URL?.trim();
  const fallbackBase = currentPublicUrl
    ? new URL(currentPublicUrl).origin
    : typeof window !== 'undefined' ? window.location.origin : '';
  return `${(configuredBase || fallbackBase).replace(/\/$/, '')}/shop/${slug}`;
}
