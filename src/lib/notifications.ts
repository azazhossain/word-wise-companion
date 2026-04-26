import { LocalNotifications } from "@capacitor/local-notifications";

const isNative = typeof window !== "undefined" && !!(window as any).Capacitor?.isNativePlatform?.();

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNative) {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission !== "denied") {
      const r = await Notification.requestPermission();
      return r === "granted";
    }
    return false;
  }
  const { display } = await LocalNotifications.requestPermissions();
  return display === "granted";
}

export async function scheduleDailyReminder(hour = 22, minute = 0): Promise<void> {
  if (!isNative) return; // Web: handled separately if needed
  await LocalNotifications.cancel({ notifications: [{ id: 1001 }] });
  const now = new Date();
  const at = new Date();
  at.setHours(hour, minute, 0, 0);
  if (at.getTime() <= now.getTime()) at.setDate(at.getDate() + 1);

  await LocalNotifications.schedule({
    notifications: [
      {
        id: 1001,
        title: "AdroitVocab — আজকের অনুশীলন 📚",
        body: "১০টি নতুন শব্দ অপেক্ষা করছে। চলো শুরু করি!",
        schedule: { at, repeats: true, every: "day", allowWhileIdle: true },
        smallIcon: "ic_stat_icon_config_sample",
      },
    ],
  });
}

export async function cancelDailyReminder(): Promise<void> {
  if (!isNative) return;
  await LocalNotifications.cancel({ notifications: [{ id: 1001 }] });
}
