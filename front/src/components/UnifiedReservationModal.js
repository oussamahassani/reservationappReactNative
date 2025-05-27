
import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar, Clock, User, X } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { SPACING } from '../theme/spacing';
import { FONT_SIZE } from '../theme/typography';
import CustomButton from './CustomButton';
import { ReservationService } from '../services/ReservationService';
import ReservationSummary from './ReservationSummary';

const UnifiedReservationModal = ({ 
  visible, 
  onClose, 
  entity, 
  entityType, // 'event' or 'place'
  onConfirm 
}) => {
  const [step, setStep] = useState(1); // 1: form, 2: summary, 3: success
  const [formData, setFormData] = useState({
    date: new Date(),
    time: '10:00',
    count: 1,
    userData: {
      name: '',
      email: '',
      phone: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check availability
      const availabilityCheck = await ReservationService.checkAvailability({
        entityType,
        entityId: entity.id,
        ...(entityType === 'place' ? {
          date: formData.date.toISOString(),
          numberOfPersons: formData.count
        } : {
          numberOfTickets: formData.count
        })
      });

      if (!availabilityCheck.available) {
        setError('Cette plage horaire n\'est pas disponible');
        return;
      }

      // If available, show summary
      setStep(2);
    } catch (err) {
      console.error('Error checking availability:', err);
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReservation = async () => {
    try {
      setLoading(true);
      setError(null);

      const reservationData = {
        userId: 1, // In a real app, get from auth
        ...(entityType === 'place' ? {
          placeId: entity.id,
          numberOfPersons: formData.count,
          visitDate: formData.date.toISOString()
        } : {
          eventId: entity.id,
          numberOfTickets: formData.count
        }),
        userData: formData.userData
      };

      const result = await ReservationService.createReservation(reservationData);
      
      if (result.id) {
        setStep(3);
        if (onConfirm) {
          onConfirm(result);
        }
      }
    } catch (err) {
      console.error('Error creating reservation:', err);
      setError('Erreur lors de la création de la réservation');
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => (
    <ScrollView style={styles.formContainer}>
      <Text style={styles.title}>
        {entityType === 'place' ? 'Réserver une visite' : 'Réserver des billets'}
      </Text>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nom complet</Text>
        <TextInput
          style={styles.input}
          value={formData.userData.name}
          onChangeText={(text) => setFormData({
            ...formData,
            userData: { ...formData.userData, name: text }
          })}
          placeholder="Votre nom complet"
        />
      </View>

      {/* ... Add other form fields similar to EventRegistrationModal ... */}

      <CustomButton
        title="Continuer"
        onPress={handleSubmit}
        loading={loading}
        disabled={!formData.userData.name}
      />
    </ScrollView>
  );

  const renderSummary = () => (
    <ReservationSummary
      entityType={entityType}
      entityData={entity}
      formData={formData}
      onConfirm={handleConfirmReservation}
      onBack={() => setStep(1)}
      loading={loading}
    />
  );

  const renderSuccess = () => (
    <View style={styles.successContainer}>
      <Text style={styles.successTitle}>Réservation Confirmée!</Text>
      <Text style={styles.successText}>
        Votre réservation a été enregistrée avec succès. 
        Vous recevrez une confirmation par email.
      </Text>
      <CustomButton
        title="Fermer"
        onPress={onClose}
      />
    </View>
  );

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

          {step === 1 && renderForm()}
          {step === 2 && renderSummary()}
          {step === 3 && renderSuccess()}
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
    borderRadius: 20,
    width: '90%',
    maxHeight: '90%',
    padding: SPACING.lg,
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    zIndex: 1,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
  },
  errorContainer: {
    backgroundColor: COLORS.error_light,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.sm,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray,
    marginBottom: SPACING.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.light_gray,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
  },
  successContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  successTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    color: COLORS.success,
    marginBottom: SPACING.md,
  },
  successText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
});

export default UnifiedReservationModal;
