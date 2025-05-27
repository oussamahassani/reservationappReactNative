
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Map, Utensils, Building, Stethoscope, LayoutGrid } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { SPACING } from '../theme/spacing';
import { FONT_SIZE, FONT_WEIGHT, getFontWeight } from '../theme/typography';

const getCategoryIcon = (categoryId, isActive) => {
  const color = isActive ? COLORS.white : COLORS.primary;
  const size = 16;
  
  switch (categoryId) {
    case 'all':
      return <LayoutGrid size={size} color={color} />;
    case 'monuments':
      return <Map size={size} color={color} />;
    case 'restaurants':
      return <Utensils size={size} color={color} />;
    case 'hotels':
      return <Building size={size} color={color} />;
    case 'pharmacies':
      return <Stethoscope size={size} color={color} />;
    default:
      return <LayoutGrid size={size} color={color} />;
  }
};

const categories = [
  { id: 'all', name: 'Tous' },
  { id: 'monuments', name: 'Monuments' },
  { id: 'restaurants', name: 'Restaurants' },
  { id: 'hotels', name: 'Hôtels' },
  { id: 'pharmacies', name: 'Pharmacies' },
];

const CategoryTabs = ({ activeCategory, onCategoryPress }) => {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((category) => {
        const isActive = activeCategory === category.id;
        return (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryTab,
              isActive && styles.activeTab
            ]}
            onPress={() => onCategoryPress(category.id)}
          >
            {getCategoryIcon(category.id, isActive)}
            <Text 
              style={[
                styles.categoryText,
                isActive && styles.activeText
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.sm,
    borderRadius: 30,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  activeText: {
    color: COLORS.white,
    fontWeight: FONT_WEIGHT.bold,
  },
});

export default CategoryTabs;
