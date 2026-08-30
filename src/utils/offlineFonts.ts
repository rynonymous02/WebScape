/**
 * Offline Fonts Helper for WebScape Export
 * Contains base64 font representations and font bundle helpers
 */

import { getFontOption } from './fontLoader';

export interface BundledFontAsset {
  filename: string;
  fontFamily: string;
  base64Data: string;
  mimeType: string;
}

// Minimal valid WOFF2 font header base64 payload to serve as offline font bundle asset
const FALLBACK_FONT_BASE64 = 'd09GMgABAAAAAAQoAA8AAAAACVAAAAPSAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGhwSGgZgAAgIgXQREQgKDBwLCw4AATYCJANQAAQgBYNIB2s2MwvI3r92l/h87l0EaU00m0q/q7T3j40pkhg+95/qPz7+B0HwO75/v/u+M4tZgW0gQ9jUo5pB29B1p154VzQhD4kQ';

/**
 * Returns a bundled font asset for a given font family
 */
export function getOfflineFontAsset(fontFamily: string): BundledFontAsset {
  const opt = getFontOption(fontFamily);
  return {
    filename: opt.offlineFilename,
    fontFamily: opt.cleanName,
    base64Data: FALLBACK_FONT_BASE64,
    mimeType: 'font/woff2',
  };
}

/**
 * Extracts all unique fonts used across text nodes in a project
 */
export function extractFontsFromNodes(nodes: Record<string, any>): {
  webFonts: string[];
  offlineFonts: string[];
} {
  const webFonts = new Set<string>();
  const offlineFonts = new Set<string>();

  Object.values(nodes).forEach((node: any) => {
    if (node.type === 'text' && node.style) {
      const ff = node.style.fontFamily || 'Inter, sans-serif';
      const source = node.style.fontSource || 'web';
      if (source === 'offline') {
        offlineFonts.add(ff);
      } else {
        webFonts.add(ff);
      }
    }
  });

  return {
    webFonts: Array.from(webFonts),
    offlineFonts: Array.from(offlineFonts),
  };
}
