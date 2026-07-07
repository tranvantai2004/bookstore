"""
Run: python seed_data.py
Tạo dữ liệu mẫu cho BookStore
"""
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User
from books.models import Category, Book
from orders.models import Customer, Order, OrderItem

# Users
admin = User.objects.create_superuser(
    username='admin', email='admin@bookstore.com', password='admin123', role='admin',
    first_name='Admin', last_name='Store'
)
staff = User.objects.create_user(
    username='staff', email='staff@bookstore.com', password='staff123', role='user',
    first_name='Nhân viên', last_name='A'
)
print("✅ Users created")

# Categories
cats = ['Văn học', 'Khoa học', 'Kỹ thuật - Công nghệ', 'Kinh tế', 'Thiếu nhi']
category_objs = [Category.objects.create(name=c, description=f'Sách {c}') for c in cats]
print("✅ Categories created")

# Books
books_data = [
    ('Nhà Giả Kim', 'Paulo Coelho', 75000, 50, 0),
    ('Đắc Nhân Tâm', 'Dale Carnegie', 68000, 30, 1),
    ('Sapiens', 'Yuval Noah Harari', 120000, 25, 1),
    ('Clean Code', 'Robert C. Martin', 150000, 20, 2),
    ('Python Crash Course', 'Eric Matthes', 180000, 15, 2),
    ('Tư Duy Phản Biện', 'Richard Paul', 95000, 40, 3),
    ('Khởi Nghiệp Tinh Gọn', 'Eric Ries', 110000, 35, 3),
    ('Dế Mèn Phiêu Lưu Ký', 'Tô Hoài', 45000, 60, 4),
    ('Hoàng Tử Bé', 'Antoine de Saint-Exupéry', 55000, 45, 4),
    ('Lập Trình Python', 'Nguyễn Văn A', 130000, 18, 2),
]
book_objs = []
for title, author, price, stock, cat_idx in books_data:
    b = Book.objects.create(title=title, author=author, price=price, stock=stock, category=category_objs[cat_idx])
    book_objs.append(b)
print("✅ Books created")

# Customers
customers_data = [
    ('Nguyễn Văn An', 'an@email.com', '0901234567', 'HCM'),
    ('Trần Thị Bình', 'binh@email.com', '0912345678', 'Hà Nội'),
    ('Lê Văn Cường', 'cuong@email.com', '0923456789', 'Đà Nẵng'),
    ('Phạm Thị Dung', 'dung@email.com', '0934567890', 'Cần Thơ'),
    ('Hoàng Văn Em', 'em@email.com', '0945678901', 'Bình Dương'),
]
cust_objs = [Customer.objects.create(full_name=n, email=e, phone=p, address=a) for n, e, p, a in customers_data]
print("✅ Customers created")

# Orders
order1 = Order.objects.create(customer=cust_objs[0], created_by=staff, status='completed')
OrderItem.objects.create(order=order1, book=book_objs[0], quantity=2, unit_price=book_objs[0].price)
OrderItem.objects.create(order=order1, book=book_objs[1], quantity=1, unit_price=book_objs[1].price)
order1.calculate_total()

order2 = Order.objects.create(customer=cust_objs[1], created_by=staff, status='pending')
OrderItem.objects.create(order=order2, book=book_objs[3], quantity=1, unit_price=book_objs[3].price)
order2.calculate_total()

order3 = Order.objects.create(customer=cust_objs[2], created_by=admin, status='shipping')
OrderItem.objects.create(order=order3, book=book_objs[4], quantity=1, unit_price=book_objs[4].price)
order3.calculate_total()

print("✅ Orders created")
print("\n🎉 Seed data xong!")
print("Admin: admin / admin123")
print("Staff: staff / staff123")
