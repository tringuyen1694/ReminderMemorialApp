# Ngày kỷ niệm — App nhắc nhở ngày giỗ & ngày kỷ niệm

Ứng dụng React Native (Expo) với 2 tab:
- **Danh sách**: các ngày kỷ niệm, sắp xếp theo số ngày còn lại gần nhất.
- **Lịch**: xem lịch tháng có cả dương lịch và âm lịch, điều hướng qua các tháng/năm khác.
- Nút **+** nổi ở góc dưới phải, luôn hiển thị ở cả 2 tab, mở form tạo "Ngày giỗ" (nhắc theo âm lịch) hoặc "Ngày kỷ niệm" (nhắc theo dương lịch).

## Cách chạy dự án

### Cách 1 — Không cần cài gì lên máy (khuyên dùng nếu máy bạn không có quyền Admin)

1. Vào https://snack.expo.dev
2. Tạo project mới, sau đó copy nội dung từng file trong thư mục `src/`, `App.js`, `app.json` vào đúng đường dẫn tương ứng trên Snack.
3. Quét mã QR bằng app **Expo Go** trên điện thoại để xem trực tiếp.

> Lưu ý: Snack không hỗ trợ 100% `expo-notifications` chạy nền thật sự — để test đầy đủ tính năng thông báo, nên dùng Cách 2.

### Cách 2 — Chạy trên máy tính (cần Node.js đã cài được, xem hướng dẫn `nvm` ở phần trước)

```bash
cd MemorialApp
npm install
npx expo start
```

Sau đó:
- Bấm `i` để mở iOS Simulator (cần Xcode), `a` để mở Android Emulator (cần Android Studio)
- Hoặc quét mã QR bằng app **Expo Go** trên điện thoại thật (nhanh nhất, không cần simulator)

## Cấu trúc dự án

```
MemorialApp/
├── App.js
├── app.json
├── babel.config.js
├── package.json
└── src/
    ├── context/EventsContext.js      # Quản lý danh sách sự kiện + tính ngày kế tiếp
    ├── components/
    │   ├── EventCard.js              # Thẻ hiển thị 1 sự kiện trong danh sách
    │   └── CreateReminderModal.js    # Form tạo mới (2 bước: chọn loại → điền thông tin)
    ├── screens/
    │   ├── ListScreen.js             # Tab Danh sách
    │   └── CalendarScreen.js         # Tab Lịch
    ├── navigation/index.js           # Bottom tab navigator
    └── utils/
        ├── lunar.js                  # Thuật toán chuyển đổi dương lịch <-> âm lịch VN
        ├── storage.js                # Lưu/đọc dữ liệu bằng AsyncStorage
        └── notifications.js          # Lên lịch thông báo local (expo-notifications)
```

## Logic nhắc nhở

- **Ngày giỗ**: lưu ngày/tháng âm lịch cố định. Mỗi khi cần tính, app tìm ngày dương lịch kế tiếp (>= hôm nay) tương ứng với ngày/tháng âm đó (dùng `nextSolarDateForLunarAnniversary` trong `lunar.js`), sau đó lên lịch thông báo local trước 1 ngày / 1 tuần / 1 tháng tuỳ lựa chọn.
- **Ngày kỷ niệm**: lưu ngày/tháng dương lịch, lặp lại hằng năm — tính tương tự nhưng không cần quy đổi âm lịch.
- Thông báo được lên lịch bằng `expo-notifications` ngay khi tạo mới (không cần chạy nền liên tục — hệ điều hành tự bắn thông báo đúng giờ đã lên lịch).

## Việc cần làm tiếp (gợi ý)

- Thêm màn hình sửa sự kiện đã tạo (hiện tại mới có thêm mới + xoá).
- Thêm ảnh đại diện cho từng người thân (tuỳ chọn).
- Khi build bản chính thức (không chỉ chạy qua Expo Go), cần chạy `npx expo prebuild` và build bằng EAS Build vì `expo-notifications` cần native module.
