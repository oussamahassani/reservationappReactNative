
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';
import { FONT_SIZE } from '../../theme/typography';
import CustomButton from '../CustomButton';

const SuccessStep = ({ onReturnToLogin }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.checkmark}>✓</Text>
      </View>
      
      <Text style={styles.successText}>
        {t('forgotPassword.passwordResetComplete') || 'Password Reset Complete'}
      </Text>
      
      <Text style={styles.description}>
        {t('forgotPassword.successDescription') || 
         'Your password has been successfully reset. You can now log in with your new password.'}
      </Text>
      
      <CustomButton
        title={t('forgotPassword.returnToLogin') || 'Return to Login'}
        onPress={onReturnToLogin}
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: 40,
    fontWeight: 'bold',
  },
  successText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  description: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  button: {
    marginTop: SPACING.lg,
    width: '100%',
  },
});

export default SuccessStep;
