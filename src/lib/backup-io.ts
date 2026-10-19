import Constants, { ExecutionEnvironment } from "expo-constants";
import * as DocumentPicker from "expo-document-picker";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

/** Writes the file to the documents dir and opens the share sheet. */
export async function saveFile(
  name: string,
  contents: string,
  mimeType: string,
  uti: string
): Promise<string> {
  const file = new File(Paths.document, name);
  if (file.exists) file.delete();
  file.create();
  file.write(contents);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType,
      dialogTitle: "Export finance data",
      UTI: uti,
    });
  }
  return file.uri;
}

/** Lets the user pick a JSON file and returns its text, or null if cancelled. */
export async function pickJsonFile(): Promise<string | null> {
  // Expo Go sandboxes the filesystem to its scoped experience directory, so it
  // cannot read the copy DocumentPicker drops in /cache/DocumentPicker/. This
  // works in a development/standalone build (the installed APK), not Expo Go.
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    throw new Error(
      "Import isn't supported in Expo Go. Open the installed app (your dev/APK build) and try again."
    );
  }

  const result = await DocumentPicker.getDocumentAsync({
    type: "application/json",
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled) return null;

  return new File(result.assets[0].uri).text();
}
