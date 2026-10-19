import type { Stack } from "expo-router";
import type { ComponentProps } from "react";

export type StackScreenOptions = ComponentProps<typeof Stack>["screenOptions"];

// Native headers already provide back buttons and swipe-back gestures.
// (.tsx to match the .web.tsx twin: Metro picks `x.ts` before `x.web.tsx`.)
export const stackScreenOptions: StackScreenOptions = undefined;
