import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../theme/colors';
import { SPACING } from '../theme/spacing';
import { FONT_SIZE } from '../theme/typography';
import { ROUTES, STACKS } from '../navigation/navigationConstants';
import { Home, Map, MapPin, Settings } from 'lucide-react-native';

export const FooterNav = ({ navigation, activeScreen }) => {
  // Navigation now needs to account for nested navigators
  const navigateTo = (screen) => {
    const currentRouteName = navigation.getState().routes[navigation.getState().index].name;
    
    // Check if we're in the USER stack or need to navigate to it
    if (currentRouteName === STACKS.USER) {
      navigation.navigate(screen);
    } else {
      navigation.navigate(STACKS.USER, { screen });
    }
  };

  const isActive = (screen) => {
    return activeScreen === screen;
  };

  return (
    <View style={styles.footer}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigateTo(ROUTES.HOME)}
        activeOpacity={0.7}
      >
        <Home
          size={24}
          color={isActive(ROUTES.HOME) ? COLORS.primary : COLORS.gray}
          fill={isActive(ROUTES.HOME) ? COLORS.primary : 'transparent'}
        />
        <Text
          style={[
            styles.navLabel,
            isActive(ROUTES.HOME) && styles.activeNavLabel
          ]}
        >
          Accueil
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigateTo(ROUTES.EVENTS)}
        activeOpacity={0.7}
      >
        <Map
          size={24}
          color={isActive(ROUTES.EVENTS) ? COLORS.primary : COLORS.gray}
          fill={isActive(ROUTES.EVENTS) ? COLORS.primary : 'transparent'}
        />
        <Text
          style={[
            styles.navLabel,
            isActive(ROUTES.EVENTS) && styles.activeNavLabel
          ]}
        >
          Événements
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigateTo(ROUTES.ACOTE)}
        activeOpacity={0.7}
      >
        <MapPin
          size={24}
          color={isActive(ROUTES.ACOTE) ? COLORS.primary : COLORS.gray}
          fill={isActive(ROUTES.ACOTE) ? COLORS.primary : 'transparent'}
        />
        <Text
          style={[
            styles.navLabel,
            isActive(ROUTES.ACOTE) && styles.activeNavLabel
          ]}
        >
          À côté
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigateTo(ROUTES.SETTINGS)}
        activeOpacity={0.7}
      >
        <Settings
          size={24}
          color={isActive(ROUTES.SETTINGS) ? COLORS.primary : COLORS.gray}
          fill={isActive(ROUTES.SETTINGS) ? COLORS.primary : 'transparent'}
        />
        <Text
          style={[
            styles.navLabel,
            isActive(ROUTES.SETTINGS) && styles.activeNavLabel
          ]}
        >
          Paramètres
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.light_gray,
    paddingVertical: SPACING.sm,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray,
    marginTop: SPACING.xxs,
  },
  activeNavLabel: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});
