import React, { useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  Alert,
} from "react-native";
import {
  User,
  CalendarCheck,
  MessageSquare,
  Star,
  LogOut,
  MapPin,
  Map,
  Sparkles,
} from "lucide-react-native";
import { COLORS } from "../../theme/colors";
import { SPACING } from "../../theme/spacing";
import { FONT_SIZE } from "../../theme/typography";
import * as Animatable from "react-native-animatable";
import { AuthContext } from "../../context/AuthContext";
import { useClerkIntegration } from "../../utils/clerkAuth";
import { CommonActions } from "@react-navigation/native";
import { STACKS } from "../../navigation/navigationConstants";

const ProviderDashboardScreen = ({ navigation }) => {
  const { logout } = useContext(AuthContext);
  const { logoutFromClerk } = useClerkIntegration();

  const menuItems = [
    {
      title: "Gestion du compte",
      icon: <User size={24} color={COLORS.white} />,
      background: COLORS.primary,
      onPress: () => navigation.navigate("AccountManagement"),
    },
    {
      title: "Gestion des réservations",
      icon: <CalendarCheck size={24} color={COLORS.white} />,
      background: COLORS.secondary,
      onPress: () => navigation.navigate("ReservationManagement"),
    },
    {
      title: "Gestion des avis",
      icon: <MessageSquare size={24} color={COLORS.white} />,
      background: COLORS.tertiary,
      onPress: () => navigation.navigate("ReviewManagement"),
    },
    {
      title: "Gestion des promotions",
      icon: <Star size={24} color={COLORS.white} />,
      background: COLORS.secondary_light,
      onPress: () => navigation.navigate("PromotionManagement"),
    },
    {
      title: "Mes Événements ",
      icon: <Sparkles size={24} color={COLORS.white} />,
      background: COLORS.success,
      onPress: () => navigation.navigate("EventManagementprovider"),
    },
    {
      title: "Mes lieux",
      icon: <Map size={24} color={COLORS.white} />,
      background: COLORS.primary_dark,
      onPress: () => navigation.navigate("MyPlaces"),
    },
  ];

  const handleLogout = async () => {
    try {
      await logoutFromClerk();

      // Navigate to the auth stack after logout
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: STACKS.AUTH }],
        })
      );
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert(
        "Logout Error",
        "An error occurred during logout. Please try again."
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animatable.View
        animation="fadeInDown"
        duration={1000}
        style={styles.header}
      >
        <Text style={styles.title}>Tableau de bord</Text>
        <Text style={styles.subtitle}>Gérez votre service JenCity</Text>
      </Animatable.View>

      <ScrollView style={styles.content}>
        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => (
            <Animatable.View
              key={index}
              animation="fadeInUp"
              delay={300 + index * 100}
              style={styles.menuItemContainer}
            >
              <TouchableOpacity
                style={[styles.menuItem, { backgroundColor: item.background }]}
                onPress={item.onPress}
              >
                <View style={styles.iconContainer}>{item.icon}</View>
                <Text style={styles.menuItemText}>{item.title}</Text>
              </TouchableOpacity>
            </Animatable.View>
          ))}
        </View>

        <Animatable.View animation="fadeInUp" delay={700}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={24} color={COLORS.error} />
            <Text style={styles.logoutText}>Se déconnecter</Text>
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
  header: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    paddingTop: Platform.OS === "android" ? SPACING.xl * 2 : SPACING.xl,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
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
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: SPACING.lg,
  },
  menuItemContainer: {
    width: "48%",
    marginBottom: SPACING.md,
  },
  menuItem: {
    borderRadius: 12,
    padding: SPACING.lg,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  menuItemText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: FONT_SIZE.md,
    textAlign: "center",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 68, 68, 0.1)",
    padding: SPACING.md,
    borderRadius: 12,
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  logoutText: {
    color: COLORS.error,
    fontWeight: "bold",
    marginLeft: SPACING.sm,
  },
});

export default ProviderDashboardScreen;
