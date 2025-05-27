
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  StatusBar,
  Dimensions,
  RefreshControl
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';
import { FONT_SIZE } from '../../theme/typography';
import { boxShadow } from '../../theme/mixins';

const { width } = Dimensions.get('window');

export default function GlobalSupervisionScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [activityLogs, setActivityLogs] = useState([
    { id: '1', action: 'Utilisateur bloqué', admin: 'Admin', timestamp: '10:25', date: 'Aujourd\'hui' },
    { id: '2', action: 'Lieu validé', admin: 'Admin', timestamp: '09:40', date: 'Aujourd\'hui' },
    { id: '3', action: 'Avis supprimé', admin: 'Admin', timestamp: '09:15', date: 'Aujourd\'hui' },
    { id: '4', action: 'Événement approuvé', admin: 'Admin', timestamp: '21:30', date: 'Hier' },
    { id: '5', action: 'Utilisateur ajouté', admin: 'Admin', timestamp: '18:47', date: 'Hier' },
    { id: '6', action: 'Lieu modifié', admin: 'Admin', timestamp: '16:22', date: 'Hier' },
    { id: '7', action: 'Avis modéré', admin: 'Admin', timestamp: '14:53', date: 'Hier' },
  ]);

  // Mock data for system status
  const systemStatus = {
    serverStatus: 'Opérationnel',
    databaseStatus: 'Opérationnel',
    lastBackup: 'Aujourd\'hui, 04:00',
    activeUsers: 78,
    apiRequests: '1,245',
    responseTime: '125 ms',
    serverLoad: 32,
    diskUsage: 47,
    memoryUsage: 58
  };

  // Mock data for analytics
  const analyticsData = {
    totalUsers: 1245,
    newUsersToday: 32,
    totalLocations: 348,
    newLocationsToday: 5,
    totalReviews: 782,
    newReviewsToday: 17,
    totalEvents: 45,
    newEventsToday: 3
  };

  // Mock alerts
  const [alerts, setAlerts] = useState([
    { id: '1', type: 'error', message: 'Avis signalé nécessitant modération', timestamp: '09:15', read: false },
    { id: '2', type: 'warning', message: 'Pic d\'activité détecté sur le serveur', timestamp: '08:30', read: false },
    { id: '3', type: 'info', message: 'Nouveau lieu ajouté en attente de validation', timestamp: 'Hier, 22:45', read: true }
  ]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate a refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const markAlertAsRead = (id) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, read: true } : alert
    ));
  };

  const getStatusColor = (status) => {
    return status === 'Opérationnel' ? '#2E7D32' : '#C62828';
  };

  const getUsageColor = (percentage) => {
    if (percentage < 50) return '#2E7D32';
    if (percentage < 80) return '#F57F17';
    return '#C62828';
  };

  const renderUsageBar = (percentage) => {
    const color = getUsageColor(percentage);
    return (
      <View style={styles.usageBarContainer}>
        <View 
          style={[
            styles.usageBar, 
            { width: `${percentage}%`, backgroundColor: color }
          ]} 
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary_dark} barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Supervision Globale</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Alerts Section */}
        <Animatable.View animation="fadeInDown" duration={500} style={styles.section}>
          <Text style={styles.sectionTitle}>Alertes</Text>
          {alerts.length > 0 ? (
            alerts.map(alert => (
              <TouchableOpacity 
                key={alert.id} 
                style={[styles.alertItem, alert.read && styles.alertItemRead]}
                onPress={() => markAlertAsRead(alert.id)}
              >
                <View style={[
                  styles.alertIndicator, 
                  { backgroundColor: alert.type === 'error' ? '#C62828' : 
                                    alert.type === 'warning' ? '#F57F17' : '#1976D2' }
                ]} />
                <View style={styles.alertContent}>
                  <Text style={styles.alertMessage}>{alert.message}</Text>
                  <Text style={styles.alertTimestamp}>{alert.timestamp}</Text>
                </View>
                {!alert.read && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyStateText}>Aucune alerte active</Text>
          )}
        </Animatable.View>
        
        {/* Quick Actions */}
        <Animatable.View animation="fadeInUp" duration={500} delay={100} style={styles.quickActionsContainer}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('UserManagement')}
          >
            <Text style={styles.quickActionIcon}>👤</Text>
            <Text style={styles.quickActionText}>Utilisateurs</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('LocationManagement')}
          >
            <Text style={styles.quickActionIcon}>📍</Text>
            <Text style={styles.quickActionText}>Lieux</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('ReviewModeration')}
          >
            <Text style={styles.quickActionIcon}>💬</Text>
            <Text style={styles.quickActionText}>Avis</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('EventManagement')}
          >
            <Text style={styles.quickActionIcon}>📅</Text>
            <Text style={styles.quickActionText}>Événements</Text>
          </TouchableOpacity>
        </Animatable.View>
        
        {/* Analytics Overview */}
        <Animatable.View animation="fadeInUp" duration={500} delay={200} style={styles.section}>
          <Text style={styles.sectionTitle}>Vue d'ensemble</Text>
          <View style={styles.analyticsGrid}>
            <View style={styles.analyticsCard}>
              <Text style={styles.analyticsLabel}>Utilisateurs</Text>
              <Text style={styles.analyticsValue}>{analyticsData.totalUsers}</Text>
              <Text style={styles.analyticsSubtext}>+{analyticsData.newUsersToday} aujourd'hui</Text>
            </View>
            <View style={styles.analyticsCard}>
              <Text style={styles.analyticsLabel}>Lieux</Text>
              <Text style={styles.analyticsValue}>{analyticsData.totalLocations}</Text>
              <Text style={styles.analyticsSubtext}>+{analyticsData.newLocationsToday} aujourd'hui</Text>
            </View>
            <View style={styles.analyticsCard}>
              <Text style={styles.analyticsLabel}>Avis</Text>
              <Text style={styles.analyticsValue}>{analyticsData.totalReviews}</Text>
              <Text style={styles.analyticsSubtext}>+{analyticsData.newReviewsToday} aujourd'hui</Text>
            </View>
            <View style={styles.analyticsCard}>
              <Text style={styles.analyticsLabel}>Événements</Text>
              <Text style={styles.analyticsValue}>{analyticsData.totalEvents}</Text>
              <Text style={styles.analyticsSubtext}>+{analyticsData.newEventsToday} aujourd'hui</Text>
            </View>
          </View>
        </Animatable.View>
        
        {/* System Status */}
        <Animatable.View animation="fadeInUp" duration={500} delay={300} style={styles.section}>
          <Text style={styles.sectionTitle}>État du Système</Text>
          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Serveur</Text>
              <Text style={[
                styles.statusValue, 
                { color: getStatusColor(systemStatus.serverStatus) }
              ]}>
                {systemStatus.serverStatus}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Base de données</Text>
              <Text style={[
                styles.statusValue, 
                { color: getStatusColor(systemStatus.databaseStatus) }
              ]}>
                {systemStatus.databaseStatus}
              </Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Dernier backup</Text>
              <Text style={styles.statusValue}>{systemStatus.lastBackup}</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Utilisateurs actifs</Text>
              <Text style={styles.statusValue}>{systemStatus.activeUsers}</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Requêtes API (24h)</Text>
              <Text style={styles.statusValue}>{systemStatus.apiRequests}</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Temps de réponse</Text>
              <Text style={styles.statusValue}>{systemStatus.responseTime}</Text>
            </View>
          </View>
          
          <View style={styles.resourcesContainer}>
            <Text style={styles.resourcesTitle}>Ressources serveur</Text>
            
            <View style={styles.resourceItem}>
              <View style={styles.resourceHeader}>
                <Text style={styles.resourceLabel}>Utilisation CPU</Text>
                <Text style={styles.resourcePercentage}>{systemStatus.serverLoad}%</Text>
              </View>
              {renderUsageBar(systemStatus.serverLoad)}
            </View>
            
            <View style={styles.resourceItem}>
              <View style={styles.resourceHeader}>
                <Text style={styles.resourceLabel}>Espace disque</Text>
                <Text style={styles.resourcePercentage}>{systemStatus.diskUsage}%</Text>
              </View>
              {renderUsageBar(systemStatus.diskUsage)}
            </View>
            
            <View style={styles.resourceItem}>
              <View style={styles.resourceHeader}>
                <Text style={styles.resourceLabel}>Mémoire</Text>
                <Text style={styles.resourcePercentage}>{systemStatus.memoryUsage}%</Text>
              </View>
              {renderUsageBar(systemStatus.memoryUsage)}
            </View>
          </View>
        </Animatable.View>
        
        {/* Recent Activity Logs */}
        <Animatable.View animation="fadeInUp" duration={500} delay={400} style={styles.section}>
          <Text style={styles.sectionTitle}>Activité Récente</Text>
          {activityLogs.map((log, index) => (
            <View key={log.id} style={styles.logItem}>
              <View style={styles.logDot} />
              <View style={styles.logContent}>
                <Text style={styles.logAction}>{log.action}</Text>
                <View style={styles.logMeta}>
                  <Text style={styles.logAdmin}>par {log.admin}</Text>
                  <Text style={styles.logTime}>{log.date}, {log.timestamp}</Text>
                </View>
              </View>
            </View>
          ))}
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: SPACING.md,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...boxShadow,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: COLORS.primary_dark,
    marginBottom: SPACING.md,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light_gray,
  },
  alertItemRead: {
    opacity: 0.7,
  },
  alertIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  alertContent: {
    flex: 1,
  },
  alertMessage: {
    fontSize: FONT_SIZE.md,
    color: COLORS.black,
    marginBottom: 2,
  },
  alertTimestamp: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: SPACING.sm,
  },
  emptyStateText: {
    textAlign: 'center',
    color: COLORS.gray,
    fontStyle: 'italic',
    padding: SPACING.md,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  quickActionButton: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: SPACING.sm,
    alignItems: 'center',
    width: (width - SPACING.md * 2 - SPACING.sm * 3) / 4,
    ...boxShadow,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  quickActionText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.primary_dark,
    textAlign: 'center',
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  analyticsCard: {
    backgroundColor: COLORS.light_gray,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    width: '48%',
  },
  analyticsLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray,
    marginBottom: 2,
  },
  analyticsValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  analyticsSubtext: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.primary_dark,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  statusItem: {
    width: '48%',
    marginBottom: SPACING.sm,
  },
  statusLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray,
  },
  statusValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
    color: COLORS.primary_dark,
  },
  resourcesContainer: {
    marginTop: SPACING.md,
  },
  resourcesTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
    color: COLORS.primary_dark,
    marginBottom: SPACING.sm,
  },
  resourceItem: {
    marginBottom: SPACING.sm,
  },
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  resourceLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray,
  },
  resourcePercentage: {
    fontSize: FONT_SIZE.sm,
    fontWeight: 'bold',
    color: COLORS.primary_dark,
  },
  usageBarContainer: {
    height: 8,
    backgroundColor: COLORS.light_gray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  usageBar: {
    height: '100%',
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  logDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary_light,
    marginRight: SPACING.sm,
    marginTop: 5,
  },
  logContent: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light_gray,
    paddingBottom: SPACING.sm,
  },
  logAction: {
    fontSize: FONT_SIZE.md,
    color: COLORS.black,
    marginBottom: 2,
  },
  logMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logAdmin: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.primary_dark,
  },
  logTime: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray,
  },
});
