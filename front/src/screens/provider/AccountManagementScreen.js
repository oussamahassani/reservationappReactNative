import React, { useState, useContext, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  User,
  Mail,
  Phone,
  MapPin,
  ArrowLeft,
  MessageCircle,
} from "lucide-react-native";
import { COLORS } from "../../theme/colors";
import { SPACING } from "../../theme/spacing";
import { FONT_SIZE } from "../../theme/typography";
import * as Animatable from "react-native-animatable";
import { AuthContext } from "../../context/AuthContext";
import { ROUTES } from "../../navigation/navigationConstants";
import { boxShadow } from "../../theme/mixins";

const AccountManagementScreen = ({ navigation }) => {
  const { user, updateUserProfile, loading, error } = useContext(AuthContext);
  const [updateLoading, setUpdateLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setProfileData({
        ...profileData,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    // Prepare data for update
    const updateData = {
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      phone: profileData.phone,
      // We'll use address and other fields later if API supports them
    };

    setUpdateLoading(true);

    try {
      const success = await updateUserProfile(updateData);

      if (success) {
        Alert.alert(
          "Succès",
          "Vos informations ont été mises à jour avec succès."
        );
      } else {
        Alert.alert(
          "Erreur",
          "La mise à jour de vos informations a échoué. Veuillez réessayer."
        );
      }
    } catch (error) {
      Alert.alert(
        "Erreur",
        error.message || "Une erreur est survenue. Veuillez réessayer."
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animatable.View
        animation="fadeInDown"
        duration={1000}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft color={COLORS.white} size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Gestion du compte</Text>
        <Text style={styles.subtitle}>Modifiez vos informations</Text>
      </Animatable.View>

      <ScrollView style={styles.content}>
        <Animatable.View
          animation="fadeInUp"
          delay={300}
          style={styles.profileInfo}
        >
          <Text style={styles.username}>
            {user
              ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
              : "Utilisateur"}
          </Text>
          <Text style={styles.userRole}>
            {user?.role === "provider"
              ? "Prestataire de service"
              : "Utilisateur"}
          </Text>
        </Animatable.View>

        <Animatable.View
          animation="fadeInUp"
          delay={400}
          style={styles.formContainer}
        >
          <View style={styles.inputContainer}>
            <User size={20} color={COLORS.primary} />
            <TextInput
              style={styles.input}
              placeholder="Prénom"
              value={profileData.firstName}
              onChangeText={(text) =>
                setProfileData({ ...profileData, firstName: text })
              }
            />
          </View>

          <View style={styles.inputContainer}>
            <User size={20} color={COLORS.primary} />
            <TextInput
              style={styles.input}
              placeholder="Nom"
              value={profileData.lastName}
              onChangeText={(text) =>
                setProfileData({ ...profileData, lastName: text })
              }
            />
          </View>

          <View style={styles.inputContainer}>
            <Mail size={20} color={COLORS.primary} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              value={profileData.email}
              onChangeText={(text) =>
                setProfileData({ ...profileData, email: text })
              }
              editable={false} // Email usually shouldn't be changed directly
            />
          </View>

          <View style={styles.inputContainer}>
            <Phone size={20} color={COLORS.primary} />
            <TextInput
              style={styles.input}
              placeholder="Téléphone"
              keyboardType="phone-pad"
              value={profileData.phone}
              onChangeText={(text) =>
                setProfileData({ ...profileData, phone: text })
              }
            />
          </View>

          <View style={styles.inputContainer}>
            <MapPin size={20} color={COLORS.primary} />
            <TextInput
              style={styles.input}
              placeholder="Adresse"
              value={profileData.address}
              onChangeText={(text) =>
                setProfileData({ ...profileData, address: text })
              }
            />
          </View>
          <TouchableOpacity
            style={styles.floatingChatButton}
            onPress={() => navigation.navigate(ROUTES.CONVERSATION_LIST)}
          >
            <MessageCircle size={28} color={COLORS.white} />
          </TouchableOpacity>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={600}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={updateLoading}
          >
            {updateLoading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.saveButtonText}>
                Enregistrer les modifications
              </Text>
            )}
          </TouchableOpacity>
        </Animatable.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.gray,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    paddingTop: Platform.OS === "android" ? SPACING.xl * 2 : SPACING.xl,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: "bold",
    color: COLORS.white,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.white,
    opacity: 0.8,
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  profileInfo: {
    alignItems: "center",
    marginVertical: SPACING.lg,
  },
  username: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  userRole: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray,
  },
  formContainer: {
    marginBottom: SPACING.lg,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.light_gray,
    borderRadius: 10,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === "ios" ? SPACING.sm : 0,
  },
  input: {
    flex: 1,
    paddingVertical: SPACING.sm,
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZE.md,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: SPACING.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
    height: 50,
  },
  saveButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: FONT_SIZE.md,
  },
  floatingChatButton: {
    position: "absolute",
    bottom: -20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    ...boxShadow,
    zIndex: 999,
  },
});

export default AccountManagementScreen;
