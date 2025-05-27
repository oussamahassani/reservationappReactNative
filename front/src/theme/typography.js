
import { scaleFont } from './mixins';

export const FONT_SIZE = {
  xs: scaleFont(12),
  sm: scaleFont(14),
  md: scaleFont(16),
  lg: scaleFont(20),
  xl: scaleFont(24),
  xxl: scaleFont(32),
};

export const FONT_FAMILY = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

export const FONT_WEIGHT = {
  regular: '400',
  medium: '600',
  bold: '700',
};

// Add helper function to ensure we always have valid font weights
export const getFontWeight = (weight) => {
  return FONT_WEIGHT[weight] || FONT_WEIGHT.regular;
};
