# Base
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Desarrollo 
FROM base AS development
EXPOSE 5173
# El flag --host es lo que permite que lo veas desde fuera
CMD ["npm", "run", "dev", "--", "--host"]

# Build (Solo para generar archivos)
FROM base AS build
RUN npm run build

# Producción (Para el Ubuntu Server)
FROM nginx:stable-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
# Configuracion básica para React Router
RUN sed -i 's/index  index.html index.htm;/index  index.html index.htm; try_files $uri $uri\/ \/index.html;/g' /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]