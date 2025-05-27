import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme/colors';
import { SPACING } from '../theme/spacing';
import { FONT_SIZE } from '../theme/typography';
import { boxShadow } from '../theme/mixins';
import * as Animatable from 'react-native-animatable';
import { Eye, EyeOff } from 'lucide-react-native';
import { useOAuth, useAuth as useClerkAuth } from '@clerk/clerk-expo';
import { useClerkIntegration } from '../utils/clerkAuth';
import { useTranslation } from 'react-i18next';
import { ROUTES, STACKS } from '../navigation/navigationConstants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';

export default function LoginScreen({ navigation }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const { login, error } = useAuth();
  const { isClerkAuthenticated } = useClerkIntegration();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const { signOut: clerkSignOut } = useClerkAuth();

  useEffect(() => {
    const handleSignOut = async () => {
      try {
        if (clerkSignOut) {
          await clerkSignOut();
          console.log('Signed out of Clerk');
        }
      } catch (error) {
        console.error('Error signing out of Clerk:', error);
      }
    };

    handleSignOut();
  }, []);

  useEffect(() => {
    if (isClerkAuthenticated) {
      navigation.navigate(ROUTES.HOME);
    }
  }, [isClerkAuthenticated, navigation]);

  const handleLogin = async () => {
    if (!email || !password) {
      setLoginError(t('login.fillAllFields') || 'Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    setLoginError('');
    try {
      const userData = await login(email, password);
      console.log('User data after login:', userData);
      
      let targetStack = STACKS.USER;
      if (userData.role === 'admin') {
        targetStack = STACKS.ADMIN;
      } else if (userData.role === 'provider' || userData.role === 'prestataire') {
        targetStack = STACKS.PROVIDER;
      }
      
      console.log('Navigating to stack:', targetStack);
      
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: targetStack }],
        })
      );
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(t('login.invalidCredentials') || 'Identifiants incorrects. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate(ROUTES.OTP);
  };
  
  const handleGoogleLogin = async () => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow();
      
      if (createdSessionId) {
        setActive({ session: createdSessionId });
      }
    } catch (err) {
      console.error("OAuth error", err);
      setLoginError(t('login.googleError') || 'Problème lors de la connexion avec Google');
    }
  };

  useEffect(() => {
    if (error) {
      setLoginError(error);
    }
  }, [error]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Animatable.View 
            animation="fadeInDown" 
            duration={1000} 
            style={styles.header}
          >
            <Text style={styles.title}>{t('login.welcome') || 'Bienvenue'}</Text>
            <Text style={styles.subtitle}>{t('login.subtitle') || 'Connectez-vous pour continuer'}</Text>
          </Animatable.View>

          <Animatable.View 
            animation="fadeInUp" 
            duration={1000} 
            delay={300}
            style={styles.formContainer}
          >
            {loginError ? (
              <Animatable.View 
                animation="shake" 
                style={styles.errorContainer}
              >
                <Text style={styles.errorText}>{loginError}</Text>
              </Animatable.View>
            ) : null}
            
            <TextInput 
              style={styles.input}
              placeholder={t('login.email') || "E-mail"}
              placeholderTextColor={COLORS.gray}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            
            <View style={styles.passwordContainer}>
              <TextInput 
                style={styles.passwordInput}
                placeholder={t('login.password') || "Mot de passe"}
                placeholderTextColor={COLORS.gray}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <Eye size={20} color={COLORS.gray} />
                ) : (
                  <EyeOff size={20} color={COLORS.gray} />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>
                {t('login.forgotPassword') || "Mot de passe oublié ?"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.loginButtonText}>{t('login.login') || "Se connecter"}</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t('login.or') || "ou"}</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity 
              style={styles.googleButton}
              onPress={handleGoogleLogin}
            >
              <Image 
                source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}
                style={styles.googleIcon}
              />
              <Text style={styles.googleButtonText}>{t('login.googleLogin') || "Se connecter avec Google"}</Text>
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>
                {t('login.noAccount') || "Vous n'avez pas de compte ?"}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.signupLink}>
                  {t('login.signup') || "S'inscrire"}
                </Text>
              </TouchableOpacity>
            </View>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.primary,
    paddingBottom: SPACING.xl * 1.5,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.white,
    opacity: 0.8,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  input: {
    backgroundColor: COLORS.light_gray,
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    fontSize: FONT_SIZE.md,
    borderWidth: 1,
    borderColor: COLORS.light_gray,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.lg,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 10,
    alignItems: 'center',
    ...boxShadow,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.light_gray,
  },
  dividerText: {
    color: COLORS.gray,
    paddingHorizontal: SPACING.md,
    fontSize: FONT_SIZE.sm,
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.light_gray,
    ...boxShadow,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: SPACING.sm,
  },
  googleButtonText: {
    color: COLORS.black,
    fontSize: FONT_SIZE.md,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  signupText: {
    color: COLORS.gray,
    fontSize: FONT_SIZE.sm,
  },
  signupLink: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    fontWeight: 'bold',
    marginLeft: SPACING.xs,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.light_gray,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.light_gray,
    marginBottom: SPACING.md,
  },
  passwordInput: {
    flex: 1,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
  },
  eyeIcon: {
    padding: SPACING.sm,
  },
  errorContainer: {
    backgroundColor: '#FFDDDD',
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#FF6666',
  },
  errorText: {
    color: '#CC0000',
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
  },
});
