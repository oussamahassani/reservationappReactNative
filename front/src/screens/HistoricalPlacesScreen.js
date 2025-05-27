
import React, { useState, useMemo, useEffect } from 'react';
import { 
  View, StyleSheet, Platform, Text, ScrollView, 
  Image, TouchableOpacity, TextInput, ActivityIndicator 
} from 'react-native';
import { FooterNav } from '../components/FooterNav';
import { COLORS } from '../theme/colors';
import { SPACING } from '../theme/spacing';
import { FONT_SIZE } from '../theme/typography';
import { useTranslation } from 'react-i18next';
import { Search, Landmark, Bed, Utensils } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocationPermission } from '../hooks/useLocationPermission';
import { calculateDistance } from '../../common/calculateDistance';
import TextToSpeech from '../components/TextToSpeech';
import { getApiUrlSync, ENDPOINTS } from '../config/apiConfig';
import PlaceItem from '../components/PlaceItem';

const categories = [
  { id: 1, name: 'museums', icon: Landmark, color: '#FFB347' },
  { id: 2, name: 'hotels', icon: Bed, color: '#98B4D4' },
  { id: 3, name: 'restaurants', icon: Utensils, color: '#FF6B6B' },
];

const HistoricalPlacesScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('museums'); // Default to museums
  const { userLocation, locationError } = useLocationPermission();
  const [placesWithDistances, setPlacesWithDistances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch places from API
  const fetchPlaces = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const url = getApiUrlSync(ENDPOINTS.PLACES);
      console.log('Fetching places from:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return result.data || [];
    } catch (e) {
      console.error('Error fetching places:', e);
      setError(e.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Load places when component mounts
    const loadPlaces = async () => {
      const allPlaces = await fetchPlaces();
      
      // Filter places by type "museums"
      const museumPlaces = allPlaces.filter(place => 
        place.type?.toLowerCase() === 'museums' || 
        place.category?.toLowerCase() === 'museums'
      );
      
      if (userLocation) {
        // Calculate distances if user location is available
        const placesWithCalculatedDistances = museumPlaces.map(place => {
          if (place.coordinates && place.coordinates.latitude && place.coordinates.longitude) {
            const distance = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              place.coordinates.latitude,
              place.coordinates.longitude
            );
            
            // Log the distance calculation for debugging
            console.log(`Calculated distance for ${place.name}:`, {
              userLat: userLocation.latitude,
              userLng: userLocation.longitude,
              placeLat: place.coordinates.latitude,
              placeLng: place.coordinates.longitude,
              distance: distance
            });
            
            return {
              ...place,
              distance: distance !== null ? distance : null
            };
          }
          return {
            ...place,
            distance: null
          };
        });
        
        // Sort places by distance
        placesWithCalculatedDistances.sort((a, b) => {
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });
        
        setPlacesWithDistances(placesWithCalculatedDistances);
      } else {
        setPlacesWithDistances(museumPlaces);
      }
    };
    
    loadPlaces();
  }, [userLocation]);

  // Re-calculate distances when user location changes
  useEffect(() => {
    if (userLocation && placesWithDistances.length > 0) {
      console.log('Recalculating distances with user location:', userLocation);
      
      const updatedPlaces = placesWithDistances.map(place => {
        if (place.coordinates && place.coordinates.latitude && place.coordinates.longitude) {
          const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            place.coordinates.latitude,
            place.coordinates.longitude
          );
          
          // Additional logging for verification
          console.log(`Updated distance for ${place.name}:`, {
            userLat: userLocation.latitude,
            userLng: userLocation.longitude,
            placeLat: place.coordinates.latitude,
            placeLng: place.coordinates.longitude,
            distance: distance
          });
          
          return {
            ...place,
            distance: distance !== null ? distance : null
          };
        }
        return place;
      });
      
      updatedPlaces.sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
      
      setPlacesWithDistances(updatedPlaces);
    }
  }, [userLocation]);

  const filteredPlaces = useMemo(() => {
    return placesWithDistances.filter(place => {
      const matchesSearch = !searchQuery || 
        place.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = !selectedCategory || 
        place.type?.toLowerCase() === selectedCategory.toLowerCase() ||
        place.category?.toLowerCase() === selectedCategory.toLowerCase();
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, placesWithDistances]);

  // ... keep existing code (the rest of the component and render method)

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('historicalPlaces.title')}</Text>
        <Text style={styles.subtitle}>{t('historicalPlaces.subtitle')}</Text>

        <View style={styles.searchContainer}>
          <Search size={20} color={COLORS.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('historicalPlaces.searchPlaceholder')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.gray}
          />
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {categories.map(category => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.name;
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  { backgroundColor: category.color, opacity: isSelected ? 0.6 : 1 }
                ]}
                onPress={() => setSelectedCategory(isSelected ? null : category.name)}
              >
                <Icon size={24} color={COLORS.white} />
                <Text style={styles.categoryText}>
                  {t(`historicalPlaces.categories.${category.name}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>{t('common.loading')}</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{t('common.error')}: {error}</Text>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={() => fetchPlaces()}
            >
              <Text style={styles.retryText}>{t('common.retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : filteredPlaces.length > 0 ? (
          filteredPlaces.map(place => (
            <PlaceItem 
              key={place.id} 
              place={place} 
              distance={place.distance}
              onPress={() => navigation.navigate('PlaceDetails', { placeId: place.id })}
            />
          ))
        ) : (
          <Text style={styles.noResultsText}>{t('historicalPlaces.noResults')}</Text>
        )}
      </ScrollView>

      <FooterNav navigation={navigation} activeScreen="HistoricalPlaces" />
    </SafeAreaView>
  );
};

// ... keep existing code (styles)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    paddingTop: Platform.OS === 'android' ? SPACING.xl : SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.white,
    opacity: 0.8,
    marginTop: SPACING.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZE.md,
    color: COLORS.black,
  },
  categoriesContainer: {
    marginTop: SPACING.md,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: 12,
    marginRight: SPACING.sm,
    marginVertical: SPACING.sm,
  },
  categoryText: {
    color: COLORS.white,
    marginLeft: SPACING.xs,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    padding: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.gray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  retryText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  noResultsText: {
    textAlign: 'center',
    fontSize: FONT_SIZE.md,
    color: COLORS.gray,
    marginTop: SPACING.lg,
  },
});

export default HistoricalPlacesScreen;
