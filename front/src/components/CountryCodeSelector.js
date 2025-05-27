
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, FlatList, Image } from 'react-native';
import { COLORS } from '../theme/colors';
import { SPACING } from '../theme/spacing';
import { FONT_SIZE } from '../theme/typography';

const countries = [
  { code: '+216', name: 'Tunisia', flag: '🇹🇳' },
  { code: '+1', name: 'United States', flag: '🇺🇸' },
  { code: '+1', name: 'Canada', flag: '🇨🇦' },
  { code: '+33', name: 'France', flag: '🇫🇷' },
  { code: '+49', name: 'Germany', flag: '🇩🇪' },
  { code: '+39', name: 'Italy', flag: '🇮🇹' },
  { code: '+41', name: 'Switzerland', flag: '🇨🇭' },
];

const CountryCodeSelector = ({ selectedCountry, onSelectCountry }) => {
  const [modalVisible, setModalVisible] = React.useState(false);

  const handleCountrySelect = (country) => {
    onSelectCountry(country);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.flagText}>{selectedCountry.flag}</Text>
        <Text style={styles.codeText}>{selectedCountry.code}</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={countries}
              keyExtractor={(item) => item.code + item.name}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryItem}
                  onPress={() => handleCountrySelect(item)}
                >
                  <Text style={styles.flagText}>{item.flag}</Text>
                  <Text style={styles.countryName}>{item.name}</Text>
                  <Text style={styles.countryCode}>{item.code}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 80,
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.light_gray,
    borderRadius: 10,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.light_gray,
  },
  flagText: {
    fontSize: FONT_SIZE.md,
    marginRight: SPACING.xs,
  },
  codeText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.black,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    maxHeight: '70%',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: SPACING.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light_gray,
    paddingBottom: SPACING.sm,
  },
  modalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  closeButton: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.gray,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light_gray,
  },
  countryName: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    marginLeft: SPACING.sm,
  },
  countryCode: {
    fontSize: FONT_SIZE.md,
    color: COLORS.gray,
  },
});

export default CountryCodeSelector;
