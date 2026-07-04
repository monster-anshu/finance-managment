import { router } from "expo-router";
import { ActivityIndicator, Button, StyleSheet, View } from "react-native";

import {
  BarBreakdown,
  type BreakdownSegment,
} from "@/components/bar-breakdown";
import { Card } from "@/components/card";
import { EmptyState } from "@/components/empty-state";
import { Screen } from "@/components/screen";
import { Stat } from "@/components/stat";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { usePortfolioSummary } from "@/features/dashboard/hooks";
import { formatINR } from "@/lib/format";
import { ASSET_TYPE_LABELS, TX_KIND_LABELS } from "@/lib/types";

const TYPE_COLORS = {
  stock: "#3c87f7",
  etf: "#30a46c",
  bond: "#e5a000",
  fd: "#00a2c7",
} as const;
const KIND_COLORS = { lumpsum: "#8e4ec6", sip: "#e5484d" } as const;

export default function DashboardScreen() {
  const { data: summary, isPending } = usePortfolioSummary();

  if (isPending || !summary) {
    return (
      <Screen scroll={false}>
        <ActivityIndicator />
      </Screen>
    );
  }

  const typeSegments: BreakdownSegment[] = (
    Object.keys(summary.byType) as (keyof typeof summary.byType)[]
  ).map((type) => ({
    label: ASSET_TYPE_LABELS[type],
    amount: summary.byType[type],
    color: TYPE_COLORS[type],
  }));

  const kindSegments: BreakdownSegment[] = (
    Object.keys(summary.byKind) as (keyof typeof summary.byKind)[]
  ).map((kind) => ({
    label: TX_KIND_LABELS[kind],
    amount: summary.byKind[kind],
    color: KIND_COLORS[kind],
  }));

  return (
    <Screen>
      <View style={styles.header}>
        <ThemedText type="subtitle">Dashboard</ThemedText>
        <Button title="Settings" onPress={() => router.push("/settings")} />
      </View>

      {summary.buyCount === 0 ? (
        <EmptyState
          title="Nothing invested yet"
          hint="Add instruments and buys from the Portfolio tab."
        />
      ) : (
        <>
          <Card>
            <ThemedText type="small" themeColor="textSecondary">
              Total invested
            </ThemedText>
            <ThemedText type="title">
              {formatINR(summary.totalInvested)}
            </ThemedText>
            <View style={styles.counts}>
              <Stat
                label="Instruments"
                value={String(summary.instrumentCount)}
              />
              <Stat label="Buys" value={String(summary.buyCount)} />
            </View>
          </Card>

          <Card>
            <ThemedText type="smallBold">By asset type</ThemedText>
            <BarBreakdown segments={typeSegments} />
          </Card>

          <Card>
            <ThemedText type="smallBold">By kind</ThemedText>
            <BarBreakdown segments={kindSegments} />
          </Card>
        </>
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
  counts: { gap: Spacing.one, marginTop: Spacing.two },
});
