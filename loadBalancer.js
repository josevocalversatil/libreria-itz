// npm i http-proxy-middleware axios
const express = require('express');
const {createProxyMiddleware} = require('http-proxy-middleware');   
const axios = require('axios');

const app = express();  
const PORT = 8000;

// lista de micro-servicios con su puerto correspondiente
const services = {
    libros: 'http://localhost:3000',
    users: 'http://localhost:3001',
    documentacion: 'http://localhost:3002',
    itz: 'https://zacatecas.tecnm.mx/'
}

// Middleware para comprobar si el servicio esta disponible 
const checkServiceStatus = async (req, res, next) => {
    // extraer el primer ssegmento de la URL
    //   /localhost:8000/libros
    //  [0] = localhost:8000
    //  [1] = libros
    const serviceName = req.originalUrl.split('/')[1];
    const serviceUrl = services[serviceName];
    if (!serviceUrl) {
        return res.status(404).json({error: 'Micro-Servicio no encontrado'});

    }

    try {
       await axios.get(serviceUrl);  // intenta hacer una peticion al micro-servicio
       next();   // si todo sale bien, continua el flujo
    } catch (error) {
        console.log(error);
        return res.status(503).json({error: 'Micro-Servicio ' + serviceName + ' no disponible por el momento'});
        
    }
}

// aplicamos el middleware en la verificacion antes del proxy 
app.use('/users', checkServiceStatus, createProxyMiddleware({
    target: services.users,
     changeOrigin: true
    }
));

app.use('/libros', checkServiceStatus, createProxyMiddleware({
    target: services.libros,
    changeOrigin: true
}));

app.use('/documentacion', checkServiceStatus, createProxyMiddleware({
    target: services.documentacion,
    changeOrigin: true,
    // para no tener problemas con el swagger
    pathRewrite: {'^/documentacion': '/'}
}));

app.use('/itz', checkServiceStatus, createProxyMiddleware({
    target: services.itz,
    changeOrigin: true,
}));

app.listen(PORT, () => {
    console.log(`Load Balancer corriendo en el puerto ${PORT}`);
});