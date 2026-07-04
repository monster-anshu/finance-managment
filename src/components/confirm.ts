import { Alert } from "react-native";

export function confirmDestructive(
  message: string,
  onConfirm: () => void,
  title = "Are you sure?"
) {
  Alert.alert(title, message, [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: onConfirm },
  ]);
}
