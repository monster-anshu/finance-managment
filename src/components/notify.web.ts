export function notify(title: string, message: string) {
  // react-native-web's Alert is a no-op, so fall back to the browser dialog.
  window.alert(`${title}\n\n${message}`);
}
