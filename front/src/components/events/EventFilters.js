
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';
import { FONT_SIZE } from '../../theme/typography';

const EventFilters = ({ 
  selectedRegion,
  setSelectedRegion, 
  priceRange, 
  setPriceRange,
  regions,
  onClose 
}) => {
  const [priceInput, setPriceInput] = useState(priceRange.toString());

  const handlePriceChange = (text) => {
    // Only allow numbers
    const numericValue = text.replace(/[^0-9]/g, '');
    setPriceInput(numericValue);
    
    // Convert to number and update the price range
    const numValue = parseInt(numericValue, 10) || 0;
    setPriceRange(numValue);
  };

  const handleClearRegion = () => {
    setSelectedRegion('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Filtres</Text>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Région</Text>
          {selectedRegion ? (
            <TouchableOpacity onPress={handleClearRegion}>
              <Text style={styles.clearLink}>Effacer</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.regionsScroll}>
          {regions.map((region) => (
            <TouchableOpacity
              key={region}
              style={[
                styles.regionChip,
                selectedRegion === region && styles.selectedRegionChip
              ]}
              onPress={() => setSelectedRegion(region)}
            >
              <Text style={[
                styles.regionText,
                selectedRegion === region && styles.selectedRegionText
              ]}>
                {region}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Prix maximum (TND)</Text>
        <TextInput
          style={styles.priceInput}
          value={priceInput}
          onChangeText={handlePriceChange}
          keyboardType="numeric"
          placeholder="Entrez le prix maximum"
        />
        <Text style={styles.priceText}>{priceRange} TND</Text>
      </View>

      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Appliquer les filtres</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: 15,
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    color: COLORS.primary_dark,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.gray,
  },
  clearLink: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  regionsScroll: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  regionChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.light_gray,
    borderRadius: 20,
    marginRight: SPACING.sm,
  },
  selectedRegionChip: {
    backgroundColor: COLORS.primary,
  },
  regionText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray,
  },
  selectedRegionText: {
    color: COLORS.white,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: COLORS.light_gray,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.md,
    marginBottom: SPACING.sm,
  },
  priceText: {
    textAlign: 'center',
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
});

export default EventFilters;
