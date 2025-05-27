
import React from 'react';
import { TextInput as RNTextInput, StyleSheet, View } from 'react-native';
import { COLORS } from '../theme/colors';
import { SPACING } from '../theme/spacing';
import { FONT_SIZE } from '../theme/typography';

const TextInput = ({
  style,
  ...props
}) => {
  return (
    <View style={styles.container}>
      <RNTextInput
        style={[styles.input, style]}
        placeholderTextColor={COLORS.gray}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.light_gray,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.black,
    borderWidth: 1,
    borderColor: COLORS.gray_light,
  },
});

export default TextInput;
