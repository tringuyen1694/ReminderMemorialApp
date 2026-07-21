import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatLunar } from "../utils/lunar";

export default function EventCard({ event, nextDate, daysLeft, highlight, onDelete }) {
  const title = event.type === "gio" ? `Ngày giỗ của ${event.name}` : event.name;

  const solarText = `${String(nextDate.getDate()).padStart(2, "0")}/${String(
    nextDate.getMonth() + 1
  ).padStart(2, "0")}/${nextDate.getFullYear()}`;

  const subtitle =
    event.type === "gio"
      ? `${solarText} · Âm lịch: ${formatLunar(event.lunarDay, event.lunarMonth)}`
      : solarText;

  return (
    <View style={[styles.card, highlight && styles.highlight]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={styles.days}>{daysLeft}</Text>
        <Text style={styles.daysLabel}>ngày nữa</Text>
      </View>
      {onDelete && (
        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn} accessibilityLabel="Xoá">
          <Ionicons name="trash-outline" size={16} color="#999" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  highlight: {
    borderColor: "#378ADD",
    borderWidth: 1.5,
  },
  name: { fontSize: 15, fontWeight: "600", color: "#111" },
  subtitle: { fontSize: 12, color: "#777", marginTop: 2 },
  days: { fontSize: 18, fontWeight: "700", color: "#378ADD" },
  daysLabel: { fontSize: 11, color: "#999" },
  deleteBtn: { marginLeft: 10, padding: 4 },
});
