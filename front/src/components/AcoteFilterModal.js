
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../theme/colors';
import { SPACING } from '../theme/spacing';
import { FONT_SIZE } from '../theme/typography';

const AcoteFilterModal = ({ visible, onClose, maxDistance, setMaxDistance }) => {
  const { t } = useTranslation();
  const [distanceInput, setDistanceInput] = useState(maxDistance.toString());

  const handleDistanceChange = (text) => {
    // Only allow numbers
    const numericValue = text.replace(/[^0-9]/g, '');
    setDistanceInput(numericValue);
  };

  const applyFilters = () => {
    const numValue = parseInt(distanceInput, 10) || 50;
    setMaxDistance(numValue);
    onClose();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('acote.filter')}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={24} color={COLORS.gray} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>{t('acote.distance')}</Text>
        <TextInput
          style={styles.input}
          value={distanceInput}
          onChangeText={handleDistanceChange}
          keyboardType="numeric"
          placeholder="50"
          placeholderTextColor={COLORS.gray}
        />
        <Text style={styles.helperText}>{t('map.kilometers')}</Text>
      </View>

      <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
        <Text style={styles.applyButtonText}>{t('events.apply')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: SPACING.lg,
    width: '90%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  content: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.gray,
    marginBottom: SPACING.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.light_gray,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.md,
    marginBottom: SPACING.xs,
  },
  helperText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray,
    marginBottom: SPACING.md,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 10,
    alignItems: 'center',
  },
  applyButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
});

export default AcoteFilterModal;
