import React, { useMemo, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useEvents, getNextOccurrence } from "../context/EventsContext";
import EventCard from "../components/EventCard";
import CreateReminderModal from "../components/CreateReminderModal";

export default function ListScreen() {
  const { events, removeEvent } = useEvents();
  const [modalVisible, setModalVisible] = useState(false);

  const sorted = useMemo(() => {
    const today = new Date();
    return events
      .map((event) => {
        const { nextDate, daysLeft } = getNextOccurrence(event, today);
        return { event, nextDate, daysLeft };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [events]);

  function confirmDelete(event) {
    Alert.alert(
      "Xoá ngày này?",
      event.type === "gio" ? `Ngày giỗ của ${event.name}` : event.name,
      [
        { text: "Huỷ", style: "cancel" },
        { text: "Xoá", style: "destructive", onPress: () => removeEvent(event.id) },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.header}>Ngày kỷ niệm</Text>

      {sorted.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="calendar-outline" size={36} color="#ccc" />
          <Text style={styles.emptyText}>Chưa có ngày nào. Nhấn nút + để thêm.</Text>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.event.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          renderItem={({ item, index }) => (
            <EventCard
              event={item.event}
              nextDate={item.nextDate}
              daysLeft={item.daysLeft}
              highlight={index === 0}
              onDelete={() => confirmDelete(item.event)}
            />
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        accessibilityLabel="Thêm ngày kỷ niệm"
      >
        <Ionicons name="add" size={26} color="#fff" />
      </TouchableOpacity>

      <CreateReminderModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f5" },
  header: { fontSize: 20, fontWeight: "700", paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  emptyText: { color: "#999", fontSize: 13 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
});
