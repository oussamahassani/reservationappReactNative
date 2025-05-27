import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import * as Animatable from "react-native-animatable";

import { COLORS } from "../theme/colors";
import { SPACING } from "../theme/spacing";
import { FONT_SIZE } from "../theme/typography";
import { ROUTES } from "../navigation/navigationConstants";

import { useLocationPermission } from "../hooks/useLocationPermission";
import { usePlacesData } from "../hooks/usePlacesData";

import CategoryFilters from "../components/map/CategoryFilters";
import MapContent from "../components/map/MapContent";
import SearchInput from "../components/map/SearchInput";
import { LoadingState, ErrorState } from "../components/map/LoadingErrorStates";
import { FooterNav } from "../components/FooterNav";

const MapScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const mapRef = useRef(null);

  const [filterType, setFilterType] = useState(null);
  const [mapRegion, setMapRegion] = useState(null); // ← will use user location
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const { userLocation } = useLocationPermission();
  const { places, isLoading, error, fetchPlaces } = usePlacesData();

  // Set map region when user location is available
  useEffect(() => {
    if (userLocation && userLocation.latitude && userLocation.longitude) {
      setMapRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [userLocation]);

  const handleRegionChangeComplete = (region) => {
    setMapRegion(region);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);

    const lowerQuery = query.toLowerCase();

    const matches = parsedPlaces.filter((place) =>
      place.name.toLowerCase().includes(lowerQuery)
    );

    setSearchResults(matches);

    if (matches.length > 0 && mapRef.current) {
      const firstMatch = matches[0];
      const lat = parseFloat(firstMatch.location.latitude);
      const lng = parseFloat(firstMatch.location.longitude);

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
    }
  };
  const handlePlaceDetails = (placeId) => {
    navigation.navigate(ROUTES.PLACE_DETAILS, { placeId });
  };

  const toggleFilter = (type) => {
    const nextFilter = filterType === type ? null : type;
    setFilterType(nextFilter);
    setSearchQuery("");
    setSearchResults([]);
        console.log("nextFilter:", nextFilter);

  };

  const parsedPlaces = useMemo(() => {
    if (!Array.isArray(places)) return [];

    return places.map((place) => ({
      ...place,
      location:
        typeof place.location === "string"
          ? JSON.parse(place.location)
          : place.location,
    }));
  }, [places]);

  const filteredPlaces = useMemo(() => {
    const activeQuery = searchQuery.trim();
    const hasSearch = activeQuery.length > 0;
    const hasResults = searchResults.length > 0;

    let source;
    console.log("Search matches activeQuery:", activeQuery);
    console.log("Search matches searchResults:", searchResults);
    if (!hasSearch) {
      source = parsedPlaces;
    } else if (hasResults) {
      source = searchResults;
    } else {
      return [];
    }

    return filterType
      ? source.filter((place) => place.type === filterType)
      : source;
  }, [searchQuery, searchResults, parsedPlaces, filterType]);
  if (!mapRegion || isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={fetchPlaces} />;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primary_dark}
      />

      <Animatable.View
        animation="fadeInDown"
        duration={1000}
        style={styles.header}
      >
        <Text style={styles.title}>{t("map.home")}</Text>
        <Text style={styles.subtitle}>{t("map.discover")}</Text>
      </Animatable.View>

      <Animatable.View
        animation="fadeInUp"
        duration={800}
        style={styles.mainContent}
      >
        <CategoryFilters filterType={filterType} toggleFilter={toggleFilter} />

        <View style={styles.mapContainer}>
          {/* <SearchInput
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearch={handleSearch}
          /> */}
          <MapContent
            mapRef={mapRef}
            initialRegion={mapRegion}
            userLocation={userLocation}
            filteredPlaces={filteredPlaces}
            searchResults={searchResults}
            onRegionChangeComplete={handleRegionChangeComplete}
            onPlacePress={handlePlaceDetails}
          />
        </View>
      </Animatable.View>

      <FooterNav navigation={navigation} activeScreen={ROUTES.HOME} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    paddingTop: Platform.OS === "android" ? SPACING.xl : SPACING.lg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: "bold",
    color: COLORS.white,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.white,
    opacity: 0.8,
    marginTop: SPACING.xs,
  },
  mainContent: {
    flex: 1,
    padding: SPACING.sm,
  },
  mapContainer: {
    flex: 1,
    borderRadius: 15,
    overflow: "hidden",
    marginTop: SPACING.sm,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});

export default MapScreen;
