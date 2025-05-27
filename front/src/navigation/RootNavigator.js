import React, { useContext } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthContext } from "../context/AuthContext";
import { ROUTES, STACKS } from "./navigationConstants";

// Import screens
import StartScreen from "../screens/StartScreen";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import ResetPasswordSuccessScreen from "../screens/ResetPasswordSuccessScreen";
import MapScreen from "../screens/MapScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";
import HistoricalPlacesScreen from "../screens/HistoricalPlacesScreen";
import AcoteScreen from "../screens/AcoteScreen";
import ReservationScreen from "../screens/ReservationScreen";
import ConfidentialiteScreen from "../screens/ConfidentialiteScreen";
import PlaceDetailsScreen from "../screens/PlaceDetailsScreen";
import PlaceReviewsScreen from "../screens/PlaceReviewsScreen";
import OTPScreen from "../screens/OTPScreen";
import EventsScreen from "../screens/EventsScreen";
import ConversationScreen from "../screens/ConversationScreen";

// Admin screens
import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";
import UserManagementScreen from "../screens/admin/UserManagementScreen";
import LocationManagementScreen from "../screens/admin/LocationManagementScreen";
import EventManagementScreen from "../screens/admin/EventManagementScreen";
import EventManagementScreenprovider from "../screens/provider/EventManagementScreen";
import ReviewModerationScreen from "../screens/admin/ReviewModerationScreen";
import GlobalSupervisionScreen from "../screens/admin/GlobalSupervisionScreen";

// Provider screens
import ProviderDashboardScreen from "../screens/provider/ProviderDashboardScreen";
import AccountManagementScreen from "../screens/provider/AccountManagementScreen";
import ReservationManagementScreen from "../screens/provider/ReservationManagementScreen";
import ReviewManagementScreen from "../screens/provider/ReviewManagementScreen";
import PromotionManagementScreen from "../screens/provider/PromotionManagementScreen";
import AddPlaceScreen from "../screens/provider/AddPlaceScreen";
import MyPlacesScreen from "../screens/provider/MyPlacesScreen";
import EditPlaceScreen from "../screens/provider/EditPlaceScreen";
import ConversationsListScreen from "../screens/ConversationsListScreen";

const Stack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();

const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <ActivityIndicator size="large" color="#0000ff" />
    <Text style={{ marginTop: 10 }}>Loading...</Text>
  </View>
);

