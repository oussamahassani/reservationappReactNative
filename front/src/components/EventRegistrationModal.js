import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  Platform
} from 'react-native';
import { X, Users, Calendar, Clock } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { SPACING } from '../theme/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '../theme/typography';
import CustomButton from './CustomButton';
import { useTranslation } from 'react-i18next';
import { ReservationService } from '../services/ReservationService';

const EventRegistrationModal = ({ visible, onClose, event, onConfirm }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    numberOfTickets: '1',
    specialRequirements: '',
    paymentMethod: 'card'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check availability first
      const availabilityCheck = await ReservationService.checkAvailability({
        entityType: 'event',
        entityId: event.id,
        numberOfTickets: parseInt(formData.numberOfTickets)
      });

      if (!availabilityCheck.available) {
        setError(t('event.notAvailable', 'Le nombre de places demandé n\'est pas disponible'));
        return;
      }

      const reservationData = {
        eventId: event.id,
        numberOfTickets: parseInt(formData.numberOfTickets),
        paymentMethod: formData.paymentMethod,
        // Note: paymentId would typically come from payment processing
        // In a real app, you'd typically have a userId from authentication
        userId: 1, // This should be replaced with the actual user ID from auth
        // Store additional user information
        userData: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          specialRequirements: formData.specialRequirements
        }
      };

      const result = await ReservationService.createReservation(reservationData);
      
      if (result.id) {
        if (onConfirm) {
          onConfirm(result);
        }
        onClose();
      } else {
        setError(t('event.registrationError', 'Erreur lors de l\'inscription'));
      }
    } catch (err) {
      console.error('Error creating event reservation:', err);
      setError(t('common.error', 'Une erreur est survenue'));
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return formData.name.trim() && 
           formData.email.trim() && 
           formData.phone.trim() &&
           parseInt(formData.numberOfTickets) > 0;
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
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Inscription à l'événement</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.gray} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer}>
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            
            {event && (
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <View style={styles.eventDetails}>
                  <View style={styles.detailRow}>
                    <Calendar size={16} color={COLORS.primary} />
                    <Text style={styles.detailText}>
                      {new Date(event.startDate).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Clock size={16} color={COLORS.primary} />
                    <Text style={styles.detailText}>
                      {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Users size={16} color={COLORS.primary} />
                    <Text style={styles.detailText}>
                      {event.capacity} places disponibles
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom complet</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({...formData, name: text})}
                placeholder="Votre nom complet"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData({...formData, email: text})}
                placeholder="Votre adresse email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Téléphone</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => setFormData({...formData, phone: text})}
                placeholder="Votre numéro de téléphone"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre de participants</Text>
              <TextInput
                style={styles.input}
                value={formData.numberOfTickets}
                onChangeText={(text) => setFormData({...formData, numberOfTickets: text})}
                placeholder="Nombre de participants"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Besoins spéciaux (optionnel)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.specialRequirements}
                onChangeText={(text) => setFormData({...formData, specialRequirements: text})}
                placeholder="Besoins particuliers, restrictions alimentaires, etc."
                multiline
                numberOfLines={4}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <CustomButton
              title={t('event.register', 'S\'inscrire')}
              onPress={handleSubmit}
              disabled={!isFormValid()}
              loading={loading}
              style={[
                styles.submitButton,
                !isFormValid() && styles.submitButtonDisabled
              ]}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    width: '90%',
    maxHeight: '90%',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light_gray,
  },
  modalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.black,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  formContainer: {
    padding: SPACING.md,
  },
  eventInfo: {
    backgroundColor: COLORS.light_gray,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  eventTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  eventDetails: {
    gap: SPACING.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  detailText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.black,
    marginBottom: SPACING.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.light_gray,
    borderRadius: 8,
    padding: SPACING.sm,
    fontSize: FONT_SIZE.md,
    backgroundColor: COLORS.white,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  footer: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.light_gray,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.gray_light,
  },
});

export default EventRegistrationModal;
