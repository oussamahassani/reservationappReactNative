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
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { COLORS } from "../../theme/colors";
import { SPACING } from "../../theme/spacing";
import { FONT_SIZE } from "../../theme/typography";
import { boxShadow } from "../../theme/mixins";
import { API_URL, ENDPOINTS } from "../../config/apiConfig";

export default function UserManagementScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editedUser, setEditedUser] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    role: "user",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}${ENDPOINTS.ALL_USERS}`);

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const result = await response.json();
      setUsers(result.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async () => {
    try {
      const response = await fetch(
        `${API_URL}${ENDPOINTS.USER_BY_ID(selectedUser.id)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: editedUser.firstName,
            lastName: editedUser.lastName,
            phone: editedUser.phone,
            role: editedUser.role,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      setUsers(
        users.map((user) =>
          user.id === selectedUser.id ? { ...user, ...editedUser } : user
        )
      );

      setModalVisible(false);

      Alert.alert("Succès", "Utilisateur mis à jour avec succès");
    } catch (error) {
      console.error("Error updating user:", error);
      Alert.alert("Erreur", error.message);
    }
  };

  const ToggleUserStatus = async (item) => {
    try {
      console.log(item);
      const response = await fetch(
        `${API_URL}${ENDPOINTS.USER_BY_ID(item && item.id)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: item.firstName,
            lastName: item.lastName,
            phone: item.phone,
            role: item.role,
            status: item.status === "active" ? "blocked" : "active",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      setUsers(
        users.map((user) => (user.id === item.id ? { ...user, ...item } : user))
      );

      Alert.alert("Succès", "Utilisateur mis à jour avec succès");
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      Alert.alert("Erreur", error.message);
    }
  };

  const deleteUser = async (id) => {
    Alert.alert(
      "Confirmation",
      "Êtes-vous sûr de vouloir supprimer cet utilisateur ?",
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Supprimer",
          onPress: async () => {
            try {
              const response = await fetch(
                `${API_URL}${ENDPOINTS.USER_BY_ID(id)}`,
                {
                  method: "DELETE",
                }
              );

              if (!response.ok) {
                throw new Error("Failed to delete user");
              }

              setUsers(users.filter((user) => user.id !== id));

              Alert.alert("Succès", "Utilisateur supprimé avec succès");
            } catch (error) {
              console.error("Error deleting user:", error);
              Alert.alert("Erreur", error.message);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const filteredUsers = users.filter(
    (user) =>
      user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditedUser({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phone: user.phone || "",
      email: user.email || "",
      role: user.role || "user",
    });
    setModalVisible(true);
  };

  const renderUserItem = ({ item }) => (
    <Animatable.View animation="fadeIn" duration={500} style={styles.userCard}>
      <View style={styles.userInfo}>
        <View style={styles.userAvatar}>
          <Text style={styles.avatarText}>
            {item.firstName?.charAt(0) || ""}
          </Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{`${item.firstName || ""} ${
            item.lastName || ""
          }`}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          <View style={styles.userMeta}>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    item.status === "active"
                      ? "#E8F5E9"
                      : item.status === "blocked"
                      ? "#FFEBEE"
                      : "#F5F5F5",
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      item.status === "active"
                        ? COLORS.success
                        : item.status === "blocked"
                        ? COLORS.error
                        : COLORS.gray,
                  },
                ]}
              >
                {item.status === "active"
                  ? "Actif"
                  : item.status === "blocked"
                  ? "Bloqué"
                  : "Inactif"}
              </Text>
            </View>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>
                {item.role === "premium" ? "Premium" : "Utilisateur"}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.userActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#FFF9C4" }]}
          onPress={() => handleEditUser(item)}
        >
          <Text style={[styles.actionButtonText, { color: "#FFA000" }]}>
            Modifier
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#1976D2" }]}
          onPress={() => ToggleUserStatus(item)}
        >
          <Text style={[styles.actionButtonText, { color: "#fff" }]}>
            {item.status === "active" ? "Bloquer" : "debloquer"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#FFEBEE" }]}
          onPress={() => deleteUser(item.id)}
        >
          <Text style={[styles.actionButtonText, { color: COLORS.error }]}>
            Supprimer
          </Text>
        </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Gestion Utilisateurs</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un utilisateur..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {users.filter((u) => u.status === "active").length}
          </Text>
          <Text style={styles.statLabel}>Actifs</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {users.filter((u) => u.status === "blocked").length}
          </Text>
          <Text style={styles.statLabel}>Bloqués</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {users.filter((u) => u.role === "premium").length}
          </Text>
          <Text style={styles.statLabel}>Premium</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Chargement des utilisateurs...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Erreur: {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchUsers}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucun utilisateur trouvé</Text>
            </View>
          )}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Modifier l'utilisateur</Text>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Prénom</Text>
              <TextInput
                style={styles.modalInput}
                value={editedUser.firstName}
                onChangeText={(text) =>
                  setEditedUser({ ...editedUser, firstName: text })
                }
                placeholder="Prénom"
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Nom</Text>
              <TextInput
                style={styles.modalInput}
                value={editedUser.lastName}
                onChangeText={(text) =>
                  setEditedUser({ ...editedUser, lastName: text })
                }
                placeholder="Nom"
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Téléphone</Text>
              <TextInput
                style={styles.modalInput}
                value={editedUser.phone}
                onChangeText={(text) =>
                  setEditedUser({ ...editedUser, phone: text })
                }
                placeholder="Téléphone"
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: "#f0f0f0" }]}
                value={editedUser.email}
                editable={false}
                placeholder="Email"
              />
              <Text style={styles.fieldHint}>
                L'email ne peut pas être modifié
              </Text>
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>Rôle</Text>
              <View style={styles.radioContainer}>
                {["user", "admin", "provider"].map((roleOption) => (
                  <TouchableOpacity
                    key={roleOption}
                    style={[
                      styles.radioOption,
                      editedUser.role === roleOption && styles.radioSelected,
                    ]}
                    onPress={() =>
                      setEditedUser({
                        ...editedUser,
                        role: roleOption,
                      })
                    }
                  >
                    <Text style={styles.radioText}>
                      {roleOption === "user"
                        ? "Utilisateur"
                        : roleOption === "admin"
                        ? "Administrateur"
                        : "Prestataire"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={updateUser}
              >
                <Text style={[styles.buttonText, { color: COLORS.white }]}>
                  Enregistrer
                </Text>
              </TouchableOpacity>
            </View>
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
  statsRow: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light_gray,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: SPACING.sm,
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
  userCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...boxShadow,
  },
  userInfo: {
    flexDirection: "row",
    marginBottom: SPACING.md,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary_light,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.lg,
    fontWeight: "bold",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: FONT_SIZE.md,
    fontWeight: "bold",
    color: COLORS.primary_dark,
  },
  userEmail: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray,
    marginBottom: SPACING.xs,
  },
  userMeta: {
    flexDirection: "row",
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: 10,
    marginRight: SPACING.sm,
  },
  statusText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: "bold",
  },
  roleBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: 10,
  },
  roleText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: "bold",
    color: "#1976D2",
  },
  userActions: {
    flexDirection: "row",
    justifyContent: "space-between",
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

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  loadingText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray,
    marginTop: SPACING.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.error,
    marginBottom: SPACING.md,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: "bold",
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray,
  },

  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: SPACING.lg,
    width: "90%",
    maxHeight: "80%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: SPACING.lg,
    textAlign: "center",
  },
  formField: {
    marginBottom: SPACING.md,
  },
  fieldLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: "bold",
    color: COLORS.gray,
    marginBottom: SPACING.xs,
  },
  fieldHint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray,
    marginTop: 2,
    fontStyle: "italic",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.light_gray,
    borderRadius: 8,
    padding: SPACING.sm,
    fontSize: FONT_SIZE.md,
  },
  radioContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  radioOption: {
    borderWidth: 1,
    borderColor: COLORS.light_gray,
    borderRadius: 8,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  radioSelected: {
    backgroundColor: COLORS.primary_light,
    borderColor: COLORS.primary,
  },
  radioText: {
    fontSize: FONT_SIZE.sm,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SPACING.lg,
  },
  button: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: SPACING.xs,
  },
  cancelButton: {
    backgroundColor: COLORS.light_gray,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  buttonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: "bold",
  },
});
