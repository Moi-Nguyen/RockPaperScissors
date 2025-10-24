# RockPaperScissors – Kéo Búa Bao Realtime

Trải nghiệm trò chơi **Kéo – Búa – Bao** trực tuyến dành cho 2 người với giao diện hiện đại, hiệu ứng glassmorphism và kết nối Socket.IO thời gian thực. Dự án gồm hai phần: client React/Vite và server Node.js/Express.

---

## 🔥 Điểm nổi bật
- **Giao diện hiện đại**: nền gradient, thẻ mờ (glassmorphism), nút gradient động và typography rõ ràng.
- **Chơi cùng bạn bè tức thì**: tạo phòng riêng với mã ngẫu nhiên, gửi mã cho bạn bè để tham gia.
- **Đồng bộ thời gian thực**: biến động phòng, lựa chọn, bộ đếm thời gian được cập nhật lập tức qua Socket.IO.
- **Quản lý vòng đấu thông minh**: tự động gán lựa chọn nếu người chơi hết 30 giây, tính điểm, công bố người thắng khi đạt 3 điểm.
- **Tiếng Việt thân thiện**: toàn bộ nội dung UI và thông báo đều được Việt hóa.

---

## 🧱 Kiến trúc & công nghệ
| Thư mục | Công nghệ chính | Vai trò |
|---------|-----------------|---------|
| `client/` | React 19, Vite 7, Socket.IO Client | Giao diện, quản lý state, kết nối realtime |
| `server/` | Node.js, Express 5, Socket.IO 4, Nodemon | API/socket server, điều phối phòng & vòng chơi |
| Chung | npm, ESLint | Quản lý package, linting |

---

## 📁 Cấu trúc thư mục
```
RockPaperScissors/
├─ client/                 # Ứng dụng React
│  ├─ src/
│  │  ├─ components/       # NameForm, ActionSelector, GameRoom, GamePlaying...
│  │  ├─ App.jsx           # Điều phối luồng chơi, kết nối socket
│  │  └─ App.css           # Toàn bộ styling glassmorphism mới
│  ├─ public/
│  └─ vite.config.js
├─ server/                 # Socket server
│  ├─ index.js             # Logic phòng, điểm, timer
│  └─ package.json
└─ README.md
```

---

## 🚀 Bắt đầu
### 1. Yêu cầu hệ thống
- Node.js ≥ 18
- npm ≥ 9
- Cổng `5173` (client) và `3001` (server) đang trống

### 2. Cài đặt
```bash
git clone <repository-url>
cd RockPaperScissors

# Cài client
cd client
npm install

# Cài server
cd ../server
npm install
```

### 3. Chạy dự án
Mở hai terminal riêng:
```bash
# Terminal 1 – Server (cổng 3001)
cd server
npm start

# Terminal 2 – Client (cổng 5173)
cd client
npm run dev
```
Truy cập `http://localhost:5173` để trải nghiệm trò chơi.

---

## 🕹️ Luồng gameplay
1. **Nhập tên hiển thị**: màn chào sử dụng thẻ glass card và nút gradient.  
2. **Chọn hành động**: tạo phòng mới hoặc nhập mã để tham gia phòng có sẵn.  
3. **Chờ đủ 2 người**: danh sách người chơi, phân biệt chủ phòng và hướng dẫn chia sẻ mã.  
4. **Thi đấu vòng**: mỗi vòng có timer 30 giây, hiển thị lựa chọn bằng emoji, bảng điểm realtime.  
5. **Kết thúc trận**: người đầu tiên đạt 3 điểm sẽ thắng, có thể thoát hoặc tiếp tục vòng mới.

> Hình ảnh UI minh họa đã được cung cấp trong yêu cầu trước, phản ánh giao diện hiện hành.

---

## 🛠️ Dành cho nhà phát triển
- Chạy `npm run lint` trong `client/` trước khi commit để đảm bảo chất lượng mã.
- Logic xác định thắng/thua nằm ở `server/index.js` (`determineWinner`); có thể mở rộng nếu muốn bổ sung luật mới hoặc chơi nhiều người.
- Khi chỉnh sửa giao diện, giữ nguyên stylesheet `App.css` để đảm bảo trải nghiệm nhất quán.
- Dự án chưa có test tự động; cân nhắc bổ sung Jest/Vitest cho client và server nếu triển khai thực tế.

---

## ❗ Troubleshooting
- **Trang trắng ở client**: kiểm tra `client/index.html` có phần tử `<div id="root"></div>` và Vite đang chạy (`npm run dev`).  
- **Không kết nối được server**: chắc chắn `npm start` trong `server/` đang chạy và không có ứng dụng khác chiếm cổng 3001.  
- **Bị ngắt kết nối Socket.IO**: kiểm tra firewall hoặc các tiện ích chặn localhost.

---

## 📄 Giấy phép
Dự án phục vụ mục đích học tập. Thêm giấy phép chính thức (MIT, Apache 2.0, ...) nếu bạn muốn công bố rộng rãi.

---

Chúc bạn chơi vui và dễ dàng mời bạn bè thách đấu Kéo Búa Bao! 🎮
