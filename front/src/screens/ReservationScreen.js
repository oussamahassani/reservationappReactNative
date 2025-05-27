import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  FlatList, 
  StatusBar, 
  Platform,
  Animated,
  ActivityIndicator
} from 'react-native';
import { FooterNav } from '../components/FooterNav';
import { COLORS } from '../theme/colors';
import { SPACING } from '../theme/spacing';
import { FONT_SIZE, FONT_WEIGHT, getFontWeight } from '../theme/typography';
import { useTranslation } from 'react-i18next';
import { Calendar, ChevronDown, ChevronUp, Filter, Clock, User, MapPin } from 'lucide-react-native';
import { ReservationService } from '../services/ReservationService';

const ReservationScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [sortBy, setSortBy] = useState('date'); // 'date', 'price', 'status'
  const [sortDirection, setSortDirection] = useState('asc');
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Fetch reservations
    fetchReservations();
  }, []);

  useEffect(() => {
    // Sort reservations when sort options change
    if (reservations.length > 0) {
      sortReservations();
    }
  }, [sortBy, sortDirection, selectedDate]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, you'd get the logged-in user ID
      const userId = 1; // Replace with actual user ID from auth
      
      const result = await ReservationService.getReservationsByUser(userId);
      
      if (Array.isArray(result)) {
        setReservations(result);
        sortReservations(result);
      } else {
        console.error('Unexpected response format:', result);
        setError('Format de réponse inattendu');
      }
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError('Erreur lors du chargement des réservations');
    } finally {
      setLoading(false);
    }
  };

  const sortReservations = (data = reservations) => {
    const filtered = selectedDate 
      ? data.filter(res => {
          const resDate = new Date(res.visitDate || res.eventDate);
          return resDate.toISOString().split('T')[0] === selectedDate;
        })
      : [...data];
      
    const sorted = filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.visitDate || a.eventDate);
        const dateB = new Date(b.visitDate || b.eventDate);
        return sortDirection === 'asc' 
          ? dateA - dateB
          : dateB - dateA;
      } else if (sortBy === 'price') {
        return sortDirection === 'asc' ? a.price - b.price : b.price - a.price;
      } else if (sortBy === 'status') {
        return sortDirection === 'asc' 
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      }
      return 0;
    });
    
    setReservations(sorted);
  };

  const toggleSortDirection = () => {
    setSortDirection(prevDirection => prevDirection === 'asc' ? 'desc' : 'asc');
  };

  const setSortOption = (option) => {
    if (sortBy === option) {
      toggleSortDirection();
    } else {
      setSortBy(option);
      setSortDirection('asc');
    }
  };

  const toggleCalendar = () => {
    setIsCalendarVisible(!isCalendarVisible);
  };

  const selectDate = (date) => {
    setSelectedDate(date);
    setIsCalendarVisible(false);
  };

  const clearDateFilter = () => {
    setSelectedDate(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return COLORS.success;
      case 'pending':
        return COLORS.warning;
      case 'canceled':
        return COLORS.error;
      default:
        return COLORS.gray;
    }
  };

  const renderReservationItem = ({ item }) => {
    // Determine if this is a place or event reservation
    const isEventReservation = !!item.eventId;
    const name = isEventReservation ? item.event?.title : item.place?.name;
    const date = new Date(isEventReservation ? item.eventDate : item.visitDate);
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const persons = isEventReservation ? item.numberOfTickets : item.numberOfPersons;
    
    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        <TouchableOpacity 
          style={styles.reservationCard}
          onPress={() => navigation.navigate(
            'ReservationDetail', 
            { reservationId: item.id }
          )}
        >
          <View style={styles.reservationHeader}>
            <Text style={styles.siteName}>{name || 'Réservation'}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
          
          <View style={styles.reservationDetails}>
            <View style={styles.detailRow}>
              <Calendar size={16} color={COLORS.primary} />
              <Text style={styles.detailText}>
                {date.toLocaleDateString('fr-FR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Clock size={16} color={COLORS.primary} />
              <Text style={styles.detailText}>{time}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <User size={16} color={COLORS.primary} />
              <Text style={styles.detailText}>
                {persons} {persons > 1 ? 
                  (isEventReservation ? 'tickets' : 'personnes') : 
                  (isEventReservation ? 'ticket' : 'personne')
                }
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <MapPin size={16} color={COLORS.primary} />
              <Text style={styles.detailText}>
                {isEventReservation ? 
                  (item.event?.location || 'Lieu non spécifié') : 
                  (item.place?.location?.city || 'Lieu non spécifié')
                }
              </Text>
            </View>
          </View>
          
          <View style={styles.reservationFooter}>
            <Text style={styles.priceText}>{item.price || '0'} €</Text>
            <TouchableOpacity style={styles.detailsButton}>
              <Text style={styles.detailsButtonText}>Détails</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderListHeader = () => (
    <View style={styles.listHeader}>
      <View style={styles.filterOptions}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={toggleCalendar}
        >
          <Calendar size={18} color={COLORS.primary} style={styles.filterIcon} />
          <Text style={styles.filterButtonText}>
            {selectedDate ? new Date(selectedDate).toLocaleDateString('fr-FR') : 'Filtrer par date'}
          </Text>
          {selectedDate && (
            <TouchableOpacity 
              style={styles.clearFilterButton}
              onPress={clearDateFilter}
            >
              <Text style={styles.clearFilterText}>×</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.sortButton, sortBy === 'date' && styles.activeSortButton]}
          onPress={() => setSortOption('date')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'date' && styles.activeSortText]}>Date</Text>
          {sortBy === 'date' && (
            sortDirection === 'asc' ? 
              <ChevronUp size={14} color={COLORS.white} /> : 
              <ChevronDown size={14} color={COLORS.white} />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.sortButton, sortBy === 'price' && styles.activeSortButton]}
          onPress={() => setSortOption('price')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'price' && styles.activeSortText]}>Prix</Text>
          {sortBy === 'price' && (
            sortDirection === 'asc' ? 
              <ChevronUp size={14} color={COLORS.white} /> : 
              <ChevronDown size={14} color={COLORS.white} />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.sortButton, sortBy === 'status' && styles.activeSortButton]}
          onPress={() => setSortOption('status')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'status' && styles.activeSortText]}>Statut</Text>
          {sortBy === 'status' && (
            sortDirection === 'asc' ? 
              <ChevronUp size={14} color={COLORS.white} /> : 
              <ChevronDown size={14} color={COLORS.white} />
          )}
        </TouchableOpacity>
      </View>
      
      {isCalendarVisible && (
        <View style={styles.calendarContainer}>
          {/* Simple calendar implementation - in a real app, use a dedicated calendar component */}
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>
              Choisir une date
            </Text>
            <TouchableOpacity onPress={toggleCalendar} style={styles.closeCalendarButton}>
              <Text style={styles.closeCalendarText}>×</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.calendarGrid}>
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
              <Text key={`day-${index}`} style={styles.calendarWeekday}>{day}</Text>
            ))}
            
            {Array.from({ length: 31 }, (_, i) => {
              const date = new Date(2023, 5, i + 1); // June 2023
              return renderCalendarDay({ date });
            })}
          </View>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary_dark} />
      <View style={styles.header}>
        <Text style={styles.title}>{t('reservation.title') || 'Réservations'}</Text>
        <Text style={styles.subtitle}>{t('reservation.subtitle') || 'Gérez vos visites'}</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
          <Text style={styles.loadingText}>Chargement des réservations...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchReservations}
          >
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={reservations}
          renderItem={renderReservationItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Calendar size={64} color={COLORS.gray} />
              <Text style={styles.emptyTitle}>Aucune réservation</Text>
              <Text style={styles.emptyText}>
                Vous n'avez pas encore de réservations.
              </Text>
              <TouchableOpacity 
                style={styles.createReservationButton}
                onPress={() => navigation.navigate('Map')}
              >
                <Text style={styles.createReservationButtonText}>Planifier une visite</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('Map')}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
      
      <FooterNav navigation={navigation} activeScreen="Reservation" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light_gray,
  },
  header: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + SPACING.md : SPACING.lg,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: getFontWeight('bold'),
    color: COLORS.white,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  listHeader: {
    marginBottom: SPACING.md,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterIcon: {
    marginRight: SPACING.xs,
  },
  filterButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZE.sm,
    fontWeight: getFontWeight('medium'),
  },
  clearFilterButton: {
    marginLeft: SPACING.xs,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.light_gray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearFilterText: {
    color: COLORS.gray,
    fontSize: FONT_SIZE.sm,
    fontWeight: getFontWeight('bold'),
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activeSortButton: {
    backgroundColor: COLORS.primary,
  },
  sortButtonText: {
    color: COLORS.gray,
    fontSize: FONT_SIZE.xs,
    fontWeight: getFontWeight('medium'),
    marginRight: SPACING.xs,
  },
  activeSortText: {
    color: COLORS.white,
  },
  calendarContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  calendarTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: getFontWeight('bold'),
    color: COLORS.black,
  },
  closeCalendarButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.light_gray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeCalendarText: {
    color: COLORS.gray,
    fontSize: FONT_SIZE.md,
    fontWeight: getFontWeight('bold'),
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  calendarWeekday: {
    width: '14%',
    textAlign: 'center',
    marginBottom: SPACING.sm,
    color: COLORS.gray,
    fontWeight: getFontWeight('medium'),
  },
  calendarDay: {
    width: '14%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  calendarDaySelected: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
  },
  calendarDayWithReservation: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 20,
  },
  calendarDayText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.black,
  },
  calendarDayTextSelected: {
    color: COLORS.white,
    fontWeight: getFontWeight('bold'),
  },
  reservationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reservationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light_gray,
  },
  siteName: {
    fontSize: FONT_SIZE.md,
    fontWeight: getFontWeight('bold'),
    color: COLORS.black,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xs,
    fontWeight: getFontWeight('medium'),
  },
  reservationDetails: {
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  detailText: {
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray,
  },
  reservationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.light_gray,
  },
  priceText: {
    fontSize: FONT_SIZE.md,
    fontWeight: getFontWeight('bold'),
    color: COLORS.primary,
  },
  detailsButton: {
    backgroundColor: COLORS.primary_light,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
  },
  detailsButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.xs,
    fontWeight: getFontWeight('medium'),
  },
  addButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  addButtonText: {
    fontSize: 28,
    fontWeight: getFontWeight('bold'),
    color: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.gray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.red,
    marginBottom: SPACING.md,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.sm,
    fontWeight: getFontWeight('medium'),
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginTop: SPACING.lg,
  },
  emptyTitle: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.lg,
    fontWeight: getFontWeight('bold'),
    color: COLORS.black,
  },
  emptyText: {
    marginTop: SPACING.sm,
    fontSize: FONT_SIZE.md,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  createReservationButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
  },
  createReservationButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.sm,
    fontWeight: getFontWeight('medium'),
  },
});

export default ReservationScreen;
