import { useState } from 'react';
import { Alert, Button, StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { exportCsv, exportJson } from '@/lib/backup';

export default function SettingsScreen() {
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<string>) {
    try {
      setBusy(true);
      await action();
    } catch (error) {
      Alert.alert('Export failed', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Card>
        <ThemedText type="smallBold">Backup / Export</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Export your data to a file you can save or share. Data lives only on this device.
        </ThemedText>
        <View style={styles.buttons}>
          <Button title="Export JSON" disabled={busy} onPress={() => run(exportJson)} />
          <Button title="Export CSV" disabled={busy} onPress={() => run(exportCsv)} />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  buttons: { gap: Spacing.two, marginTop: Spacing.two },
});
