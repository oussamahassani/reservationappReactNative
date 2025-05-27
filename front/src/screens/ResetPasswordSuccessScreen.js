
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../theme/colors';
import { SPACING } from '../theme/spacing';
import { FONT_SIZE } from '../theme/typography';
import SuccessStep from '../components/forgotPassword/SuccessStep';
import { ROUTES } from '../navigation/navigationConstants';
import { SafeAreaView } from 'react-native-safe-area-context';

const ResetPasswordSuccessScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  // Handle return to login page after successful reset
  const handleReturnToLogin = () => {
    console.log('Navigating back to login screen');
    navigation.navigate(ROUTES.LOGIN);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {t('forgotPassword.successTitle') || 'Success!'}
          </Text>
          <Text style={styles.subtitle}>
            {t('forgotPassword.successSubtitle') || 'Your password has been reset successfully'}
          </Text>
        </View>
        
        {/* Step indicators */}
        <View style={styles.stepIndicatorContainer}>
          {[1, 2, 3, 4].map((step) => (
            <View 
              key={step}
              style={[
                styles.stepIndicator,
                4 >= step ? styles.activeStep : styles.inactiveStep,
              ]}
            >
              <Text style={styles.stepCheckmark}>✓</Text>
            </View>
          ))}
        </View>
        
        {/* Success step content */}
        <View style={styles.content}>
          <SuccessStep onReturnToLogin={handleReturnToLogin} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
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
    backgroundColor: COLORS.primary,
  },
  stepCheckmark: {
    color: COLORS.white,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    marginBottom: SPACING.lg,
  },
});

export default ResetPasswordSuccessScreen;
