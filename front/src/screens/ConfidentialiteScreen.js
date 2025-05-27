
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Image
} from 'react-native';
import { FooterNav } from '../components/FooterNav';
import { COLORS } from '../theme/colors';
import { SPACING } from '../theme/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '../theme/typography';
import * as Animatable from 'react-native-animatable';
import { 
  Shield, 
  Lock, 
  FileText, 
  UserX, 
  EyeOff, 
  CheckCheck,
  ArrowLeft
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
const ConfidentialiteScreen = ({ navigation }) => {
  const { t } = useTranslation();

  const privacyCategories = [
    {
      icon: <Shield size={24} color={COLORS.primary} />,
      title: 'Protection des données',
      description: 'Nous utilisons des protocoles de sécurité avancés pour protéger vos informations personnelles.'
    },
    {
      icon: <Lock size={24} color={COLORS.primary} />,
      title: 'Sécurité',
      description: 'Vos données sont cryptées et stockées sur des serveurs sécurisés conformes aux normes internationales.'
    },
    {
      icon: <FileText size={24} color={COLORS.primary} />,
      title: 'Utilisation des données',
      description: 'Nous collectons certaines informations pour améliorer votre expérience mais ne les partageons jamais avec des tiers.'
    },
    {
      icon: <UserX size={24} color={COLORS.primary} />,
      title: 'Suppression de compte',
      description: 'Vous pouvez demander la suppression de votre compte et de vos données à tout moment.'
    },
    {
      icon: <EyeOff size={24} color={COLORS.primary} />,
      title: 'Confidentialité',
      description: 'Contrôlez qui peut voir vos informations et vos activités sur la plateforme.'
    },
    {
      icon: <CheckCheck size={24} color={COLORS.primary} />,
      title: 'Conformité RGPD',
      description: 'Notre application est entièrement conforme au Règlement Général sur la Protection des Données (RGPD).'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Confidentialité</Text>
        <View style={styles.backButtonPlaceholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Animatable.View 
          animation="fadeIn" 
          duration={800}
          style={styles.introSection}
        >
          <View style={styles.imageContainer}>
            <Image 
              source={require('../../assets/bulla-regia.png')} 
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.overlayGradient} />
          </View>
          
          <Text style={styles.introTitle}>
            Politique de confidentialité
          </Text>
          <Text style={styles.introText}>
            Chez notre application, nous prenons très au sérieux la protection de vos données personnelles. 
            Notre politique de confidentialité décrit comment nous collectons, utilisons et protégeons vos informations.
          </Text>
        </Animatable.View>

        <View style={styles.privacyCategoriesContainer}>
          {privacyCategories.map((category, index) => (
            <Animatable.View 
              key={index}
              animation="fadeInUp"
              delay={300 + (index * 100)}
              style={styles.categoryCard}
            >
              <View style={styles.iconContainer}>
                {category.icon}
              </View>
              <View style={styles.categoryContent}>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categoryDescription}>{category.description}</Text>
              </View>
            </Animatable.View>
          ))}
        </View>

        <Animatable.View 
          animation="fadeInUp"
          delay={1000}
          style={styles.contactSection}
        >
          <Text style={styles.contactTitle}>Questions sur la confidentialité?</Text>
          <Text style={styles.contactText}>
            Si vous avez des questions concernant notre politique de confidentialité, 
            n'hésitez pas à nous contacter à privacy@app.com
          </Text>
        </Animatable.View>

        <Animatable.View 
          animation="fadeInUp"
          delay={1100}
          style={styles.lastUpdatedContainer}
        >
          <Text style={styles.lastUpdatedText}>
            Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}
          </Text>
        </Animatable.View>
      </ScrollView>

      <FooterNav navigation={navigation} activeScreen="Settings" />
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
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: SPACING.xs,
  },
  backButtonPlaceholder: {
    width: 24,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  introSection: {
    marginBottom: SPACING.xl,
  },
  imageContainer: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlayGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(27, 67, 50, 0.3)',
  },
  introTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary_dark,
    marginBottom: SPACING.sm,
  },
  introText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray,
    lineHeight: 22,
  },
  privacyCategoriesContainer: {
    marginBottom: SPACING.xl,
  },
  categoryCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.light_gray,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary_dark,
    marginBottom: SPACING.xs,
  },
  categoryDescription: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray,
    lineHeight: 18,
  },
  contactSection: {
    backgroundColor: COLORS.tertiary_light,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  contactTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary_dark,
    marginBottom: SPACING.sm,
  },
  contactText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary_dark,
    lineHeight: 20,
  },
  lastUpdatedContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  lastUpdatedText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray,
  },
});

export default ConfidentialiteScreen;