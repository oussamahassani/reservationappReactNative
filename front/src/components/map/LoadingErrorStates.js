
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';
import { FONT_SIZE } from '../../theme/typography';
import * as Animatable from 'react-native-animatable';

export const LoadingState = () => {
  return (
    <View style={styles.container}>
      <Animatable.View animation="fadeIn" duration={800} style={styles.content}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chargement de la carte...</Text>
      </Animatable.View>
    </View>
  );
};

export const ErrorState = ({ error, onRetry }) => {
  return (
    <View style={styles.container}>
      <Animatable.View animation="fadeIn" duration={800} style={styles.content}>
        <Text style={styles.errorText}>Oups! Une erreur s'est produite</Text>
        <Text style={styles.errorDescription}>{error?.message || 'Impossible de charger la carte'}</Text>
        <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </Animatable.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  content: {
    padding: SPACING.xl,
    borderRadius: 15,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '80%',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.gray,
    textAlign: 'center',
  },
  errorText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  errorDescription: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 25,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
  },
});
