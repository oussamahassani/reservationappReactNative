
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../theme/colors';
import { SPACING } from '../theme/spacing';
import { FONT_SIZE, FONT_FAMILY } from '../theme/typography';
import EmailStep from '../components/forgotPassword/EmailStep';
import VerificationStep from '../components/forgotPassword/VerificationStep';
import ResetPasswordStep from '../components/forgotPassword/ResetPasswordStep';
import SuccessStep from '../components/forgotPassword/SuccessStep';
import { ROUTES } from '../navigation/navigationConstants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

const ForgotPasswordScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { forgotPassword, resetPassword } = useAuth();
  
  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Debug logging
  useEffect(() => {
    console.log('ForgotPasswordScreen - Current step:', currentStep);
    console.log('ForgotPasswordScreen - Email:', email);
    console.log('ForgotPasswordScreen - Reset code:', resetCode);
  }, [currentStep, email, resetCode]);

  // Generate a random 4-digit verification code
  const generateVerificationCode = () => {
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += Math.floor(Math.random() * 10).toString();
    }
    console.log('Generated verification code:', code);
    return code;
  };

  // Handle email submission and sending verification code
  const handleEmailSubmit = async (submittedEmail) => {
    console.log('Email submit handler called with:', submittedEmail);
    
    // Validate email
    if (!submittedEmail || typeof submittedEmail !== 'string' || !submittedEmail.includes('@')) {
      const errorMsg = t('forgotPassword.invalidEmail') || 'Email invalide';
      setError(errorMsg);
      Alert.alert(t('forgotPassword.errorTitle') || 'Erreur', errorMsg);
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      // Generate a random code
      const code = generateVerificationCode();
      
      console.log('Attempting to send reset code to:', submittedEmail, 'with code:', code);
      
      // Use the forgotPassword function from Auth context
      const response = await forgotPassword(submittedEmail, code);
      
      console.log('Forgot password API response:', response);
      
      // Store email and code for later verification
      setEmail(submittedEmail);
      setResetCode(code);
      
      // Move to the next step
      setCurrentStep(2);
      
      console.log('Successfully moved to verification step. Current step:', 2);
    } catch (err) {
      console.error('Error sending verification code:', err);
      const errorMsg = t('forgotPassword.emailError') || 'Échec de l\'envoi du code de vérification';
      
      Alert.alert(
        t('forgotPassword.errorTitle') || 'Erreur',
        errorMsg
      );
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle verification code submission
  const handleVerificationSubmit = (code) => {
    console.log('Verification submit handler called with:', code);
    
    setError('');
    setLoading(true);
    
    try {
      // Format the code for comparison
      let codeString;
      
      if (Array.isArray(code)) {
        codeString = code.join('');
      } else if (typeof code === 'string') {
        codeString = code;
      } else if (code === undefined || code === null) {
        throw new Error('Code de vérification manquant');
      } else {
        codeString = String(code);
      }
      
      console.log('Comparing verification codes - Input:', codeString, 'Expected:', resetCode);
      
      // Check if entered code matches the generated code
      if (codeString === resetCode) {
        console.log('Code verified successfully');
        
        // Store code for next steps if needed
        if (Array.isArray(code)) {
          setVerificationCode(code);
        } else if (typeof code === 'string') {
          setVerificationCode(code.split(''));
        }
        
        // Move to the next step
        setCurrentStep(3);
        console.log('Successfully moved to reset password step. Current step:', 3);
      } else {
        console.log('Code verification failed - Input code does not match expected code');
        throw new Error(t('forgotPassword.verificationError') || 'Code de vérification invalide');
      }
    } catch (err) {
      console.error('Verification code error:', err);
      const errorMsg = err.message || t('forgotPassword.verificationError') || 'Code de vérification invalide';
      
      Alert.alert(
        t('forgotPassword.errorTitle') || 'Erreur',
        errorMsg
      );
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle password reset
  const handlePasswordReset = async (password) => {
    console.log('Password reset handler called');
    
    setError('');
    setLoading(true);
    
    try {
      console.log('Attempting to reset password for:', email, 'with code:', resetCode);
      
      // Use the resetPassword function from Auth context
      const response = await resetPassword(email, resetCode, password);
      
      console.log('Password reset API response:', response);
      
      // Move to the final success step
      setCurrentStep(4);
      console.log('Successfully moved to success step. Current step:', 4);
    } catch (err) {
      console.error('Error resetting password:', err);
      const errorMsg = t('forgotPassword.resetError') || 'Échec de la réinitialisation du mot de passe';
      
      Alert.alert(
        t('forgotPassword.errorTitle') || 'Erreur',
        errorMsg
      );
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle return to login page after successful reset
  const handleReturnToLogin = () => {
    console.log('Navigating back to login screen');
    navigation.navigate(ROUTES.LOGIN);
  };

  // Handle going back to previous step or login screen
  const handleGoBack = () => {
    if (currentStep > 1) {
      console.log('Going back to previous step');
      setCurrentStep(currentStep - 1);
    } else {
      console.log('Navigating back to login screen');
      navigation.navigate(ROUTES.LOGIN);
    }
  };

  // Render the appropriate step based on currentStep
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <EmailStep onSubmit={handleEmailSubmit} loading={loading} error={error} />;
      case 2:
        return (
          <VerificationStep 
            email={email} 
            onSubmit={handleVerificationSubmit} 
            onResendCode={() => handleEmailSubmit(email)}
            loading={loading} 
            error={error}
          />
        );
      case 3:
        return <ResetPasswordStep onSubmit={handlePasswordReset} loading={loading} error={error} />;
      case 4:
        return <SuccessStep onReturnToLogin={handleReturnToLogin} />;
      default:
        return <EmailStep onSubmit={handleEmailSubmit} loading={loading} error={error} />;
    }
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
              {t('forgotPassword.title') || 'Reset Password'}
            </Text>
            <Text style={styles.subtitle}>
              {t('forgotPassword.subtitle') || 'Follow the steps to reset your password'}
            </Text>
          </View>
          
          {/* Step indicators */}
          <View style={styles.stepIndicatorContainer}>
            {[1, 2, 3, 4].map((step) => (
              <View 
                key={step}
                style={[
                  styles.stepIndicator,
                  currentStep >= step ? styles.activeStep : styles.inactiveStep,
                ]}
              >
                {currentStep > step ? (
                  <Text style={styles.stepCheckmark}>✓</Text>
                ) : (
                  <Text style={currentStep === step ? styles.activeStepText : styles.inactiveStepText}>
                    {step}
                  </Text>
                )}
              </View>
            ))}
          </View>
          
          {/* Current step content */}
          <View style={styles.content}>
            {renderStep()}
          </View>
          
          {/* Back button - only show if not on success step */}
          {currentStep !== 4 && (
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={handleGoBack}
              disabled={loading}
            >
              <Text style={styles.backButtonText}>
                {currentStep > 1 
                  ? (t('forgotPassword.backToStep') || 'Back to Previous Step') 
                  : (t('forgotPassword.backToLogin') || 'Back to Login')}
              </Text>
            </TouchableOpacity>
          )}
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

export default ForgotPasswordScreen;