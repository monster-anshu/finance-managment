import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="smallBold">{title}</ThemedText>
      {hint ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
          {hint}
        </ThemedText>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: Spacing.five, gap: Spacing.one },
  hint: { textAlign: 'center' },
});
