export function confirmDestructive(
  message: string,
  onConfirm: () => void,
  title = "Are you sure?"
) {
  // react-native-web's Alert is a no-op, so fall back to the browser dialog.
  if (window.confirm(`${title}\n\n${message}`)) onConfirm();
}
