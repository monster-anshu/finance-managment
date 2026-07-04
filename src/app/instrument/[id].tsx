import { router, Stack, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Button,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { Card } from "@/components/card";
import { confirmDestructive } from "@/components/confirm";
import { EmptyState } from "@/components/empty-state";
import { Screen } from "@/components/screen";
import { Stat } from "@/components/stat";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import {
  useDeleteInstrument,
  useInstrument,
} from "@/features/instruments/hooks";
import {
  useDeleteTransaction,
  useTransactionsByInstrument,
} from "@/features/transactions/hooks";
import { summarizeTransactions } from "@/lib/aggregation";
import { formatDate, formatINR, formatQuantity } from "@/lib/format";
import { ASSET_TYPE_LABELS, TX_KIND_LABELS } from "@/lib/types";

export default function InstrumentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const instrumentId = Number(id);

  const { data: instrument, isPending } = useInstrument(instrumentId);
  const { data: transactions } = useTransactionsByInstrument(instrumentId);
  const deleteInstrument = useDeleteInstrument();
  const deleteTransaction = useDeleteTransaction();

  if (isPending || !instrument) {
    return (
      <Screen scroll={false}>
        <ActivityIndicator />
      </Screen>
    );
  }

  const buys = transactions ?? [];
  const summary = summarizeTransactions(buys);

  function handleDeleteInstrument() {
    confirmDestructive(
      "Deleting this instrument also deletes all its buys. This cannot be undone.",
      () =>
        deleteInstrument.mutate(instrumentId, {
          onSuccess: () => router.back(),
        })
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: instrument.name }} />

      <Card>
        <ThemedText type="subtitle">{instrument.name}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {ASSET_TYPE_LABELS[instrument.type]}
        </ThemedText>
        {instrument.description ? (
          <ThemedText type="small">{instrument.description}</ThemedText>
        ) : null}
        <View style={styles.stats}>
          <Stat
            label="Total invested"
            value={formatINR(summary.totalInvested)}
          />
          <Stat
            label="Total units"
            value={formatQuantity(summary.totalUnits)}
          />
          <Stat label="Avg cost / unit" value={formatINR(summary.avgCost)} />
        </View>
        <View style={styles.actions}>
          <Button
            title="Edit"
            onPress={() => router.push(`/instrument/edit/${instrumentId}`)}
          />
          <Button
            title="Delete"
            color="#e5484d"
            onPress={handleDeleteInstrument}
          />
        </View>
      </Card>

      <View style={styles.buysHeader}>
        <ThemedText type="smallBold">Buys</ThemedText>
        <Button
          title="Add Buy"
          onPress={() =>
            router.push(`/transaction/new?instrumentId=${instrumentId}`)
          }
        />
      </View>

      {buys.length === 0 ? (
        <EmptyState
          title="No buys yet"
          hint="Add your first lumpsum or SIP purchase."
        />
      ) : (
        buys.map((buy) => (
          <Pressable
            key={buy.id}
            onPress={() => router.push(`/transaction/edit/${buy.id}`)}
          >
            <Card>
              <View style={styles.buyRow}>
                <ThemedText type="smallBold">
                  {TX_KIND_LABELS[buy.kind]}
                </ThemedText>
                <ThemedText type="smallBold">
                  {formatINR(buy.pricePerUnit * buy.quantity)}
                </ThemedText>
              </View>
              <Stat label="Price / unit" value={formatINR(buy.pricePerUnit)} />
              <Stat label="Quantity" value={formatQuantity(buy.quantity)} />
              <Stat label="Date" value={formatDate(buy.date)} />
              {buy.note ? (
                <ThemedText type="small" themeColor="textSecondary">
                  {buy.note}
                </ThemedText>
              ) : null}
              <Button
                title="Delete buy"
                color="#e5484d"
                onPress={() =>
                  confirmDestructive(
                    "Delete this buy? This cannot be undone.",
                    () => deleteTransaction.mutate({ id: buy.id, instrumentId })
                  )
                }
              />
            </Card>
          </Pressable>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: { gap: Spacing.one, marginTop: Spacing.two },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.two,
  },
  buysHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buyRow: { flexDirection: "row", justifyContent: "space-between" },
});
