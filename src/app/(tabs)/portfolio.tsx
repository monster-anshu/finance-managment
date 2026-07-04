import { Link, router } from "expo-router";
import {
  ActivityIndicator,
  Button,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { Card } from "@/components/card";
import { EmptyState } from "@/components/empty-state";
import { Screen } from "@/components/screen";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { useInstruments } from "@/features/instruments/hooks";
import { useAllTransactions } from "@/features/transactions/hooks";
import { summarizeByInstrument } from "@/lib/aggregation";
import { formatINR, formatQuantity } from "@/lib/format";
import { ASSET_TYPE_LABELS } from "@/lib/types";

export default function PortfolioScreen() {
  const { data: instruments, isPending: loadingInstruments } = useInstruments();
  const { data: transactions, isPending: loadingTx } = useAllTransactions();

  if (loadingInstruments || loadingTx || !instruments || !transactions) {
    return (
      <Screen scroll={false}>
        <ActivityIndicator />
      </Screen>
    );
  }

  const rows = summarizeByInstrument(instruments, transactions);

  return (
    <Screen>
      <View style={styles.header}>
        <ThemedText type="subtitle">Portfolio</ThemedText>
        <Button title="Add" onPress={() => router.push("/instrument/new")} />
      </View>

      {rows.length === 0 ? (
        <EmptyState
          title="No instruments yet"
          hint="Tap Add to create your first holding."
        />
      ) : (
        rows.map(({ instrument, summary }) => (
          <Link
            key={instrument.id}
            href={`/instrument/${instrument.id}`}
            asChild
          >
            <Pressable>
              <Card>
                <View style={styles.cardHeader}>
                  <ThemedText type="smallBold">{instrument.name}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {ASSET_TYPE_LABELS[instrument.type]}
                  </ThemedText>
                </View>
                <View style={styles.cardHeader}>
                  <ThemedText type="small" themeColor="textSecondary">
                    {formatQuantity(summary.totalUnits)} units
                  </ThemedText>
                  <ThemedText type="smallBold">
                    {formatINR(summary.totalInvested)}
                  </ThemedText>
                </View>
              </Card>
            </Pressable>
          </Link>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
});
