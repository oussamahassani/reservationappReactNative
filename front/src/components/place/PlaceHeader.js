
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import * as Icons from 'lucide-react-native';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '../../theme/typography';

const PlaceHeader = ({ place, navigation, onBack, navigateToReviews }) => {
  const placeCoverImage = place.images && place.images.length > 0 
    ? { uri: place.images[0] } 
    : require('../../../assets/icon.png');

  return (
    <View style={styles.imageContainer}>
      <Image 
        source={placeCoverImage} 
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.overlay} />
      <TouchableOpacity 
        style={styles.backButton}
        onPress={onBack}
      >
        <Icons.ArrowLeft size={24} color={COLORS.white} />
      </TouchableOpacity>

      <View style={styles.headerContent}>
        <Text style={styles.placeName}>{place.name}</Text>
        
        <View style={styles.ratingContainer}>
          <Icons.Star size={16} color={COLORS.highlight} fill={COLORS.highlight} />
          <Text style={styles.ratingText}>
            {parseFloat(place.average_rating || 0).toFixed(1)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    height: 250,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.light_gray,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  backButton: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.lg,
    right: SPACING.lg,
  },
  placeName: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  ratingText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
    marginLeft: 4,
  },
});

export default PlaceHeader;
