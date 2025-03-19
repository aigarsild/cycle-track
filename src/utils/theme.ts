/**
 * Global color theme constants for use in JavaScript/TypeScript contexts
 */

export const colors = {
  pink: {
    light: '#F15F82',
    DEFAULT: '#EF476F',
    dark: '#E22F5B',
  },
  yellow: {
    light: '#FFD980',
    DEFAULT: '#FFD166',
    dark: '#FFC94D',
  },
  green: {
    light: '#1DDAAB',
    DEFAULT: '#06D6A0',
    dark: '#00BD8B',
  },
  blue: {
    light: '#1A9CC7',
    DEFAULT: '#118AB2',
    dark: '#0E779A',
  },
  navy: {
    light: '#0A4B60',
    DEFAULT: '#073B4C',
    dark: '#052C39',
  },
  white: '#FFFFFF',
  dark: {
    light: '#3C3C3C',
    DEFAULT: '#2C2C2C',
    dark: '#1C1C1C',
  }
};

// Helper function to get a color value by path (e.g., "navy.light")
export const getColor = (path: string): string => {
  const parts = path.split('.');
  let result: any = colors;
  
  for (const part of parts) {
    if (result[part] === undefined) {
      console.warn(`Color path "${path}" not found`);
      return '';
    }
    result = result[part];
  }
  
  return result;
};

export default colors; 