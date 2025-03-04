const express = require('express');
require('../db');
const cors = require('cors');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const librosController = require('../controllers/LibrosController');
const authenticateJWT = require('../authMiddleware');
const app = express();
const PORT = 3000;

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

///////// RUTAS LIBROS 

// obtenemos todos los libros
/**
 * @swagger
 * /libros:
 *   get:
 *      summary: Obtiene todos los libros
 *      responses:
 *          200:
 *              description: Lista de libros
 */
app.get('/', authenticateJWT, async (req, res) => {
    librosController.list(req, res);
});

// obtenemos un libro por su id
/**
* @swagger
* /libros/{id}: 
*  get:     
*      summary: Obtiene un libro por su id
*      parameters:
*          -   in: path
*              name: id
*              required: true
*              description: El id del libro
*              schema:
*                  type: string
*      responses:
*          200:
*              description: detalles del libro
*/
app.get('/:id', authenticateJWT, async (req, res) => {
   librosController.show(req, res);
});

// creamos un libro
/**
* @swagger
* /libros:
*  post:
*      summary:    Crea un libro
*      consumes:
*          -   application/json
*      requestBody:
*          required: true
*          content:
*              application/json:
*                  schema:
*                      type: object
*                      properties:
*                          titulo:
*                              type: string
*                          autor:
*                              type: string
*                          publicacion:
*                              type: integer   
*                      example:
*                          titulo: "El señor de los anillos"  
*                          autor:  "J.R.R. Tolkien"
*                          publicacion:    1954
*      responses:
*          200:
*              description: Libro creado
*/
app.post('/', authenticateJWT, async (req, res) => {
   librosController.create(req, res);
});

// actualizamos un libro
/**
* @swagger
* /libros/{id}:
*   put:
*     summary: Actualiza un libro por su id
*     parameters:
*       - in: path
*         name: id
*         required: true
*         description: Id del libro
*         schema:
*           type: string
*       - in: body
*         name: libro
*         required: true
*         content:
*           application/json:
*             schema:
*               type: object
*               properties: 
*                 titulo: 
*                   type: string
*                 autor:
*                   type: string
*                 publicacion:
*                   type: integer
*             example:
*               titulo: "El señor de los anillos"
*               autor: "J.R.R. Tolkien"
*               publicacion: 1954
*     responses:
*       200:
*         description: Libro actualizado
*/
app.put('/:id', authenticateJWT, async (req, res) => {
   librosController.update(req, res);
});

// eliminamos un libro  
/**
* @swagger
* /libros/{id}:
*  delete:
*      summary: Elimina un libro por id
*      parameters:
*          -   in: path
*              name: id
*              required: true
*              description: El id del libro
*              schema:
*                  type: string
*      responses:
*          200:
*              description: Libro eliminado
*          404:
*              description: No se encontro el libro
*/
app.delete('/:id', authenticateJWT, async (req, res) => {
    librosController.remove(req, res);
});

app.listen(PORT, () => {
    console.log(`Micro-servicio Libros corriendo en el puerto ${PORT}`);
});