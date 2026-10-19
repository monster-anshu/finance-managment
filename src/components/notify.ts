import { Alert } from "react-native";

export function notify(title: string, message: string) {
  Alert.alert(title, message);
}
