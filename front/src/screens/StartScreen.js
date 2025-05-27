
import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Animated, 
  TouchableOpacity, 
  Dimensions, 
  SafeAreaView, 
  Image,
  useWindowDimensions,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme/colors';
import { SPACING } from '../theme/spacing';
import { FONT_SIZE } from '../theme/typography';
import { boxShadow, scaleFont, scaleSpacing } from '../theme/mixins';
import { useTranslation } from 'react-i18next';

const StartScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const { width, height } = useWindowDimensions();
  const flatListRef = useRef(null);
  
  // Animation values
  const scrollX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Run entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const steps = [
    {
      title: t('start.explore'),
      description: t('start.exploreDesc'),
      icon: '🏛️'
    },
    {
      title: t('start.experience'),
      description: t('start.experienceDesc'),
      icon: '🌟'
    },
    {
      title: t('start.connect'),
      description: t('start.connectDesc'),
      icon: '🤝'
    }
  ];

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      flatListRef.current?.scrollToOffset({ 
        offset: nextStep * width,
        animated: true
      });
    } else {
      // On last step, go to login
      navigation.navigate('Login');
    }
  };

  const skipToLogin = () => {
    navigation.navigate('Login');
  };

  const renderStep = ({ item, index }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.5, 1, 0.5],
    });

    return (
      <Animated.View 
        style={[
          styles.stepContainer,
          { 
            opacity: opacity,
            width: width
          }
        ]}
      >
        <LinearGradient
          colors={['rgba(45, 106, 79, 0.9)', 'rgba(8, 28, 21, 0.95)']}
          style={[styles.gradientContainer, { height: height * 0.6 }]}
        >
          <Animated.View 
            style={[
              styles.iconContainer,
              { transform: [{ scale }] }
            ]}
          >
            <Text style={styles.icon}>{item.icon}</Text>
          </Animated.View>
          <Animated.Text 
            style={[
              styles.title,
              { transform: [{ scale }] }
            ]}
          >
            {item.title}
          </Animated.Text>
          <Animated.Text 
            style={[
              styles.description,
              { transform: [{ scale }] }
            ]}
          >
            {item.description}
          </Animated.Text>
        </LinearGradient>
      </Animated.View>
    );
  };

  return (
    <LinearGradient
      colors={['#1B4332', '#081C15']}
      style={styles.container}
    >
      <StatusBar translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={skipToLogin}
        >
          <Text style={styles.skipText}>{t('start.skip')}</Text>
        </TouchableOpacity>
        
        <Animated.View 
          style={[
            styles.content, 
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Animated.FlatList
            ref={flatListRef}
            horizontal
            pagingEnabled
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            data={steps}
            renderItem={renderStep}
            keyExtractor={(_, index) => index.toString()}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
          />

          <View style={styles.pagination}>
            {steps.map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  currentStep === index && styles.activeDot,
                  {
                    transform: [{
                      scale: scrollX.interpolate({
                        inputRange: [
                          (index - 1) * width,
                          index * width,
                          (index + 1) * width,
                        ],
                        outputRange: [0.8, 1.4, 0.8],
                        extrapolate: 'clamp',
                      }),
                    }],
                  },
                ]}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              currentStep === steps.length - 1 && styles.finalButton
            ]}
            onPress={goToNextStep}
          >
            <Text style={styles.buttonText}>
              {currentStep === steps.length - 1 ? t('start.start') : t('start.next')}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 0,
  },
  content: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: scaleSpacing(SPACING.xl),
    right: scaleSpacing(SPACING.lg),
    zIndex: 10,
    paddingVertical: scaleSpacing(SPACING.xs),
    paddingHorizontal: scaleSpacing(SPACING.md),
  },
  skipText: {
    color: COLORS.white,
    fontSize: scaleFont(FONT_SIZE.sm),
    opacity: 0.8,
  },
  gradientContainer: {
    padding: scaleSpacing(SPACING.xl),
    borderRadius: 25,
    margin: scaleSpacing(SPACING.md),
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scaleSpacing(SPACING.md),
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scaleSpacing(SPACING.xl),
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  icon: {
    fontSize: 50,
  },
  title: {
    fontSize: scaleFont(FONT_SIZE.xl),
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: scaleSpacing(SPACING.md),
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  description: {
    fontSize: scaleFont(FONT_SIZE.md),
    color: COLORS.white,
    textAlign: 'center',
    paddingHorizontal: scaleSpacing(SPACING.xl),
    opacity: 0.9,
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scaleSpacing(SPACING.xl),
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: COLORS.white,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: scaleSpacing(SPACING.md),
    paddingHorizontal: scaleSpacing(SPACING.xl),
    borderRadius: 25,
    marginHorizontal: scaleSpacing(SPACING.xl),
    marginBottom: scaleSpacing(SPACING.xl),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  finalButton: {
    backgroundColor: COLORS.secondary,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: scaleFont(FONT_SIZE.md),
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});

export default StartScreen;
