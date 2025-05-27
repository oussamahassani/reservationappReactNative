
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  FlatList,
  Alert,
  Platform 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';
import { FONT_SIZE } from '../../theme/typography';
import { Image as ImageIcon, Trash2, Plus } from 'lucide-react-native';

/**
 * Composant pour la troisième étape: téléchargement des images du lieu
 * Component for the third step: uploading place images
 * 
 * Ce composant permet d'ajouter des images au lieu en cours de création.
 * This component allows adding images to the place being created.
 * 
 * @param {Object} formData - Les données du formulaire / Form data
 * @param {Function} setFormData - Fonction pour mettre à jour le formulaire / Function to update form data
 */
const ImageUploadStep = ({ formData, setFormData }) => {
  const [uploading, setUploading] = useState(false);

  /**
   * Vérifier les permissions d'accès à la galerie
   * Check gallery access permissions
   */
  const checkPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          "Permission requise", 
          "Nous avons besoin d'accéder à votre galerie pour télécharger des images."
        );
        return false;
      }
      return true;
    }
    return true;
  };

  /**
   * Sélectionner une image depuis la galerie
   * Pick an image from the gallery
   */
  const pickImage = async () => {
    const hasPermission = await checkPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImage = result.assets[0];
        
        // Dans une vraie application, vous téléchargeriez l'image sur un serveur ici
        // In a real app, you would upload the image to a server here
        
        // Pour l'instant, nous ajoutons simplement l'URI à notre formData
        // For now, we'll just add the URI to our formData
        const updatedImages = [...(formData.images || []), newImage.uri];
        setFormData({
          ...formData,
          images: updatedImages
        });
      }
    } catch (error) {
      console.error("Erreur lors de la sélection de l'image:", error);
      Alert.alert("Erreur", "Impossible de sélectionner l'image.");
    }
  };

  /**
   * Supprimer une image de la liste
   * Remove an image from the list
   * 
   * @param {number} index - Index de l'image à supprimer / Index of the image to remove
   */
  const removeImage = (index) => {
    const updatedImages = [...formData.images];
    updatedImages.splice(index, 1);
    setFormData({
      ...formData,
      images: updatedImages
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.stepTitle}>Images du lieu</Text>
      
      <TouchableOpacity 
        style={styles.uploadButton} 
        onPress={pickImage}
        disabled={uploading}
      >
        <ImageIcon size={24} color={COLORS.primary} />
        <Text style={styles.uploadButtonText}>
          {uploading ? "Téléchargement en cours..." : "Ajouter une image"}
        </Text>
      </TouchableOpacity>

      {formData.images && formData.images.length > 0 ? (
        <View style={styles.imageGrid}>
          <FlatList
            data={formData.images}
            keyExtractor={(item, index) => index.toString()}
            horizontal={false}
            numColumns={2}
            renderItem={({ item, index }) => (
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: item }} 
                  style={styles.image} 
                />
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => removeImage(index)}
                >
                  <Trash2 size={20} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Plus size={40} color={COLORS.gray_light} />
          <Text style={styles.emptyStateText}>
            Aucune image ajoutée
          </Text>
          <Text style={styles.emptyStateSubtext}>
            Ajoutez des images pour mettre en valeur ce lieu
          </Text>
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
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.light_gray,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray_light,
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  imageGrid: {
    marginTop: SPACING.sm,
  },
  imageContainer: {
    width: '48%',
    margin: '1%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.light_gray,
    borderRadius: 8,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.gray_light,
    borderStyle: 'dashed',
  },
  emptyStateText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
    color: COLORS.gray,
  },
  emptyStateSubtext: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
});

export default ImageUploadStep;