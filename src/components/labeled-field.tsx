import type { ReactNode } from "react";
import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

interface LabeledFieldProps extends TextInputProps {
  label: string;
  error?: string;
  /** Optional element rendered beside the input (e.g. a stepper button). */
  rightAdornment?: ReactNode;
}

export function LabeledField({
  label,
  error,
  style,
  rightAdornment,
  ...rest
}: LabeledFieldProps) {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <View style={styles.inputRow}>
        <TextInput
          placeholderTextColor={theme.textSecondary}
          style={[
            styles.input,
            { color: theme.text, backgroundColor: theme.backgroundElement },
            style,
          ]}
          {...rest}
        />
        {rightAdornment}
      </View>
      {error ? (
        <ThemedText type="small" style={styles.error}>
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.one },
  inputRow: { flexDirection: "row", alignItems: "center", gap: Spacing.two },
  input: {
    flex: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  error: { color: "#e5484d" },
});
