
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';
import { FONT_SIZE } from '../../theme/typography';

const StepIndicator = ({ currentStep, steps }) => {
  return (
    <View style={styles.container}>
      <View style={styles.progressBarContainer}>
        <View 
          style={[
            styles.progressBar, 
            { width: `${(currentStep / (steps.length - 1)) * 100}%` }
          ]} 
        />
      </View>
      
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <View 
            key={index}
            style={[
              styles.stepContainer,
              index === 0 && { alignItems: 'flex-start' },
              index === steps.length - 1 && { alignItems: 'flex-end' },
            ]}
          >
            <View 
              style={[
                styles.stepDot,
                index <= currentStep && styles.activeDot
              ]}
            >
              {index < currentStep && (
                <View style={styles.completedDot} />
              )}
            </View>
            <Text 
              style={[
                styles.stepText,
                index <= currentStep && styles.activeStepText
              ]}
              numberOfLines={1}
            >
              {step}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: COLORS.gray_light,
    borderRadius: 2,
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.gray_light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  activeDot: {
    borderColor: COLORS.primary,
  },
  completedDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  stepText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray,
    textAlign: 'center',
  },
  activeStepText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default StepIndicator;
