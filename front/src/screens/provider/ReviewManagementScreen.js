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
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  ArrowLeft,
  User,
  MessageSquare,
  Flag,
  Star,
  Calendar,
  Send,
  X,
  RefreshCw,
  Shield,
} from "lucide-react-native";
import { COLORS } from "../../theme/colors";
import { SPACING } from "../../theme/spacing";
import { FONT_SIZE } from "../../theme/typography";
import * as Animatable from "react-native-animatable";
import { getApiUrl, ENDPOINTS } from "../../config/apiConfig";
import { useAuth } from "../../context/AuthContext";
import { getAllReviews, updateReview } from "../../services/ReviewService";

const ReviewManagementScreen = ({ navigation }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [replyText, setReplyText] = useState("");
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { user } = useAuth();

  // Charger les avis du prestataire au chargement
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await getAllReviews();
      setReviews(data);
    } catch (error) {
      console.error("Erreur de chargement des avis:", error);
    } finally {
      setLoading(false);
    }
  };
  const approveReview = async (review) => {
    try {
      await updateReview(review.id, {
        placeId: review.placeId,
        userId: review.userId,
        rating: review.rating,
        comment: review.comment,
        status: "approved",
      });
      setReviews(
        reviews.map((r) =>
          r.id === review.id ? { ...r, status: "approved" } : r
        )
      );
      fetchReviews();
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'approuver cet avis.");
    }
  };

  const cancelReview = async (review) => {
    try {
      await updateReview(review.id, {
        placeId: review.placeId,
        userId: review.userId,
        rating: review.rating,
        comment: review.comment,
        status: "canceled",
      });
      setReviews(
        reviews.map((r) =>
          r.id === review.id ? { ...r, status: "approved" } : r
        )
      );
      fetchReviews();
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'approuver cet avis.");
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReviews();
  };

  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          size={16}
          color={i < rating ? "#FFC107" : COLORS.gray_light}
          fill={i < rating ? "#FFC107" : "none"}
        />
      ));
  };

  const handleReply = (review) => {
    setSelectedReview(review);
    setReplyText(review.reply || "");
    setReplyModalVisible(true);
  };

  const submitReply = async () => {
    if (!replyText.trim() || !selectedReview) return;

    try {
      setSubmitting(true);

      // Préparer les données de la réponse
      const replyData = {
        reply: replyText,
      };

      // Envoyer la réponse à l'API (endpoint à adapter selon votre API)
      const response = await fetch(
        getApiUrl(`${ENDPOINTS.REVIEWS}/${selectedReview.id}/reply`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(user && user.token
              ? { Authorization: `Bearer ${user.token}` }
              : {}),
          },
          body: JSON.stringify(replyData),
        }
      );

      if (!response.ok) {
        // Si l'API ne prend pas en charge les réponses, nous pouvons simuler
        // en mettant à jour l'interface utilisateur localement
        console.warn("API response error or not supported:", response.status);
      }

      // Mettre à jour l'état local
      setReviews(
        reviews.map((review) =>
          review.id === selectedReview.id
            ? { ...review, replied: true, reply: replyText }
            : review
        )
      );

      Alert.alert("Succès", "Votre réponse a été enregistrée avec succès.");

      setReplyModalVisible(false);
      setReplyText("");
    } catch (err) {
      console.error("Error submitting reply:", err);
      Alert.alert(
        "Erreur",
        "Une erreur est survenue lors de l'enregistrement de votre réponse. Veuillez réessayer."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReport = (review) => {
    setSelectedReview(review);
    setReportModalVisible(true);
  };

  const submitReport = async () => {
    if (!reportReason.trim() || !selectedReview) return;

    try {
      setSubmitting(true);

      // Préparer les données du signalement
      const reportData = {
        reason: reportReason,
      };

      // Envoyer le signalement à l'API (endpoint à adapter selon votre API)
      const response = await fetch(
        getApiUrl(`${ENDPOINTS.REVIEWS}/${selectedReview.id}/report`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(user && user.token
              ? { Authorization: `Bearer ${user.token}` }
              : {}),
          },
          body: JSON.stringify(reportData),
        }
      );

      if (!response.ok) {
        // Si l'API ne prend pas en charge les signalements, nous pouvons simuler
        // en mettant à jour l'interface utilisateur localement
        console.warn(
          "API report endpoint error or not supported:",
          response.status
        );
      }

      // Mettre à jour l'état local
      setReviews(
        reviews.map((review) =>
          review.id === selectedReview.id
            ? { ...review, reported: true }
            : review
        )
      );

      Alert.alert("Succès", "L'avis a été signalé avec succès.");

      setReportModalVisible(false);
      setReportReason("");
    } catch (err) {
      console.error("Error submitting report:", err);
      Alert.alert(
        "Erreur",
        "Une erreur est survenue lors du signalement de l'avis. Veuillez réessayer."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Formate une date pour l'affichage
   * @param {string} dateString - Date au format ISO
   * @returns {string} - Date formatée
   */
  const formatDate = (dateString) => {
    if (!dateString) return "";

    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  /**
   * Formate le nom complet d'un utilisateur
   * @param {Object} review - L'avis contenant les infos utilisateur
   * @returns {string} - Nom complet formaté
   */
  const formatUserName = (review) => {
    if (review.firstName && review.lastName) {
      return `${review.firstName} ${review.lastName}`;
    } else if (review.userName) {
      return review.userName;
    } else if (review.user && review.user.name) {
      return review.user.name;
    } else {
      return "Utilisateur";
    }
  };

  const renderReviewItem = ({ item }) => (
    <Animatable.View
      animation="fadeIn"
      duration={500}
      style={styles.reviewCard}
    >
      <View style={styles.reviewHeader}>
        <View style={styles.userInfo}>
          <User size={18} color={COLORS.primary} />
          <Text style={styles.userName}>{formatUserName(item)}</Text>
        </View>
        <View style={styles.dateContainer}>
          <Calendar size={14} color={COLORS.gray} />
          <Text style={styles.dateText}>
            {formatDate(item.createdAt || item.date)}
          </Text>
        </View>
      </View>

      <View style={styles.placeInfo}>
        <Text style={styles.placeName}>{item.placeName || "Lieu"}</Text>
      </View>

      <View style={styles.ratingContainer}>
        <View style={styles.stars}>{renderStars(item.rating)}</View>
      </View>

      <Text style={styles.commentText}>{item.comment}</Text>

      {item.replied && item.reply && (
        <View style={styles.replyContainer}>
          <Text style={styles.replyLabel}>Votre réponse:</Text>
          <Text style={styles.replyText}>{item.reply}</Text>
        </View>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.replyButton,
            item.status === "approved" && styles.disabledButton,
          ]}
          onPress={() => approveReview(item)}
          disabled={item.status === "approved"}
        >
          <Shield size={18} color={COLORS.white} />
          <Text style={styles.actionButtonText}>Approuver</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.reportButton,
            item.status === "canceled" && styles.disabledButton,
          ]}
          onPress={() => cancelReview(item)}
          disabled={item.status === "canceled"}
        >
          <Flag size={18} color={COLORS.white} />
          <Text style={styles.actionButtonText}>Annuler</Text>
        </TouchableOpacity>
      </View>
    </Animatable.View>
  );

  // Calculer les statistiques
  const averageRating = reviews.filter((r) => r.status == "canceled").length;

  const repliedCount = reviews.filter((r) => r.status == "approved").length;

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
        <Text style={styles.title}>Gestion des avis</Text>
        <Text style={styles.subtitle}>Répondez aux avis de vos clients</Text>
      </Animatable.View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{reviews.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{averageRating}</Text>
          <Text style={styles.statLabel}>Annulées</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{repliedCount}</Text>
          <Text style={styles.statLabel}>Approuver</Text>
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Chargement des avis...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MessageSquare size={48} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchReviews}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderReviewItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MessageSquare size={48} color={COLORS.gray_light} />
              <Text style={styles.emptyText}>
                Aucun avis pour le moment. Les avis de vos clients apparaîtront
                ici.
              </Text>
            </View>
          }
        />
      )}

      {/* Reply Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={replyModalVisible}
        onRequestClose={() => setReplyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View
            animation="fadeInUp"
            duration={300}
            style={styles.modalContainer}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Répondre à l'avis</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setReplyModalVisible(false)}
              >
                <X size={24} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            {selectedReview && (
              <View style={styles.selectedReview}>
                <Text style={styles.selectedReviewName}>
                  {selectedReview.userName ||
                    selectedReview.user?.name ||
                    "Utilisateur"}
                </Text>
                <View style={styles.selectedReviewRating}>
                  {renderStars(selectedReview.rating)}
                </View>
                <Text style={styles.selectedReviewComment}>
                  {selectedReview.comment}
                </Text>
              </View>
            )}

            <TextInput
              style={styles.replyInput}
              placeholder="Écrivez votre réponse..."
              multiline
              value={replyText}
              onChangeText={setReplyText}
              editable={!submitting}
            />

            <TouchableOpacity
              style={[
                styles.submitButton,
                (submitting || !replyText.trim()) && styles.disabledButton,
              ]}
              onPress={submitReply}
              disabled={submitting || !replyText.trim()}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <>
                  <Send size={20} color={COLORS.white} />
                  <Text style={styles.submitButtonText}>Envoyer</Text>
                </>
              )}
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </Modal>

      {/* Report Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={reportModalVisible}
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View
            animation="fadeInUp"
            duration={300}
            style={styles.modalContainer}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Signaler l'avis</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setReportModalVisible(false)}
              >
                <X size={24} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            {selectedReview && (
              <View style={styles.selectedReview}>
                <Text style={styles.selectedReviewName}>
                  {selectedReview.userName ||
                    selectedReview.user?.name ||
                    "Utilisateur"}
                </Text>
                <Text style={styles.selectedReviewComment}>
                  {selectedReview.comment}
                </Text>
              </View>
            )}

            <Text style={styles.reasonLabel}>Motif du signalement:</Text>

            <TextInput
              style={styles.replyInput}
              placeholder="Précisez le motif du signalement..."
              multiline
              value={reportReason}
              onChangeText={setReportReason}
              editable={!submitting}
            />

            <TouchableOpacity
              style={[
                styles.submitButton,
                styles.reportSubmitButton,
                (submitting || !reportReason.trim()) && styles.disabledButton,
              ]}
              onPress={submitReport}
              disabled={submitting || !reportReason.trim()}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <>
                  <Flag size={20} color={COLORS.white} />
                  <Text style={styles.submitButtonText}>Signaler</Text>
                </>
              )}
            </TouchableOpacity>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.gray,
    fontSize: FONT_SIZE.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  errorText: {
    marginTop: SPACING.md,
    color: COLORS.error,
    fontSize: FONT_SIZE.md,
    textAlign: "center",
  },
  retryButton: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: SPACING.md,
    color: COLORS.gray,
    fontSize: FONT_SIZE.md,
    textAlign: "center",
  },
  listContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  reviewCard: {
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
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  userName: {
    fontSize: FONT_SIZE.md,
    fontWeight: "bold",
    marginLeft: SPACING.xs,
    color: COLORS.primary,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray,
    marginLeft: 4,
  },
  placeInfo: {
    backgroundColor: COLORS.light_gray,
    padding: SPACING.xs,
    borderRadius: 4,
    marginBottom: SPACING.sm,
  },
  placeName: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary_dark,
    fontWeight: "bold",
  },
  ratingContainer: {
    marginBottom: SPACING.sm,
  },
  stars: {
    flexDirection: "row",
  },
  commentText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.black,
    marginBottom: SPACING.md,
  },
  replyContainer: {
    backgroundColor: COLORS.light_gray,
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  replyLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 4,
  },
  replyText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.black,
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
    paddingHorizontal: SPACING.md,
    flex: 1,
    marginHorizontal: 4,
  },
  replyButton: {
    backgroundColor: COLORS.info,
  },
  reportButton: {
    backgroundColor: COLORS.warning,
  },
  actionButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
    marginLeft: 4,
  },
  reportedBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255, 68, 68, 0.1)",
    borderRadius: 16,
  },
  reportedText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.error,
    marginLeft: 4,
    fontWeight: "bold",
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
    maxHeight: "80%",
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
  selectedReview: {
    backgroundColor: COLORS.light_gray,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  selectedReviewName: {
    fontSize: FONT_SIZE.md,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 4,
  },
  selectedReviewRating: {
    flexDirection: "row",
    marginBottom: 8,
  },
  selectedReviewComment: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.black,
  },
  reasonLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  replyInput: {
    backgroundColor: COLORS.light_gray,
    borderRadius: 12,
    padding: SPACING.md,
    maxHeight: 150,
    textAlignVertical: "top",
    minHeight: 100,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  reportSubmitButton: {
    backgroundColor: COLORS.error,
  },
  disabledButton: {
    backgroundColor: COLORS.gray_light,
  },
  submitButtonText: {
    color: COLORS.white,
    fontWeight: "bold",
    fontSize: FONT_SIZE.md,
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default ReviewManagementScreen;
