
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Icons from 'lucide-react-native';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '../../theme/typography';
import TextToSpeech from '../TextToSpeech';

const PlaceInfo = ({ place, onOpenMaps }) => {
  const formatOpeningHours = (openingHours) => {
    if (!openingHours) return 'Information non disponible';
    
    const days = {
      monday: 'Lundi',
      tuesday: 'Mardi',
      wednesday: 'Mercredi',
      thursday: 'Jeudi',
      friday: 'Vendredi',
      saturday: 'Samedi',
      sunday: 'Dimanche'
    };
    
    return Object.entries(openingHours)
      .map(([day, hours]) => `${days[day]}: ${hours}`)
      .join('\n');
  };

  return (
    <View style={styles.container}>
      <View style={styles.infoCard}>
        <View style={styles.infoCardHeader}>
          <Icons.MapPin size={20} color={COLORS.primary} />
          <Text style={styles.infoCardTitle}>Emplacement</Text>
        </View>
        <Text style={styles.infoCardText}>
          {place.location.address}, {place.location.city}, {place.location.region}
        </Text>
        <TouchableOpacity 
          style={styles.seeOnMapButton}
          onPress={onOpenMaps}
        >
          <Icons.Map size={16} color={COLORS.white} />
          <Text style={styles.seeOnMapText}>Voir sur la carte</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.descriptionSection}>
        <View style={styles.descriptionHeader}>
          <Text style={styles.sectionTitle}>Description</Text>
          <TextToSpeech text={place.description} autoPlay={false} />
        </View>
        <Text style={styles.descriptionText}>{place.description}</Text>
      </View>

      {place.openingHours && (
        <View style={styles.infoCard}>
          <View style={styles.infoCardHeader}>
            <Icons.Clock size={20} color={COLORS.primary} />
            <Text style={styles.infoCardTitle}>Heures d'ouverture</Text>
          </View>
          <Text style={styles.scheduleText}>
            {formatOpeningHours(place.openingHours)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
  },
  infoCard: {
    backgroundColor: COLORS.light_gray,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  infoCardTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.black,
    marginLeft: SPACING.sm,
  },
  infoCardText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray,
    marginBottom: SPACING.sm,
  },
  seeOnMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: SPACING.xs,
  },
  seeOnMapText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    marginLeft: 4,
  },
  descriptionSection: {
    marginBottom: SPACING.lg,
  },
  descriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.black,
  },
  descriptionText: {
    fontSize: FONT_SIZE.md,
    lineHeight: 22,
    color: COLORS.gray,
  },
  scheduleText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray,
    lineHeight: 22,
  },
});

export default PlaceInfo;
