import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { formatINR } from "@/lib/format";

export interface BreakdownSegment {
  label: string;
  amount: number;
  color: string;
}

export function BarBreakdown({ segments }: { segments: BreakdownSegment[] }) {
  const total = segments.reduce((sum, s) => sum + s.amount, 0);

  return (
    <View style={styles.container}>
      {segments.map((segment) => {
        const pct = total > 0 ? (segment.amount / total) * 100 : 0;
        return (
          <View key={segment.label} style={styles.row}>
            <View style={styles.labelRow}>
              <ThemedText type="small">{segment.label}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {formatINR(segment.amount)} · {pct.toFixed(0)}%
              </ThemedText>
            </View>
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  { width: `${pct}%`, backgroundColor: segment.color },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.three },
  row: { gap: Spacing.one },
  labelRow: { flexDirection: "row", justifyContent: "space-between" },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(127,127,127,0.2)",
    overflow: "hidden",
  },
  fill: { height: 8, borderRadius: 4 },
});
