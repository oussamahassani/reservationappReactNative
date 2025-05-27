
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  BackHandler
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../theme/colors';
import { SPACING } from '../theme/spacing';
import { FONT_SIZE } from '../theme/typography';
import EmailStep from '../components/forgotPassword/EmailStep';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../navigation/navigationConstants';
import { SafeAreaView } from 'react-native-safe-area-context';

const ForgotPasswordEmailScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { forgotPassword } = useAuth();
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Prevent hardware back button from working to stop returning to login
  useFocusEffect(
    React.useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          // Show the confirmation dialog instead of going back directly
          handleGoBack();
          return true; // Prevent default back button behavior
        }
      );

      return () => backHandler.remove();
    }, [])
  );

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
    setIsLoading(true);
    
    try {
      // Generate a random code
      const code = generateVerificationCode();
      
      console.log('Attempting to send reset code to:', submittedEmail, 'with code:', code);
      
      // Use the forgotPassword function from Auth context
      await forgotPassword(submittedEmail, code);
      
      console.log('Navigating to verification code screen with email:', submittedEmail, 'and code:', code);
      
      // Navigate to verification screen with name and params separately
      navigation.navigate(ROUTES.VERIFICATION_CODE, { 
        email: submittedEmail,
        resetCode: code 
      });
      
    } catch (err) {
      console.error('Error sending verification code:', err);
      const errorMsg = t('forgotPassword.emailError') || 'Échec de l\'envoi du code de vérification';
      
      Alert.alert(
        t('forgotPassword.errorTitle') || 'Erreur',
        errorMsg
      );
      
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle going back to login screen with confirmation
  const handleGoBack = () => {
    Alert.alert(
      t('forgotPassword.backToLoginTitle') || 'Retour à la connexion',
      t('forgotPassword.backToLoginMessage') || 'Voulez-vous abandonner la réinitialisation du mot de passe et retourner à la page de connexion ?',
      [
        {
          text: t('common.cancel') || 'Annuler',
          style: 'cancel',
        },
        {
          text: t('common.confirm') || 'Confirmer',
          onPress: () => navigation.navigate(ROUTES.LOGIN),
        },
      ]
    );
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
              {t('forgotPassword.subtitle') || 'Enter your email to receive a verification code'}
            </Text>
          </View>
          
          {/* Step indicators */}
          <View style={styles.stepIndicatorContainer}>
            {[1, 2, 3, 4].map((step) => (
              <View 
                key={step}
                style={[
                  styles.stepIndicator,
                  1 >= step ? styles.activeStep : styles.inactiveStep,
                ]}
              >
                {1 > step ? (
                  <Text style={styles.stepCheckmark}>✓</Text>
                ) : (
                  <Text style={1 === step ? styles.activeStepText : styles.inactiveStepText}>
                    {step}
                  </Text>
                )}
              </View>
            ))}
          </View>
          
          {/* Email step content */}
          <View style={styles.content}>
            <EmailStep onSubmit={handleEmailSubmit} error={error} />
          </View>
          
          {/* Back button */}
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleGoBack}
          >
            <Text style={styles.backButtonText}>
              {t('forgotPassword.backToLogin') || 'Back to Login'}
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

export default ForgotPasswordEmailScreen;
