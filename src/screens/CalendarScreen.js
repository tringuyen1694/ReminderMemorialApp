import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Pressable, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useEvents } from "../context/EventsContext";
import { solarToLunar } from "../utils/lunar";
import CreateReminderModal from "../components/CreateReminderModal";

const MONTH_NAMES = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];
const MONTH_SHORT = MONTH_NAMES.map((_, i) => `Th ${i + 1}`);
const DOW = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

// Khoảng năm hiển thị trong bảng chọn năm (có thể scroll thêm)
const YEAR_RANGE_PAST = 60;
const YEAR_RANGE_FUTURE = 60;

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export default function CalendarScreen() {
  const { events } = useEvents();
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [modalVisible, setModalVisible] = useState(false);
  const [monthPickerVisible, setMonthPickerVisible] = useState(false);
  const [yearPickerVisible, setYearPickerVisible] = useState(false);

  const yearList = useMemo(() => {
    const arr = [];
    for (let y = today.getFullYear() - YEAR_RANGE_PAST; y <= today.getFullYear() + YEAR_RANGE_FUTURE; y++) {
      arr.push(y);
    }
    return arr;
  }, []);

  // Đánh dấu những ngày dương lịch trong tháng đang xem có sự kiện rơi vào (dựa trên ngày kế tiếp gần nhất)
  const markedDays = useMemo(() => {
    const marks = new Set();
    events.forEach((event) => {
      if (event.type === "kn") {
        if (event.month - 1 === viewMonth) {
          marks.add(event.day);
        }
      } else {
        // Với ngày giỗ, kiểm tra từng ngày dương trong tháng xem có trùng ngày/tháng âm đã lưu không
        const total = daysInMonth(viewYear, viewMonth);
        for (let d = 1; d <= total; d++) {
          const [ld, lm] = solarToLunar(d, viewMonth + 1, viewYear);
          if (ld === event.lunarDay && lm === event.lunarMonth) {
            marks.add(d);
          }
        }
      }
    });
    return marks;
  }, [events, viewMonth, viewYear]);

  const cells = useMemo(() => {
    const total = daysInMonth(viewYear, viewMonth);
    const firstDow = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;
    const arr = [];
    for (let i = 0; i < firstDow; i++) arr.push(null);
    for (let d = 1; d <= total; d++) {
      const [ld, lm] = solarToLunar(d, viewMonth + 1, viewYear);
      arr.push({ day: d, lunarDay: ld, lunarMonth: lm, marked: markedDays.has(d) });
    }
    return arr;
  }, [viewYear, viewMonth, markedDays]);

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  const isToday = (d) =>
    d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.header}>Lịch</Text>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <View style={styles.monthRow}>
          <TouchableOpacity onPress={prevMonth} accessibilityLabel="Tháng trước">
            <Ionicons name="chevron-back" size={22} color="#333" />
          </TouchableOpacity>
          <View style={styles.monthYearGroup}>
            <TouchableOpacity onPress={() => setMonthPickerVisible(true)}>
              <Text style={styles.monthLabel}>{MONTH_NAMES[viewMonth]}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setYearPickerVisible(true)}>
              <Text style={styles.monthLabel}>{viewYear}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={nextMonth} accessibilityLabel="Tháng sau">
            <Ionicons name="chevron-forward" size={22} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.dowRow}>
          {DOW.map((d) => (
            <Text key={d} style={styles.dowText}>
              {d}
            </Text>
          ))}
        </View>

        <View style={styles.grid}>
          {cells.map((cell, i) => (
            <View key={i} style={styles.cell}>
              {cell && (
                <View style={[styles.cellInner, isToday(cell.day) && styles.todayCell]}>
                  <Text style={[styles.dayText, cell.marked && styles.markedText]}>
                    {cell.day}
                  </Text>
                  <Text style={styles.lunarText}>{cell.lunarDay}</Text>
                  {cell.marked && <View style={styles.dot} />}
                </View>
              )}
            </View>
          ))}
        </View>

        <Text style={styles.hint}>
          Số nhỏ phía dưới là ngày âm lịch. Ô có chấm là ngày kỷ niệm/ngày giỗ.
        </Text>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        accessibilityLabel="Thêm ngày kỷ niệm"
      >
        <Ionicons name="add" size={26} color="#fff" />
      </TouchableOpacity>

      <CreateReminderModal visible={modalVisible} onClose={() => setModalVisible(false)} />

      {/* Bảng chọn tháng (3x4) */}
      <Modal
        visible={monthPickerVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setMonthPickerVisible(false)}
      >
        <Pressable style={styles.pickerOverlay} onPress={() => setMonthPickerVisible(false)}>
          <Pressable style={styles.pickerSheet} onPress={() => {}}>
            <Text style={styles.pickerTitle}>Chọn tháng</Text>
            <View style={styles.monthGrid}>
              {MONTH_SHORT.map((label, idx) => {
                const isCurrentReal = idx === today.getMonth() && viewYear === today.getFullYear();
                const isSelected = idx === viewMonth;
                return (
                  <TouchableOpacity
                    key={label}
                    style={[
                      styles.monthGridItem,
                      isSelected && styles.monthGridItemSelected,
                    ]}
                    onPress={() => {
                      setViewMonth(idx);
                      setMonthPickerVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.monthGridText,
                        isCurrentReal && styles.monthGridTextCurrent,
                        isSelected && styles.monthGridTextSelected,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Bảng chọn năm (3x4, có thể scroll) */}
      <Modal
        visible={yearPickerVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setYearPickerVisible(false)}
      >
        <Pressable style={styles.pickerOverlay} onPress={() => setYearPickerVisible(false)}>
          <Pressable style={styles.pickerSheet} onPress={() => {}}>
            <Text style={styles.pickerTitle}>Chọn năm</Text>
            <FlatList
              data={yearList}
              key="year-grid-3col"
              numColumns={3}
              initialNumToRender={24}
              getItemLayout={(_, index) => ({ length: 56, offset: 56 * Math.floor(index / 3), index })}
              initialScrollIndex={Math.max(0, yearList.indexOf(viewYear) - 6)}
              keyExtractor={(y) => String(y)}
              contentContainerStyle={{ paddingBottom: 8 }}
              renderItem={({ item: y }) => {
                const isCurrentReal = y === today.getFullYear();
                const isSelected = y === viewYear;
                return (
                  <TouchableOpacity
                    style={[
                      styles.monthGridItem,
                      isSelected && styles.monthGridItemSelected,
                    ]}
                    onPress={() => {
                      setViewYear(y);
                      setYearPickerVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.monthGridText,
                        isCurrentReal && styles.monthGridTextCurrent,
                        isSelected && styles.monthGridTextSelected,
                      ]}
                    >
                      {y}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              style={{ maxHeight: 4 * 56 }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f5" },
  header: { fontSize: 20, fontWeight: "700", paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  monthYearGroup: { flexDirection: "row", gap: 10 },
  monthLabel: { fontSize: 16, fontWeight: "600" },
  dowRow: { flexDirection: "row", marginBottom: 4 },
  dowText: { flex: 1, textAlign: "center", fontSize: 11, color: "#999" },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: "center", justifyContent: "center" },
  cellInner: { alignItems: "center", justifyContent: "center", width: "86%", height: "86%", borderRadius: 8 },
  todayCell: { backgroundColor: "#e6f1fb" },
  dayText: { fontSize: 13, color: "#222" },
  markedText: { fontWeight: "700", color: "#185fa5" },
  lunarText: { fontSize: 9, color: "#aaa" },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#378ADD", marginTop: 2 },
  hint: { fontSize: 12, color: "#999", marginTop: 12 },
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
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  pickerSheet: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    width: "84%",
    maxHeight: "70%",
  },
  pickerTitle: { fontSize: 15, fontWeight: "700", marginBottom: 12, textAlign: "center" },
  monthGrid: { flexDirection: "row", flexWrap: "wrap" },
  monthGridItem: {
    width: "33.33%",
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  monthGridItemSelected: {
    backgroundColor: "#e6f1fb",
    borderRadius: 10,
  },
  monthGridText: { fontSize: 14, color: "#333" },
  monthGridTextCurrent: { fontWeight: "700", color: "#185fa5" },
  monthGridTextSelected: { fontWeight: "700", color: "#185fa5" },
});