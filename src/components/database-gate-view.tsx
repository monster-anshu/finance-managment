import type { ReactNode } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";

interface DatabaseGateViewProps {
  ready: boolean;
  error?: Error;
  children: ReactNode;
}

/** Shows a spinner until the database is ready, or the error if it failed. */
export function DatabaseGateView({
  ready,
  error,
  children,
}: DatabaseGateViewProps) {
  if (error) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText type="subtitle">Database error</ThemedText>
        <ThemedText
          type="small"
          themeColor="textSecondary"
          style={styles.message}
        >
          {error.message}
        </ThemedText>
      </ThemedView>
    );
  }

  if (!ready) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.four,
  },
  message: {
    marginTop: Spacing.two,
    textAlign: "center",
  },
});
