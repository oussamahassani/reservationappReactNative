
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../theme/colors';
import { SPACING } from '../theme/spacing';
import { FONT_SIZE } from '../theme/typography';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../navigation/navigationConstants';
import TextInput from '../components/TextInput';
import CustomButton from '../components/CustomButton';

// Steps of the password reset flow
const STEPS = {
  EMAIL: 0,
  VERIFICATION: 1,
  NEW_PASSWORD: 2
};

// Password strength levels
const PASSWORD_STRENGTH = {
  WEAK: 0,
  MEDIUM: 1,
  STRONG: 2
};

const OTPScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { forgotPassword, resetPassword } = useAuth();
  
  // State for the current step
  const [currentStep, setCurrentStep] = useState(STEPS.EMAIL);
  
  // Form state
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState(PASSWORD_STRENGTH.WEAK);
  
  // UI state
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Check password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength(PASSWORD_STRENGTH.WEAK);
      return;
    }
    
    // Define criteria for password strength
    const hasLength = password.length >= 8;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    // Calculate strength
    const strength = [hasLength, hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
    
    // Set strength level
    if (strength <= 2) {
      setPasswordStrength(PASSWORD_STRENGTH.WEAK);
    } else if (strength <= 4) {
      setPasswordStrength(PASSWORD_STRENGTH.MEDIUM);
    } else {
      setPasswordStrength(PASSWORD_STRENGTH.STRONG);
    }
  }, [password]);
  
  // Get strength text and color
  const getStrengthInfo = () => {
    switch (passwordStrength) {
      case PASSWORD_STRENGTH.STRONG:
        return {
          text: t('forgotPassword.passwordStrong') || 'Fort',
          color: COLORS.success
        };
      case PASSWORD_STRENGTH.MEDIUM:
        return {
          text: t('forgotPassword.passwordMedium') || 'Moyen',
          color: COLORS.warning
        };
      default:
        return {
          text: t('forgotPassword.passwordWeak') || 'Faible',
          color: COLORS.error
        };
    }
  };
  
  // Generate a random verification code
  const generateVerificationCode = () => {
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += Math.floor(Math.random() * 10).toString();
    }
    console.log('Generated verification code:', code);
    return code;
  };
  
  // Handle email submission
  const handleEmailSubmit = async () => {
    if (!email || !email.includes('@')) {
      setError(t('forgotPassword.invalidEmail') || 'Please enter a valid email address');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      // Generate a random code
      const code = generateVerificationCode();
      setResetCode(code);
      
      console.log('Sending forgotPassword request for email:', email, 'with code:', code);
      
      // Call the API with email and code
      await forgotPassword(email, code);
      
      // Move to verification step
      setCurrentStep(STEPS.VERIFICATION);
      
    } catch (err) {
      console.error('Error requesting password reset:', err);
      const errorMsg = err.message || t('forgotPassword.requestError') || 'Failed to request password reset';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle verification code submission
  const handleVerificationSubmit = () => {
    if (!verificationCode || verificationCode.length < 4) {
      setError(t('forgotPassword.invalidCode') || 'Please enter a valid verification code');
      return;
    }
    
    setError('');
    
    // Compare entered code with generated code
    if (verificationCode === resetCode) {
      // Move to new password step
      setCurrentStep(STEPS.NEW_PASSWORD);
    } else {
      setError(t('forgotPassword.verificationError') || 'Invalid verification code');
    }
  };
  
  // Handle new password submission
  const handlePasswordSubmit = async () => {
    if (!password || password.length < 6) {
      setError(t('forgotPassword.passwordTooShort') || 'Password must be at least 6 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      setError(t('forgotPassword.passwordMismatch') || 'Passwords do not match');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      // Call API to reset password
      await resetPassword(email, resetCode, password);
      
      // Navigate to success screen
      navigation.navigate(ROUTES.RESET_PASSWORD_SUCCESS);
      
    } catch (err) {
      console.error('Error resetting password:', err);
      const errorMsg = err.message || t('forgotPassword.resetError') || 'Failed to reset password';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle resend code
  const handleResendCode = async () => {
    setIsLoading(true);
    
    try {
      // Generate a new code
      const newCode = generateVerificationCode();
      setResetCode(newCode);
      
      // Call API with email and new code
      await forgotPassword(email, newCode);
      
      Alert.alert(
        t('forgotPassword.codeSentTitle') || 'Code Sent',
        t('forgotPassword.codeSentMessage') || 'A new verification code has been sent to your email.'
      );
    } catch (err) {
      console.error('Error resending verification code:', err);
      const errorMsg = err.message || t('forgotPassword.resendError') || 'Failed to resend verification code';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle going back
  const handleGoBack = () => {
    if (currentStep === STEPS.EMAIL) {
      navigation.navigate(ROUTES.LOGIN);
    } else {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };
  
  // Get title based on current step
  const getStepTitle = () => {
    switch (currentStep) {
      case STEPS.EMAIL:
        return t('forgotPassword.title') || 'Forgot Password';
      case STEPS.VERIFICATION:
        return t('forgotPassword.verificationTitle') || 'Verification Code';
      case STEPS.NEW_PASSWORD:
        return t('forgotPassword.resetTitle') || 'Reset Password';
      default:
        return '';
    }
  };
  
  // Get subtitle based on current step
  const getStepSubtitle = () => {
    switch (currentStep) {
      case STEPS.EMAIL:
        return t('forgotPassword.subtitle') || 'Enter your email to receive a verification code';
      case STEPS.VERIFICATION:
        return t('forgotPassword.verificationSubtitle') || 'Enter the code sent to your email';
      case STEPS.NEW_PASSWORD:
        return t('forgotPassword.resetSubtitle') || 'Create a new password for your account';
      default:
        return '';
    }
  };
  
  // Render password strength indicator
  const renderPasswordStrength = () => {
    if (!password) return null;
    
    const strengthInfo = getStrengthInfo();
    
    return (
      <View style={styles.strengthContainer}>
        <View style={styles.strengthBarContainer}>
          <View 
            style={[
              styles.strengthBar,
              { width: `${((passwordStrength + 1) / 3) * 100}%`, backgroundColor: strengthInfo.color }
            ]}
          />
        </View>
        <Text style={[styles.strengthText, { color: strengthInfo.color }]}>
          {strengthInfo.text}
        </Text>
      </View>
    );
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case STEPS.EMAIL:
        return (
          <View style={styles.formContainer}>
            <TextInput
              placeholder={t('common.email') || 'Email'}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
            <CustomButton
              title={t('common.continue') || 'Continue'}
              onPress={handleEmailSubmit}
              isLoading={isLoading}
              style={styles.button}
            />
          </View>
        );
      
      case STEPS.VERIFICATION:
        return (
          <View style={styles.formContainer}>
            <Text style={styles.emailText}>
              {t('forgotPassword.verificationDescription')} <Text style={styles.emailHighlight}>{email}</Text>
            </Text>
            <TextInput
              placeholder={t('forgotPassword.verificationCode') || 'Verification Code'}
              value={verificationCode}
              onChangeText={setVerificationCode}
              keyboardType="number-pad"
              maxLength={6}
              style={styles.input}
            />
            <CustomButton
              title={t('common.verify') || 'Verify'}
              onPress={handleVerificationSubmit}
              isLoading={isLoading}
              style={styles.button}
            />
            <TouchableOpacity 
              style={styles.resendButton} 
              onPress={handleResendCode}
              disabled={isLoading}
            >
              <Text style={styles.resendButtonText}>
                {t('forgotPassword.resendCode') || 'Resend Code'}
              </Text>
            </TouchableOpacity>
          </View>
        );
      
      case STEPS.NEW_PASSWORD:
        return (
          <View style={styles.formContainer}>
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder={t('forgotPassword.newPassword') || 'New Password'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={styles.input}
              />
              <TouchableOpacity 
                style={styles.visibilityButton}
                onPress={togglePasswordVisibility}
              >
                <Text style={styles.visibilityText}>
                  {showPassword ? t('forgotPassword.hide') || 'Hide' : t('forgotPassword.show') || 'Show'}
                </Text>
              </TouchableOpacity>
            </View>
            
            {renderPasswordStrength()}
            
            <TextInput
              placeholder={t('forgotPassword.confirmPassword') || 'Confirm Password'}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              style={styles.input}
            />
            <CustomButton
              title={t('forgotPassword.resetPassword') || 'Reset Password'}
              onPress={handlePasswordSubmit}
              isLoading={isLoading}
              style={styles.button}
            />
          </View>
        );
      
      default:
        return null;
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
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleGoBack}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.header}>
            <Text style={styles.title}>{getStepTitle()}</Text>
            <Text style={styles.subtitle}>{getStepSubtitle()}</Text>
          </View>
          
          {/* Step indicators with animation */}
          <View style={styles.stepIndicatorContainer}>
            {[0, 1, 2].map((step) => (
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
                    {step + 1}
                  </Text>
                )}
              </View>
            ))}
            
            {/* Connecting lines */}
            <View style={[styles.connectingLine, styles.lineLeft, currentStep > 0 ? styles.activeLine : {}]} />
            <View style={[styles.connectingLine, styles.lineRight, currentStep > 1 ? styles.activeLine : {}]} />
          </View>
          
          {/* Error message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          
          {/* Step content with card style */}
          <View style={styles.contentCard}>
            {renderStepContent()}
          </View>
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
    marginTop: SPACING.xl,
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
    alignItems: 'center',
    marginBottom: SPACING.xl,
    position: 'relative',
  },
  connectingLine: {
    position: 'absolute',
    top: '50%',
    height: 2,
    width: '15%',
    backgroundColor: COLORS.light_gray,
    zIndex: -1,
  },
  lineLeft: {
    left: '30%',
  },
  lineRight: {
    right: '30%',
  },
  activeLine: {
    backgroundColor: COLORS.primary,
  },
  stepIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
  contentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: SPACING.md,
  },
  button: {
    marginTop: SPACING.sm,
  },
  errorContainer: {
    backgroundColor: COLORS.error_light,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    zIndex: 10,
    padding: SPACING.sm,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.light_gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.primary,
  },
  resendButton: {
    alignSelf: 'center',
    marginTop: SPACING.md,
    padding: SPACING.sm,
  },
  resendButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.md,
  },
  passwordContainer: {
    position: 'relative',
  },
  visibilityButton: {
    position: 'absolute',
    right: SPACING.md,
    top: '30%',
    transform: [{ translateY: -10 }],
  },
  visibilityText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
  },
  strengthContainer: {
    marginBottom: SPACING.md,
  },
  strengthBarContainer: {
    height: 6,
    backgroundColor: COLORS.light_gray,
    borderRadius: 3,
    marginBottom: SPACING.xs,
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
    borderRadius: 3,
  },
  strengthText: {
    fontSize: FONT_SIZE.xs,
    textAlign: 'right',
  },
  emailText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  emailHighlight: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default OTPScreen;
