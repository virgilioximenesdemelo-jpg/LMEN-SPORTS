// Branded SVG fallback with neutral athletic design (never misleads with unrelated products)
export const DEFAULT_FALLBACK_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none">
  <rect width="600" height="600" fill="#0E1015"/>
  <rect x="24" y="24" width="552" height="552" rx="20" stroke="rgba(255,255,255,0.08)" stroke-width="2"/>
  <circle cx="300" cy="270" r="64" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
  <path d="M300 230 L324 270 L300 310 L276 270 Z" fill="#FFFFFF"/>
  <text x="300" y="380" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="4">LMEN SPORTS</text>
  <text x="300" y="408" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600" fill="rgba(255,255,255,0.5)" text-anchor="middle">FOTO DO PRODUTO</text>
</svg>
`)}`;

export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.currentTarget;
  const currentSrc = target.src || '';

  // Prevent infinite error recursion
  if (currentSrc === DEFAULT_FALLBACK_IMAGE || currentSrc.startsWith('data:image/svg+xml')) {
    return;
  }

  // If failed on .avif, try loading the .jpg equivalent first before falling back
  if (currentSrc.includes('.avif')) {
    target.src = currentSrc.replace(/\.avif/g, '.jpg');
    return;
  }

  target.src = DEFAULT_FALLBACK_IMAGE;
};

