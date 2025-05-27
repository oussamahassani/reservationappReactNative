import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
} from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import PlaceCallout from "../PlaceCallout"; // Make sure this exists and works correctly
import { COLORS } from "../../theme/colors";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { ROUTES } from "../../navigation/navigationConstants";

const MapContent = ({
  mapRef,
  initialRegion,
  userLocation,
  filteredPlaces = [],
  searchResults = [],
  onRegionChangeComplete,
  onPlacePress,
}) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [mapError, setMapError] = useState(false);
  const [displayMarkers, setDisplayMarkers] = useState([]);

  const getValidRegion = useCallback(() => {
    const defaultRegion = {
      latitude: 36.7755,
      longitude: 8.7834,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };

    if (!initialRegion || typeof initialRegion !== "object")
      return defaultRegion;

    const lat = Number(initialRegion.latitude);
    const lng = Number(initialRegion.longitude);
    const latDelta = Number(initialRegion.latitudeDelta);
    const lngDelta = Number(initialRegion.longitudeDelta);

    return !isNaN(lat) && !isNaN(lng) && !isNaN(latDelta) && !isNaN(lngDelta)
      ? {
          latitude: lat,
          longitude: lng,
          latitudeDelta: latDelta,
          longitudeDelta: lngDelta,
        }
      : defaultRegion;
  }, [initialRegion]);

  const createValidMarkers = useCallback((placesArray) => {
    if (!Array.isArray(placesArray)) return [];

    return placesArray
      .filter((place) => {
        if (!place?.location) return false;
        const lat = parseFloat(place.location.latitude);
        const lng = parseFloat(place.location.longitude);
        return !isNaN(lat) && !isNaN(lng);
      })
      .map((place, index) => {
        const lat = parseFloat(place.location.latitude);
        const lng = parseFloat(place.location.longitude);
        return {
          ...place,
          id: place.id || `place-${index}`,
          key: `marker-${place.id || index}`,
          coordinate: { latitude: lat, longitude: lng },
        };
      });
  }, []);

  useEffect(() => {
    try {
      const source = filteredPlaces;
      const markers = createValidMarkers(source);
      setDisplayMarkers(markers);
    } catch (error) {
      console.error("Marker creation failed:", error);
      setDisplayMarkers([]);
    }
  }, [filteredPlaces, searchResults, createValidMarkers]);

  useEffect(() => {
    if (!mapRef?.current || !userLocation || mapError) return;
    const lat = Number(userLocation.latitude);
    const lng = Number(userLocation.longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      mapRef.current.animateToRegion(
        {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    }
  }, [userLocation, mapError]);

  useEffect(() => {
    if (
      !mapRef?.current ||
      !Array.isArray(searchResults) ||
      searchResults.length === 0 ||
      mapError
    )
      return;

    try {
      const coords = searchResults
        .map((p) => {
          const lat = parseFloat(p.location?.latitude);
          const lng = parseFloat(p.location?.longitude);
          return !isNaN(lat) && !isNaN(lng)
            ? { latitude: lat, longitude: lng }
            : null;
        })
        .filter(Boolean);

      if (coords.length === 1) {
        mapRef.current.animateToRegion(
          {
            ...coords[0],
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          1000
        );
      } else if (coords.length > 1) {
        mapRef.current.fitToCoordinates(coords, {
          edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
          animated: true,
        });
      }
    } catch (e) {
      console.error("Failed to animate to search result:", e);
    }
  }, [searchResults, mapError]);

  const handlePlacePress = (place) => {
    if (onPlacePress && place?.id) {
      onPlacePress(place.id);
    } else {
      navigation.navigate(ROUTES.PLACE_DETAILS, { placeId: place.id });
    }
  };

  if (mapError) {
    return (
      <View style={[styles.mapWrapper, styles.errorContainer]}>
        <Text style={styles.errorText}>{t("map.loadingError")}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => setMapError(false)}
        >
          <Text style={styles.retryText}>{t("common.retry")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.mapWrapper}>
     <MapView
  ref={mapRef}
  style={styles.map}
  initialRegion={getValidRegion()}
  showsUserLocation
  showsMyLocationButton
  showsCompass
  showsScale
  toolbarEnabled={Platform.OS === "android"}
  onRegionChangeComplete={onRegionChangeComplete}
  loadingEnabled
  loadingIndicatorColor={COLORS.primary}
  loadingBackgroundColor={COLORS.white}
  mapType="standard"
  pitchEnabled
  rotateEnabled
  zoomEnabled
  zoomControlEnabled={Platform.OS === "android"}
  onError={(e) => {
    console.error("MapView error:", e.nativeEvent);
    setMapError(true);
  }}
>
        {displayMarkers.map((marker) => (
          <Marker
            key={marker.key}
            coordinate={marker.coordinate}
            pinColor={COLORS.primary}
            onPress={() => handlePlacePress(marker)}
            tracksViewChanges={false}
          >
            <Callout tooltip onPress={() => handlePlacePress(marker)}>
              <PlaceCallout
                place={marker}
                onDetailsPress={() => handlePlacePress(marker)}
              />
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  mapWrapper: {
    flex: 1,
    borderRadius: 15,
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
  errorContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.light_gray,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 12,
    color: COLORS.error,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: COLORS.white,
    fontWeight: "600",
  },
});

export default MapContent;
