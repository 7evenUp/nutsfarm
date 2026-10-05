# Указываем базовый образ
FROM node:20

# Создаем директорию приложения
WORKDIR /app

# Копируем package.json и package-lock.json (если есть)
COPY package*.json ./

# Устанавливаем зависимости приложения
RUN npm install

# Копируем все файлы проекта в рабочую директорию
COPY . .
