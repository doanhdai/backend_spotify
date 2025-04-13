# # Sử dụng image Python chính thức
# FROM python:3.9-slim

# # Install system dependencies
# RUN apt-get update && apt-get install -y \
#     gcc \
#     python3-dev \
#     libmariadb-dev-compat \
#     pkg-config \
#     && rm -rf /var/lib/apt/lists/*

# # Thiết lập thư mục làm việc
# WORKDIR /app

# # Sao chép requirements.txt và cài đặt dependencies
# COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt
# RUN pip install daphne

# # Sao chép toàn bộ mã nguồn
# COPY . .

# # Thêm thư mục backend vào PYTHONPATH
# ENV PYTHONPATH=/app

# # Mở cổng 8000
# EXPOSE 8000

# # Lệnh chạy server
# CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "backend.asgi:application"]