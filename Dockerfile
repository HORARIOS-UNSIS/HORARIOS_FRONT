FROM node:20-alpine

# Servidor simple para servir archivos estáticos
RUN npm install -g http-server

# Carpeta app y directorio de trabajo
WORKDIR /app

# Copiar package.json e instalar dependencias
COPY package.json /app/package.json

# Instalar dependencias
RUN npm install

# Copiar archivos y carpetas al contenedor
COPY . .

# Construir la aplicación para producción
RUN npm run build

# Exponer el puerto 
EXPOSE 8080

# Comando para servir la aplicación
CMD [ "http-server", "dist" ]