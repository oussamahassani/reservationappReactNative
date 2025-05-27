
import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Determine screen size categories
export const isSmallDevice = width < 375;
export const isMediumDevice = width >= 375 && width < 768;
export const isLargeDevice = width >= 768;
export const isExtraLargeDevice = width >= 1024;

// Screen dimensions
export const screenWidth = width;
export const screenHeight = height;

// Responsive font sizing
export const scaleFont = (size) => {
  const baseSize = size;
  if (isSmallDevice) return baseSize * 0.9;
  if (isLargeDevice) return baseSize * 1.15;
  if (isExtraLargeDevice) return baseSize * 1.3;
  return baseSize;
};

// Responsive spacing
export const scaleSpacing = (size) => {
  if (isSmallDevice) return size * 0.9;
  if (isLargeDevice) return size * 1.2;
  if (isExtraLargeDevice) return size * 1.4;
  return size;
};

// Shadow styles
export const boxShadow = {
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
};

export const lightShadow = {
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 1,
  },
  shadowOpacity: 0.18,
  shadowRadius: 1.0,
  elevation: 1,
};

export const strongShadow = {
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 4,
  },
  shadowOpacity: 0.32,
  shadowRadius: 5.46,
  elevation: 9,
};

// Common component styles
export const cardStyle = {
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  padding: scaleSpacing(16),
  ...boxShadow,
};

export const inputStyle = {
  backgroundColor: '#F5F5F5',
  borderRadius: 8,
  paddingVertical: scaleSpacing(12),
  paddingHorizontal: scaleSpacing(16),
  borderWidth: 1,
  borderColor: '#E0E0E0',
  fontSize: scaleFont(16),
};

export const buttonStyle = {
  paddingVertical: scaleSpacing(12),
  paddingHorizontal: scaleSpacing(20),
  borderRadius: 8,
  alignItems: 'center',
  justifyContent: 'center',
};

// Platform-specific styles
export const platformShadow = Platform.select({
  ios: boxShadow,
  android: {
    elevation: 5,
  },
  default: boxShadow,
});

// Responsive layout helpers
export const getResponsiveWidth = (percentage) => {
  return width * (percentage / 100);
};

export const getResponsiveHeight = (percentage) => {
  return height * (percentage / 100);
};

// Grid column widths based on device size
export const getColumnWidth = (columns = 1) => {
  const gap = 16;
  let totalColumns;
  
  if (isExtraLargeDevice) totalColumns = 4;
  else if (isLargeDevice) totalColumns = 3;
  else if (isMediumDevice) totalColumns = 2;
  else totalColumns = 1;
  
  const usableColumns = Math.min(columns, totalColumns);
  return (width - (gap * (totalColumns + 1))) / totalColumns * usableColumns + (gap * (usableColumns - 1));
};
