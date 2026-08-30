export interface FontOption {
  id: string;
  name: string;
  family: string;
  cleanName: string;
  category: 'sans-serif' | 'serif' | 'display' | 'handwriting' | 'monospace';
  googleFontQuery?: string;
  offlineFilename: string;
}

export const POPULAR_FONTS: FontOption[] = [
  {
    id: 'inter',
    name: 'Inter',
    cleanName: 'Inter',
    family: 'Inter, sans-serif',
    category: 'sans-serif',
    googleFontQuery: 'family=Inter:wght@300;400;500;600;700;800',
    offlineFilename: 'Inter-Variable.woff2',
  },
  {
    id: 'poppins',
    name: 'Poppins',
    cleanName: 'Poppins',
    family: 'Poppins, sans-serif',
    category: 'sans-serif',
    googleFontQuery: 'family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600',
    offlineFilename: 'Poppins-Regular.woff2',
  },
  {
    id: 'jakarta',
    name: 'Plus Jakarta Sans',
    cleanName: 'Plus Jakarta Sans',
    family: "'Plus Jakarta Sans', sans-serif",
    category: 'sans-serif',
    googleFontQuery: 'family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600',
    offlineFilename: 'PlusJakartaSans-Regular.woff2',
  },
  {
    id: 'bebas',
    name: 'Bebas Neue',
    cleanName: 'Bebas Neue',
    family: "'Bebas Neue', sans-serif",
    category: 'display',
    googleFontQuery: 'family=Bebas+Neue',
    offlineFilename: 'BebasNeue-Regular.woff2',
  },
  {
    id: 'montserrat',
    name: 'Montserrat',
    cleanName: 'Montserrat',
    family: 'Montserrat, sans-serif',
    category: 'sans-serif',
    googleFontQuery: 'family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600',
    offlineFilename: 'Montserrat-Regular.woff2',
  },
  {
    id: 'photograph_signature',
    name: 'Photograph Signature',
    cleanName: 'Photograph Signature',
    family: "'Photograph Signature', cursive",
    category: 'handwriting',
    googleFontQuery: 'family=Great+Vibes', // High-fidelity handwriting alternative for web
    offlineFilename: 'PhotographSignature.woff2',
  },
  {
    id: 'outfit',
    name: 'Outfit',
    cleanName: 'Outfit',
    family: 'Outfit, sans-serif',
    category: 'sans-serif',
    googleFontQuery: 'family=Outfit:wght@300;400;500;600;700;800',
    offlineFilename: 'Outfit-Regular.woff2',
  },
  {
    id: 'space_grotesk',
    name: 'Space Grotesk',
    cleanName: 'Space Grotesk',
    family: "'Space Grotesk', sans-serif",
    category: 'sans-serif',
    googleFontQuery: 'family=Space+Grotesk:wght@300;400;500;600;700',
    offlineFilename: 'SpaceGrotesk-Regular.woff2',
  },
  {
    id: 'roboto',
    name: 'Roboto',
    cleanName: 'Roboto',
    family: 'Roboto, sans-serif',
    category: 'sans-serif',
    googleFontQuery: 'family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,400;1,700',
    offlineFilename: 'Roboto-Regular.woff2',
  },
  {
    id: 'playfair',
    name: 'Playfair Display',
    cleanName: 'Playfair Display',
    family: "'Playfair Display', serif",
    category: 'serif',
    googleFontQuery: 'family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400',
    offlineFilename: 'PlayfairDisplay-Regular.woff2',
  },
  {
    id: 'caveat',
    name: 'Caveat',
    cleanName: 'Caveat',
    family: 'Caveat, cursive',
    category: 'handwriting',
    googleFontQuery: 'family=Caveat:wght@400;600;700',
    offlineFilename: 'Caveat-Regular.woff2',
  },
  {
    id: 'pacifico',
    name: 'Pacifico',
    cleanName: 'Pacifico',
    family: 'Pacifico, cursive',
    category: 'handwriting',
    googleFontQuery: 'family=Pacifico',
    offlineFilename: 'Pacifico-Regular.woff2',
  },
  {
    id: 'syne',
    name: 'Syne',
    cleanName: 'Syne',
    family: 'Syne, sans-serif',
    category: 'display',
    googleFontQuery: 'family=Syne:wght@400;600;700;800',
    offlineFilename: 'Syne-Regular.woff2',
  },
  {
    id: 'cinzel',
    name: 'Cinzel',
    cleanName: 'Cinzel',
    family: 'Cinzel, serif',
    category: 'serif',
    googleFontQuery: 'family=Cinzel:wght@400;600;700',
    offlineFilename: 'Cinzel-Regular.woff2',
  },
];

