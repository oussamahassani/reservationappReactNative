import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';
import { FONT_SIZE } from '../../theme/typography';
import { Clock, Euro, ChevronDown, ChevronUp } from 'lucide-react-native';

const weekdays = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
  { key: 'sunday', label: 'Dimanche' },
];

const defaultOpeningHours = {
  monday: '9:00-17:00',
  tuesday: '9:00-17:00',
  wednesday: '9:00-17:00',
  thursday: '9:00-17:00',
  friday: '9:00-17:00',
  saturday: '10:00-15:00',
  sunday: 'Fermé'
};

const DetailsStep = ({ formData, updateField }) => {
  const [expandedSection, setExpandedSection] = useState('hours');
  const [freeEntry, setFreeEntry] = useState(
    formData.entranceFee?.adult === 0 && 
    formData.entranceFee?.child === 0 && 
    formData.entranceFee?.student === 0
  );
  
  useEffect(() => {
    if (!formData.openingHours || Object.keys(formData.openingHours).length === 0) {
      updateField('openingHours', { ...defaultOpeningHours });
    }
  }, []);
  
  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleHoursChange = (day, value) => {
    const updatedHours = {
      ...(formData.openingHours || {}),
      [day]: value
    };
    updateField('openingHours', updatedHours);
  };

  const handleFeeChange = (type, value) => {
    const updatedFees = {
      ...(formData.entranceFee || {}),
      [type]: parseFloat(value) || 0
    };
    updateField('entranceFee', updatedFees);
  };

  const toggleFreeEntry = (value) => {
    setFreeEntry(value);
    
    if (value) {
      updateField('entranceFee', {
        adult: 0,
        child: 0,
        student: 0
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.stepTitle}>Détails supplémentaires</Text>

      <TouchableOpacity 
        style={styles.sectionHeader}
        onPress={() => toggleSection('hours')}
      >
        <View style={styles.sectionHeaderContent}>
          <Clock size={20} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Heures d'ouverture</Text>
        </View>
        {expandedSection === 'hours' ? (
          <ChevronUp size={20} color={COLORS.gray} />
        ) : (
          <ChevronDown size={20} color={COLORS.gray} />
        )}
      </TouchableOpacity>

      {expandedSection === 'hours' && (
        <View style={styles.sectionContent}>
          {weekdays.map((day) => (
            <View key={day.key} style={styles.dayRow}>
              <Text style={styles.dayName}>{day.label}</Text>
              <TextInput
                style={styles.hoursInput}
                placeholder={defaultOpeningHours[day.key] || "9:00-17:00 ou Fermé"}
                value={formData.openingHours?.[day.key] || ''}
                onChangeText={(text) => handleHoursChange(day.key, text)}
              />
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity 
        style={styles.sectionHeader}
        onPress={() => toggleSection('fees')}
      >
        <View style={styles.sectionHeaderContent}>
          <Euro size={20} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>Tarifs d'entrée</Text>
        </View>
        {expandedSection === 'fees' ? (
          <ChevronUp size={20} color={COLORS.gray} />
        ) : (
          <ChevronDown size={20} color={COLORS.gray} />
        )}
      </TouchableOpacity>

      {expandedSection === 'fees' && (
        <View style={styles.sectionContent}>
          <View style={styles.freeEntryRow}>
            <Text style={styles.feeLabel}>Entrée gratuite</Text>
            <Switch
              value={freeEntry}
              onValueChange={toggleFreeEntry}
              trackColor={{ false: COLORS.gray_light, true: COLORS.success }}
              thumbColor={freeEntry ? COLORS.white : COLORS.white}
            />
          </View>
          
          {!freeEntry && (
            <>
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Adulte</Text>
                <View style={styles.feeInputContainer}>
                  <TextInput
                    style={styles.feeInput}
                    placeholder="0.00"
                    keyboardType="numeric"
                    value={formData.entranceFee?.adult?.toString() || ''}
                    onChangeText={(text) => handleFeeChange('adult', text)}
                  />
                  <Text style={styles.feeCurrency}>TND</Text>
                </View>
              </View>
              
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Enfant</Text>
                <View style={styles.feeInputContainer}>
                  <TextInput
                    style={styles.feeInput}
                    placeholder="0.00"
                    keyboardType="numeric"
                    value={formData.entranceFee?.child?.toString() || ''}
                    onChangeText={(text) => handleFeeChange('child', text)}
                  />
                  <Text style={styles.feeCurrency}>TND</Text>
                </View>
              </View>
              
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>Étudiant</Text>
                <View style={styles.feeInputContainer}>
                  <TextInput
                    style={styles.feeInput}
                    placeholder="0.00"
                    keyboardType="numeric"
                    value={formData.entranceFee?.student?.toString() || ''}
                    onChangeText={(text) => handleFeeChange('student', text)}
                  />
                  <Text style={styles.feeCurrency}>TND</Text>
                </View>
              </View>
            </>
          )}
          
          {freeEntry && (
            <Text style={styles.freeEntryNote}>
              Tous les tarifs sont définis à 0 TND pour une entrée gratuite.
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  stepTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.light_gray,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginLeft: SPACING.sm,
  },
  sectionContent: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray_light,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  dayName: {
    width: '30%',
    fontSize: FONT_SIZE.md,
    color: COLORS.black,
  },
  hoursInput: {
    width: '65%',
    backgroundColor: COLORS.light_gray,
    borderRadius: 8,
    padding: SPACING.sm,
    fontSize: FONT_SIZE.md,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  freeEntryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray_light,
  },
  feeLabel: {
    width: '30%',
    fontSize: FONT_SIZE.md,
    color: COLORS.black,
  },
  feeInputContainer: {
    width: '65%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.light_gray,
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
  },
  feeInput: {
    flex: 1,
    padding: SPACING.sm,
    fontSize: FONT_SIZE.md,
  },
  feeCurrency: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray,
    marginLeft: SPACING.xs,
  },
  freeEntryNote: {
    fontSize: FONT_SIZE.sm,
    fontStyle: 'italic',
    color: COLORS.gray,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
});

export default DetailsStep;
