// instalamos mongoose
// npm install mongoose 
var mongoose = require('mongoose');
var Schema = mongoose.Schema;   

// definimos el esquema de la tabla
var LibroSchema = new Schema({
    
    titulo: String,
    autor: String,
    año: Number,
});

// definimos el modelo del libro
var Libros = mongoose.model('Libros', LibroSchema);

// exportamo el modelo 
module.exports = Libros;