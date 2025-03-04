var mongoose = require('mongoose');
// conectamos a la base de datos    27017 es el puerto de mongo
var MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/libreria_itz_db';

mongoose.connect(MONGO_URL);

//cuando la conexion es corecta 
mongoose.connection.on('connected', () => {
    console.log('Conectado a la base de datos' + MONGO_URL);
});

// cuando hay un error en la conexion 
mongoose.connection.on('error', (error) => {
    console.log('Error en la conexion a la base de datos' + error);
});

// cuando se desconecta de la base de datos
mongoose.connection.on('disconnected', () => {
    console.log('Desconectado de la base de datos');
});