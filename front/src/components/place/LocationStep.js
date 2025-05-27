
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Platform 
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';
import { FONT_SIZE } from '../../theme/typography';
import { useLocationPermission } from '../../hooks/useLocationPermission';
import MapView, { Marker } from 'react-native-maps';

const LocationStep = ({ formData, setFormData }) => {
  const [mapRegion, setMapRegion] = useState(null);
  const { userLocation } = useLocationPermission();

  // Initialize from existing formData or user location
  useEffect(() => {
    // Case 1: Use existing form data if available
    if (formData.location?.latitude && formData.location?.longitude) {
      const lat = parseFloat(formData.location.latitude);
      const lng = parseFloat(formData.location.longitude);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        setMapRegion({
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        return;
      }
    }
    
    // Case 2: Fall back to user location
    if (userLocation?.latitude && userLocation?.longitude) {
      setMapRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      
      // Update form data with user location if no location is set
      if (!formData.location?.latitude || !formData.location?.longitude) {
        setFormData({
          ...formData,
          location: {
            ...formData.location,
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          }
        });
      }
    }
  }, [userLocation, formData.location]);

  // Update form data when location fields change
  const handleLocationChange = (field, value) => {
    setFormData({
      ...formData,
      location: {
        ...formData.location || {},
        [field]: value
      }
    });
  };

  // Handle map press to set marker
  const handleMapPress = (event) => {
    const { coordinate } = event.nativeEvent;
    
    // Update map region
    setMapRegion({
      ...mapRegion,
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    });
    
    // Update form data
    handleLocationChange('latitude', coordinate.latitude);
    handleLocationChange('longitude', coordinate.longitude);
  };

  // Get marker coordinate safely
  const getMarkerCoordinate = () => {
    if (!formData.location) return null;
    
    const lat = parseFloat(formData.location.latitude);
    const lng = parseFloat(formData.location.longitude);
    
    if (isNaN(lat) || isNaN(lng)) return null;
    
    return {
      latitude: lat,
      longitude: lng
    };
  };

  // Handle marker drag end
  const handleMarkerDragEnd = (e) => {
    const { coordinate } = e.nativeEvent;
    handleLocationChange('latitude', coordinate.latitude);
    handleLocationChange('longitude', coordinate.longitude);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.stepTitle}>Emplacement</Text>
      
      {mapRegion && (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={mapRegion}
            onPress={handleMapPress}
            provider={Platform.OS === 'android' ? 'google' : null}
          >
            {getMarkerCoordinate() && (
              <Marker
                coordinate={getMarkerCoordinate()}
                draggable
                onDragEnd={handleMarkerDragEnd}
              />
            )}
          </MapView>
          <Text style={styles.mapHint}>Appuyez sur la carte pour placer le marqueur ou faites-le glisser</Text>
        </View>
      )}

      <View style={styles.coordinatesContainer}>
        <View style={styles.coordinateInput}>
          <Text style={styles.label}>Latitude</Text>
          <TextInput
            style={styles.input}
            placeholder="Latitude"
            keyboardType="numeric"
            value={formData.location?.latitude?.toString()}
            onChangeText={(text) => handleLocationChange('latitude', parseFloat(text) || 0)}
          />
        </View>

        <View style={styles.coordinateInput}>
          <Text style={styles.label}>Longitude</Text>
          <TextInput
            style={styles.input}
            placeholder="Longitude"
            keyboardType="numeric"
            value={formData.location?.longitude?.toString()}
            onChangeText={(text) => handleLocationChange('longitude', parseFloat(text) || 0)}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Adresse</Text>
        <TextInput
          style={styles.input}
          placeholder="123 Rue principale"
          value={formData.location?.address}
          onChangeText={(text) => handleLocationChange('address', text)}
        />
      </View>

      <View style={styles.addressContainer}>
        <View style={styles.addressHalf}>
          <Text style={styles.label}>Ville</Text>
          <TextInput
            style={styles.input}
            placeholder="Ville"
            value={formData.location?.city}
            onChangeText={(text) => handleLocationChange('city', text)}
          />
        </View>

        <View style={styles.addressHalf}>
          <Text style={styles.label}>Région</Text>
          <TextInput
            style={styles.input}
            placeholder="Région"
            value={formData.location?.region}
            onChangeText={(text) => handleLocationChange('region', text)}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  stepTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  mapContainer: {
    height: 200,
    marginBottom: SPACING.md,
    borderRadius: 8,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  map: {
    flex: 1,
  },
  mapHint: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: COLORS.white,
    padding: SPACING.xs,
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
  },
  coordinatesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  coordinateInput: {
    width: '48%',
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.light_gray,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
  },
  addressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addressHalf: {
    width: '48%',
  },
});

export default LocationStep;
