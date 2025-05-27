import React, { useContext } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';
import { FONT_SIZE } from '../../theme/typography';
import { boxShadow } from '../../theme/mixins';
import { API_URL, ENDPOINTS } from '../../config/apiConfig';
import { AuthContext } from '../../context/AuthContext';
import { LogOut } from 'lucide-react-native';
import { useClerkIntegration } from '../../utils/clerkAuth';
import { CommonActions } from '@react-navigation/native';
import { STACKS } from '../../navigation/navigationConstants';

export default function AdminDashboardScreen({ navigation }) {
  // Get logout function from AuthContext and Clerk integration
  const { logout } = useContext(AuthContext);
  const { logoutFromClerk } = useClerkIntegration();
  
  // State for stats
  const [statsData, setStatsData] = React.useState([
    { title: 'Utilisateurs', count: 0, change: '0%' },
    { title: 'Lieux', count: 348, change: '+5%' },
    { title: 'Avis', count: 782, change: '+8%' },
    { title: 'Événements', count: 45, change: '+15%' },
  ]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  // Fetch users count when component mounts
  React.useEffect(() => {
    fetchUsersCount();
  }, []);

  const fetchUsersCount = async () => {
    try {
      const response = await fetch(`${API_URL}${ENDPOINTS.ALL_USERS}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const result = await response.json();
      const users = result.data || [];
      
      // Update users count in statsData
      setStatsData(prevStats => {
        const newStats = [...prevStats];
        newStats[0] = { 
          ...newStats[0], 
          count: users.length,
          change: '+12%' // This would normally be calculated based on previous data
        };
        return newStats;
      });
    } catch (error) {
      console.error('Error fetching users count:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Use the complete logout function from clerk integration
      await logoutFromClerk();
      
      // Navigate to the auth stack after logout
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: STACKS.AUTH }],
        })
      );
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert(
        'Erreur de déconnexion',
        'Une erreur est survenue lors de la déconnexion. Veuillez réessayer.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary_dark} barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tableau de bord Admin</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animatable.View animation="fadeInUp" duration={800} style={styles.welcomeCard}>
          <Text style={styles.welcomeText}>Bienvenue, Administrateur</Text>
          <Text style={styles.welcomeDescription}>
            Gérez les utilisateurs, les lieux, les avis et les événements.
          </Text>
        </Animatable.View>
        
        <View style={styles.statsContainer}>
          {loading ? (
            <View style={styles.loadingStats}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingText}>Chargement des statistiques...</Text>
            </View>
          ) : (
            statsData.map((item, index) => (
              <Animatable.View 
                key={index} 
                animation="zoomIn" 
                duration={500} 
                delay={index * 100}
                style={styles.statCard}
              >
                <Text style={styles.statCount}>{item.count}</Text>
                <Text style={styles.statTitle}>{item.title}</Text>
                <Text style={[
                  styles.statChange, 
                  { color: item.change.includes('+') ? COLORS.success : COLORS.error }
                ]}>
                  {item.change}
                </Text>
              </Animatable.View>
            ))
          )}
        </View>
        
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Gestion</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('UserManagement')}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#E3F2FD' }]}>
              <Text style={{ fontSize: 24 }}>👤</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Gestion Utilisateurs</Text>
              <Text style={styles.menuDescription}>
                Supervision, modification et suppression des comptes
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('LocationManagement')}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#E8F5E9' }]}>
              <Text style={{ fontSize: 24 }}>📍</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Gestion Lieux</Text>
              <Text style={styles.menuDescription}>
                Ajout, modification, suppression et validation
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('ReviewModeration')}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#FFF8E1' }]}>
              <Text style={{ fontSize: 24 }}>💬</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Modération Avis</Text>
              <Text style={styles.menuDescription}>
                Modération des avis et détection de fraude
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('EventManagement')}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#F3E5F5' }]}>
              <Text style={{ fontSize: 24 }}>📅</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Gestion Événements</Text>
              <Text style={styles.menuDescription}>
                Validation et suppression des événements
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        
        <Animatable.View
          animation="fadeInUp"
          delay={700}
        >
          <TouchableOpacity 
            style={styles.logoutFullButton}
            onPress={handleLogout}
          >
            <LogOut size={24} color={COLORS.error} />
            <Text style={styles.logoutFullText}>Déconnexion</Text>
          </TouchableOpacity>
        </Animatable.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: SPACING.lg + (StatusBar.currentHeight || 0),
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
  },
  logoutButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  logoutText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.sm,
  },
  scrollContainer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl * 2,
  },
  welcomeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...boxShadow,
  },
  welcomeText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  welcomeDescription: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray,
    marginBottom: SPACING.md,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  loadingStats: {
    width: '100%',
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray,
    marginTop: SPACING.xs,
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    width: '48%',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...boxShadow,
  },
  statCount: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statTitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray,
    marginVertical: SPACING.xxs,
  },
  statChange: {
    fontSize: FONT_SIZE.xs,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: COLORS.primary_dark,
    marginBottom: SPACING.md,
  },
  menuContainer: {
    marginBottom: SPACING.xl,
  },
  menuItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...boxShadow,
  },
  menuIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
    color: COLORS.primary_dark,
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray,
  },
  logoutFullButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    padding: SPACING.md,
    borderRadius: 12,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  logoutFullText: {
    color: COLORS.error,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZE.md,
  },
});
