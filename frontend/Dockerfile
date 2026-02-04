# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Копируем package файлы
COPY package.json package-lock.json* ./

# Устанавливаем зависимости
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Устанавливаем PostCSS зависимости если их нет (для совместимости)
RUN npm list autoprefixer 2>/dev/null || npm install -D autoprefixer postcss 2>/dev/null || true

# Копируем исходники
COPY . .

# Build аргументы
ARG VITE_API_URL

ENV VITE_API_URL=${VITE_API_URL}

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html
# Собираем проект
RUN npm run build

# Production stage
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Удаляем дефолтный nginx конфиг и файлы
RUN rm -rf ./* /etc/nginx/conf.d/default.conf

# Копируем собранное приложение
COPY --from=builder /app/dist .

# Создаём nginx конфиг для порта 3000
RUN echo 'server { \
    listen 3000; \
    server_name localhost ex.odineco.online; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
