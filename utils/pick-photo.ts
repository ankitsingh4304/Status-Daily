import * as ImagePicker from 'expo-image-picker';

/** Launch the gallery picker with a square crop and return the chosen image URI,
 *  or null if permission was denied or the user cancelled. Shared by the profile
 *  header avatar tap and the edit-profile modal. */
export async function pickSquarePhoto(): Promise<string | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;

  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85,
  });

  if (!res.canceled && res.assets[0]?.uri) return res.assets[0].uri;
  return null;
}
