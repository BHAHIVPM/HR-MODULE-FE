/**
 * Color Contrast & Relative Luminance Engine
 * Implements WCAG 2.1 relative luminance calculation to dynamically determine 
 * optimal contrasting text color (black vs white) for any background color.
 */

/**
 * Converts a hex string, rgb(), or rgba() string to { r, g, b, a } (0-255).
 * @param {string} color
 * @returns {{ r: number, g: number, b: number, a: number } | null}
 */
export function parseColor(color) {
  if (!color || typeof color !== 'string') return null;
  const c = color.trim();

  // Named shortcuts
  if (c === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
  if (c === 'white') return { r: 255, g: 255, b: 255, a: 1 };
  if (c === 'black') return { r: 0, g: 0, b: 0, a: 1 };

  // Hex (#rgb, #rgba, #rrggbb, #rrggbbaa)
  if (c.startsWith('#')) {
    let hex = c.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      hex = hex
        .split('')
        .map((ch) => ch + ch)
        .join('');
    }
    if (hex.length === 6) {
      return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16),
        a: 1,
      };
    }
    if (hex.length === 8) {
      return {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16),
        a: parseInt(hex.substring(6, 8), 16) / 255,
      };
    }
    return null;
  }

  // rgb / rgba
  const rgbMatch = c.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/i);
  if (rgbMatch) {
    return {
      r: Math.min(255, Math.max(0, parseInt(rgbMatch[1], 10))),
      g: Math.min(255, Math.max(0, parseInt(rgbMatch[2], 10))),
      b: Math.min(255, Math.max(0, parseInt(rgbMatch[3], 10))),
      a: rgbMatch[4] !== undefined ? Math.min(1, Math.max(0, parseFloat(rgbMatch[4]))) : 1,
    };
  }

  return null;
}

/**
 * Calculates WCAG 2.1 relative luminance for any given color.
 * Luminance ranges from 0 (deepest black) to 1 (purest white).
 * Formula: Y = 0.2126 * R + 0.7152 * G + 0.0722 * B
 * @param {string} color - Hex, rgb(), or rgba() string
 * @returns {number} Relative luminance in [0, 1]
 */
export function getLuminance(color) {
  const rgb = parseColor(color);
  if (!rgb) return 0;

  // sRGB gamma expansion to linear luminance
  const toLinear = (val) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };

  const R = toLinear(rgb.r);
  const G = toLinear(rgb.g);
  const B = toLinear(rgb.b);

  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Determines whether a color is perceived as bright or dark.
 * WCAG threshold crossover point where contrast ratio with black equals contrast with white:
 * (1.05 / (L + 0.05)) = ((L + 0.05) / 0.05) => L ≈ 0.1791.
 * If L > 0.179, black text gives higher contrast.
 * If L <= 0.179, white text gives higher contrast.
 * @param {string} color
 * @returns {boolean} true if bright/light, false if dark
 */
export function isBrightColor(color) {
  return getLuminance(color) > 0.179;
}

/**
 * Returns either high-contrast dark text or high-contrast light text
 * dynamically based on the luminance of the given background color.
 *
 * @param {string} bgColor - Background color
 * @param {string} darkTextColor - Defaults to '#0f172a' (deep slate/black)
 * @param {string} lightTextColor - Defaults to '#ffffff' (crisp white)
 * @returns {string} The optimal text color for guaranteed readability
 */
export function getContrastColor(bgColor, darkTextColor = '#0f172a', lightTextColor = '#ffffff') {
  return isBrightColor(bgColor) ? darkTextColor : lightTextColor;
}

/**
 * Returns a muted secondary text color that stays fully readable on the background.
 * @param {string} bgColor
 * @returns {string}
 */
export function getContrastMuted(bgColor) {
  return isBrightColor(bgColor) ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255, 255, 255, 0.72)';
}

/**
 * Returns a subtle contrast border color for the background.
 * @param {string} bgColor
 * @returns {string}
 */
export function getContrastBorder(bgColor) {
  return isBrightColor(bgColor) ? 'rgba(15, 23, 42, 0.12)' : 'rgba(255, 255, 255, 0.12)';
}

/**
 * Returns a very subtle text color (captions, subheadings).
 * @param {string} bgColor
 * @returns {string}
 */
export function getContrastSubtle(bgColor) {
  return isBrightColor(bgColor) ? 'rgba(15, 23, 42, 0.45)' : 'rgba(255, 255, 255, 0.45)';
}

/**
 * Helper to return an inline style object combining background and contrasting text.
 * @param {string} bgColor
 * @returns {{ backgroundColor: string, color: string }}
 */
export function getAutoContrastStyles(bgColor) {
  return {
    backgroundColor: bgColor,
    color: getContrastColor(bgColor),
  };
}

/**
 * Automatically calculates and applies contrasting text color to any DOM element
 * that requests automatic contrast via `data-auto-contrast` or `.auto-contrast`.
 * @param {HTMLElement} element
 */
export function applyAutoContrastToElement(element) {
  if (!element || typeof window === 'undefined') return;

  // Find effective background color (traverse upwards if transparent)
  let curr = element;
  let bg = '';
  while (curr && curr !== document.documentElement) {
    const style = window.getComputedStyle(curr);
    const candidate = style.backgroundColor;
    if (candidate && candidate !== 'transparent' && candidate !== 'rgba(0, 0, 0, 0)') {
      bg = candidate;
      break;
    }
    curr = curr.parentElement;
  }

  if (!bg) {
    bg = document.documentElement.dataset.theme === 'dark' ? '#0a0f18' : '#ffffff';
  }

  const contrast = getContrastColor(bg);
  element.style.color = contrast;
  element.style.setProperty('--auto-contrast-color', contrast);
}

/**
 * Initialize auto-contrast watcher for elements with `[data-auto-contrast]` or `.auto-contrast`
 */
export function initAutoContrastWatcher() {
  if (typeof window === 'undefined' || typeof MutationObserver === 'undefined') return () => {};

  const refreshAll = () => {
    const targets = document.querySelectorAll('[data-auto-contrast], .auto-contrast');
    targets.forEach(applyAutoContrastToElement);
  };

  refreshAll();

  const observer = new MutationObserver((mutations) => {
    let shouldRefresh = false;
    for (const m of mutations) {
      if (
        m.type === 'childList' ||
        (m.type === 'attributes' && (m.attributeName === 'style' || m.attributeName === 'class' || m.attributeName === 'data-theme'))
      ) {
        shouldRefresh = true;
        break;
      }
    }
    if (shouldRefresh) refreshAll();
  });

  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class', 'data-theme'],
  });

  return () => observer.disconnect();
}
