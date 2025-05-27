
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform, StatusBar } from 'react-native';
import { Menu, Search } from 'lucide-react-native';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';
import { FONT_SIZE } from '../../theme/typography';

const MapHeader = ({ onMenuPress }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.menuIcon} onPress={onMenuPress}>
        <Menu size={24} color={COLORS.white} />
      </TouchableOpacity>
      
      <Text style={styles.title}>Carte</Text>
      
      <TouchableOpacity style={styles.searchButton}>
        <Search size={24} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || SPACING.lg : SPACING.md,
    paddingBottom: SPACING.md,
  },
  menuIcon: {
    padding: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  searchButton: {
    padding: SPACING.xs,
  },
});

export default MapHeader;
