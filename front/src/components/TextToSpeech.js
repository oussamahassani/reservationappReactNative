import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert, Text } from 'react-native';
import * as Icons from 'lucide-react-native'; // Importation des icônes
import { COLORS } from '../theme/colors'; // Couleurs personnalisées
import { SPACING } from '../theme/spacing'; // Espacements personnalisés
import * as Speech from 'expo-speech'; // Module pour la synthèse vocale

// Composant TextToSpeech
const TextToSpeech = ({
  text,                // Texte à lire
  autoPlay = false,    // Si vrai, le texte sera lu automatiquement
  language = 'fr-FR',  // Langue par défaut pour la synthèse
  showLabel = false,   // Affiche ou non le label "Listen" ou "Stop"
  buttonSize = 'medium' // Taille du bouton : small, medium, large
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false); // État : est-ce qu'on est en train de parler
  const [isReady, setIsReady] = useState(false);       // État : est-ce que la synthèse vocale est prête

  // Initialisation de la synthèse vocale au montage du composant
  useEffect(() => {
    let isMounted = true;

    const setupSpeech = async () => {
      try {
        const available = await Speech.isSpeakingAsync(); // Vérifie si la synthèse vocale fonctionne
        if (isMounted) {
          setIsReady(true);
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de la voix :', error);
      }
    };

    setupSpeech();

    // Nettoyage au démontage du composant
    return () => {
      isMounted = false;
      if (isSpeaking) {
        Speech.stop().catch(err => console.error('Erreur lors de l\'arrêt de la voix :', err));
      }
    };
  }, [language]);

  // Lancer automatiquement la voix si autoPlay est activé
  useEffect(() => {
    if (autoPlay && text && isReady) {
      speak();
    }
  }, [autoPlay, text, isReady]);

  // Fonction pour lancer ou arrêter la lecture du texte
  const speak = async () => {
    try {
      if (isSpeaking) {
        // Si déjà en train de parler, arrêter la lecture
        await Speech.stop();
        setIsSpeaking(false);
      } else {
        if (!text || text.trim() === '') {
          console.log('Aucun texte à lire');
          return;
        }

        setIsSpeaking(true);

        // Options de la synthèse vocale
        const options = {
          language: language,
          pitch: 1.0,
          rate: 0.75,
          onStart: () => setIsSpeaking(true),
          onDone: () => setIsSpeaking(false),
          onStopped: () => setIsSpeaking(false),
          onError: (error) => {
            console.error('Erreur vocale :', error);
            setIsSpeaking(false);
            Alert.alert('Erreur', 'Impossible de lire le texte actuellement.');
          }
        };

        await Speech.speak(text, options);
      }
    } catch (error) {
      console.error('Erreur lors de la lecture vocale :', error);
      setIsSpeaking(false);
      Alert.alert('Erreur', 'Impossible de lire le texte actuellement.');
    }
  };

  // Fonction pour définir la taille de l’icône selon le bouton
  const getIconSize = () => {
    switch (buttonSize) {
      case 'small': return 16;
      case 'large': return 24;
      default: return 20;
    }
  };

  // Styles du bouton selon sa taille
  const getButtonStyles = () => {
    const baseStyles = [styles.button];
    switch (buttonSize) {
      case 'small':
        baseStyles.push(styles.buttonSmall);
        break;
      case 'large':
        baseStyles.push(styles.buttonLarge);
        break;
      default:
        baseStyles.push(styles.buttonMedium);
    }
    return baseStyles;
  };

  // Composant visuel
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={getButtonStyles()}
        onPress={speak}
        disabled={!isReady || !text}
        accessibilityLabel={isSpeaking ? "Stop audio" : "Play audio"}
      >
        {isSpeaking ? (
          <Icons.Square size={getIconSize()} color={COLORS.white} />
        ) : (
          <Icons.Volume2 size={getIconSize()} color={COLORS.white} />
        )}
        {showLabel && (
          <Text style={styles.labelText}>
            {isSpeaking ? "Stop" : "Écouter"}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.primary,
  },
  buttonSmall: {
    padding: SPACING.xs,
    borderRadius: 16,
  },
  buttonMedium: {
    padding: SPACING.sm,
    borderRadius: 20,
  },
  buttonLarge: {
    padding: SPACING.md,
    borderRadius: 24,
  },
  labelText: {
    color: COLORS.white,
    marginLeft: SPACING.xs,
    fontSize: 14,
    fontWeight: '500',
  }
});

export default TextToSpeech;
