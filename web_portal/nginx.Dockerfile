# Stage 1: Build Frontend Assets
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Nginx
FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
# Copy public folder dari repo asli (berisi index.php dsb)
COPY ./public /var/www/html/public
# Copy build assets dari Stage 1
COPY --from=builder /app/public/build /var/www/html/public/build
