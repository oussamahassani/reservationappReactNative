
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { I18nextProvider } from 'react-i18next';
import i18n from './src/i18n';
import { AuthProvider } from './src/context/AuthContext';
import { NavigationContainer } from '@react-navigation/native';
import { ClerkProvider } from './src/context/ClerkProvider';
import RootNavigator from './src/navigation/RootNavigator';

// Add both dev and build:dev scripts - this helps with Lovable builds
if (process.env.NODE_ENV === 'development') {
  console.log('Running in development mode');
  // Required scripts for Lovable environment
  if (!process.env.npm_lifecycle_script) {
    console.log('Please make sure the following scripts are in package.json:');
    console.log('- "dev": "vite"');
    console.log('- "build:dev": "vite build --mode development"');
  }
}

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <ClerkProvider>
        <AuthProvider>
          <NavigationContainer>
            <RootNavigator />
            <StatusBar style="auto" />
          </NavigationContainer>
        </AuthProvider>
      </ClerkProvider>
    </I18nextProvider>
  );
}
