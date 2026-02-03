# Etapa 1: Compilación
FROM node:20-alpine AS build

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar el código fuente
COPY . .

# Compilar la aplicación
RUN npm run build

# Etapa 2: Producción con servidor HTTP simple
FROM node:20-alpine

WORKDIR /app

# Instalar serve para servir archivos estáticos
RUN npm install -g serve

# Copiar archivos compilados desde la etapa de build
COPY --from=build /app/dist /app/dist

# Exponer el puerto 
EXPOSE 5171

# Comando para servir los archivos estáticos
CMD ["serve", "-s", "dist", "-l", "5171"]
