# 
FROM node:18
WORKDIR /usr/src/app
## copiamos  todos los archivos 
COPY . .
# install the dependencies
RUN npm install
#indicamos el puerto 
EXPOSE 3000
# indicamos el comando 
CMD ["node", "index"]
