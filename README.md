
# Dự án Spotify Clone
Đây là dự án mô phỏng lại ứng dụng Spotify, bao gồm hai phần chính: `backend_spotify` và `frontend`.
## 📁 Cấu trúc dự án
- `backend_spotify/`: Chứa mã nguồn phía backend (có thể sử dụng Django hoặc Node.js).
- `frontend/`: Chứa mã nguồn phía frontend (React.js).
---
## 🚀 Hướng dẫn cài đặt
### Yêu cầu trước khi cài đặt

- Cài đặt **Node.js** (phiên bản 18 trở lên)
- Cài đặt **npm** hoặc **yarn**
- Cài đặt **Python 3.9+** (nếu backend là Django)
- Cài đặt **pip**
- **MySQL** hoặc **PostgreSQL** nếu dùng cơ sở dữ liệu
---

## ⚙️ Cài đặt Backend

1. Truy cập vào thư mục backend:
```bash
cd backend_spotify
```
2. (Tuỳ chọn) Tạo môi trường ảo và kích hoạt:
```bash
python -m venv venv
source venv/bin/activate        # Trên Windows dùng: venv\Scripts\activate
```
3. Cài đặt các thư viện cần thiết:
```bash
pip install -r requirements.txt
```
4. Tạo file `.env` để cấu hình các biến môi trường:
Ví dụ nội dung `.env`:
SECRET_KEY=your_secret_key
DEBUG=True
DATABASE_URL=mysql://user:password@localhost:3306/spotify_db
```
5. Tạo và áp dụng migration:

```bash
python manage.py makemigrations
python manage.py migrate
```

6. Chạy server backend:

```bash
python manage.py runserver
```

---

## 🌐 Cài đặt Frontend
1. Truy cập vào thư mục frontend:
```bash
cd frontend
```
2. Cài đặt các thư viện frontend:

```bash
npm install
```

3. Tạo file `.env` và cấu hình địa chỉ backend:

```.env
REACT_APP_BACKEND_URL=http://localhost:8000
```

4. Chạy ứng dụng frontend:

```bash
npm dev
```

---

## 🧪 Kiểm thử

- Backend:

```bash
python manage.py test
```

- Frontend:

```bash
npm test
```

---

## 📝 Ghi chú

- Cần đảm bảo file `.env` được cấu hình đúng ở cả backend và frontend.
- Đảm bảo các cổng không bị trùng (mặc định backend chạy ở `8000`, frontend chạy ở `3000`).
- Nếu sử dụng CORS, cần cấu hình cho phép frontend truy cập từ backend.

---

## 📬 Liên hệ

Nếu bạn có bất kỳ câu hỏi hoặc đóng góp nào, vui lòng tạo issue hoặc liên hệ với người phát triển dự án.

---

> Được phát triển với ❤️ bởi Doanh Đại
