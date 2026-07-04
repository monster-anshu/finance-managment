import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import type { ReactNode } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { db } from "@/db/client";
import migrations from "@/db/drizzle/migrations";

export function MigrationGate({ children }: { children: ReactNode }) {
  const { success, error } = useMigrations(db, migrations);

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

  if (!success) {
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
