import {
  parseColor,
  getLuminance,
  isBrightColor,
  getContrastColor,
  getContrastMuted,
  getAutoContrastStyles,
} from './colorContrast';

describe('colorContrast utility', () => {
  describe('parseColor', () => {
    it('parses 6-digit hex colors', () => {
      expect(parseColor('#ffffff')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
      expect(parseColor('#000000')).toEqual({ r: 0, g: 0, b: 0, a: 1 });
      expect(parseColor('#2f5dd1')).toEqual({ r: 47, g: 93, b: 209, a: 1 });
    });

    it('parses 3-digit hex colors', () => {
      expect(parseColor('#fff')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
      expect(parseColor('#000')).toEqual({ r: 0, g: 0, b: 0, a: 1 });
    });

    it('parses rgb and rgba strings', () => {
      expect(parseColor('rgb(255, 255, 255)')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
      expect(parseColor('rgba(0, 0, 0, 0.5)')).toEqual({ r: 0, g: 0, b: 0, a: 0.5 });
    });

    it('handles named colors and fallbacks', () => {
      expect(parseColor('white')).toEqual({ r: 255, g: 255, b: 255, a: 1 });
      expect(parseColor('black')).toEqual({ r: 0, g: 0, b: 0, a: 1 });
      expect(parseColor('invalid')).toBeNull();
    });
  });

  describe('getLuminance & isBrightColor', () => {
    it('calculates 1.0 for pure white and 0.0 for pure black', () => {
      expect(getLuminance('#ffffff')).toBeCloseTo(1.0, 2);
      expect(getLuminance('#000000')).toBeCloseTo(0.0, 2);
    });

    it('identifies bright colors (yellow, white, cyan, light gray)', () => {
      expect(isBrightColor('#ffffff')).toBe(true);
      expect(isBrightColor('#ffff00')).toBe(true); // yellow
      expect(isBrightColor('#00ffff')).toBe(true); // cyan
      expect(isBrightColor('#f8fafc')).toBe(true); // light surface
    });

    it('identifies dark colors (navy, dark purple, black, deep blue)', () => {
      expect(isBrightColor('#000000')).toBe(false);
      expect(isBrightColor('#0b1220')).toBe(false); // third color
      expect(isBrightColor('#2f5dd1')).toBe(false); // default blue
      expect(isBrightColor('#1e1b4b')).toBe(false); // royal indigo
    });
  });

  describe('getContrastColor', () => {
    it('returns dark text for bright backgrounds', () => {
      expect(getContrastColor('#ffffff')).toBe('#0f172a');
      expect(getContrastColor('#ffff00')).toBe('#0f172a');
      expect(getContrastColor('#facc15')).toBe('#0f172a');
      expect(getContrastColor('#f8fafc')).toBe('#0f172a');
    });

    it('returns white text for dark backgrounds', () => {
      expect(getContrastColor('#000000')).toBe('#ffffff');
      expect(getContrastColor('#0b1220')).toBe('#ffffff');
      expect(getContrastColor('#2f5dd1')).toBe('#ffffff');
      expect(getContrastColor('#121a2c')).toBe('#ffffff');
    });

    it('supports custom dark and light text overrides', () => {
      expect(getContrastColor('#ffffff', '#111111', '#eeeeee')).toBe('#111111');
      expect(getContrastColor('#000000', '#111111', '#eeeeee')).toBe('#eeeeee');
    });
  });

  describe('getContrastMuted & getAutoContrastStyles', () => {
    it('returns muted colors based on background brightness', () => {
      expect(getContrastMuted('#ffffff')).toContain('rgba(15, 23, 42');
      expect(getContrastMuted('#000000')).toContain('rgba(255, 255, 255');
    });

    it('returns valid inline style object', () => {
      const styles = getAutoContrastStyles('#fde047');
      expect(styles).toEqual({
        backgroundColor: '#fde047',
        color: '#0f172a',
      });
    });
  });
});
