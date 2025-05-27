import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import * as Icons from "lucide-react-native";
import { COLORS } from "../theme/colors";
import { SPACING } from "../theme/spacing";
import { FONT_SIZE, FONT_WEIGHT } from "../theme/typography";
import MessagingService from "../services/MessagingService";
import { useAuth } from "../context/AuthContext";

const ConversationsListScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      loadConversations();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadConversations = async () => {
    try {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const response = await MessagingService.listConversations(user.id);
      console.log(response);
      if (response?.data && Array.isArray(response.data)) {
        setConversations(response.data);
      } else {
        setConversations([]);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
      Alert.alert(
        t("conversations.error"),
        t(
          "conversations.loadError",
          "Impossible de charger les conversations. Veuillez réessayer plus tard."
        )
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  const handleConversationPress = (conversation) => {
    const otherUserId =
      conversation.userId1 === user.id
        ? conversation.userId2
        : conversation.userId1;
    const otherUserName =
      conversation.userId1 === user.id
        ? `${conversation.user2FirstName} ${conversation.user2LastName}`
        : `${conversation.user1FirstName} ${conversation.user1LastName}`;

    navigation.navigate("Conversation", {
      recipientId: otherUserId,
      recipientName: otherUserName,
      placeName: conversation.placeName,
    });
  };

  const renderConversationItem = ({ item }) => {
    const isUserSender = item.lastMessageSenderId === user?.id;
    const otherUserName =
      item.userId1 === user?.id
        ? `${item.user2FirstName} ${item.user2LastName}`
        : `${item.user1FirstName} ${item.user1LastName}`;

    const lastMessageTime = new Date(item.lastMessageDate);
    const now = new Date();
    const diffDays = Math.floor(
      (now - lastMessageTime) / (1000 * 60 * 60 * 24)
    );

    let formattedTime;
    if (diffDays === 0) {
      // Today - show time
      formattedTime = lastMessageTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      // Yesterday
      formattedTime = t("conversations.yesterday", "Hier");
    } else if (diffDays < 7) {
      // This week - show day name
      const options = { weekday: "long" };
      formattedTime = lastMessageTime.toLocaleDateString(undefined, options);
    } else {
      // More than a week ago - show date
      formattedTime = lastMessageTime.toLocaleDateString();
    }

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => handleConversationPress(item)}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {otherUserName.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.userName}>{otherUserName}</Text>
            <Text style={styles.timeText}>{formattedTime}</Text>
          </View>

          <View style={styles.lastMessageContainer}>
            {isUserSender && (
              <Text style={styles.senderPrefix}>
                {t("conversations.you", "Vous")}:{" "}
              </Text>
            )}
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessageContent}
            </Text>
          </View>

          {item.placeName && (
            <Text style={styles.placeName}>{item.placeName}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "right", "left"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {t("conversations.title", "Mes conversations")}
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>
            {t("conversations.loading", "Chargement des conversations...")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "right", "left"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icons.ArrowLeft size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {t("conversations.title", "Mes conversations")}
        </Text>
      </View>

      {conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icons.MessageCircle size={60} color={COLORS.light_gray} />
          <Text style={styles.emptyText}>
            {t(
              "conversations.noConversations",
              "Vous n'avez pas encore de conversations"
            )}
          </Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => navigation.navigate("Map")}
          >
            <Text style={styles.exploreButtonText}>
              {t("conversations.explore", "Explorer les lieux")}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
        />
      )}
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
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  backButton: {
    padding: SPACING.xs,
  },

  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
    textAlign: "center",
    marginLeft: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.gray,
    fontSize: FONT_SIZE.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  emptyText: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
    color: COLORS.gray,
    fontSize: FONT_SIZE.md,
    textAlign: "center",
  },
  exploreButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 25,
  },
  exploreButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },
  listContent: {
    padding: SPACING.md,
  },
  conversationItem: {
    flexDirection: "row",
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  avatarContainer: {
    marginRight: SPACING.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xxs,
  },
  userName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.black,
  },
  timeText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray,
  },
  lastMessageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  senderPrefix: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray,
    fontWeight: FONT_WEIGHT.medium,
  },
  lastMessage: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray,
    flex: 1,
  },
  placeName: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.primary,
    marginTop: SPACING.xxs,
  },
});

export default ConversationsListScreen;
