import { StyleSheet } from 'react-native';

export const Typography = StyleSheet.create({
  // Headings
  h1: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333333',
    letterSpacing: 0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
    letterSpacing: 0.3,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    letterSpacing: 0.2,
  },

  // Body text
  bodyLarge: {
    fontSize: 18,
    fontWeight: '400',
    color: '#666666',
    lineHeight: 26,
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666666',
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666666',
    lineHeight: 20,
  },

  // Labels and buttons
  labelLarge: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  labelMedium: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  labelSmall: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333333',
  },

  // Special styles
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#7792bd',
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    color: '#999999',
    letterSpacing: 0.2,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // Status and alerts
  status: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  error: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF3B30',
  },
  success: {
    fontSize: 14,
    fontWeight: '500',
    color: '#34C759',
  },
});

// Example usage:
// import { Typography } from '../common/typography';
// <Text style={Typography.h1}>Heading 1</Text>
// <Text style={Typography.bodyMedium}>Regular text</Text>
// <Text style={Typography.labelLarge}>Button Label</Text>

export default Typography;