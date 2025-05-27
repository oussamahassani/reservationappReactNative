import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Text,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react-native";
import EventSearchHeader from "../components/events/EventSearchHeader";
import EventFilters from "../components/events/EventFilters";
import { FooterNav } from "../components/FooterNav";
import { getAllEvents } from "../services/EventService";
import { COLORS } from "../theme/colors";
import { SPACING } from "../theme/spacing";
import { FONT_SIZE } from "../theme/typography";
import { Calendar, Clock, MapPin, Euro, Users } from "lucide-react-native";

const EventsScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [priceRange, setPriceRange] = useState(200);
  const [sortOrder, setSortOrder] = useState(null);

  const regions = React.useMemo(() => {
    if (!events || !Array.isArray(events) || events.length === 0) {
      return [];
    }

    const regionSet = new Set();

    events.forEach((event) => {
      if (event.place && event.place.location) {
        try {
          const locationData =
            typeof event.place.location === "string"
              ? JSON.parse(event.place.location)
              : event.place.location;

          if (locationData && locationData.region) {
            regionSet.add(locationData.region);
          }
        } catch (e) {
          console.error("Error parsing location data:", e);
        }
      }
    });

    return [...regionSet];
  }, [events]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await getAllEvents();

      setEvents(data || []);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRegionFromEvent = (event) => {
    if (!event || !event.place || !event.place.location) {
      return "";
    }

    try {
      const location =
        typeof event.place.location === "string"
          ? JSON.parse(event.place.location)
          : event.place.location;

      return location.region || "";
    } catch (e) {
      console.error("Error parsing location:", e);
      return "";
    }
  };

  const processedEvents = React.useMemo(() => {
    if (!Array.isArray(events)) {
      return [];
    }

    let result = events.filter((event) => {
      const searchMatches =
        (event.title &&
          event.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (event.description &&
          event.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (event.location &&
          event.location.toLowerCase().includes(searchQuery.toLowerCase()));

      const region = getRegionFromEvent(event);
      const regionMatches = !selectedRegion || region === selectedRegion;

      const price = parseFloat(event.ticketPrice || 0);
      const priceMatches = price <= priceRange;

      return searchMatches && regionMatches && priceMatches;
    });

    if (sortOrder) {
      result = [...result];

      switch (sortOrder) {
        case "price-asc":
          result.sort(
            (a, b) =>
              parseFloat(a.ticketPrice || 0) - parseFloat(b.ticketPrice || 0)
          );
          break;
        case "price-desc":
          result.sort(
            (a, b) =>
              parseFloat(b.ticketPrice || 0) - parseFloat(a.ticketPrice || 0)
          );
          break;
        case "date-asc":
          result.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
          break;
        case "date-desc":
          result.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
          break;
        case "region":
          result.sort((a, b) => {
            const regionA = getRegionFromEvent(a) || "";
            const regionB = getRegionFromEvent(b) || "";
            return regionA.localeCompare(regionB);
          });
          break;
        default:
          break;
      }
    }

    return result;
  }, [events, searchQuery, selectedRegion, priceRange, sortOrder]);

  const toggleSortOrder = (sortType) => {
    if (sortOrder === sortType) {
      setSortOrder(null);
    } else {
      setSortOrder(sortType);
    }
  };

  const renderEvent = ({ item }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => {
        navigation.navigate("PlaceDetails", {
          eventId: item.id,
          placeId: item.place?.id,
        });
        console.log(item);
      }}
    >
      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.priceContainer}>
          <Text style={styles.ticketPrice}>
            {parseFloat(item.ticketPrice || 0).toFixed(2)} TND
          </Text>
        </View>
      </View>

      <Text style={styles.eventDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.eventDetails}>
        <View style={styles.detailRow}>
          <Calendar size={16} color={COLORS.primary} />
          <Text style={styles.detailText}>{formatDate(item.startDate)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Clock size={16} color={COLORS.primary} />
          <Text style={styles.detailText}>{formatTime(item.startDate)}</Text>
        </View>
        <View style={styles.detailRow}>
          <MapPin size={16} color={COLORS.primary} />
          <Text style={styles.detailText}>{item.location}</Text>
        </View>
        {getRegionFromEvent(item) && (
          <View style={styles.detailRow}>
            <MapPin size={16} color={COLORS.primary} />
            <Text style={styles.detailText}>{getRegionFromEvent(item)}</Text>
          </View>
        )}
      </View>

      <View style={styles.eventFooter}>
        <View style={styles.capacityContainer}>
          <Users size={16} color={COLORS.primary} />
          <Text style={styles.capacity}>
            {item.capacity} {t("events.capacity")}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "right", "left"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {t("events.title", "Événements")}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <EventSearchHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterPress={() => setShowFilters(true)}
      />

      <View style={styles.sortButtons}>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sortOrder === "price-asc" && styles.sortButtonActive,
          ]}
          onPress={() => toggleSortOrder("price-asc")}
        >
          <Text style={styles.sortButtonText}>Prix ↑</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sortButton,
            sortOrder === "price-desc" && styles.sortButtonActive,
          ]}
          onPress={() => toggleSortOrder("price-desc")}
        >
          <Text style={styles.sortButtonText}>Prix ↓</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sortButton,
            sortOrder === "date-asc" && styles.sortButtonActive,
          ]}
          onPress={() => toggleSortOrder("date-asc")}
        >
          <Text style={styles.sortButtonText}>Date ↑</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sortButton,
            sortOrder === "date-desc" && styles.sortButtonActive,
          ]}
          onPress={() => toggleSortOrder("date-desc")}
        >
          <Text style={styles.sortButtonText}>Date ↓</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sortButton,
            sortOrder === "region" && styles.sortButtonActive,
          ]}
          onPress={() => toggleSortOrder("region")}
        >
          <Text style={styles.sortButtonText}>Région</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showFilters}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <EventFilters
            selectedRegion={selectedRegion}
            setSelectedRegion={setSelectedRegion}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            regions={regions}
            onClose={() => setShowFilters(false)}
          />
        </View>
      </Modal>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchEvents}>
            <Text style={styles.retryButtonText}>{t("common.retry")}</Text>
          </TouchableOpacity>
        </View>
      ) : processedEvents.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.noResults}>{t("events.noResults")}</Text>
        </View>
      ) : (
        <FlatList
          data={processedEvents}
          renderItem={renderEvent}
          keyExtractor={(item) =>
            item.id?.toString() || Math.random().toString()
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FooterNav navigation={navigation} activeScreen="Events" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light_gray,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  backButton: {
    padding: SPACING.xs,
  },
  placeholder: {
    width: 24,
  },
  sortButtons: {
    flexDirection: "row",
    justifyContent: "flex-start",
    flexWrap: "wrap",
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light_gray,
  },
  sortButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    backgroundColor: COLORS.light_gray,
  },
  sortButtonActive: {
    backgroundColor: COLORS.primary_light,
  },
  sortButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    fontWeight: "600",
  },
  listContainer: {
    padding: SPACING.md,
  },
  eventCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xs,
  },
  eventTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "bold",
    color: COLORS.primary,
    flex: 1,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  ticketPrice: {
    fontSize: FONT_SIZE.md,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  eventDescription: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray,
    marginBottom: SPACING.sm,
  },
  eventDetails: {
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  detailText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray,
  },
  eventFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.light_gray,
  },
  capacityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  capacity: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.md,
    textAlign: "center",
    marginBottom: SPACING.md,
  },
  noResults: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.gray,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: SPACING.lg,
  },
});

export default EventsScreen;
