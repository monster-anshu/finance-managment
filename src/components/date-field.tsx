import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { formatDate } from "@/lib/format";

export interface DateFieldProps {
  label: string;
  /** Epoch milliseconds, or null when unset. */
  value: number | null;
  onChange: (value: number) => void;
  error?: string;
}

export function DateField({ label, value, onChange, error }: DateFieldProps) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <View style={styles.container}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <Pressable onPress={() => setShowPicker(true)}>
        <ThemedView type="backgroundElement" style={styles.dateBox}>
          <ThemedText type="small">
            {value != null ? formatDate(value) : "Select date"}
          </ThemedText>
        </ThemedView>
      </Pressable>
      {error ? (
        <ThemedText type="small" style={styles.error}>
          {error}
        </ThemedText>
      ) : null}
      {showPicker ? (
        <DateTimePicker
          value={value != null ? new Date(value) : new Date()}
          mode="date"
          onChange={(_event, selected) => {
            if (Platform.OS !== "ios") setShowPicker(false);
            if (selected) onChange(selected.getTime());
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.one },
  dateBox: { padding: Spacing.three, borderRadius: Spacing.two },
  error: { color: "#e5484d" },
});
