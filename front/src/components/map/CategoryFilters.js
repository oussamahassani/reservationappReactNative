
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';
import { FONT_SIZE } from '../../theme/typography';
import * as Animatable from 'react-native-animatable';

// Define the filter category data structure
const filterCategories = [
  { id: null, label: 'Tous', icon: '📍', color: COLORS.primary },
  { id: 'historical', label: 'Historique', icon: '🕰️', color: COLORS.secondary },
  { id: 'cafe', label: 'Cafés', icon: '☕', color: COLORS.tertiary },
  { id: 'building', label: 'Bâtiments', icon: '🏢', color: COLORS.info },
  { id: 'hotel', label: 'Hôtels', icon: '🏨', color: COLORS.warning },
  { id: 'restaurant', label: 'Restaurants', icon: '🍴', color: COLORS.accent },
  { id: 'museum', label: 'Musées', icon: '🏛️', color: COLORS.success },
  { id: 'parks', label: 'Parcs', icon: '🌴', color: COLORS.tertiary_light }
];

const CategoryFilters = ({ filterType, toggleFilter }) => {
  return (
    <View style={styles.filterContainer}>
      <Text style={styles.filterTitle}>Catégories</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filterCategories.map((category) => {
          const isSelected = filterType === category.id;
          
          return (
            <Animatable.View 
              key={category.label}
              animation="fadeIn" 
              duration={600}
            >
              <TouchableOpacity 
                style={[
                  styles.filterChip, 
                  isSelected && { 
                    backgroundColor: category.color,
                    borderColor: COLORS.white,
                  }
                ]}
                onPress={() => toggleFilter(category.id)}
              >
                <Text style={styles.iconText}>{category.icon}</Text>
                <Text style={[
                  styles.filterChipText, 
                  isSelected && { color: COLORS.white }
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            </Animatable.View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
    borderRadius: 15,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: SPACING.md,
  },
  filterTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: SPACING.md,
    marginBottom: SPACING.sm,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  filterChip: {
    flexDirection: 'row',
    backgroundColor: COLORS.light_gray,
    borderRadius: 20,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    marginRight: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray_light,
  },
  filterChipText: {
    fontSize: FONT_SIZE.sm,
    marginLeft: SPACING.xs,
    color: COLORS.black,
    fontWeight: '500',
  },
  iconText: {
    fontSize: 16,
  }
});

export default CategoryFilters;
