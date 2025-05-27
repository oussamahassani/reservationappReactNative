
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { MapPin, Star } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../theme/colors';
import { SPACING } from '../theme/spacing';
import { FONT_SIZE } from '../theme/typography';

const PlaceItem = ({ place, distance, distanceLabel, onPress }) => {
  const { t } = useTranslation();
  const placeholderImage = require('../../assets/bulla-regia.png');
  
  const getImageUrl = () => {
    try {
      if (place.images) {
        const images = typeof place.images === 'string' ? JSON.parse(place.images) : place.images;
        if (images && images.length > 0) {
          // If it's a full URL return it, otherwise it's likely a filename only
          return images[0].startsWith('http') ? images[0] : placeholderImage;
        }
      }
      return placeholderImage;
    } catch (e) {
      return placeholderImage;
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <ImageBackground 
        source={getImageUrl()}
        style={styles.image}
        resizeMode="cover"
        imageStyle={styles.imageStyle}
      >
        <View style={styles.overlay}>
          <View style={styles.content}>
            <Text style={styles.name} numberOfLines={1}>{place.name}</Text>
            
            <View style={styles.detailsContainer}>
              <View style={styles.locationContainer}>
                <MapPin size={16} color={COLORS.white} />
                <Text style={styles.location} numberOfLines={1}>
                  {place.address || place.location?.address || t('map.noResultsFound')}
                </Text>
              </View>
              
              {place.average_rating && (
                <View style={styles.ratingContainer}>
                  <Star size={16} color={COLORS.white} fill={COLORS.white} />
                  <Text style={styles.rating}>{place.average_rating}</Text>
                </View>
              )}
            </View>
            
            {distanceLabel && (
              <View style={styles.distanceContainer}>
                <Text style={styles.distance}>{distanceLabel}</Text>
              </View>
            )}
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    height: 150,
    width: '100%',
  },
  imageStyle: {
    borderRadius: 12,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
    padding: SPACING.md,
    justifyContent: 'flex-end',
  },
  content: {
    justifyContent: 'flex-end',
  },
  name: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  location: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.white,
    marginLeft: SPACING.xs,
    opacity: 0.9,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rating: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.white,
    marginLeft: 2,
  },
  distanceContainer: {
    marginTop: SPACING.xs,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  distance: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.white,
    fontWeight: '600',
  },
});

export default PlaceItem;
