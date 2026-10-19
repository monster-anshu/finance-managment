import { StyleSheet, View } from "react-native";

import type { DateFieldProps } from "@/components/date-field";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

function toInputValue(value: number): string {
  const date = new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function fromInputValue(text: string): number | null {
  const [year, month, day] = text.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day).getTime();
}

// @react-native-community/datetimepicker has no web support; use the native
// browser date input instead.
export function DateField({ label, value, onChange, error }: DateFieldProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <input
        type="date"
        value={value != null ? toInputValue(value) : ""}
        onChange={(event) => {
          const next = fromInputValue(event.target.value);
          if (next !== null) onChange(next);
        }}
        style={{
          padding: Spacing.three,
          borderRadius: Spacing.two,
          border: "none",
          fontSize: 16,
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: theme.text,
          backgroundColor: theme.backgroundElement,
          colorScheme: "light dark",
        }}
      />
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
  error: { color: "#e5484d" },
});
