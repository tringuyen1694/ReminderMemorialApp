import React, { useState, useRef, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEvents } from "../context/EventsContext";
import { requestNotificationPermission } from "../utils/notifications";

const FREQ_OPTIONS = [
  { key: "1d", label: "Trước 1 ngày" },
  { key: "1w", label: "Trước 1 tuần" },
  { key: "1m", label: "Trước 1 tháng" },
];

export default function CreateReminderModal({ visible, onClose }) {
  const { addEvent } = useEvents();
  const [step, setStep] = useState("choose"); // 'choose' | 'form'
  const [type, setType] = useState("gio");
  const [name, setName] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [freq, setFreq] = useState(["1d"]);
  const [error, setError] = useState("");

  // Điều khiển animation mượt: modal chỉ thực sự unmount SAU KHI animation đóng chạy xong
  const [mounted, setMounted] = useState(visible);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(400)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      backdropOpacity.setValue(0);
      sheetTranslateY.setValue(400);
      requestAnimationFrame(() => {
        Animated.parallel([
          Animated.timing(backdropOpacity, {
            toValue: 1,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.spring(sheetTranslateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }),
        ]).start();
      });
    }
  }, [visible]);

  function playCloseAnimation(after) {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: 400,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setMounted(false);
      after && after();
    });
  }

  function reset() {
    setStep("choose");
    setName("");
    setDay("");
    setMonth("");
    setYear("");
    setFreq(["1d"]);
    setError("");
  }

  function handleClose() {
    playCloseAnimation(() => {
      reset();
      onClose();
    });
  }

  function chooseType(t) {
    setType(t);
    setStep("form");
  }

  function toggleFreq(key) {
    setFreq((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );
  }

  async function handleConfirm() {
    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = year ? parseInt(year, 10) : undefined;

    const validDay = d >= 1 && d <= 31;
    const validMonth = m >= 1 && m <= 12;

    if (!name.trim() || !validDay || !validMonth) {
      setError("Vui lòng nhập tên và ngày/tháng hợp lệ.");
      return;
    }

    await requestNotificationPermission();

    const base = {
      type,
      name: name.trim(),
      freq,
    };

    if (type === "gio") {
      await addEvent({ ...base, lunarDay: d, lunarMonth: m, lunarYear: y });
    } else {
      await addEvent({ ...base, day: d, month: m, year: y });
    }

    handleClose();
  }

  return (
    <Modal visible={mounted} animationType="none" transparent onRequestClose={handleClose}>
      <Animated.View style={[styles.overlay, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetTranslateY }] }]}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <View style={styles.headerRow}>
              <Text style={styles.title}>
                {step === "choose" ? "Thêm mới" : type === "gio" ? "Ngày giỗ" : "Ngày kỷ niệm"}
              </Text>
              <TouchableOpacity onPress={handleClose} accessibilityLabel="Đóng">
                <Ionicons name="close" size={22} color="#666" />
              </TouchableOpacity>
            </View>

            {step === "choose" && (
              <View>
                <TouchableOpacity style={styles.chooseCard} onPress={() => chooseType("gio")}>
                  <Ionicons name="flower-outline" size={22} color="#378ADD" style={{ marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.chooseTitle}>Ngày giỗ</Text>
                    <Text style={styles.chooseSubtitle}>Nhắc theo ngày âm lịch hằng năm</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.chooseCard} onPress={() => chooseType("kn")}>
                  <Ionicons name="heart-outline" size={22} color="#378ADD" style={{ marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.chooseTitle}>Ngày kỷ niệm</Text>
                    <Text style={styles.chooseSubtitle}>Nhắc theo ngày dương lịch hằng năm</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {step === "form" && (
              <View>
                <Text style={styles.label}>{type === "gio" ? "Ngày giỗ của" : "Tên kỷ niệm"}</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder={type === "gio" ? "Ví dụ: Ông Nội" : "Ví dụ: Ngày cưới ba mẹ"}
                  placeholderTextColor="#999"
                />

                <Text style={styles.label}>{type === "gio" ? "Chọn ngày âm lịch" : "Chọn ngày"}</Text>
                <View style={styles.row3}>
                  <TextInput
                    style={[styles.input, styles.third]}
                    value={day}
                    onChangeText={setDay}
                    placeholder="Ngày"
                    placeholderTextColor="#999"
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                  <TextInput
                    style={[styles.input, styles.third]}
                    value={month}
                    onChangeText={setMonth}
                    placeholder="Tháng"
                    placeholderTextColor="#999"
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                  <TextInput
                    style={[styles.input, styles.third]}
                    value={year}
                    onChangeText={setYear}
                    placeholder="Năm (tuỳ chọn)"
                    placeholderTextColor="#999"
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                </View>

                <Text style={styles.label}>Chọn tần suất nhắc nhở</Text>
                {FREQ_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.key}
                    style={styles.checkboxRow}
                    onPress={() => toggleFreq(opt.key)}
                  >
                    <Ionicons
                      name={freq.includes(opt.key) ? "checkbox" : "square-outline"}
                      size={20}
                      color="#378ADD"
                    />
                    <Text style={styles.checkboxLabel}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}

                {!!error && <Text style={styles.error}>{error}</Text>}

                <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
                  <Text style={styles.confirmText}>Xác nhận</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: "88%",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: { fontSize: 16, fontWeight: "600" },
  chooseCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  chooseTitle: { fontSize: 14, fontWeight: "600" },
  chooseSubtitle: { fontSize: 12, color: "#777", marginTop: 2 },
  label: { fontSize: 13, color: "#666", marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111",
  },
  row3: { flexDirection: "row", gap: 8 },
  third: { flex: 1 },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 8,
  },
  checkboxLabel: { fontSize: 14, color: "#333" },
  error: { color: "#c0392b", fontSize: 12, marginTop: 8 },
  confirmBtn: {
    backgroundColor: "#111",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  confirmText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});