import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Calendar, Clock, Users, X } from "lucide-react-native";
import { COLORS } from "../theme/colors";
import { SPACING } from "../theme/spacing";
import { FONT_SIZE, FONT_WEIGHT } from "../theme/typography";

const ReservationSummaryModal = ({
  visible,
  onClose,
  onConfirm,
  loading,
  error,
  data,
  type, // 'place' or 'event'
}) => {
  const formatDate = (date) => {
    if (!date) return "Date non spécifiée";
    return new Date(date).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "Heure non spécifiée";
    return new Date(date).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price, quantity) => {
    if (price === undefined || quantity === undefined)
      return "Prix non disponible";
    return `${(price * quantity).toFixed(2)} TND`;
  };

  // Check if data exists before rendering the content
  if (!data) {
    return null;
  }

  // Safely access the entity name based on type
  const getEntityName = () => {
    if (type === "event" && data.event) {
      return data.event.title;
    } else if (type === "place" && data.place) {
      return data.place.name;
    }
    return "Réservation";
  };

  // Safely get price based on type
  const getPrice = () => {
    if (type === "event" && data.event) {
      return data.event.ticketPrice;
    } else if (type === "place" && data.place && data.place.entranceFee) {
      return data.place.entranceFee.adult;
    }
    return 0;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={COLORS.gray} />
          </TouchableOpacity>

          <Text style={styles.title}>Résumé de la réservation</Text>

          <View style={styles.summaryContainer}>
            <Text style={styles.entityName}>{getEntityName()}</Text>

            <View style={styles.detailRow}>
              <Calendar size={20} color={COLORS.primary} />
              <Text style={styles.detailText}>{formatDate(data.date)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Clock size={20} color={COLORS.primary} />
              <Text style={styles.detailText}>{formatTime(data.date)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Users size={20} color={COLORS.primary} />
              <Text style={styles.detailText}>
                {data.numberOfPeople || data.numberOfTickets || 1}{" "}
                {(data.numberOfPeople || data.numberOfTickets || 1) > 1
                  ? "personnes"
                  : "personne"}
              </Text>
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Prix total</Text>
              <Text style={styles.priceValue}>
                {formatPrice(
                  getPrice(),
                  data.numberOfPeople || data.numberOfTickets || 1
                )}
              </Text>
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmButton, loading && styles.buttonDisabled]}
              onPress={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={styles.confirmButtonText}>Confirmer</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.xl,
    width: "100%",
    maxWidth: 400,
  },
  closeButton: {
    position: "absolute",
    right: SPACING.md,
    top: SPACING.md,
    padding: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.black,
    marginBottom: SPACING.xl,
    textAlign: "center",
  },
  summaryContainer: {
    backgroundColor: COLORS.light_gray,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  entityName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  detailText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray,
    marginLeft: SPACING.sm,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.light_gray,
  },
  priceLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.black,
  },
  priceValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  errorContainer: {
    backgroundColor: COLORS.error + "20",
    padding: SPACING.md,
    borderRadius: 8,
    marginTop: SPACING.md,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.sm,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray_light,
    alignItems: "center",
  },
  cancelButtonText: {
    color: COLORS.gray,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
  },
  confirmButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: "center",
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});

export default ReservationSummaryModal;
