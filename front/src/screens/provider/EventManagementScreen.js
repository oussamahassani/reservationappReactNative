// 📁 File: screens/EventManagementScreen.js

import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  TextInput,
  Modal,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  ArrowLeft,
  Calendar,
  Edit,
  Trash2,
  Plus,
  X,
  MapPin,
  User,
  DollarSign,
  Users,
  Image as ImageIcon,
  CloudCog,
} from "lucide-react-native";

import { COLORS } from "../../theme/colors";
import { SPACING } from "../../theme/spacing";
import { FONT_SIZE } from "../../theme/typography";
import * as Animatable from "react-native-animatable";
import { EventService } from "../../services/EventService";
import { useAuth } from "../../context/AuthContext";

const EventManagementScreen = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState("ongoing");
  const [groupedEvents, setGroupedEvents] = useState({
    ongoing: [],
    cancel: [],
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: "",
    organizer: "",
    ticketPrice: "",
    capacity: "",
    images: [],
  });

  const { user } = useAuth();

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

      setGroupedEvents(grouped);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  };

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setNewEvent({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      location: "",
      organizer: "",
      ticketPrice: "",
      capacity: "",
      images: [],
    });
    setModalVisible(true);
  };
  const handleDeleteEvent = async (id) => {
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

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      description: event.description,
      startDate: event.startDate?.slice(0, 10),
      endDate: event.endDate?.slice(0, 10),
      location: event.location,
      organizer: event.organizer,
      ticketPrice: String(event.ticketPrice || ""),
      capacity: String(event.capacity || ""),
      images: Array.isArray(event.images) ? event.images : [],
    });
    setModalVisible(true);
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const uris = result.assets?.map((asset) => asset.uri) || [];
      setNewEvent((prev) => ({
        ...prev,
        images: [...prev.images, ...uris],
      }));
    }
  };

  const saveEvent = async () => {
    const {
      title,
      description,
      startDate,
      endDate,
      location,
      organizer,
      ticketPrice,
      capacity,
      images,
    } = newEvent;

    if (!title || !description || !startDate || !endDate) {
      console.warn("Tous les champs sont requis");
      return;
    }

    const parsedStart = parseDate(startDate);
    const parsedEnd = parseDate(endDate);

    // if (isNaN(parsedStart.getTime()) || isNaN(parsedEnd.getTime())) {
    //   console.warn(
    //     "Les dates doivent être valides au format ISO ou JJ/MM/AAAA"
    //   );

    //   return;
    // }

    const payload = {
      title,
      description,
      startDate: toMySQLDateTime(parsedStart),
      endDate: toMySQLDateTime(parsedEnd),
      location,
      organizer,
      ticketPrice: parseFloat(ticketPrice),
      capacity: parseInt(capacity, 10),
      provider_id: user?.id || 1,
      place_id: 1,
      images,
    };
    console.log(payload)
    try {
      if (editingEvent) {
        await EventService.updateEvent(editingEvent.id, payload);
        console.log("Événement mis à jour avec succès");
      } else {
        await EventService.createEvent(payload);
        console.log("Nouvel événement créé avec succès");
      }

      setModalVisible(false);
      fetchEvents();
    } catch (error) {
      console.error(" Failed to save event:", error);
      setModalVisible(false);
    }
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

  const renderEventItem = ({ item }) => (
    <Animatable.View animation="fadeIn" duration={500} style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>

      <View style={styles.row}>
        <Calendar size={16} />
        <Text>
          {" "}
          {item.startDate?.slice(0, 10)} - {item.endDate?.slice(0, 10)}
        </Text>
      </View>

      <View style={styles.row}>
        <MapPin size={16} />
        <Text> {item.location} </Text>
      </View>

      <View style={styles.row}>
        <User size={16} />
        <Text> {item.organizer}</Text>
      </View>

      <View style={styles.row}>
        <DollarSign size={16} />
        <Text> {item.ticketPrice} DT</Text>
      </View>

      <View style={styles.row}>
        <Users size={16} />
        <Text> Capacité: {item.capacity}</Text>
      </View>

      {item.images && Array.isArray(item.images) && item.images.length > 0 && (
        <ScrollView horizontal style={{ marginTop: 8 }}>
          {item.images.map((uri, index) => (
            <Image
              key={index}
              source={{ uri }}
              style={{
                width: 100,
                height: 100,
                borderRadius: 8,
                marginRight: 8,
              }}
            />
          ))}
        </ScrollView>
      )}

      {activeTab === "ongoing" && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleEditEvent(item)}
          >
            <Edit size={16} color={COLORS.white} />
            <Text style={styles.buttonText}>Modifier</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: COLORS.error }]}
            onPress={() => handleDeleteEvent(item.id)}
          >
            <X size={16} color={COLORS.white} />
            <Text style={styles.buttonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animatable.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft color={COLORS.white} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestsdsion des événements</Text>
      </View>
      <View style={styles.tabsContainer}>
        {["ongoing", "cancel"].map((tab) => (
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
              {tab === "ongoing"
                ? `Actifs (${groupedEvents.ongoing.length})`
                : `Annulés (${groupedEvents.cancel.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.addButton} onPress={handleCreateEvent}>
        <Plus size={20} color={COLORS.white} />
        <Text style={styles.addButtonText}>Créer un événement</Text>
      </TouchableOpacity>

      <FlatList
        data={groupedEvents[activeTab]}
        keyExtractor={(item) => item.id}
        renderItem={renderEventItem}
        contentContainerStyle={styles.list}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView>
              {[
                "title",
                "description",
                "location",
                "organizer",
                "ticketPrice",
                "capacity",
                "startDate",
                "endDate",
              ].map((field) => (
                <View key={field} style={{ marginBottom: SPACING.md }}>
                  <Text style={styles.inputLabel}>
                    {field === "ticketPrice"
                      ? "Prix"
                      : field === "startDate"
                      ? "Date début"
                      : field === "endDate"
                      ? "Date fin"
                      : field}
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={newEvent[field]}
                    onChangeText={(text) =>
                      setNewEvent({ ...newEvent, [field]: text })
                    }
                    placeholder={
                      {
                        title: "Titre de l'événement",
                        description: "Description complète...",
                        location: "Lieu de l'événement",
                        organizer: "Organisateur (facultatif)",
                        ticketPrice: "Prix du billet (DT)",
                        capacity: "Nombre de places",
                        startDate: "JJ/MM/AAAA",
                        endDate: "JJ/MM/AAAA",
                      }[field]
                    }
                  />
                </View>
              ))}

              <TouchableOpacity style={styles.button} onPress={handleImagePick}>
                <ImageIcon size={18} color={COLORS.white} />
                <Text style={styles.buttonText}>Ajouter une image</Text>
              </TouchableOpacity>

              {newEvent.images.length > 0 && (
                <ScrollView horizontal style={{ marginTop: 10 }}>
                  {newEvent.images.map((uri, index) => (
                    <Image
                      key={index}
                      source={{ uri }}
                      style={{
                        width: 100,
                        height: 100,
                        marginRight: 10,
                        borderRadius: 8,
                      }}
                    />
                  ))}
                </ScrollView>
              )}

              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => saveEvent()}
              >
                <Text style={styles.saveButtonText}>
                  {editingEvent ? "Mettre à jour" : "Créer"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default EventManagementScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: {
    backgroundColor: COLORS.primary,
    padding: SPACING.xxxl,
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZE.lg,
    fontWeight: "bold",
    marginLeft: SPACING.md,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
  },
  addButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: FONT_SIZE.md,
    marginLeft: SPACING.sm,
  },
  list: { padding: SPACING.md },
  card: {
    backgroundColor: COLORS.light_gray,
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  title: { fontSize: FONT_SIZE.md, fontWeight: "bold", color: COLORS.primary },
  description: { marginVertical: SPACING.sm },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SPACING.md,
  },
  button: {
    backgroundColor: COLORS.info,
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.sm,
    borderRadius: 8,
    flex: 1,
    justifyContent: "center",
    marginHorizontal: 4,
  },
  buttonText: { color: COLORS.white, marginLeft: 4, fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  inputLabel: { color: COLORS.primary, fontWeight: "bold", marginBottom: 4 },
  input: {
    backgroundColor: COLORS.light_gray,
    padding: SPACING.sm,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 12,
    marginTop: SPACING.md,
    alignItems: "center",
  },
  saveButtonText: { color: COLORS.white, fontWeight: "bold" },
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
