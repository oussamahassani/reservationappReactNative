
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-expo';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

// Simplified Clerk integration
export const useClerkIntegration = () => {
  const { isSignedIn, signOut } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const { login, logout } = useAuth();

  // When Clerk auth state changes, sync with our system
  useEffect(() => {
    if (isSignedIn && clerkUser) {
      handleClerkUserSync();
    }
  }, [isSignedIn, clerkUser]);

  const handleClerkUserSync = async () => {
    try {
      // Map Clerk user data to our system format
      const userData = {
        email: clerkUser.primaryEmailAddress?.emailAddress || 'user@example.com',
      };

      // Simplified login without password check
      try {
        await login(userData.email, 'simple-password');
        console.log('Clerk user logged in successfully');
      } catch (error) {
        console.error('Error syncing Clerk user:', error);
        // Fall back to manual user data
        Alert.alert(
          'Authentication Notice',
          'Using simplified authentication. Please proceed with the regular login.'
        );
      }
    } catch (error) {
      console.error('Error in handleClerkUserSync:', error);
    }
  };

  // Complete logout function that handles both Clerk and our auth system
  const handleCompleteLogout = async () => {
    try {
      // First logout from our system
      await logout();
      
      // Then logout from Clerk if signed in
      if (isSignedIn) {
        await signOut();
      }
      
      console.log('User completely logged out from all systems');
      return true;
    } catch (error) {
      console.error('Error during complete logout:', error);
      return false;
    }
  };

  return {
    isClerkAuthenticated: isSignedIn,
    clerkUser,
    logoutFromClerk: handleCompleteLogout
  };
};
