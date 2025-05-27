import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image,
  Platform 
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';
import { FONT_SIZE } from '../../theme/typography';
import { MapPin, Clock, Euro, Image as ImageIcon } from 'lucide-react-native';
import TextToSpeech from '../TextToSpeech';

const SummaryStep = ({ formData }) => {
  // Check if entrance is free (all fees are 0)
  const isEntryFree = formData.entranceFee && 
    formData.entranceFee.adult === 0 && 
    formData.entranceFee.child === 0 && 
    formData.entranceFee.student === 0;

  return (
    <View style={styles.container}>
      <Text style={styles.stepTitle}>Résumé</Text>
      
      <View style={styles.card}>
        <View style={styles.titleContainer}>
          <Text style={styles.cardTitle}>{formData.name || 'Sans nom'}</Text>
          <TextToSpeech text={formData.name} autoPlay={false} buttonSize="small" />
        </View>
        <Text style={styles.cardType}>{formData.typeName || 'Type non spécifié'}</Text>
        
        <View style={styles.divider} />
        
        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Description</Text>
            <TextToSpeech text={formData.description} autoPlay={false} buttonSize="small" />
          </View>
          <Text style={styles.descriptionText}>
            {formData.description || 'Aucune description fournie.'}
          </Text>
        </View>
        
        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <MapPin size={16} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Lieu</Text>
          </View>
          
          <Text style={styles.infoText}>
            {formData.location?.address || 'Adresse non spécifiée'}
          </Text>
          <Text style={styles.infoText}>
            {formData.location?.city || ''}{formData.location?.city && formData.location?.region ? ', ' : ''}
            {formData.location?.region || ''}
          </Text>
          <Text style={styles.infoTextSmall}>
            Lat: {formData.location?.latitude?.toFixed(6) || 'N/A'}, 
            Long: {formData.location?.longitude?.toFixed(6) || 'N/A'}
          </Text>
        </View>
        
        {formData.images && formData.images.length > 0 && (
          <View style={styles.infoSection}>
            <View style={styles.infoHeader}>
              <ImageIcon size={16} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Images ({formData.images.length})</Text>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {formData.images.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={styles.thumbnailImage}
                />
              ))}
            </ScrollView>
          </View>
        )}
        
        {formData.openingHours && Object.keys(formData.openingHours).length > 0 && (
          <View style={styles.infoSection}>
            <View style={styles.infoHeader}>
              <Clock size={16} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Heures d'ouverture</Text>
            </View>
            
            {Object.entries(formData.openingHours).map(([day, hours]) => (
              <View key={day} style={styles.hoursRow}>
                <Text style={styles.dayText}>
                  {day === 'monday' ? 'Lundi' :
                   day === 'tuesday' ? 'Mardi' :
                   day === 'wednesday' ? 'Mercredi' :
                   day === 'thursday' ? 'Jeudi' :
                   day === 'friday' ? 'Vendredi' :
                   day === 'saturday' ? 'Samedi' :
                   'Dimanche'}:
                </Text>
                <Text style={styles.hoursText}>{hours}</Text>
              </View>
            ))}
          </View>
        )}
        
        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <Euro size={16} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Tarifs</Text>
          </View>
          
          {isEntryFree ? (
            <View style={styles.freeEntryContainer}>
              <Text style={styles.freeEntryText}>Entrée Gratuite</Text>
            </View>
          ) : (
            <>
              {formData.entranceFee?.adult !== undefined && (
                <View style={styles.feeRow}>
                  <Text style={styles.feeType}>Adulte:</Text>
                  <Text style={styles.feeAmount}>
                    {formData.entranceFee.adult} TND
                  </Text>
                </View>
              )}
              
              {formData.entranceFee?.child !== undefined && (
                <View style={styles.feeRow}>
                  <Text style={styles.feeType}>Enfant:</Text>
                  <Text style={styles.feeAmount}>
                    {formData.entranceFee.child} TND
                  </Text>
                </View>
              )}
              
              {formData.entranceFee?.student !== undefined && (
                <View style={styles.feeRow}>
                  <Text style={styles.feeType}>Étudiant:</Text>
                  <Text style={styles.feeAmount}>
                    {formData.entranceFee.student} TND
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </View>
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
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  cardType: {
    fontSize: FONT_SIZE.md,
    color: COLORS.secondary,
    marginTop: SPACING.xs,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray_light,
    marginVertical: SPACING.md,
  },
  infoSection: {
    marginBottom: SPACING.md,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  descriptionText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.black,
    lineHeight: 22,
  },
  infoText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.black,
    marginBottom: SPACING.xs,
  },
  infoTextSmall: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray,
  },
  thumbnailImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: SPACING.sm,
  },
  hoursRow: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  dayText: {
    width: 80,
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: COLORS.black,
  },
  hoursText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.black,
  },
  feeRow: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  feeType: {
    width: 80,
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: COLORS.black,
  },
  feeAmount: {
    fontSize: FONT_SIZE.md,
    color: COLORS.black,
  },
  freeEntryContainer: {
    backgroundColor: COLORS.success + '20',
    padding: SPACING.sm,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  freeEntryText: {
    color: COLORS.success,
    fontWeight: 'bold',
    fontSize: FONT_SIZE.md,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
});

export default SummaryStep;