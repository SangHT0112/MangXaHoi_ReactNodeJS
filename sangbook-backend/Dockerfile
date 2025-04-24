# Sử dụng Node.js phiên bản mới nhất
FROM node:22

# Đặt thư mục làm việc
WORKDIR /app

# Copy tất cả file vào container
COPY . .

# Cài đặt dependencies
RUN npm install

# Mở cổng 5000
EXPOSE 4000

# Chạy server
CMD ["node", "server.js"]
