import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { COLORS } from "../theme/colors";
import { SPACING } from "../theme/spacing";
import { FONT_SIZE } from "../theme/typography";
import { boxShadow } from "../theme/mixins";
import { useAuth } from "../context/AuthContext";
import * as Animatable from "react-native-animatable";
import CountryCodeSelector from "../components/CountryCodeSelector";
import { Eye, EyeOff } from "lucide-react-native";
import { useOAuth } from "@clerk/clerk-expo";
import { useClerkIntegration } from "../utils/clerkAuth";
import { ROUTES } from "../navigation/navigationConstants";
import SuccessModal from "../../common/SuccessModal";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const PASSWORD_STRENGTH = {
  WEAK: 0,
  MEDIUM: 1,
  STRONG: 2,
};

const countries = [
  { code: "+216", name: "Tunisia", flag: "🇹🇳" },
  { code: "+1", name: "United States", flag: "🇺🇸" },
  { code: "+1", name: "Canada", flag: "🇨🇦" },
  { code: "+33", name: "France", flag: "🇫🇷" },
  { code: "+49", name: "Germany", flag: "🇩🇪" },
  { code: "+39", name: "Italy", flag: "🇮🇹" },
  { code: "+41", name: "Switzerland", flag: "🇨🇭" },
];

export default function SignupScreen({ navigation }) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState({
    code: "+216",
    name: "Tunisia",
    flag: "🇹🇳",
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { signup } = useAuth();
  const { isClerkAuthenticated } = useClerkIntegration();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const [passwordStrength, setPasswordStrength] = useState(
    PASSWORD_STRENGTH.WEAK
  );

  useEffect(() => {
    if (isClerkAuthenticated) {
      navigation.navigate(ROUTES.HOME);
    }
  }, [isClerkAuthenticated, navigation]);
  useEffect(() => {
    if (!password) {
      setPasswordStrength(PASSWORD_STRENGTH.WEAK);
      return;
    }

    const hasLength = password.length >= 8;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const strength = [
      hasLength,
      hasLower,
      hasUpper,
      hasNumber,
      hasSpecial,
    ].filter(Boolean).length;

    if (strength <= 2) {
      setPasswordStrength(PASSWORD_STRENGTH.WEAK);
    } else if (strength <= 4) {
      setPasswordStrength(PASSWORD_STRENGTH.MEDIUM);
    } else {
      setPasswordStrength(PASSWORD_STRENGTH.STRONG);
    }
  }, [password]);

  const getStrengthInfo = () => {
    switch (passwordStrength) {
      case PASSWORD_STRENGTH.STRONG:
        return {
          text: t("forgotPassword.passwordStrong") || "Fort",
          color: COLORS.success,
        };
      case PASSWORD_STRENGTH.MEDIUM:
        return {
          text: t("forgotPassword.passwordMedium") || "Moyen",
          color: COLORS.warning,
        };
      default:
        return {
          text: t("forgotPassword.passwordWeak") || "Faible",
          color: COLORS.error,
        };
    }
  };

  const renderPasswordStrength = () => {
    if (!password) return null;

    const strengthInfo = getStrengthInfo();

    return (
      <View style={styles.strengthContainer}>
        <View style={styles.strengthBarContainer}>
          <View
            style={[
              styles.strengthBar,
              {
                width: `${((passwordStrength + 1) / 3) * 100}%`,
                backgroundColor: strengthInfo.color,
              },
            ]}
          />
        </View>
        <Text style={[styles.strengthText, { color: strengthInfo.color }]}>
          {strengthInfo.text}
        </Text>
      </View>
    );
  };

  const steps = [
    {
      title: t("signup.steps.personal.title") || "Informations personnelles",
      subtitle:
        t("signup.steps.personal.subtitle") ||
        "Veuillez entrer vos informations personnelles.",
      fields: (
        <>
          <TextInput
            style={styles.input}
            placeholder={t("signup.firstName") || "Prénom"}
            placeholderTextColor={COLORS.gray}
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            style={styles.input}
            placeholder={t("signup.lastName") || "Nom"}
            placeholderTextColor={COLORS.gray}
            value={lastName}
            onChangeText={setLastName}
          />
        </>
      ),
    },
    {
      title: t("signup.steps.contact.title") || "Coordonnées",
      subtitle:
        t("signup.steps.contact.subtitle") ||
        "Veuillez entrer vos coordonnées.",
      fields: (
        <>
          <TextInput
            style={styles.input}
            placeholder={t("signup.email") || "E-mail"}
            placeholderTextColor={COLORS.gray}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <View style={styles.phoneInputContainer}>
            <CountryCodeSelector
              selectedCountry={selectedCountry}
              onSelectCountry={setSelectedCountry}
              countries={countries}
            />
            <TextInput
              style={styles.phoneInput}
              placeholder={t("signup.phone") || "Téléphone"}
              placeholderTextColor={COLORS.gray}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>
        </>
      ),
    },
    {
      title: t("signup.steps.security.title") || "Sécurité",
      subtitle:
        t("signup.steps.security.subtitle") ||
        "Définissez un mot de passe sécurisé.",
      fields: (
        <>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder={t("signup.password") || "Mot de passe"}
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
                <EyeOff size={20} color={COLORS.gray} />
              ) : (
                <Eye size={20} color={COLORS.gray} />
              )}
            </TouchableOpacity>
          </View>
          {renderPasswordStrength()}
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder={t("common.confirm") || "Confirmer le mot de passe"}
              placeholderTextColor={COLORS.gray}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff size={20} color={COLORS.gray} />
              ) : (
                <Eye size={20} color={COLORS.gray} />
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.passwordRequirements}>
            {t("signup.passwordRequirements") ||
              "Le mot de passe doit contenir au moins 6 caractères, des lettres et des chiffres."}
          </Text>
        </>
      ),
    },
  ];

  const validateStep = (step) => {
    switch (step) {
      case 0:
        if (!firstName.trim() || !lastName.trim()) {
          Alert.alert(
            t("common.error") || "Erreur",
            t("signup.fillAllFields") || "Veuillez remplir tous les champs"
          );
          return false;
        }
        return true;
      case 1:
        if (!email.trim() || !phone.trim()) {
          Alert.alert(
            t("common.error") || "Erreur",
            t("signup.fillAllFields") || "Veuillez remplir tous les champs"
          );
          return false;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
          Alert.alert(
            t("common.error") || "Erreur",
            t("signup.invalidEmail") || "Veuillez saisir un email valide"
          );
          return false;
        }
        return true;
      case 2:
        if (!password.trim() || !confirmPassword.trim()) {
          Alert.alert(
            t("common.error") || "Erreur",
            t("signup.fillAllFields") || "Veuillez remplir tous les champs"
          );
          return false;
        }
        if (password.length < 6) {
          Alert.alert(
            t("common.error") || "Erreur",
            t("signup.passwordTooShort") ||
              "Le mot de passe doit contenir au moins 6 caractères"
          );
          return false;
        }
        if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
          Alert.alert(
            t("common.error") || "Erreur",
            t("signup.passwordRequirements") ||
              "Le mot de passe doit contenir au moins une lettre et un chiffre"
          );
          return false;
        }
        if (password !== confirmPassword) {
          Alert.alert(
            t("common.error") || "Erreur",
            t("signup.passwordMismatch") ||
              "Les mots de passe ne correspondent pas"
          );
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSignup();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigation.navigate(ROUTES.LOGIN);
  };

  const handleSignup = async () => {
    setIsLoading(true);
    try {
      const userData = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: `${selectedCountry.code}${phone}`,
        password: password,
        role: "user", // Setting default role to 'user'
      };

      const registeredUser = await signup(userData);
      console.log("Registered user:", registeredUser);

      setShowSuccessModal(true);
    } catch (error) {
      Alert.alert(
        t("signup.registerError") || "Erreur d'inscription",
        error.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow();

      if (createdSessionId) {
        setActive({ session: createdSessionId });
      }
    } catch (err) {
      console.error("OAuth error", err);
      Alert.alert(
        t("common.error") || "Erreur",
        t("signup.googleError") || "Problème lors de la connexion avec Google"
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Animatable.View
            animation="fadeInDown"
            duration={1000}
            style={styles.header}
          >
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>

            <View style={styles.stepIndicator}>
              {steps.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.stepDot,
                    currentStep === index && styles.activeStepDot,
                    currentStep > index && styles.completedStepDot,
                  ]}
                />
              ))}
            </View>

            <Text style={styles.title}>{steps[currentStep].title}</Text>
            <Text style={styles.subtitle}>{steps[currentStep].subtitle}</Text>
          </Animatable.View>

          <Animatable.View
            animation="fadeInUp"
            duration={1000}
            delay={300}
            style={styles.formContainer}
          >
            {steps[currentStep].fields}

            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.nextButtonText}>
                  {currentStep === steps.length - 1
                    ? t("signup.signup") || "S'inscrire"
                    : t("signup.next") || "Suivant"}
                </Text>
              )}
            </TouchableOpacity>

            {currentStep === 0 && (
              <>
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>
                    {t("signup.or") || "ou"}
                  </Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity
                  style={styles.googleButton}
                  onPress={handleGoogleSignup}
                >
                  <Image
                    source={{
                      uri: "https://developers.google.com/identity/images/g-logo.png",
                    }}
                    style={styles.googleIcon}
                  />
                  <Text style={styles.googleButtonText}>
                    {t("signup.googleSignup") || "S'inscrire avec Google"}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>
                {t("signup.haveAccount") || "Vous avez déjà un compte ?"}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginLink}>
                  {t("signup.login") || "Se connecter"}
                </Text>
              </TouchableOpacity>
            </View>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <SuccessModal
        isVisible={showSuccessModal}
        onClose={handleSuccessModalClose}
        message={
          t("signup.success") ||
          "Inscription réussie ! Vous pouvez maintenant vous connecter."
        }
      />
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
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    marginBottom: SPACING.md,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xl,
  },
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.light_gray,
    marginHorizontal: SPACING.xs,
  },
  activeStepDot: {
    backgroundColor: COLORS.white,
    width: 12,
    height: 12,
  },
  completedStepDot: {
    backgroundColor: COLORS.secondary,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    color: COLORS.white,
    fontWeight: "bold",
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
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: COLORS.light_gray,
    borderRadius: 10,
    padding: SPACING.md,
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZE.md,
    borderWidth: 1,
    borderColor: COLORS.light_gray,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
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
  passwordRequirements: {
    color: COLORS.gray,
    fontSize: FONT_SIZE.xs,
    marginBottom: SPACING.md,
    marginTop: -SPACING.xs,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 10,
    alignItems: "center",
    marginTop: SPACING.md,
    ...boxShadow,
  },
  nextButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: "bold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
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
    flexDirection: "row",
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
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
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  loginText: {
    color: COLORS.gray,
    fontSize: FONT_SIZE.sm,
  },
  loginLink: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    fontWeight: "bold",
    marginLeft: SPACING.xs,
  },
  strengthContainer: {
    marginBottom: SPACING.md,
  },
  strengthBarContainer: {
    height: 6,
    backgroundColor: COLORS.light_gray,
    borderRadius: 3,
    marginBottom: SPACING.xs,
    overflow: "hidden",
  },
  strengthBar: {
    height: "100%",
    borderRadius: 3,
  },
  strengthText: {
    fontSize: FONT_SIZE.xs,
    textAlign: "right",
  },
});
