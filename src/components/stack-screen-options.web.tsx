import { Pressable, StyleSheet } from "react-native";

import type { StackScreenOptions } from "@/components/stack-screen-options";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { goBack, parentHref, type RouteParams } from "@/lib/navigation";

// A standalone PWA (iOS home screen) has no browser back button or swipe
// gesture, and the stack hides its back arrow when there's no history, so
// every stack screen gets an always-visible Back button.
export const stackScreenOptions: StackScreenOptions = ({ route }) => ({
  headerLeft: () => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      onPress={() =>
        goBack(parentHref(route.name, (route.params ?? {}) as RouteParams))
      }
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <ThemedText type="link" style={styles.chevron}>
        ‹
      </ThemedText>
      <ThemedText type="link">Back</ThemedText>
    </Pressable>
  ),
});

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  chevron: { fontSize: 28, lineHeight: 28 },
  pressed: { opacity: 0.5 },
});
