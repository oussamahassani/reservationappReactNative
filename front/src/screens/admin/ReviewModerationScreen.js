import React, { useEffect, useState } from "react";
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
  Platform,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { COLORS } from "../../theme/colors";
import { SPACING } from "../../theme/spacing";
import { FONT_SIZE } from "../../theme/typography";
import { boxShadow } from "../../theme/mixins";
import { getAllReviews, updateReview } from "../../services/ReviewService";
import { Calendar, Flag, MessageSquare, User } from "lucide-react-native";

export default function ReviewModerationScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const data = await getAllReviews();
      console.log(data);
      setReviews(data);
    } catch (err) {
      Alert.alert("Erreur", "Impossible de charger les avis.");
    }
  };

  // const filteredReviews = reviews.filter((review) => {
  //   const matchesQuery =
  //     review.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     review.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     review.comment.toLowerCase().includes(searchQuery.toLowerCase());

  //   if (filterStatus === "all") return matchesQuery;
  //   if (filterStatus === "flagged") return matchesQuery && review.flagged;
  //   return matchesQuery && review.status === filterStatus;
  // });

  const handleStatusChange = (id, newStatus) => {
    setReviews(
      reviews.map((review) => {
        if (review.id === id) {
          return {
            ...review,
            status: newStatus,
            flagged: newStatus === "rejected" ? true : review.flagged,
          };
        }
        return review;
      })
    );
  };

  const toggleFlagged = (id) => {
    setReviews(
      reviews.map((review) => {
        if (review.id === id) {
          return { ...review, flagged: !review.flagged };
        }
        return review;
      })
    );
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
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'approuver cet avis.");
    }
  };

  const resetReview = async (id) => {
    try {
      await updateReview(id, { status: "pending" });
      setReviews(
        reviews.map((r) => (r.id === id ? { ...r, status: "pending" } : r))
      );
    } catch (error) {
      Alert.alert("Erreur", "Impossible de réinitialiser cet avis.");
    }
  };
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text
          key={i}
          style={{
            fontSize: FONT_SIZE.sm,
            color: i <= rating ? "#FFC107" : COLORS.gray_light,
          }}
        >
          ★
        </Text>
      );
    }
    return <View style={{ flexDirection: "row" }}>{stars}</View>;
  };
  const formatDate = (dateString) => {
    if (!dateString) return "";

    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  const getReviewStyle = (status, flagged) => {
    if (status === "rejected") return styles.reviewCardRejected;
    if (flagged) return styles.reviewCardFlagged;
    return styles.reviewCard;
  };
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
        {item.status === "pending" ? (
          <>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#E8F5E9" }]}
              onPress={() => approveReview(item)}
            >
              <Text style={[styles.actionButtonText, { color: "#2E7D32" }]}>
                Approuver
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#FFEBEE" }]}
              onPress={() => cancelReview(item)}
            >
              <Text style={[styles.actionButtonText, { color: "#C62828" }]}>
                Annuler
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={[styles.statusBadge, { backgroundColor: "#ECEFF1" }]}>
            <Text style={[styles.statusText, { color: COLORS.primary_dark }]}>
              {item.status === "approved" ? "Approuvé" : "Annulé"}
            </Text>
          </View>
        )}
      </View>
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
        <Text style={styles.headerTitle}>Modération des Avis</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher dans les avis..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterTabs}>
        {["all", "pending", "approved", "canceled"].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterTab,
              filterStatus === status && styles.filterTabActive,
            ]}
            onPress={() => setFilterStatus(status)}
          >
            <Text
              style={[
                styles.filterTabText,
                filterStatus === status && styles.filterTabTextActive,
              ]}
            >
              {status === "all"
                ? "Tous"
                : status === "pending"
                ? "En attente"
                : status === "approved"
                ? "Approuvés"
                : "Annulés"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {reviews.filter((r) => r.status === "approved").length}
          </Text>
          <Text style={styles.statLabel}>Approuvés</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {reviews.filter((r) => r.status === "pending").length}
          </Text>
          <Text style={styles.statLabel}>En attente</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {reviews.filter((r) => r.flagged).length}
          </Text>
          <Text style={styles.statLabel}>Signalés</Text>
        </View>
      </View>

      <FlatList
        data={reviews.filter((review) => {
          if (filterStatus === "all") return true;
          return review.status === filterStatus;
        })}
        renderItem={renderReviewItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
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
  reviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...boxShadow,
  },
  reviewCardFlagged: {
    backgroundColor: "#FFF8E1",
    borderLeftWidth: 4,
    borderLeftColor: "#FFA000",
  },
  reviewCardRejected: {
    backgroundColor: "#FFEBEE",
    borderLeftWidth: 4,
    borderLeftColor: "#C62828",
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.md,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary_light,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: "bold",
  },
  userName: {
    fontSize: FONT_SIZE.md,
    fontWeight: "bold",
    color: COLORS.primary_dark,
  },
  reviewDate: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray,
  },
  flagContainer: {
    flexDirection: "row",
  },
  flagBadge: {
    backgroundColor: "#FFEBEE",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: 10,
    marginRight: SPACING.sm,
  },
  flagText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: "bold",
    color: "#C62828",
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: 10,
  },
  statusText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: "bold",
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.light_gray,
    borderRadius: 8,
  },
  locationImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  locationName: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary_dark,
    fontWeight: "bold",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  ratingText: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray,
  },
  reviewComment: {
    fontSize: FONT_SIZE.md,
    color: COLORS.black,
    marginBottom: SPACING.md,
    lineHeight: 22,
  },
  reviewActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    marginTop: SPACING.xs,
    marginRight: SPACING.xs,
  },
  actionButtonText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: "bold",
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
});
