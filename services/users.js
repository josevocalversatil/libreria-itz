const express = require('express');
require('../db');
const cors = require('cors');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const usersController = require('../controllers/usersController');
const app = express();
const PORT = 3001;

// agregamos el MIDLEWARE para parsear el body de las peticiones
app.use(express.json());
// agregamos el middleware para datos de formularios
app.use(bodyParser.urlencoded({extended: true}));
// habilitamos CORS
app.use(cors());
//limitar las conexcciones por tiempo delimitado 

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // limitar a un 1 minutos
    max: 20, // limitar a 3 peticiones por IP
    message: 'Has hecho muchas peticiones, por favor espera 1 minutos'
});

app.use(limiter);

// limitar el tamaño de las solicitudes entrantes al servidor evitar desbordamiento de buffer
app.use(bodyParser.json({limit: '1mb'}));


/**
 * @swagger
 * /users/get-token: 
 *  post:     
 *      summary:    Obtiene el token de autorizacion libro por su ID
 *      parameters:
 *          -   in: query
 *              name:  api_key
 *              required:  true
 *              description: api_key del usuario
 *              schema:
 *                  type:   string
 *          -   in: query
 *              name:  email
 *              required: true
 *              description: El email del usuario
 *              schema:
 *                  type:  string
 *      requestBody:
 *          required: false
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          api_key:
 *                              type: string
 *                          email:
 *                              type: string
 *      responses:
 *          200:
 *              description: detalles del libro
 */

app.post('/get-token', async (req, res) => {
    
        if(Object.keys(req.query).length > 0){
           var  request = req.query;   
        }else if(Object.keys(req.body).length > 0){
           var  request = req.body;
        }
        const {email, api_key} = request;
        try {
            const result = await usersController.autenticar(email, api_key);
             res.json(result);
        } catch (error) {
            res.status(404).json({message: error.message});
            console.log('este es un error');
            
        }
});

// rutas protegicas
// rutas para usuarios 
/**
 * @swagger
 * /users:
 *  post:
 *      summary:    Crea un usuario
 *      consumes:
 *          -   application/json
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          email:
 *                              type: string
 *                          password:
 *                              type: string 
 *                      example:
 *                          email: "admin@gmail.com"  
 *                          password:  "1234"
 *      responses:
 *          200:
 *              description: usuario creado
 */

app.post('/', async (req, res) => {
    console.log('recibio preticion desde puerto 8000');
    console.log(req.body);
    usersController.create(req, res);
});

app.get('/', async (req, res) => {
    res.json  ({message: 'Hola mundo desde Users'});
});

app.listen(PORT, () => {
    console.log(`Micro-servicio Users corriendo en el puerto ${PORT}`);
});