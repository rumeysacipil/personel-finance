# ---- Build Stage ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
# API_BASE_URL nginx proxy'si için /api olarak ayarlanır
ENV VITE_API_BASE_URL=""
RUN npm run build

# ---- Run Stage ----
FROM nginx:alpine
# Özel nginx yapılandırmamızı kopyalıyoruz
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Build edilmiş dosyaları nginx html klasörüne kopyalıyoruz
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
