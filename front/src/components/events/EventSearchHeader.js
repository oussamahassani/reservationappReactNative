
import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Filter, Search } from 'lucide-react-native';
import { COLORS } from '../../theme/colors';
import { SPACING } from '../../theme/spacing';
import { FONT_SIZE } from '../../theme/typography';

const EventSearchHeader = ({ searchQuery, onSearchChange, onFilterPress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Search color={COLORS.gray} size={20} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un événement..."
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholderTextColor={COLORS.gray}
        />
      </View>
      <TouchableOpacity style={styles.filterButton} onPress={onFilterPress}>
        <Filter color={COLORS.primary} size={24} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light_gray,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.light_gray,
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
    padding: SPACING.sm,
    backgroundColor: COLORS.light_gray,
    borderRadius: 10,
  },
});

export default EventSearchHeader;
