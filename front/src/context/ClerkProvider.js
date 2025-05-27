
import React from 'react';
import { ClerkProvider as ClerkProviderExpo } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';

// Secure token storage for Expo
const tokenCache = {
  async getToken(key) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key, value) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

export const ClerkProvider = ({ children }) => {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_Y2FyaW5nLWJpc29uLTE5LmNsZXJrLmFjY291bnRzLmRldiQ';

  return (
    <ClerkProviderExpo 
      publishableKey={publishableKey}
      tokenCache={tokenCache}
    >
      {children}
    </ClerkProviderExpo>
  );
};

export default ClerkProvider;
