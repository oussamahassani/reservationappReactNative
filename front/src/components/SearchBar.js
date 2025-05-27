
import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { COLORS } from '../theme/colors';
import { SPACING } from '../theme/spacing';
import { FONT_SIZE, FONT_WEIGHT } from '../theme/typography';

const SearchBar = ({ value, onChangeText, placeholder, onClear }) => {
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Search size={20} color={COLORS.gray} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder || "Search..."}
          placeholderTextColor={COLORS.gray}
          value={value}
          onChangeText={onChangeText}
        />
        {value ? (
          <TouchableOpacity onPress={onClear} style={styles.clearButton}>
            <View style={styles.clearButtonInner}>
              <X size={16} color={COLORS.white} />
            </View>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.black,
    fontWeight: FONT_WEIGHT.medium,
    paddingVertical: SPACING.xs,
  },
  clearButton: {
    padding: SPACING.xs,
  },
  clearButtonInner: {
    backgroundColor: COLORS.primary_light,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SearchBar;