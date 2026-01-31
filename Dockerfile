# Dockerfile simple: copiar solo los archivos compilados
FROM nginx:alpine

# Copiar archivos compilados en dist/ (ya compilado localmente)
COPY dist/* /usr/share/nginx/html/

# Copiar configuración de nginx para SPA
COPY nginx.conf /etc/nginx/nginx.conf

# Exponer el puerto 
EXPOSE 5173

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
