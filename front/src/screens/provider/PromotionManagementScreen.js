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
  Switch,
  Platform,
  ScrollView,
} from "react-native";
import {
  ArrowLeft,
  Calendar,
  Bell,
  Edit,
  Trash2,
  Plus,
  X,
  Image as ImageIcon,
  Info,
} from "lucide-react-native";

import { COLORS } from "../../theme/colors";
import { SPACING } from "../../theme/spacing";
import { FONT_SIZE } from "../../theme/typography";
import * as Animatable from "react-native-animatable";
import { PromotionService } from "../../services/PromotionService";
import { useAuth } from "../../context/AuthContext";

const PromotionManagementScreen = ({ navigation }) => {
  const [promotions, setPromotions] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [newPromotion, setNewPromotion] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    notifyUsers: true,
    active: true,
  });
  const { user } = useAuth();
  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const data = await PromotionService.getAllPromotions();
      setPromotions(data.data || []);
    } catch (error) {
      console.error("❌ Failed to fetch promotions:", error);
    }
  };

  const handleCreatePromotion = () => {
    setEditingPromotion(null);
    setNewPromotion({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      notifyUsers: true,
      active: true,
    });
    setModalVisible(true);
  };

  const handleEditPromotion = (promotion) => {
    setEditingPromotion(promotion);
    setNewPromotion({
      title: promotion.title,
      description: promotion.description,
      startDate:
        promotion.start_date.slice(0, 10) || promotion.startDate.slice(0, 10),
      endDate:
        promotion.end_date.slice(0, 10) || promotion.endDate.slice(0, 10),
      notifyUsers: promotion.notifyUsers ?? true,
      active: promotion.active ?? true,
    });
    setModalVisible(true);
  };

  const handleDeletePromotion = async (id) => {
    try {
      await PromotionService.deletePromotion(id);
      fetchPromotions();
    } catch (error) {
      console.error("❌ Failed to delete promotion:", error);
    }
  };

  const handleToggleActive = async (id) => {
    const promo = promotions.find((p) => p.promotion_id === id || p.id === id);
    if (!promo) return;
    try {
      await PromotionService.updatePromotion(id, {
        ...promo,
        active: !promo.active,
      });
      fetchPromotions();
    } catch (error) {
      console.error("❌ Failed to toggle promotion:", error);
    }
  };

  const savePromotion = async () => {
    const { title, description, startDate, endDate, notifyUsers, active } =
      newPromotion;

    if (!title || !description || !startDate || !endDate) {
      console.warn("Tous les champs sont requis");
      return;
    }
    const isManualDate = newPromotion.startDate.includes("/");

    const payload = {
      title,
      description,
      start_date: isManualDate
        ? formatDate(newPromotion.startDate).slice(0, 10)
        : newPromotion.startDate.slice(0, 10),
      end_date: isManualDate
        ? formatDate(newPromotion.endDate).slice(0, 10)
        : newPromotion.endDate.slice(0, 10),
      discount_percent: 10,
      place_id: 1,
      created_by: user?.id || 1,
    };
    try {
      console.log(payload);
      if (editingPromotion) {
        await PromotionService.updatePromotion(
          editingPromotion.promotion_id || editingPromotion.id,
          payload
        );
      } else {
        await PromotionService.createPromotion(payload);
      }

      setModalVisible(false);
      fetchPromotions();
    } catch (error) {
      console.error("❌ Failed to save promotion:", error);
      console.log(payload);
    }
  };
  const formatDate = (dateStr) => {
    const [day, month, year] = dateStr.split("/");
    return `${year}-${month}-${day}`;
  };

  const renderPromotionItem = ({ item }) => (
    <Animatable.View
      animation="fadeIn"
      duration={500}
      style={[styles.promotionCard, !item.active && styles.inactiveCard]}
    >
      <View style={styles.promotionHeader}>
        <Text style={styles.promotionTitle}>{item.title}</Text>
        <View
          style={[
            styles.statusBadge,
            item.active ? styles.activeBadge : styles.inactiveBadge,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              item.active ? styles.activeText : styles.inactiveText,
            ]}
          >
            {item.active ? "Actif" : "Inactif"}
          </Text>
        </View>
      </View>

      <Text style={styles.promotionDescription}>{item.description}</Text>

      <View style={styles.dateContainer}>
        <View style={styles.dateItem}>
          <Calendar size={16} color={COLORS.primary} />
          <Text style={styles.dateText}>
            Début: {item.start_date.slice(0, 10)}
          </Text>
        </View>
        <View style={styles.dateItem}>
          <Calendar size={16} color={COLORS.primary} />
          <Text style={styles.dateText}>Fin: {item.end_date.slice(0, 10)}</Text>
        </View>
      </View>

      <View style={styles.notificationContainer}>
        <Bell
          size={16}
          color={item.notifyUsers ? COLORS.primary : COLORS.gray}
        />
        <Text style={styles.notificationText}>
          {item.notifyUsers
            ? "Notifications activées"
            : "Notifications désactivées"}
        </Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditPromotion(item)}
        >
          <Edit size={18} color={COLORS.white} />
          <Text style={styles.actionButtonText}>Modifier</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.toggleButton]}
          onPress={() => handleToggleActive(item.promotion_id || item.id)}
        >
          <Text style={styles.actionButtonText}>
            {item.active ? "Désactiver" : "Activer"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeletePromotion(item.promotion_id || item.id)}
        >
          <Trash2 size={18} color={COLORS.white} />
          <Text style={styles.actionButtonText}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </Animatable.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Animatable.View
        animation="fadeInDown"
        duration={1000}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft color={COLORS.white} size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Gestion des promotions</Text>
        <Text style={styles.subtitle}>Créez et gérez vos offres spéciales</Text>
      </Animatable.View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{promotions.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {promotions.filter((p) => p.active).length}
          </Text>
          <Text style={styles.statLabel}>Actives</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {promotions.filter((p) => p.notifyUsers).length}
          </Text>
          <Text style={styles.statLabel}>Avec notif.</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={handleCreatePromotion}
      >
        <Plus size={20} color={COLORS.white} />
        <Text style={styles.addButtonText}>Créer une promotion</Text>
      </TouchableOpacity>

      <FlatList
        data={promotions}
        keyExtractor={(item) => (item.promotion_id || item.id).toString()}
        renderItem={renderPromotionItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Create/Edit Promotion Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View
            animation="fadeInUp"
            duration={300}
            style={styles.modalContainer}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingPromotion
                  ? "Modifier la promotion"
                  : "Créer une promotion"}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <X size={24} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Titre</Text>
              <TextInput
                style={styles.input}
                placeholder="Titre de la promotion"
                value={newPromotion.title}
                onChangeText={(text) =>
                  setNewPromotion({ ...newPromotion, title: text })
                }
              />

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Description détaillée de votre offre..."
                multiline
                numberOfLines={4}
                value={newPromotion.description}
                onChangeText={(text) =>
                  setNewPromotion({ ...newPromotion, description: text })
                }
              />

              <View style={styles.dateRow}>
                <View style={styles.dateInputContainer}>
                  <Text style={styles.inputLabel}>Date de début</Text>
                  <TextInput
                    style={styles.dateInput}
                    placeholder="JJ/MM/AAAA"
                    value={newPromotion.startDate}
                    onChangeText={(text) =>
                      setNewPromotion({ ...newPromotion, startDate: text })
                    }
                  />
                </View>

                <View style={styles.dateInputContainer}>
                  <Text style={styles.inputLabel}>Date de fin</Text>
                  <TextInput
                    style={styles.dateInput}
                    placeholder="JJ/MM/AAAA"
                    value={newPromotion.endDate}
                    onChangeText={(text) =>
                      setNewPromotion({ ...newPromotion, endDate: text })
                    }
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.imageUploadButton}>
                <ImageIcon size={24} color={COLORS.primary} />
                <Text style={styles.imageUploadText}>Ajouter une image</Text>
              </TouchableOpacity>

              <View style={styles.switchContainer}>
                <View style={styles.switchItem}>
                  <Text style={styles.switchLabel}>
                    Notifier les utilisateurs
                  </Text>
                  <Switch
                    value={newPromotion.notifyUsers}
                    onValueChange={(value) =>
                      setNewPromotion({ ...newPromotion, notifyUsers: value })
                    }
                    trackColor={{
                      false: COLORS.gray_light,
                      true: COLORS.primary_light,
                    }}
                    thumbColor={
                      newPromotion.notifyUsers ? COLORS.primary : COLORS.gray
                    }
                  />
                </View>

                <View style={styles.switchItem}>
                  <Text style={styles.switchLabel}>Activer immédiatement</Text>
                  <Switch
                    value={newPromotion.active}
                    onValueChange={(value) =>
                      setNewPromotion({ ...newPromotion, active: value })
                    }
                    trackColor={{
                      false: COLORS.gray_light,
                      true: COLORS.primary_light,
                    }}
                    thumbColor={
                      newPromotion.active ? COLORS.primary : COLORS.gray
                    }
                  />
                </View>
              </View>

              <View style={styles.infoBox}>
                <Info size={20} color={COLORS.primary} />
                <Text style={styles.infoText}>
                  Les promotions actives seront visibles par les utilisateurs de
                  JenCity. Si vous activez les notifications, les utilisateurs à
                  proximité seront informés.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={savePromotion}
              >
                <Text style={styles.saveButtonText}>
                  {editingPromotion ? "Mettre à jour" : "Créer la promotion"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </Animatable.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    paddingTop: Platform.OS === "android" ? SPACING.xl * 2 : SPACING.xl,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    marginBottom: SPACING.sm,
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
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginTop: -SPACING.lg,
    borderRadius: 12,
    padding: SPACING.md,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    padding: SPACING.md,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  addButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: FONT_SIZE.md,
    marginLeft: SPACING.sm,
  },
  listContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  promotionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  inactiveCard: {
    opacity: 0.7,
  },
  promotionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  promotionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: "bold",
    color: COLORS.primary,
    flex: 1,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginLeft: SPACING.sm,
  },
  activeBadge: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
  },
  inactiveBadge: {
    backgroundColor: "rgba(128, 128, 128, 0.1)",
  },
  statusText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: "bold",
  },
  activeText: {
    color: COLORS.success,
  },
  inactiveText: {
    color: COLORS.gray,
  },
  promotionDescription: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.black,
    marginBottom: SPACING.md,
  },
  dateContainer: {
    flexDirection: "row",
    marginBottom: SPACING.sm,
  },
  dateItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: SPACING.lg,
  },
  dateText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray,
    marginLeft: 4,
  },
  notificationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  notificationText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray,
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    flex: 1,
    marginHorizontal: 4,
  },
  editButton: {
    backgroundColor: COLORS.info,
  },
  toggleButton: {
    backgroundColor: COLORS.warning,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
  },
  actionButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: FONT_SIZE.xs,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SPACING.lg,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  closeButton: {
    padding: 4,
  },
  inputLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 4,
    marginTop: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.light_gray,
    borderRadius: 8,
    padding: SPACING.sm,
    fontSize: FONT_SIZE.md,
  },
  textArea: {
    backgroundColor: COLORS.light_gray,
    borderRadius: 8,
    padding: SPACING.sm,
    fontSize: FONT_SIZE.md,
    minHeight: 100,
    textAlignVertical: "top",
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateInputContainer: {
    width: "48%",
  },
  dateInput: {
    backgroundColor: COLORS.light_gray,
    borderRadius: 8,
    padding: SPACING.sm,
    fontSize: FONT_SIZE.md,
  },
  imageUploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.light_gray,
    borderRadius: 8,
    padding: SPACING.md,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
  },
  imageUploadText: {
    color: COLORS.primary,
    fontWeight: "bold",
    marginLeft: SPACING.sm,
  },
  switchContainer: {
    marginTop: SPACING.md,
  },
  switchItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: SPACING.xs,
  },
  switchLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.black,
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "rgba(33, 150, 243, 0.1)",
    borderRadius: 8,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  infoText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: "center",
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  saveButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: FONT_SIZE.md,
  },
});

export default PromotionManagementScreen;
