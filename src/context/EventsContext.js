import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { loadEvents, saveEvents } from "../utils/storage";
import { nextSolarDateForLunarAnniversary } from "../utils/lunar";
import { scheduleEventReminders, cancelEventNotifications } from "../utils/notifications";

const EventsContext = createContext(null);

// Trả về ngày dương lịch KẾ TIẾP (Date) cho 1 sự kiện, và số ngày còn lại
export function getNextOccurrence(event, today = new Date()) {
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if (event.type === "gio") {
    const next = nextSolarDateForLunarAnniversary(event.lunarDay, event.lunarMonth, todayMidnight);
    const diff = Math.round((next - todayMidnight) / 86400000);
    return { nextDate: next, daysLeft: diff };
  }

  // Ngày kỷ niệm: lặp lại theo dương lịch mỗi năm
  let next = new Date(today.getFullYear(), event.month - 1, event.day);
  if (next < todayMidnight) {
    next = new Date(today.getFullYear() + 1, event.month - 1, event.day);
  }
  const diff = Math.round((next - todayMidnight) / 86400000);
  return { nextDate: next, daysLeft: diff };
}

export function EventsProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await loadEvents();
      setEvents(stored);
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (loaded) saveEvents(events);
  }, [events, loaded]);

  const addEvent = useCallback(async (event) => {
    const withId = { ...event, id: `${Date.now()}-${Math.random().toString(36).slice(2)}` };
    setEvents((prev) => [...prev, withId]);
    const { nextDate } = getNextOccurrence(withId);
    await scheduleEventReminders(withId, nextDate);
    return withId;
  }, []);

  const removeEvent = useCallback(async (id) => {
    await cancelEventNotifications(id);
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return (
    <EventsContext.Provider value={{ events, addEvent, removeEvent }}>
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error("useEvents phải được dùng bên trong EventsProvider");
  return ctx;
}
