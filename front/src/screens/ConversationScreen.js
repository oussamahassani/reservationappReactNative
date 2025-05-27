import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import * as Icons from "lucide-react-native";
import { COLORS } from "../theme/colors";
import { SPACING } from "../theme/spacing";
import { FONT_SIZE, FONT_WEIGHT } from "../theme/typography";
import MessagingService from "../services/MessagingService";
import { useAuth } from "../context/AuthContext";

const ConversationScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { recipientId, recipientName, placeId, placeName } = route.params || {};
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);
  const { user } = useAuth();

  const currentUserId = user?.id;

  useEffect(() => {
    if (!currentUserId || !recipientId) {
      setLoading(false);
      return;
    }

    loadConversation();
  }, [currentUserId, recipientId]);

  const loadConversation = async () => {
    try {
      setLoading(true);

      if (!currentUserId || !recipientId) {
        throw new Error("User IDs not available");
      }

      const response = await MessagingService.getConversation(
        currentUserId,
        recipientId
      );

      const messages = response?.data?.messages;

      if (Array.isArray(messages)) {
        const formattedMessages = messages
          .map((msg) => ({
            id: msg.id.toString(),
            text: msg.content,
            sender: msg.senderId === currentUserId ? "user" : "recipient",
            timestamp: new Date(msg.createdAt),
          }))
          .sort((a, b) => a.timestamp - b.timestamp); // Ensure messages are sorted chronologically

        setMessages(formattedMessages);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to load conversation:", error);
      Alert.alert(
        t("conversation.error"),
        t(
          "conversation.loadError",
          "Impossible de charger la conversation. Veuillez réessayer plus tard."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !currentUserId || !recipientId) return;

    const messageContent = message.trim();
    setMessage("");

    // Add optimistic message to state
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      text: messageContent,
      sender: "user",
      timestamp: new Date(),
      pending: true,
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    // Scroll to the bottom after sending a message
    setTimeout(() => {
      flatListRef.current?.scrollToEnd();
    }, 100);

    try {
      setSending(true);

      // Call API to send message
      const result = await MessagingService.sendMessage(
        currentUserId,
        recipientId,
        messageContent
      );

      // Update the temporary message with the real one from server
      if (result && result.message) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === optimisticMessage.id
              ? {
                  id: result.message.id.toString(),
                  text: result.message.content,
                  sender: "user",
                  timestamp: new Date(result.message.createdAt),
                  pending: false,
                }
              : msg
          )
        );
      }

      console.log("Message sent successfully:", result);
    } catch (error) {
      console.error("Error sending message:", error);

      // Mark the optimistic message as failed
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === optimisticMessage.id
            ? { ...msg, failed: true, pending: false }
            : msg
        )
      );

      Alert.alert(
        t("conversation.error"),
        t(
          "conversation.sendError",
          "Impossible d'envoyer le message. Veuillez réessayer."
        )
      );
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === "user" ? styles.userMessage : styles.recipientMessage,
        item.pending && styles.pendingMessage,
        item.failed && styles.failedMessage,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          item.sender === "user"
            ? styles.userMessageText
            : styles.recipientMessageText,
        ]}
      >
        {item.text}
      </Text>
      <View style={styles.messageFooter}>
        {item.pending && (
          <Icons.Clock
            size={14}
            color={item.sender === "user" ? COLORS.light_gray : COLORS.gray}
            style={styles.statusIcon}
          />
        )}
        {item.failed && (
          <Icons.AlertCircle
            size={14}
            color={COLORS.error}
            style={styles.statusIcon}
          />
        )}
        <Text
          style={[
            styles.timestamp,
            item.sender === "user"
              ? styles.userTimestamp
              : styles.recipientTimestamp,
          ]}
        >
          {item.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "right", "left"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icons.ArrowLeft size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.recipientName}>{recipientName}</Text>
          {placeName && <Text style={styles.placeName}>{placeName}</Text>}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>
            {t("conversation.loading", "Chargement de la conversation...")}
          </Text>
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icons.MessageCircle size={60} color={COLORS.light_gray} />
              <Text style={styles.emptyText}>
                {t(
                  "conversation.noMessages",
                  "Aucun message. Commencez la conversation!"
                )}
              </Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messagesList}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
              onLayout={() => flatListRef.current?.scrollToEnd()}
            />
          )}

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={message}
              onChangeText={setMessage}
              placeholder={t(
                "conversation.messagePlaceholder",
                "Écrivez votre message..."
              )}
              placeholderTextColor={COLORS.gray}
              multiline
              maxHeight={100}
              editable={!sending}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!message.trim() || sending) && styles.sendButtonDisabled,
              ]}
              onPress={sendMessage}
              disabled={!message.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Icons.Send
                  size={20}
                  color={message.trim() ? COLORS.white : COLORS.gray}
                />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
  headerTextContainer: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  recipientName: {
    color: COLORS.white,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
  },
  placeName: {
    color: COLORS.white,
    fontSize: FONT_SIZE.sm,
    opacity: 0.8,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
  },
  emptyText: {
    marginTop: SPACING.md,
    color: COLORS.gray,
    fontSize: FONT_SIZE.md,
    textAlign: "center",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesList: {
    padding: SPACING.md,
    flexGrow: 1,
  },
  messageContainer: {
    maxWidth: "80%",
    marginVertical: SPACING.xs,
    padding: SPACING.sm,
    borderRadius: 12,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  recipientMessage: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.light_gray,
    borderBottomLeftRadius: 4,
  },
  pendingMessage: {
    opacity: 0.7,
  },
  failedMessage: {
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  messageText: {
    fontSize: FONT_SIZE.md,
    lineHeight: 20,
  },
  userMessageText: {
    color: COLORS.white,
  },
  recipientMessageText: {
    color: COLORS.black,
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: SPACING.xxs,
  },
  statusIcon: {
    marginRight: SPACING.xs,
  },
  timestamp: {
    fontSize: FONT_SIZE.xs,
    opacity: 0.8,
  },
  userTimestamp: {
    color: COLORS.light_gray,
  },
  recipientTimestamp: {
    color: COLORS.gray,
  },
  inputContainer: {
    flexDirection: "row",
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
    backgroundColor: COLORS.white,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.light_gray,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === "ios" ? SPACING.sm : SPACING.xs,
    fontSize: FONT_SIZE.md,
    maxHeight: 100,
    marginRight: SPACING.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.light_gray,
  },
});

export default ConversationScreen;
