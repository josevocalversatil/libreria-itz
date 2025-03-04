const express = require('express');
// importamos la conexion a la base de datos
require('./db');

// importamos CORS nos permiten recibir solicitudes al servidor desde cualquier origen
const cors = require('cors');

// importamos el body parser
const bodyParser = require('body-parser');

// npm i csrf cookie-parser
//const csrf = require('csrf');
// npm i csurf
const csrf = require('csurf'); 
const cookieParser = require('cookie-parser');

// importamos middleware helmet para evitar xxs
const helmet = require('helmet');
const routes = require('./routes');
// importamos configuracion de swagger
const {swaggerUi, swaggerSpec, optionsV1} = require('./swagger');
// npm i express-rate-limit
const rateLimit = require('express-rate-limit');

const app = express();
const port = 3000;

// agregamos el MIDLEWARE para parsear el body de las peticiones
app.use(express.json());
// agregamos el middleware para datos de formularios
app.use(bodyParser.urlencoded({extended: true}));
// habilitamos CORS
app.use(cors());
//limitar las conexcciones por tiempo delimitado 
/*
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // limitar a un 1 minutos
    max: 20, // limitar a 3 peticiones por IP
    message: 'Has hecho muchas peticiones, por favor espera 1 minutos'
});

app.use(limiter);
*/
// limitar el tamaño de las solicitudes entrantes al servidor evitar desbordamiento de buffer
app.use(bodyParser.json({limit: '1mb'}));

// habilitamos el uso de cookies
app.use(cookieParser('mi_palabra_secreta'));


const csrfProtection = csrf({cookie: true});
//app.use(csrfProtection);

// habilitamos el uso de helmet para proteccion contra ataques xxs 
app.use(
    helmet({
       xXssProtection: false,
    }),
);

app.use(routes);

const path = require('path');
// motor de plantillas EJS
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'views'));  

app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerSpec, optionsV1));

// iniciamos el servidor    
app.listen(port, () => {
    console.log(`Servidor funcionando en el puerto: ${port}`);
});


