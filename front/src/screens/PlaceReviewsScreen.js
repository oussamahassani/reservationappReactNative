import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Star,
  User,
  Calendar,
  MessageSquare,
  Send,
  Trash2,
} from "lucide-react-native";
import { COLORS } from "../theme/colors";
import { SPACING } from "../theme/spacing";
import { FONT_SIZE, FONT_WEIGHT } from "../theme/typography";
import * as Animatable from "react-native-animatable";
import { getApiUrl, ENDPOINTS } from "../config/apiConfig";
import { useAuth } from "../context/AuthContext";

/**
 * Écran des avis sur un lieu
 * Permet de consulter et d'ajouter des avis
 * @param {Object} route - Paramètres de route (placeId, placeName)
 * @param {Object} navigation - Objet de navigation
 */
const PlaceReviewsScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { placeId, placeName } = route.params || {};
  const [reviewText, setReviewText] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avgRating, setAvgRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { user } = useAuth();

  // Charger les avis depuis l'API
  useEffect(() => {
    fetchReviews();
  }, [placeId]);

  /**
   * Récupère les avis pour ce lieu depuis l'API
   */
  const fetchReviews = async () => {
    if (!placeId) {
      setError(
        t("placeReviews.errors.missingPlaceId", "Identifiant du lieu manquant")
      );
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        getApiUrl(ENDPOINTS.REVIEWS_BY_PLACE(placeId))
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", JSON.stringify(data, null, 2));

      if (data && data.status === 200) {
        // Handle the new nested structure where reviews are in data.data.reviews
        if (data.data && data.data.reviews) {
          setReviews(Array.isArray(data.data.reviews) ? data.data.reviews : []);

          // Use the provided average rating if available
          if (data.data.averageRating) {
            setAvgRating(parseFloat(data.data.averageRating));
          } else {
            // Calculate average rating as fallback
            const reviewsArray = data.data.reviews;
            if (Array.isArray(reviewsArray) && reviewsArray.length > 0) {
              const totalRating = reviewsArray.reduce(
                (sum, review) => sum + parseFloat(review.rating),
                0
              );
              setAvgRating(totalRating / reviewsArray.length);
            } else {
              setAvgRating(0);
            }
          }
        } else {
          // Fallback to old structure
          const reviewsData = data.data || [];
          setReviews(Array.isArray(reviewsData) ? reviewsData : []);

          // Calculate average rating
          if (Array.isArray(reviewsData) && reviewsData.length > 0) {
            const totalRating = reviewsData.reduce(
              (sum, review) => sum + parseFloat(review.rating),
              0
            );
            setAvgRating(totalRating / reviewsData.length);
          } else {
            setAvgRating(0);
          }
        }
      } else {
        setError(
          t("placeReviews.errors.loadFailed", "Échec du chargement des avis")
        );
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError(
        t("placeReviews.errors.loadFailed", "Échec du chargement des avis")
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Gère la sélection d'une note
   * @param {number} rating - La note sélectionnée (1-5)
   */
  const handleRatingPress = (rating) => {
    setUserRating(rating);
  };

  /**
   * Soumet un nouvel avis
   */
  const handleSubmitReview = async () => {
    if (reviewText.trim() === "" || userRating === 0) {
      Alert.alert(
        t("placeReviews.errors.validationTitle", "Validation"),
        t(
          "placeReviews.errors.validationMessage",
          "Veuillez entrer un commentaire et une note"
        )
      );
      return;
    }

    if (!user || !user.id) {
      Alert.alert(
        t("placeReviews.errors.authTitle", "Authentification requise"),
        t(
          "placeReviews.errors.authMessage",
          "Vous devez être connecté pour laisser un avis"
        ),
        [
          {
            text: t("placeReviews.login", "Se connecter"),
            onPress: () => navigation.navigate("Login"),
          },
          {
            text: t("common.cancel", "Annuler"),
            style: "cancel",
          },
        ]
      );
      return;
    }

    try {
      setSubmitting(true);

      // Préparer les données de l'avis
      const reviewData = {
        placeId: placeId,
        rating: userRating,
        comment: reviewText,
      };

      // Si l'utilisateur est connecté, l'API prendra l'ID utilisateur depuis le token
      // Sinon, on peut ajouter l'ID utilisateur ici si disponible
      if (user && user.id) {
        reviewData.userId = user.id;
      }

      // Envoyer l'avis à l'API
      const response = await fetch(getApiUrl(ENDPOINTS.ADD_REVIEW), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Ajouter le token d'authentification si disponible
          ...(user && user.token
            ? { Authorization: `Bearer ${user.token}` }
            : {}),
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.status === 201) {
        // Réinitialiser le formulaire
        setReviewText("");
        setUserRating(0);

        // Rafraîchir la liste des avis
        fetchReviews();

        Alert.alert(
          t("placeReviews.success.title", "Succès"),
          t(
            "placeReviews.success.message",
            "Votre avis a été publié avec succès!"
          )
        );
      } else {
        throw new Error("Échec de la publication");
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      Alert.alert(
        t("placeReviews.errors.submitTitle", "Erreur"),
        t(
          "placeReviews.errors.submitMessage",
          "Une erreur est survenue lors de la publication de votre avis. Veuillez réessayer."
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Supprime un avis
   * @param {number} reviewId - L'ID de l'avis à supprimer
   */
  const handleDeleteReview = async (reviewId) => {
    if (!user || !user.id) {
      Alert.alert(
        t("placeReviews.errors.authTitle", "Authentification requise"),
        t(
          "placeReviews.errors.authMessage",
          "Vous devez être connecté pour supprimer un avis"
        )
      );
      return;
    }

    Alert.alert(
      t("placeReviews.deleteConfirm.title", "Confirmation"),
      t(
        "placeReviews.deleteConfirm.message",
        "Êtes-vous sûr de vouloir supprimer cet avis ?"
      ),
      [
        {
          text: t("common.cancel", "Annuler"),
          style: "cancel",
        },
        {
          text: t("common.confirm", "Confirmer"),
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);
              console.log(user);
              const response = await fetch(
                getApiUrl(ENDPOINTS.DELETE_REVIEW(reviewId)),
                {
                  method: "DELETE",
                  // headers: {
                  //   ...(user && user.token
                  //     ? { Authorization: `Bearer ${user.token}` }
                  //     : {}),
                  // },
                }
              );

              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              // Rafraîchir la liste des avis
              fetchReviews();

              Alert.alert(
                t("placeReviews.deleteSuccess.title", "Succès"),
                t(
                  "placeReviews.deleteSuccess.message",
                  "Votre avis a été supprimé avec succès!"
                )
              );
            } catch (err) {
              console.error("Error deleting review:", err);
              Alert.alert(
                t("placeReviews.errors.deleteTitle", "Erreur"),
                t(
                  "placeReviews.errors.deleteMessage",
                  "Une erreur est survenue lors de la suppression de votre avis. Veuillez réessayer."
                )
              );
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  /**
   * Formate une date pour l'affichage
   * @param {string} dateString - Date au format ISO
   * @returns {string} - Date formatée
   */
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  /**
   * Vérifie si l'utilisateur actuel est l'auteur de l'avis
   * @param {Object} review - L'avis à vérifier
   * @returns {boolean} - Vrai si l'utilisateur actuel est l'auteur
   */
  const isReviewOwner = (review) => {
    return user && user.id && review.userId === user.id;
  };

  /**
   * Rend les étoiles pour la notation
   * @param {number} rating - Note (1-5)
   * @param {boolean} interactive - Si les étoiles sont cliquables
   * @returns {JSX.Element[]} - Composants étoiles
   */
  const renderStars = (rating, interactive = false) => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <TouchableOpacity
          key={index}
          onPress={interactive ? () => handleRatingPress(index + 1) : undefined}
          style={styles.starContainer}
          activeOpacity={interactive ? 0.7 : 1}
        >
          <Star
            size={interactive ? 32 : 16}
            color={index < rating ? COLORS.highlight : COLORS.gray_light}
            fill={index < rating ? COLORS.highlight : "none"}
          />
        </TouchableOpacity>
      ));
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
      return t("placeReviews.anonymousUser", "Utilisateur");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "right", "left"]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* En-tête */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft color={COLORS.white} size={24} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>
            {t("placeReviews.title", "Avis")}
            {avgRating > 0 && (
              <Text style={styles.ratingText}> ({avgRating.toFixed(1)}★)</Text>
            )}
          </Text>
          <Text style={styles.subtitle}>
            {placeName || t("placeReviews.place", "Lieu")}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidView}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Section d'ajout d'avis */}
          <Animatable.View
            animation="fadeIn"
            duration={800}
            style={styles.addReviewSection}
          >
            <Text style={styles.sectionTitle}>
              {t("placeReviews.leaveReview", "Laissez votre avis")}
            </Text>

            {/* Sélecteur de notation */}
            <View style={styles.ratingSelector}>
              {renderStars(userRating, true)}
            </View>

            {/* Champ de saisie du commentaire */}
            <View style={styles.reviewInputContainer}>
              <TextInput
                style={styles.reviewInput}
                placeholder={t(
                  "placeReviews.writeReview",
                  "Écrivez votre avis ici..."
                )}
                multiline
                value={reviewText}
                onChangeText={setReviewText}
                placeholderTextColor={COLORS.gray}
                editable={!submitting}
              />

              {/* Bouton d'envoi */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (reviewText.trim() === "" ||
                    userRating === 0 ||
                    submitting) &&
                    styles.submitButtonDisabled,
                ]}
                onPress={handleSubmitReview}
                disabled={
                  reviewText.trim() === "" || userRating === 0 || submitting
                }
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Send size={20} color={COLORS.white} />
                )}
              </TouchableOpacity>
            </View>
          </Animatable.View>

          {/* Liste des avis */}
          <View style={styles.reviewsListSection}>
            <Text style={styles.sectionTitle}>
              {t("placeReviews.allReviews", "Tous les avis")}
              <Text style={styles.reviewCount}> ({reviews.length})</Text>
            </Text>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>
                  {t("placeReviews.loading", "Chargement des avis...")}
                </Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <MessageSquare size={48} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={fetchReviews}
                >
                  <Text style={styles.retryButtonText}>
                    {t("common.retry", "Réessayer")}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : /* Affichage de tous les avis */
            Array.isArray(reviews) && reviews.length > 0 ? (
              reviews.map((review, index) => (
                <Animatable.View
                  key={review.id || index}
                  animation="fadeInUp"
                  delay={index * 100}
                  style={styles.reviewCard}
                >
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewerInfo}>
                      <View style={styles.reviewerAvatar}>
                        <User size={16} color={COLORS.white} />
                      </View>
                      <Text style={styles.reviewerName}>
                        {formatUserName(review)}
                      </Text>
                    </View>

                    <View style={styles.reviewDate}>
                      <Calendar size={12} color={COLORS.gray} />
                      <Text style={styles.dateText}>
                        {formatDate(review.createdAt || review.date)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.reviewRating}>
                    {renderStars(parseFloat(review.rating))}
                  </View>

                  <Text style={styles.reviewText}>{review.comment}</Text>

                  {isReviewOwner(review) && (
                    <View style={styles.reviewActions}>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteReview(review.id)}
                        disabled={deleting}
                      >
                        {deleting ? (
                          <ActivityIndicator
                            size="small"
                            color={COLORS.error}
                          />
                        ) : (
                          <>
                            <Trash2 size={16} color={COLORS.error} />
                            <Text style={styles.deleteButtonText}>
                              {t("placeReviews.deleteReview", "Supprimer")}
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </Animatable.View>
              ))
            ) : (
              <View style={styles.noReviews}>
                <MessageSquare size={48} color={COLORS.gray_light} />
                <Text style={styles.noReviewsText}>
                  {t(
                    "placeReviews.noReviews",
                    "Pas encore d'avis. Soyez le premier à donner votre avis!"
                  )}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Styles pour l'interface utilisateur
const styles = StyleSheet.create({
  reviewActions: {
    marginTop: SPACING.sm,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
    backgroundColor: "rgba(255, 59, 48, 0.1)",
  },
  deleteButtonText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.error,
    marginLeft: 4,
    fontWeight: FONT_WEIGHT.medium,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    paddingTop: Platform.OS === "android" ? SPACING.xl * 2 : SPACING.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    marginTop: SPACING.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
    marginTop: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.white,
    opacity: 0.8,
    marginTop: 2,
  },
  ratingText: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.white,
    fontWeight: FONT_WEIGHT.bold,
  },
  content: {
    flex: 1,
  },
  addReviewSection: {
    backgroundColor: COLORS.white,
    margin: SPACING.lg,
    borderRadius: 16,
    padding: SPACING.md,
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
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: SPACING.md,
    color: COLORS.black,
  },
  ratingSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
  },
  starContainer: {
    padding: 5,
  },
  reviewInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderWidth: 1,
    borderColor: COLORS.light_gray,
    borderRadius: 12,
  },
  reviewInput: {
    flex: 1,
    minHeight: 80,
    maxHeight: 120,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.black,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    margin: SPACING.sm,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.gray_light,
  },
  reviewsListSection: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  reviewCount: {
    color: COLORS.gray,
    fontWeight: FONT_WEIGHT.normal,
  },
  reviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.light_gray,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  reviewerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  reviewerName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.black,
  },
  reviewDate: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray,
    marginLeft: 4,
  },
  reviewRating: {
    flexDirection: "row",
    marginBottom: SPACING.sm,
  },
  reviewText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray,
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
  },
  loadingText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray,
    marginTop: SPACING.md,
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.error,
    textAlign: "center",
    marginTop: SPACING.md,
  },
  retryButton: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: FONT_WEIGHT.medium,
  },
  noReviews: {
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xl,
  },
  noReviewsText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray,
    textAlign: "center",
    marginTop: SPACING.md,
  },
  bottomPadding: {
    height: 100,
  },
  highlight: {
    color: COLORS.highlight,
  },
});

export default PlaceReviewsScreen;
