import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "@memorial_events";

export async function loadEvents() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn("Không đọc được dữ liệu đã lưu", e);
    return [];
  }
}

export async function saveEvents(events) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(events));
  } catch (e) {
    console.warn("Không lưu được dữ liệu", e);
  }
}
