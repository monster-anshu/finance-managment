import { useSyncExternalStore } from "react";
import { Button, StyleSheet, View } from "react-native";

import { Card } from "@/components/card";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import {
  getPwaInstallStatus,
  promptPwaInstall,
  subscribePwaInstall,
  type PwaInstallStatus,
} from "@/lib/pwa-install";

const DESCRIPTIONS: Record<PwaInstallStatus, string> = {
  installed: "Finance is installed on this device.",
  prompt:
    "Install Finance as an app: it opens full screen from your home screen or dock and works offline.",
  ios: "To install on iPhone or iPad: open this page in Safari, tap the Share button, then “Add to Home Screen”.",
  manual:
    "Use your browser's menu to install this site as an app (e.g. “Install app” or “Add to Dock”).",
};

export function InstallAppCard() {
  const status = useSyncExternalStore(
    subscribePwaInstall,
    getPwaInstallStatus,
    () => "manual" as const
  );

  return (
    <Card>
      <ThemedText type="smallBold">Install app</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {DESCRIPTIONS[status]}
      </ThemedText>
      {status === "prompt" ? (
        <View style={styles.buttons}>
          <Button title="Install" onPress={() => void promptPwaInstall()} />
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  buttons: { gap: Spacing.two, marginTop: Spacing.two },
});
