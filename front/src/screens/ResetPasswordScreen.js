
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../theme/colors';
import { SPACING } from '../theme/spacing';
import { FONT_SIZE } from '../theme/typography';
import ResetPasswordStep from '../components/forgotPassword/ResetPasswordStep';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../navigation/navigationConstants';
import { SafeAreaView } from 'react-native-safe-area-context';

const ResetPasswordScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { resetPassword } = useAuth();
  
  const { email, resetCode } = route.params || {};
  console.log('ResetPasswordScreen - Email:', email, 'Reset Code:', resetCode);
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle password reset
  const handlePasswordReset = async (password) => {
    console.log('Password reset handler called');
    
    if (!email || !resetCode) {
      Alert.alert(
        t('forgotPassword.errorTitle') || 'Error',
        t('forgotPassword.missingInfo') || 'Missing email or verification code. Please go back and try again.'
      );
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      console.log('Attempting to reset password for:', email, 'with code:', resetCode);
      
      // Use the resetPassword function from Auth context
      await resetPassword(email, resetCode, password);
      
      console.log('Password reset successful, navigating to success screen');
      
      // Navigate to success screen with name
      navigation.navigate(ROUTES.RESET_PASSWORD_SUCCESS);
      
    } catch (err) {
      console.error('Error resetting password:', err);
      const errorMsg = t('forgotPassword.resetError') || 'Failed to reset password';
      
      Alert.alert(
        t('forgotPassword.errorTitle') || 'Error',
        errorMsg
      );
      
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle going back to verification screen
  const handleGoBack = () => {
    navigation.navigate(ROUTES.VERIFICATION_CODE, { email, resetCode });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>
              {t('forgotPassword.resetTitle') || 'Reset Password'}
            </Text>
            <Text style={styles.subtitle}>
              {t('forgotPassword.resetSubtitle') || 'Create a new password for your account'}
            </Text>
          </View>
          
          {/* Step indicators */}
          <View style={styles.stepIndicatorContainer}>
            {[1, 2, 3, 4].map((step) => (
              <View 
                key={step}
                style={[
                  styles.stepIndicator,
                  3 >= step ? styles.activeStep : styles.inactiveStep,
                ]}
              >
                {3 > step ? (
                  <Text style={styles.stepCheckmark}>✓</Text>
                ) : (
                  <Text style={3 === step ? styles.activeStepText : styles.inactiveStepText}>
                    {step}
                  </Text>
                )}
              </View>
            ))}
          </View>
          
          {/* Reset password step content */}
          <View style={styles.content}>
            <ResetPasswordStep onSubmit={handlePasswordReset} error={error} />
          </View>
          
          {/* Back button */}
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleGoBack}
          >
            <Text style={styles.backButtonText}>
              {t('forgotPassword.backToStep') || 'Back to Previous Step'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray,
    textAlign: 'center',
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  stepIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
  },
  activeStep: {
    backgroundColor: COLORS.primary,
  },
  inactiveStep: {
    backgroundColor: COLORS.light_gray,
  },
  activeStepText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  inactiveStepText: {
    color: COLORS.gray,
    fontWeight: '600',
  },
  stepCheckmark: {
    color: COLORS.white,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    marginBottom: SPACING.lg,
  },
  backButton: {
    alignSelf: 'center',
    marginTop: SPACING.md,
    padding: SPACING.sm,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.md,
  },
});

export default ResetPasswordScreen;
