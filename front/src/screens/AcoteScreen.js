
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TextInput, 
  TouchableOpacity, FlatList, ActivityIndicator, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../theme/colors';
import { SPACING } from '../theme/spacing';
import { FONT_SIZE } from '../theme/typography';
import { FooterNav } from '../components/FooterNav';
import { useLocationPermission } from '../hooks/useLocationPermission';
import { usePlacesWithDistance } from '../hooks/usePlacesWithDistance';
import PlaceItem from '../components/PlaceItem';
import AcoteFilterModal from '../components/AcoteFilterModal';

const AcoteScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [maxDistance, setMaxDistance] = useState(50); // Default 50km
  const [showFilterModal, setShowFilterModal] = useState(false);
  const { userLocation, locationError } = useLocationPermission();
  const { places, isLoading, error } = usePlacesWithDistance(userLocation, maxDistance);

  const filteredPlaces = places.filter(place => 
    place.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    place.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDistance = (distance) => {
    if (distance === null || distance === undefined) {
      return `${t('acote.distance')}: ${t('map.locating')}`;
    }
    
    if (distance < 1) {
      // Convert to meters
      const meters = Math.round(distance * 1000);
      return `${meters} ${t('map.meters')}`;
    }
    
    return `${distance} ${t('map.kilometers')}`;
  };

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <View style={styles.searchContainer}>
        <Search size={20} color={COLORS.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('acote.searchPlaceholder')}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.gray}
        />
      </View>
      <TouchableOpacity 
        style={styles.filterButton}
        onPress={() => setShowFilterModal(true)}
      >
        <SlidersHorizontal size={20} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {searchQuery 
          ? t('acote.noResults') 
          : locationError 
            ? t('acote.noPlacesFound')
            : t('acote.gettingLocation')}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('acote.title')}</Text>
        <Text style={styles.subtitle}>{t('acote.subtitle')}</Text>
      </View>

      <FlatList
        data={filteredPlaces}
        renderItem={({ item }) => (
          <PlaceItem 
            place={item}
            distance={item.distance}
            distanceLabel={formatDistance(item.distance)}
            onPress={() => navigation.navigate('PlaceDetails', { placeId: item.id })}
          />
        )}
        keyExtractor={item => item.id?.toString() || Math.random().toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyList}
        contentContainerStyle={styles.listContent}
      />

      <Modal 
        visible={showFilterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <AcoteFilterModal 
            visible={showFilterModal}
            onClose={() => setShowFilterModal(false)}
            maxDistance={maxDistance}
            setMaxDistance={setMaxDistance}
          />
        </View>
      </Modal>

      <FooterNav navigation={navigation} activeScreen="Acote" />
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SPACING.sm,
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZE.md,
    color: COLORS.black,
  },
  filterButton: {
    backgroundColor: COLORS.white,
    padding: SPACING.sm,
    borderRadius: 10,
  },
  listContent: {
    padding: SPACING.md,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.gray,
    fontSize: FONT_SIZE.md,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray,
    textAlign: 'center',
  },
});

export default AcoteScreen;
