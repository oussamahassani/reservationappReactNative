import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  Platform,
} from "react-native";
import { Search, X, SlidersHorizontal } from "lucide-react-native";
import { COLORS } from "../../theme/colors";
import { SPACING } from "../../theme/spacing";
import { FONT_SIZE } from "../../theme/typography";
import SearchBar from "../SearchBar";
import { useTranslation } from "react-i18next";

const SearchInput = ({
  onSearch,
  searchQuery,
  setSearchQuery,
  onFilterPress,
}) => {
  const [focused, setFocused] = useState(false);
  const { t } = useTranslation();

  const handleClear = () => {
    setSearchQuery("");
    onSearch("");
    Keyboard.dismiss();
    setFocused(false);
  };

  const handleSubmit = () => {
    onSearch(searchQuery);
    Keyboard.dismiss();
    setFocused(false);
  };

  return (
    <View style={[styles.container, focused && styles.containerFocused]}>
      <View style={styles.searchBarContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t("acote.searchPlaceholder")}
          onClear={handleClear}
          onSubmitEditing={handleSubmit}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {onFilterPress && (
          <TouchableOpacity
            style={styles.filterButton}
            onPress={onFilterPress}
            accessibilityLabel={t("acote.filter")}
          >
            <SlidersHorizontal size={20} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: SPACING.lg,
    left: SPACING.lg,
    right: SPACING.lg,
    zIndex: 10,
    borderRadius: 8,
    backgroundColor: "transparent",
  },
  containerFocused: {
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterButton: {
    backgroundColor: COLORS.white,
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: SPACING.sm,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});

export default SearchInput;
