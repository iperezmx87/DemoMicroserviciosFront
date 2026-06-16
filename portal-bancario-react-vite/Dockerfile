# ==========================================
# Etapa 1: Compilación (Build Stage)
# ==========================================
FROM node:20-alpine AS build

WORKDIR /app

# Aprovechar el caché de capas de Docker para las dependencias
COPY package*.json ./
RUN npm ci

# Copiar el resto del código y compilar
COPY . .
RUN npm run build

# ==========================================
# Etapa 2: Servidor de Producción (Production Stage)
# ==========================================
FROM nginx:1.25-alpine

# Copiar los archivos estáticos generados por Vite desde la etapa anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de Nginx para manejar el enrutamiento de React (SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]