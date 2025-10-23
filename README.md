<!-- PROJECT LOGO -->
# RockPaperScissors – Kéo Búa Bao Online

Ứng dụng chơi **Kéo – Búa – Bao** realtime hai người chơi, xây dựng với React (Vite) và Socket.IO. Người dùng có thể tạo/phòng, mời bạn bè bằng mã chia sẻ, theo dõi điểm số theo vòng và thi đấu đến khi đạt 3 điểm.

---

## ✨ Tính năng chính
- **Đa phiên chơi**: tạo phòng riêng với mã ngẫu nhiên, giới hạn 2 người chơi để đảm bảo công bằng.
- **Cập nhật thời gian thực**: đồng bộ trạng thái phòng, lựa chọn, kết quả mỗi vòng qua Socket.IO.
- **Đồng hồ đếm ngược thông minh**: tự chốt kết quả nếu hết 30 giây và gán lựa chọn ngẫu nhiên cho người chơi chưa chọn.
- **Điểm & vòng**: theo dõi điểm từng người, thông báo thắng/thua, cho phép chuyển tiếp vòng ngay trong giao diện.
- **Giao diện tiếng Việt**: thiết kế tối giản, dễ thao tác trên cả desktop và thiết bị màn hình lớn.

---

## 🧱 Kiến trúc & công nghệ
| Thành phần | Công nghệ | Vai trò |
|------------|-----------|---------|
| `client/`  | React 19, Vite 7, Socket.IO Client | Giao diện, quản lý trạng thái UI, kết nối realtime |
| `server/`  | Node.js, Express 5, Socket.IO 4, Nodemon | API và Socket server, điều phối game |
| Chung      | npm, ESLint | Quản lý package và linting |

---

## 📁 Cấu trúc thư mục nổi bật
```
RockPaperScissors/
├─ client/           # Ứng dụng React
│  ├─ src/
│  │  ├─ components/ # NameForm, ActionSelector, GameRoom, GamePlaying, ...
│  │  ├─ App.jsx     # Điều phối luồng game và kết nối socket
│  │  └─ App.css     # Styling chính (giao diện tiếng Việt)
│  └─ vite.config.js # Cấu hình Vite
├─ server/
│  ├─ index.js       # Socket server, lưu trữ state phòng & vòng chơi
│  └─ package.json
└─ README.md         # Tài liệu dự án
```

---

## 🚀 Bắt đầu

### 1. Yêu cầu hệ thống
- Node.js >= 18
- npm >= 9
- Cổng `5173` (client) và `3001` (server) trống trên máy.

### 2. Cài đặt
```bash
git clone <repository-url>
cd RockPaperScissors

# Cài đặt client
cd client
npm install

# Cài đặt server
cd ../server
npm install
```

### 3. Chạy ứng dụng
Mở hai terminal:
```bash
# Terminal 1 – Server (cổng 3001)
cd server
npm start

# Terminal 2 – Client (cổng 5173)
cd client
npm run dev
```
Vite sẽ cung cấp URL: `http://localhost:5173`. Truy cập đường dẫn đó để bắt đầu chơi.

---

## 🕹️ Luồng gameplay
1. **Nhập tên**: người chơi nhập tên hiển thị (ảnh 1).
2. **Tạo hoặc vào phòng**: chủ phòng nhận mã mời, người còn lại nhập mã để tham gia (ảnh 2, 3, 4).
3. **Bắt đầu trận**: khi đủ 2 người, chủ phòng khởi động trò chơi (ảnh 5).
4. **Thi đấu theo vòng**: mỗi vòng 30 giây để chọn Kéo/Búa/Bao; kết quả và điểm hiển thị tức thì (ảnh 6–8).
5. **Điểm chiến thắng**: người đầu tiên đạt 3 điểm được tuyên bố thắng, có thể rời phòng hoặc chơi tiếp.

> _Lưu ý_: Các ảnh minh họa kèm theo request của bạn phản ánh đúng giao diện mặc định của dự án.

---

## 🧪 Phát triển & đóng góp
- Dự án chưa có bộ test tự động; khi chỉnh sửa nên chạy `npm run lint` trong `client/`.
- Nếu mở rộng luật chơi hoặc bổ sung bot, cân nhắc trừu tượng hóa `determineWinner` trong `server/index.js:31`.
- Mã hóa tiếng Việt cần đảm bảo file ở dạng UTF-8 để tránh lỗi ký tự.

---

## ❓ Troubleshooting
- **Trang trắng khi chạy client**: kiểm tra `client/index.html` có phần tử `<div id="root"></div>` và script Vite hay không.
- **Không kết nối được server**: đảm bảo đã chạy `npm start` trong thư mục `server` và không có ứng dụng khác chiếm cổng 3001.
- **Socket disconnect liên tục**: xác minh firewall không chặn `localhost` hoặc Socket.IO; thử mở với quyền Administrator.

---

## 📜 Giấy phép
Dự án dành cho mục đích học tập. Bổ sung giấy phép chính thức (MIT, Apache 2.0, ...) theo nhu cầu của bạn.

---

Chúc bạn chơi vui và dễ dàng mở rộng trò chơi Kéo Búa Bao cho bạn bè! 🎮
