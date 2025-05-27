import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Image,
  Alert,
  Modal,
  Platform,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { COLORS } from "../../theme/colors";
import { SPACING } from "../../theme/spacing";
import { FONT_SIZE } from "../../theme/typography";
import { boxShadow } from "../../theme/mixins";
import { EventService } from "../../services/EventService";

export default function EventManagementScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [groupedEvents, setGroupedEvents] = useState({
    ongoing: [],
    cancel: [],
    all: [],
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const data = await EventService.getAllEvents();
      const grouped = { ongoing: [], cancel: [] };

      data.forEach((event) => {
        if (event.status === "cancel") {
          grouped.cancel.push(event);
        } else {
          grouped.ongoing.push(event);
        }
      });
      grouped.all = [...grouped.ongoing, ...grouped.cancel];
      setGroupedEvents(grouped);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  };

  // const filteredEvents = events.filter((event) => {
  //   const matchesQuery =
  //     event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     event.description.toLowerCase().includes(searchQuery.toLowerCase());

  //   if (filterStatus === "all") return matchesQuery;
  //   return matchesQuery && event.status === filterStatus;
  // });

  const filteredEvents = groupedEvents[activeTab].filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApproveEvent = async (id) => {
    try {
      const originalEvent = groupedEvents.ongoing.find((e) => e.id === id);
      if (!originalEvent) {
        console.warn("Événement introuvable pour l’annulation.");
        return;
      }

      const parsedStart = parseDate(originalEvent.startDate);
      const parsedEnd = parseDate(originalEvent.endDate);

      const updatedEvent = {
        title: originalEvent.title,
        description: originalEvent.description,
        startDate: toMySQLDateTime(parsedStart),
        endDate: toMySQLDateTime(parsedEnd),
        location: originalEvent.location,
        organizer: originalEvent.organizer,
        ticketPrice: originalEvent.ticketPrice,
        capacity: originalEvent.capacity,
        place_id: originalEvent.place_id,
        provider_id: originalEvent.provider_id,
        images: originalEvent.images || [],
        status: "ongoing",
      };
      console.log(originalEvent);

      await EventService.updateEvent(id, updatedEvent);
      await fetchEvents();
      console.log("Événement annulé avec succès");
    } catch (error) {
      console.error("Échec de l’annulation de l’événement :", error);
    }
  };

  const handleRejectEvent = async (id) => {
    try {
      const originalEvent = groupedEvents.ongoing.find((e) => e.id === id);
      if (!originalEvent) {
        console.warn("Événement introuvable pour l’annulation.");
        return;
      }

      const parsedStart = parseDate(originalEvent.startDate);
      const parsedEnd = parseDate(originalEvent.endDate);

      const updatedEvent = {
        title: originalEvent.title,
        description: originalEvent.description,
        startDate: toMySQLDateTime(parsedStart),
        endDate: toMySQLDateTime(parsedEnd),
        location: originalEvent.location,
        organizer: originalEvent.organizer,
        ticketPrice: originalEvent.ticketPrice,
        capacity: originalEvent.capacity,
        place_id: originalEvent.place_id,
        provider_id: originalEvent.provider_id,
        images: originalEvent.images || [],
        status: "cancel",
      };
      console.log(originalEvent);

      await EventService.updateEvent(id, updatedEvent);
      await fetchEvents();
      console.log("Événement annulé avec succès");
    } catch (error) {
      console.error("Échec de l’annulation de l’événement :", error);
    }
  };

  const handleDeleteEvent = async (id) => {
    Alert.alert("Confirmation", "Voulez-vous annuler cet événement ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        onPress: async () => {
          const current = events.find((e) => e.id === id);
          if (!current) return;
          await EventService.updateEvent(id, { ...current, status: "cancel" });
          fetchEvents();
        },
        style: "destructive",
      },
    ]);
  };
  const parseDate = (input) => {
    if (/\d{4}-\d{2}-\d{2}/.test(input)) return new Date(input);
    const parts = input.split("/");
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return new Date(`${year}-${month}-${day}T00:00:00`);
    }
    return new Date(NaN);
  };

  const toMySQLDateTime = (dateObj) => {
    return dateObj.toISOString().slice(0, 19).replace("T", " ");
  };

  const openEventDetails = (event) => {
    setSelectedEvent(event);
    setModalVisible(true);
  };

  const renderEventItem = ({ item }) => (
    <Animatable.View
      animation="fadeIn"
      duration={500}
      style={[
        styles.eventCard,
        item.status === "cancel"
          ? styles.eventCardRejected
          : item.status === "pending"
          ? styles.eventCardPending
          : styles.eventCard,
      ]}
    >
      <TouchableOpacity onPress={() => openEventDetails(item)}>
        <View style={styles.eventImageContainer}>
          <Image source={{ uri: item.image }} style={styles.eventImage} />
          <View style={styles.eventDateOverlay}>
            <Text style={styles.eventDate}>{item.date}</Text>
            <Text style={styles.eventTime}>{item.time}</Text>
          </View>
        </View>

        <View style={styles.eventContent}>
          <View style={styles.eventHeader}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    item.status === "ongoing"
                      ? "#E8F5E9"
                      : item.status === "pending"
                      ? "#FFF9C4"
                      : "#FFEBEE",
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      item.status === "ongoing"
                        ? "#2E7D32"
                        : item.status === "pending"
                        ? "#F57F17"
                        : "#C62828",
                  },
                ]}
              >
                {item.status === "ongoing"
                  ? "Approuvé"
                  : item.status === "pending"
                  ? "En attente"
                  : "Rejeté"}
              </Text>
            </View>
          </View>

          <Text style={styles.eventLocation}>{item.location}</Text>
          <Text style={styles.eventOrganizer}>
            Organisé par: {item.organizer}
          </Text>
          <Text numberOfLines={2} style={styles.eventDescription}>
            {item.description}
          </Text>
        </View>
      </TouchableOpacity>

      {item.status === "ongoing" && (
        <View style={styles.eventActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#E8F5E9" }]}
            onPress={() => handleApproveEvent(item.id)}
          >
            <Text style={[styles.actionButtonText, { color: "#2E7D32" }]}>
              Approuver
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#FFEBEE" }]}
            onPress={() => handleRejectEvent(item.id)}
          >
            <Text style={[styles.actionButtonText, { color: "#C62828" }]}>
              Rejeter
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: "#FFEBEE" }]}
            onPress={() => handleDeleteEvent(item.id)}
          >
            <Text style={[styles.actionButtonText, { color: "#C62828" }]}>
              Supprimer
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </Animatable.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={COLORS.primary_dark}
        barStyle="light-content"
      />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestion des Événements</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un événement..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <View style={styles.tabsContainer}>
        {["all", "ongoing", "cancel"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab === "all"
                ? `Tous (${groupedEvents.all.length})`
                : tab === "ongoing"
                ? `En cours (${groupedEvents.ongoing.length})`
                : `Annulés (${groupedEvents.cancel.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={filteredEvents}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedEvent && (
              <>
                <Image
                  source={{ uri: selectedEvent.image }}
                  style={styles.modalImage}
                />
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedEvent.title}</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <Text>{selectedEvent.description}</Text>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: SPACING.lg + (StatusBar.currentHeight || 0),
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xl,
    fontWeight: "bold",
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZE.lg,
    fontWeight: "bold",
  },
  searchContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
  },
  searchInput: {
    backgroundColor: COLORS.light_gray,
    borderRadius: 10,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
  },
  filterTabs: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light_gray,
  },
  filterTab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: "center",
  },
  filterTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray,
  },
  filterTabTextActive: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  statsRow: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light_gray,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray,
  },
  listContainer: {
    padding: SPACING.md,
  },
  eventCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginBottom: SPACING.md,
    overflow: "hidden",
    ...boxShadow,
  },
  eventCardPending: {
    backgroundColor: "#FFFDE7",
    borderLeftWidth: 4,
    borderLeftColor: "#F57F17",
  },
  eventCardRejected: {
    backgroundColor: "#FFEBEE",
    borderLeftWidth: 4,
    borderLeftColor: "#C62828",
  },
  eventImageContainer: {
    position: "relative",
    height: 120,
  },
  eventImage: {
    width: "100%",
    height: 120,
  },
  eventDateOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderTopRightRadius: 8,
  },
  eventDate: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: FONT_SIZE.xs,
  },
  eventTime: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xs,
  },
  eventContent: {
    padding: SPACING.md,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.xs,
  },
  eventTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: "bold",
    color: COLORS.primary_dark,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: 10,
    marginLeft: SPACING.sm,
  },
  statusText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: "bold",
  },
  eventLocation: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray,
    marginBottom: SPACING.xs,
  },
  eventOrganizer: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.primary_dark,
    marginBottom: SPACING.xs,
    fontStyle: "italic",
  },
  eventDescription: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.black,
    lineHeight: 20,
  },
  eventActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: COLORS.light_gray,
    padding: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: "center",
    borderRadius: 8,
    marginHorizontal: 2,
  },
  actionButtonText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: "bold",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    maxHeight: "90%",
    backgroundColor: COLORS.white,
    borderRadius: 10,
    overflow: "hidden",
    ...boxShadow,
  },
  modalImage: {
    width: "100%",
    height: 180,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light_gray,
  },
  modalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "bold",
    color: COLORS.primary,
    flex: 1,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.light_gray,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.gray,
  },
  modalBody: {
    padding: SPACING.md,
  },
  detailItem: {
    flexDirection: "row",
    marginBottom: SPACING.sm,
    alignItems: "center",
  },
  detailLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: "bold",
    color: COLORS.primary_dark,
    width: "35%",
  },
  detailValue: {
    fontSize: FONT_SIZE.md,
    color: COLORS.black,
    flex: 1,
  },
  descriptionContainer: {
    marginVertical: SPACING.sm,
  },
  description: {
    fontSize: FONT_SIZE.md,
    color: COLORS.black,
    lineHeight: 22,
    marginTop: SPACING.xs,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SPACING.lg,
  },
  modalButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: "center",
    borderRadius: 8,
    marginHorizontal: 4,
  },
  modalButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: "bold",
  },
  tabsContainer: {
    flexDirection: "row",
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    backgroundColor: COLORS.light_gray,
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: COLORS.white,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  tabText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
});