// Auth stack - only authentication screens
const AuthStack = () => {
  return (
    <Stack.Navigator
      initialRouteName={ROUTES.START}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name={ROUTES.START} component={StartScreen} />
      <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
      <Stack.Screen name={ROUTES.SIGNUP} component={SignupScreen} />
      <Stack.Screen
        name={ROUTES.OTP}
        component={OTPScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name={ROUTES.RESET_PASSWORD_SUCCESS}
        component={ResetPasswordSuccessScreen}
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
};

// User stack - standard user screens
const UserStack = () => {
  return (
    <Stack.Navigator
      initialRouteName={ROUTES.HOME}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name={ROUTES.HOME} component={MapScreen} />
      <Stack.Screen name={ROUTES.PROFILE} component={ProfileScreen} />
      <Stack.Screen name={ROUTES.SETTINGS} component={SettingsScreen} />
      <Stack.Screen name={ROUTES.EVENTS} component={EventsScreen} />
      <Stack.Screen name={ROUTES.ACOTE} component={AcoteScreen} />
      <Stack.Screen name={ROUTES.RESERVATION} component={ReservationScreen} />
      <Stack.Screen
        name={ROUTES.CONFIDENTIALITE}
        component={ConfidentialiteScreen}
      />
      <Stack.Screen
        name={ROUTES.PLACE_DETAILS}
        component={PlaceDetailsScreen}
      />
      <Stack.Screen
        name={ROUTES.PLACE_REVIEWS}
        component={PlaceReviewsScreen}
      />
      <Stack.Screen name={ROUTES.CONVERSATION} component={ConversationScreen} />
    </Stack.Navigator>
  );
};

// Admin stack - admin-specific screens
const AdminStack = () => {
  return (
    <Stack.Navigator
      initialRouteName={ROUTES.ADMIN_DASHBOARD}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name={ROUTES.ADMIN_DASHBOARD}
        component={AdminDashboardScreen}
      />
      <Stack.Screen
        name={ROUTES.USER_MANAGEMENT}
        component={UserManagementScreen}
      />
      <Stack.Screen
        name={ROUTES.LOCATION_MANAGEMENT}
        component={LocationManagementScreen}
      />
      <Stack.Screen
        name={ROUTES.EVENT_MANAGEMENT}
        component={EventManagementScreen}
      />
      <Stack.Screen
        name={ROUTES.REVIEW_MODERATION}
        component={ReviewModerationScreen}
      />
      <Stack.Screen
        name={ROUTES.GLOBAL_SUPERVISION}
        component={GlobalSupervisionScreen}
      />
      <Stack.Screen name={ROUTES.HOME} component={MapScreen} />
      <Stack.Screen
        name={ROUTES.CONFIDENTIALITE}
        component={ConfidentialiteScreen}
      />
      <Stack.Screen
        name={ROUTES.PLACE_DETAILS}
        component={PlaceDetailsScreen}
      />
      <Stack.Screen name={ROUTES.CONVERSATION} component={ConversationScreen} />
    </Stack.Navigator>
  );
};

// Provider stack - provider-specific screens
const ProviderStack = () => {
  return (
    <Stack.Navigator
      initialRouteName={ROUTES.PROVIDER_DASHBOARD}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name={ROUTES.PROVIDER_DASHBOARD}
        component={ProviderDashboardScreen}
      />
      <Stack.Screen
        name={ROUTES.ACCOUNT_MANAGEMENT}
        component={AccountManagementScreen}
      />
      <Stack.Screen
        name={ROUTES.RESERVATION_MANAGEMENT}
        component={ReservationManagementScreen}
      />
      <Stack.Screen
        name={ROUTES.REVIEW_MANAGEMENT}
        component={ReviewManagementScreen}
      />
      <Stack.Screen
        name={ROUTES.PROMOTION_MANAGEMENT}
        component={PromotionManagementScreen}
      />
      <Stack.Screen name={ROUTES.ADD_PLACE} component={AddPlaceScreen} />
      <Stack.Screen name={ROUTES.MY_PLACES} component={MyPlacesScreen} />
      <Stack.Screen name={ROUTES.EDIT_PLACE} component={EditPlaceScreen} />
      <Stack.Screen name={ROUTES.HOME} component={MapScreen} />
      <Stack.Screen
        name={ROUTES.CONFIDENTIALITE}
        component={ConfidentialiteScreen}
      />
      <Stack.Screen
        name={ROUTES.PLACE_DETAILS}
        component={PlaceDetailsScreen}
      />
      <Stack.Screen name={ROUTES.CONVERSATION} component={ConversationScreen} />
      <Stack.Screen
        name={ROUTES.EVENT_MANAGEMENT_PROVIDER}
        component={EventManagementScreenprovider}
      />
      <Stack.Screen
        name={ROUTES.CONVERSATION_LIST}
        component={ConversationsListScreen}
      />
    </Stack.Navigator>
  );
};

// Main RootNavigator - Decide which stack to show based on authentication status
const RootNavigator = () => {
  const authContext = useContext(AuthContext) || {
    loading: true,
    isAuthenticated: false,
    user: null,
  };
  const { loading, isAuthenticated, user } = authContext;

  if (loading) {
    return <LoadingScreen />;
  }

  // Determine which initial stack to show based on authentication status
  let initialRouteName = STACKS.AUTH;
  if (isAuthenticated) {
    if (user && user.role === "admin") {
      initialRouteName = STACKS.ADMIN;
    } else if (
      user &&
      (user.role === "provider" || user.role === "prestataire")
    ) {
      initialRouteName = STACKS.PROVIDER;
    } else {
      initialRouteName = STACKS.USER;
    }
  }

  return (
    <RootStack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false }}
    >
      <RootStack.Screen
        name={STACKS.AUTH}
        component={AuthStack}
        options={{ gestureEnabled: false }}
      />
      <RootStack.Screen
        name={STACKS.USER}
        component={UserStack}
        options={{ gestureEnabled: false }}
      />
      <RootStack.Screen
        name={STACKS.ADMIN}
        component={AdminStack}
        options={{ gestureEnabled: false }}
      />
      <RootStack.Screen
        name={STACKS.PROVIDER}
        component={ProviderStack}
        options={{ gestureEnabled: false }}
      />
    </RootStack.Navigator>
  );
};

export default RootNavigator;
