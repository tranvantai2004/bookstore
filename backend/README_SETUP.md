# BookStore Backend - Hướng dẫn cài đặt

## 1. Cài đặt môi trường
```bash
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

## 2. Cấu hình .env
```bash
cp .env.example .env
# Chỉnh sửa .env với thông tin DB của bạn
```

## 3. Tạo database PostgreSQL
```sql
CREATE DATABASE bookstore_db;
```

## 4. Migrate & chạy
```bash
python manage.py migrate
python seed_data.py   # Tạo dữ liệu mẫu
python manage.py runserver
```

## 5. Truy cập
- API: http://localhost:8000/api/
- Swagger Docs: http://localhost:8000/api/docs/
- Admin: http://localhost:8000/admin/

## API Endpoints
| Method | URL | Mô tả | Auth |
|--------|-----|--------|------|
| POST | /api/users/register/ | Đăng ký | Public |
| POST | /api/users/login/ | Đăng nhập | Public |
| POST | /api/users/token/refresh/ | Refresh token | Public |
| POST | /api/users/logout/ | Đăng xuất | Required |
| GET/PUT | /api/users/profile/ | Hồ sơ cá nhân | Required |
| GET | /api/users/ | Danh sách user | Admin |
| GET/POST | /api/books/ | Sách | Required |
| GET/POST | /api/books/categories/ | Danh mục | Required |
| GET/POST | /api/orders/ | Đơn hàng | Required |
| GET/POST | /api/orders/customers/ | Khách hàng | Required |
| GET | /api/orders/dashboard/ | Thống kê | Admin |

## Deploy lên Render
1. Push code lên GitHub
2. Tạo PostgreSQL database trên Render
3. Tạo Web Service, chọn repo
4. Build command: `pip install -r requirements.txt && python manage.py migrate`
5. Start command: `gunicorn config.wsgi:application`
6. Thêm Environment Variables từ .env
