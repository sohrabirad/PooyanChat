# انتخاب تصویر پایه از Node.js
FROM node:16-alpine

# تنظیم دایرکتوری کاری
WORKDIR /app

# کپی کردن فایل‌ها به داخل دایرکتوری کاری
COPY package*.json ./

# نصب وابستگی‌ها
RUN npm install

# کپی کردن بقیه فایل‌های پروژه
COPY . .

# ساخت پروژه
RUN npm run build

# تنظیم پورت برای سرور
EXPOSE 3000

# اجرای اپلیکیشن در محیط تولید
CMD ["npm", "run", "start"]
