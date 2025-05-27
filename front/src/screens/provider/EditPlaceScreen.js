
import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';
import { FONT_SIZE } from '../../theme/typography';
import { AuthContext } from '../../context/AuthContext';
import { usePlacesData } from '../../hooks/usePlacesData';
import BasicInfoStep from '../../components/place/BasicInfoStep';
import LocationStep from '../../components/place/LocationStep';
import ImageUploadStep from '../../components/place/ImageUploadStep';
import DetailsStep from '../../components/place/DetailsStep';
import SummaryStep from '../../components/place/SummaryStep';
import StepIndicator from '../../components/place/StepIndicator';
import SuccessModal from '../../common/SuccessModal';
import { getApiUrl, ENDPOINTS } from '../../config/apiConfig';

const EditPlaceScreen = ({ route, navigation }) => {
  const { place } = route.params;
  const { user } = useContext(AuthContext);
  const { updatePlace } = usePlacesData();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [error, setError] = useState(null);
  
  // Initialize form data with place data
  const [formData, setFormData] = useState({
    name: place.name || '',
    type: place.type || '',
    typeName: place.type === 'museum' ? 'Musée' : 
             place.type === 'historical_site' ? 'Site Historique' : 
             place.type === 'historical' ? 'Site Archéologique' :
             place.type === 'restaurant' ? 'Restaurant' : 
             place.type || '',
    description: place.description || '',
    location: {
      latitude: place.location?.latitude || null,
      longitude: place.location?.longitude || null,
      address: place.location?.address || '',
      city: place.location?.city || '',
      region: place.location?.region || '',
    },
    images: place.images || [],
    openingHours: place.openingHours || {
      monday: '9:00-17:00',
      tuesday: '9:00-17:00',
      wednesday: '9:00-17:00',
      thursday: '9:00-17:00',
      friday: '9:00-17:00',
      saturday: '10:00-15:00',
      sunday: 'Fermé',
    },
    entranceFee: place.entranceFee || {
      adult: 0,
      child: 0,
      student: 0,
    },
    provider_id: user?.id || place.provider_id,
  });

  const steps = [
    { title: 'Informations de base', component: BasicInfoStep },
    { title: 'Localisation', component: LocationStep },
    { title: 'Images', component: ImageUploadStep },
    { title: 'Détails', component: DetailsStep },
    { title: 'Résumé', component: SummaryStep },
  ];

  const handleUpdateField = (fieldName, value) => {
    if (fieldName.includes('.')) {
      const [parent, child] = fieldName.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [fieldName]: value
      }));
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Fonction mise à jour pour utiliser directement l'API d'édition de lieu
  // Updated function to directly use the place editing API
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Préparer les données pour la mise à jour
      // Prepare data for update
      const updateData = {
        name: formData.name,
        type: formData.type,
        description: formData.description,
        location: formData.location,
        images: formData.images,
        openingHours: formData.openingHours,
        entranceFee: formData.entranceFee,
        provider_id: formData.provider_id,
      };
      
      console.log('Envoi de la mise à jour pour le lieu ID:', place.id);
      console.log('Données de mise à jour:', JSON.stringify(updateData));
      
      // Utiliser l'API directement selon la documentation fournie
      // Use the API directly according to the provided documentation
      const response = await fetch(getApiUrl(ENDPOINTS.UPDATE_PLACE(place.id)), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erreur de réponse du serveur:', errorData);
        throw new Error(`Erreur HTTP! statut: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Mise à jour réussie, réponse du serveur:', result);
      
      setSuccessVisible(true);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du lieu:', error);
      setError(error.message);
      Alert.alert(
        'Erreur',
        `Impossible de mettre à jour le lieu. ${error.message}. Veuillez réessayer.`,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modifier un lieu</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <StepIndicator 
          steps={steps.map(s => s.title)} 
          currentStep={currentStep} 
        />
        
        <ScrollView 
          style={styles.formContainer}
          showsVerticalScrollIndicator={false}
        >
          <CurrentStepComponent 
            formData={formData}
            updateField={handleUpdateField}
          />
          
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                {error}
              </Text>
            </View>
          )}
        </ScrollView>
        
        <View style={styles.buttonsContainer}>
          {currentStep > 0 && (
            <TouchableOpacity 
              style={styles.prevButton}
              onPress={prevStep}
            >
              <Text style={styles.prevButtonText}>Précédent</Text>
            </TouchableOpacity>
          )}
          
          {currentStep < steps.length - 1 ? (
            <TouchableOpacity 
              style={[
                styles.nextButton,
                { marginLeft: currentStep > 0 ? SPACING.sm : 0 }
              ]}
              onPress={nextStep}
            >
              <Text style={styles.nextButtonText}>Suivant</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.submitButtonText}>Enregistrer</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      <SuccessModal 
        visible={successVisible}
        message="Lieu mis à jour avec succès!"
        onClose={() => {
          setSuccessVisible(false);
          navigation.goBack();
        }}
      />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  formContainer: {
    flex: 1,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: SPACING.md,
    borderRadius: 8,
    marginVertical: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
  errorText: {
    color: COLORS.error || 'red',
    fontSize: FONT_SIZE.sm,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  prevButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    flex: 1,
    marginRight: SPACING.sm,
    alignItems: 'center',
  },
  prevButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  nextButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  nextButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  submitButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.success,
    borderRadius: 8,
    flex: 1,
    marginLeft: SPACING.sm,
    alignItems: 'center',
  },
  submitButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
});

export default EditPlaceScreen;