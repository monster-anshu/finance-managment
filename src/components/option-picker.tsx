import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";

export interface Option<T extends string> {
  value: T;
  label: string;
}

interface OptionPickerProps<T extends string> {
  label: string;
  options: Option<T>[];
  value: T | "";
  onChange: (value: T) => void;
  error?: string;
}

export function OptionPicker<T extends string>({
  label,
  options,
  value,
  onChange,
  error,
}: OptionPickerProps<T>) {
  return (
    <View style={styles.container}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <View style={styles.row}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
            >
              <ThemedView
                type={selected ? "backgroundSelected" : "backgroundElement"}
                style={styles.chip}
              >
                <ThemedText
                  type="small"
                  themeColor={selected ? "text" : "textSecondary"}
                >
                  {option.label}
                </ThemedText>
              </ThemedView>
            </Pressable>
          );
        })}
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
  row: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.two },
  chip: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  error: { color: "#e5484d" },
});