// Track loaded web font URLs to prevent duplicate injections
const loadedFontUrls = new Set<string>();

/**
 * Parses the primary clean font family name from a CSS font-family string
 * Example: "'Plus Jakarta Sans', sans-serif" -> "Plus Jakarta Sans"
 */
export function extractCleanFontName(fontFamily: string): string {
  if (!fontFamily) return 'Inter';
  const primary = fontFamily.split(',')[0].trim().replace(/^['"]|['"]$/g, '');
  return primary || 'Inter';
}

/**
 * Finds font metadata from the popular fonts catalog or generates default metadata
 */
export function getFontOption(fontFamily: string): FontOption {
  const cleanName = extractCleanFontName(fontFamily);
  const found = POPULAR_FONTS.find(
    (f) => f.cleanName.toLowerCase() === cleanName.toLowerCase() || f.family.toLowerCase() === fontFamily.toLowerCase()
  );
  if (found) return found;

  const safeId = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const googleQuery = `family=${encodeURIComponent(cleanName).replace(/%20/g, '+')}:ital,wght@0,400;0,600;0,700;1,400`;
  return {
    id: safeId,
    name: cleanName,
    cleanName,
    family: `'${cleanName}', sans-serif`,
    category: 'sans-serif',
    googleFontQuery: googleQuery,
    offlineFilename: `${cleanName.replace(/\s+/g, '')}-Regular.woff2`,
  };
}

/**
 * Dynamically loads a web font by injecting a Google Fonts <link> stylesheet into document.head
 */
export function loadWebFont(fontFamily: string): void {
  if (typeof document === 'undefined') return;

  const fontOption = getFontOption(fontFamily);
  if (!fontOption.googleFontQuery) return;

  const url = `https://fonts.googleapis.com/css2?${fontOption.googleFontQuery}&display=swap`;
  if (loadedFontUrls.has(url)) return;

  // Check if link tag already exists in DOM
  const existing = document.querySelector(`link[href="${url}"]`);
  if (existing) {
    loadedFontUrls.add(url);
    return;
  }

  // Ensure preconnect to fonts.googleapis.com
  if (!document.querySelector('link[rel="preconnect"][href="https://fonts.googleapis.com"]')) {
    const preconnect1 = document.createElement('link');
    preconnect1.rel = 'preconnect';
    preconnect1.href = 'https://fonts.googleapis.com';
    document.head.appendChild(preconnect1);

    const preconnect2 = document.createElement('link');
    preconnect2.rel = 'preconnect';
    preconnect2.href = 'https://fonts.gstatic.com';
    preconnect2.crossOrigin = 'anonymous';
    document.head.appendChild(preconnect2);
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);
  loadedFontUrls.add(url);
}

/**
 * Builds Google Fonts import URL for multiple font families
 */
export function buildGoogleFontsUrl(fontFamilies: string[]): string | null {
  const queries: string[] = [];
  const added = new Set<string>();

  fontFamilies.forEach((ff) => {
    const opt = getFontOption(ff);
    if (opt.googleFontQuery && !added.has(opt.cleanName)) {
      queries.push(opt.googleFontQuery);
      added.add(opt.cleanName);
    }
  });

  if (queries.length === 0) return null;
  return `https://fonts.googleapis.com/css2?${queries.join('&')}&display=swap`;
}

/**
 * Generates offline @font-face CSS snippet
 */
export function generateOfflineFontFaceCss(fontFamily: string, pathPrefix: string = './fonts'): string {
  const opt = getFontOption(fontFamily);
  const cleanName = opt.cleanName;
  const filename = opt.offlineFilename;

  return `@font-face {\n  font-family: '${cleanName}';\n  src: url('${pathPrefix}/${filename}') format('woff2');\n  font-weight: 100 900;\n  font-style: normal;\n  font-display: swap;\n}`;
}
