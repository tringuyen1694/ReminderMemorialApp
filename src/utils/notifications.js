import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

const FREQ_DAYS = {
  "1d": 1,
  "1w": 7,
  "1m": 30,
};

// Huỷ toàn bộ thông báo đã lên lịch cho 1 sự kiện (dùng khi sửa/xoá)
export async function cancelEventNotifications(eventId) {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  const toCancel = all.filter((n) => n.content.data?.eventId === eventId);
  await Promise.all(
    toCancel.map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
  );
}

// Lên lịch nhắc nhở local dựa trên ngày dương lịch kế tiếp (nextSolarDate) và danh sách tần suất đã chọn
export async function scheduleEventReminders(event, nextSolarDate) {
  await cancelEventNotifications(event.id);

  const title =
    event.type === "gio" ? `Ngày giỗ của ${event.name}` : event.name;

  for (const freq of event.freq || []) {
    const daysBefore = FREQ_DAYS[freq];
    if (!daysBefore) continue;

    const triggerDate = new Date(nextSolarDate);
    triggerDate.setDate(triggerDate.getDate() - daysBefore);
    triggerDate.setHours(8, 0, 0, 0);

    if (triggerDate.getTime() <= Date.now()) continue;

    const label =
      freq === "1d" ? "còn 1 ngày nữa" : freq === "1w" ? "còn 1 tuần nữa" : "còn 1 tháng nữa";

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body: `${title} — ${label}.`,
        data: { eventId: event.id },
      },
      trigger: triggerDate,
    });
  }
}
