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
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../theme/colors';
import { SPACING } from '../theme/spacing';
import { FONT_SIZE } from '../theme/typography';
import VerificationStep from '../components/forgotPassword/VerificationStep';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../navigation/navigationConstants';
import { SafeAreaView } from 'react-native-safe-area-context';

const VerificationCodeScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { forgotPassword } = useAuth();
  
  const { email, resetCode } = route.params || {};
  const [isLoading, setIsLoading] = useState(false);
  
  const [error, setError] = useState('');

  // Log navigation params for debugging
  console.log('VerificationCodeScreen - Email:', email, 'Reset Code:', resetCode);

  useFocusEffect(
    React.useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          navigation.goBack();
          return true;
        }
      );

      return () => backHandler.remove();
    }, [navigation])
  );

  const handleResendCode = async () => {
    if (!email) {
      Alert.alert(
        t('forgotPassword.errorTitle') || 'Error',
        t('forgotPassword.missingEmail') || 'Email address is missing. Please go back and try again.'
      );
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Generate a new code
      const newCode = generateVerificationCode();
      
      await forgotPassword(email, newCode);
      
      // Update the resetCode param
      navigation.setParams({ resetCode: newCode });
      
      Alert.alert(
        t('forgotPassword.codeSentTitle') || 'Code Sent',
        t('forgotPassword.codeSentMessage') || 'A new verification code has been sent to your email.'
      );
    } catch (err) {
      console.error('Error resending verification code:', err);
      
      Alert.alert(
        t('forgotPassword.errorTitle') || 'Error',
        t('forgotPassword.resendError') || 'Failed to resend verification code.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const generateVerificationCode = () => {
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += Math.floor(Math.random() * 10).toString();
    }
    console.log('Generated verification code:', code);
    return code;
  };

  const handleVerifyCode = (code) => {
    setError('');
    setIsLoading(true);
    
    try {
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
      
      if (codeString === resetCode) {
        console.log('Code verified successfully');
        
        // Navigate to reset password screen with name and params separately
        navigation.navigate(ROUTES.RESET_PASSWORD, {
          email,
          resetCode
        });
        
      } else {
        console.log('Code verification failed - Input code does not match expected code');
        throw new Error(t('forgotPassword.verificationError') || 'Code de vérification invalide');
      }
    } catch (err) {
      console.error('Verification code error:', err);
      const errorMsg = err.message || t('forgotPassword.verificationError') || 'Code de vérification invalide';
      
      Alert.alert(
        t('forgotPassword.errorTitle') || 'Error',
        errorMsg
      );
      
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
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
              {t('forgotPassword.verificationTitle') || 'Verification Code'}
            </Text>
            <Text style={styles.subtitle}>
              {t('forgotPassword.verificationSubtitle') || 'Enter the 4-digit code sent to your email'}
            </Text>
          </View>
          
          <View style={styles.stepIndicatorContainer}>
            {[1, 2, 3, 4].map((step) => (
              <View 
                key={step}
                style={[
                  styles.stepIndicator,
                  2 >= step ? styles.activeStep : styles.inactiveStep,
                ]}
              >
                {2 > step ? (
                  <Text style={styles.stepCheckmark}>✓</Text>
                ) : (
                  <Text style={2 === step ? styles.activeStepText : styles.inactiveStepText}>
                    {step}
                  </Text>
                )}
              </View>
            ))}
          </View>
          
          <View style={styles.content}>
            <VerificationStep
              email={email}
              onSubmit={handleVerifyCode}
              onResendCode={handleResendCode}
              error={error}
            />
          </View>
          
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

export default VerificationCodeScreen;
