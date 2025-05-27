
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar, Clock, Users } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { SPACING } from '../theme/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '../theme/typography';
import CustomButton from './CustomButton';

const ReservationSummary = ({
  entityType,
  entityData,
  numberOfPeople,
  date,
  totalPrice,
  onConfirm,
  onCancel,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Résumé de la réservation</Text>
      
      <View style={styles.entityInfo}>
        <Text style={styles.entityName}>
          {entityType === 'event' ? entityData.title : entityData.name}
        </Text>
        
        <View style={styles.detailRow}>
          <Calendar size={16} color={COLORS.primary} />
          <Text style={styles.detailText}>
            {new Date(date).toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>

        {date && (
          <View style={styles.detailRow}>
            <Clock size={16} color={COLORS.primary} />
            <Text style={styles.detailText}>
              {new Date(date).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Users size={16} color={COLORS.primary} />
          <Text style={styles.detailText}>
            {numberOfPeople} {numberOfPeople > 1 ? 'personnes' : 'personne'}
          </Text>
        </View>
      </View>

      <View style={styles.priceContainer}>
        <Text style={styles.priceLabel}>Prix total</Text>
        <Text style={styles.priceValue}>{totalPrice.toFixed(2)} €</Text>
      </View>

      <View style={styles.buttonContainer}>
        <CustomButton
          title="Annuler"
          onPress={onCancel}
          style={styles.cancelButton}
        />
        <CustomButton
          title="Confirmer"
          onPress={onConfirm}
          style={styles.confirmButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.black,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  entityInfo: {
    backgroundColor: COLORS.light_gray,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.lg,
  },
  entityName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  detailText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray,
    marginLeft: SPACING.xs,
  },
  priceContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.light_gray,
    paddingTop: SPACING.md,
    marginTop: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.gray,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
});

export default ReservationSummary;
