import React, { useState, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  SafeAreaView,
  ScrollView,
  Platform,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { COLORS } from '../theme/colors';
import { SPACING } from '../theme/spacing';
import { FONT_SIZE } from '../theme/typography';
import { boxShadow } from '../theme/mixins';
import { useTranslation } from 'react-i18next';
import { User, Mail, Lock, Trash2, LogOut, Phone, UserCircle } from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';
import { useClerkIntegration } from '../utils/clerkAuth';
import { ROUTES } from '../navigation/navigationConstants';

export default function ProfileScreen({ navigation }) {
  // Get the user data and update functions from AuthContext
  const { t } = useTranslation();
  const { user, loading, error, logout, updateUserProfile, updatePassword } = useContext(AuthContext);
  const { logoutFromClerk } = useClerkIntegration();

  // State for handling modals and form inputs
  const [credentialsModalVisible, setCredentialsModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  
  // Email update state
  const [email, setEmail] = useState('');
  
  // Password update state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Profile update state
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  
  // State for local loading indicators
  const [updateLoading, setUpdateLoading] = useState(false);

  const handleUpdateProfile = async () => {
    if (!firstName && !lastName && !phone) {
      Alert.alert('Erreur', 'Veuillez remplir au moins un champ à mettre à jour.');
      return;
    }

    setUpdateLoading(true);
    
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;

    try {
      const success = await updateUserProfile(updateData);
      
      if (success) {
        Alert.alert('Succès', 'Profil mis à jour avec succès !');
        setProfileModalVisible(false);
      } else {
        Alert.alert('Erreur', 'Échec de la mise à jour du profil. Veuillez réessayer.');
      }
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleUpdateCredentials = async () => {
    if (!email) {
      Alert.alert('Erreur', 'Veuillez saisir votre nouvelle adresse e-mail.');
      return;
    }
    
    setUpdateLoading(true);
    
    try {
      const success = await updateUserProfile({ email });
      
      if (success) {
        Alert.alert('Succès', 'Adresse e-mail mise à jour avec succès !');
        setCredentialsModalVisible(false);
      } else {
        Alert.alert('Erreur', 'Échec de la mise à jour de l\'adresse e-mail. Veuillez réessayer.');
      }
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    // Validate password inputs
    if (!currentPassword) {
      setPasswordError('Veuillez saisir votre mot de passe actuel');
      return;
    }
    
    if (!newPassword) {
      setPasswordError('Veuillez saisir un nouveau mot de passe');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Les nouveaux mots de passe ne correspondent pas');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    setUpdateLoading(true);
    setPasswordError('');
    
    try {
      const success = await updatePassword(currentPassword, newPassword);
      
      if (success) {
        Alert.alert('Succès', 'Mot de passe mis à jour avec succès !');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordModalVisible(false);
      } else {
        setPasswordError('Échec de la mise à jour du mot de passe. Veuillez vérifier votre mot de passe actuel et réessayer.');
      }
    } catch (error) {
      setPasswordError(error.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Show loading indicator or disable button if needed
      
      // Use the complete logout function from clerk integration
      await logoutFromClerk();
      
      // Navigate to Login screen using the correct route constant
      navigation.reset({
        index: 0,
        routes: [{ name: ROUTES.LOGIN }],
      });
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert(
        'Logout Error',
        'An error occurred during logout. Please try again.'
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animatable.View 
          animation="fadeInDown" 
          duration={1000} 
          style={styles.header}
        >
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImageWrapper}>
              <UserCircle size={40} color={COLORS.white} />
            </View>
          </View>
          <Text style={styles.title}>{t('profile.title')}</Text>
          <Text style={styles.subtitle}>
            {user ? `${user.firstName} ${user.lastName}` : t('profile.subtitle')}
          </Text>
        </Animatable.View>

        <Animatable.View 
          animation="fadeInUp" 
          duration={1000} 
          delay={300}
          style={styles.content}
        >
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('profile.personalInfo')}</Text>
            <View style={styles.infoRow}>
              <Mail size={18} color={COLORS.gray} />
              <Text style={styles.infoLabel}>{t('profile.email')}:</Text>
              <Text style={styles.infoValue}>{user?.email || 'Not available'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Phone size={18} color={COLORS.gray} />
              <Text style={styles.infoLabel}>{t('profile.phone')}:</Text>
              <Text style={styles.infoValue}>{user?.phone || 'Not available'}</Text>
            </View>
            <View style={styles.infoRow}>
              <User size={18} color={COLORS.gray} />
              <Text style={styles.infoLabel}>{t('profile.role')}:</Text>
              <Text style={styles.infoValue}>{user?.role || 'User'}</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.updateButton}
            onPress={() => {
              setFirstName(user?.firstName || '');
              setLastName(user?.lastName || '');
              setPhone(user?.phone || '');
              setProfileModalVisible(true);
            }}
          >
            <User size={20} color={COLORS.white} />
            <Text style={styles.updateButtonText}>
              {t('profile.updateProfile')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.updateButton}
            onPress={() => {
              setEmail(user?.email || '');
              setCredentialsModalVisible(true);
            }}
          >
            <Mail size={20} color={COLORS.white} />
            <Text style={styles.updateButtonText}>
              {t('profile.updateEmail')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.updateButton}
            onPress={() => {
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
              setPasswordError('');
              setPasswordModalVisible(true);
            }}
          >
            <Lock size={20} color={COLORS.white} />
            <Text style={styles.updateButtonText}>
              {t('profile.updatePassword')}
            </Text>
          </TouchableOpacity>

          <View style={styles.versionContainer}>
            <Text style={styles.versionLabel}>{t('profile.version')}</Text>
            <Text style={styles.versionText}>{t('profile.appVersion')}</Text>
          </View>

          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => {
              Alert.alert(
                t('profile.deleteAccount'),
                t('profile.deleteConfirm'),
                [
                  { text: t('profile.cancel'), style: 'cancel' },
                  { text: t('profile.confirm'), style: 'destructive', onPress: () => {} }
                ]
              );
            }}
          >
            <Trash2 size={20} color={COLORS.error} />
            <Text style={styles.deleteButtonText}>
              {t('profile.deleteAccount')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <LogOut size={20} color={COLORS.white} />
            <Text style={styles.logoutButtonText}>
              {t('profile.logout')}
            </Text>
          </TouchableOpacity>
        </Animatable.View>

        {/* Profile Update Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={profileModalVisible}
          onRequestClose={() => setProfileModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {t('profile.updateProfile')}
              </Text>

              <View style={styles.inputContainer}>
                <User size={20} color={COLORS.gray} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={t('profile.firstName')}
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>

              <View style={styles.inputContainer}>
                <User size={20} color={COLORS.gray} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={t('profile.lastName')}
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>

              <View style={styles.inputContainer}>
                <Phone size={20} color={COLORS.gray} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={t('profile.phone')}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setProfileModalVisible(false)}
                  disabled={updateLoading}
                >
                  <Text style={styles.cancelButtonText}>{t('profile.cancel')}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleUpdateProfile}
                  disabled={updateLoading}
                >
                  {updateLoading ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <Text style={styles.confirmButtonText}>{t('profile.confirm')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Email Update Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={credentialsModalVisible}
          onRequestClose={() => setCredentialsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {t('profile.updateEmail')}
              </Text>

              <View style={styles.inputContainer}>
                <Mail size={20} color={COLORS.gray} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={t('profile.newEmail')}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setCredentialsModalVisible(false)}
                  disabled={updateLoading}
                >
                  <Text style={styles.cancelButtonText}>{t('profile.cancel')}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleUpdateCredentials}
                  disabled={updateLoading}
                >
                  {updateLoading ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <Text style={styles.confirmButtonText}>{t('profile.confirm')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Password Update Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={passwordModalVisible}
          onRequestClose={() => setPasswordModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {t('profile.updatePassword')}
              </Text>

              <View style={styles.inputContainer}>
                <Lock size={20} color={COLORS.gray} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={t('profile.currentPassword')}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                />
              </View>

              <View style={styles.inputContainer}>
                <Lock size={20} color={COLORS.gray} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={t('profile.newPassword')}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
              </View>

              <View style={styles.inputContainer}>
                <Lock size={20} color={COLORS.gray} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={t('profile.confirmPassword')}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>

              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}

              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setPasswordModalVisible(false)}
                  disabled={updateLoading}
                >
                  <Text style={styles.cancelButtonText}>{t('profile.cancel')}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={handleUpdatePassword}
                  disabled={updateLoading}
                >
                  {updateLoading ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <Text style={styles.confirmButtonText}>{t('profile.confirm')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.gray,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.primary,
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
  },
  profileImageContainer: {
    marginBottom: SPACING.md,
  },
  profileImageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary_light,
    justifyContent: 'center',
    alignItems: 'center',
    ...boxShadow,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.white,
    opacity: 0.8,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...boxShadow,
  },
  cardTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  infoLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray,
    marginLeft: SPACING.sm,
    width: 80,
  },
  infoValue: {
    fontSize: FONT_SIZE.md,
    color: COLORS.black,
    flex: 1,
  },
  aboutText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.black,
    lineHeight: 24,
    textAlign: 'justify',
  },
  updateButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    ...boxShadow,
  },
  updateButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
  versionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.sm,
  },
  versionLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray,
  },
  versionText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.black,
    fontWeight: '500',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  deleteButtonText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.md,
    marginLeft: SPACING.sm,
  },
  logoutButton: {
    backgroundColor: COLORS.primary_dark,
    padding: SPACING.md,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: SPACING.lg,
  },
  logoutButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 400,
    ...boxShadow,
  },
  modalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.light_gray,
    borderRadius: 10,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.light_gray,
  },
  inputIcon: {
    padding: SPACING.md,
  },
  input: {
    flex: 1,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  modalButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
  },
  cancelButton: {
    backgroundColor: COLORS.light_gray,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    color: COLORS.gray,
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
  },
});
