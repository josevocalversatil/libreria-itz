const express = require('express'); 
const librosController = require('./controllers/LibrosController');
const usersController = require('./controllers/usersController');
const authenticateJWT = require('./authMiddleware');
const router = express.Router();


// RUTAS NO PROTEGIDAS
/**
 * @swagger
 * /get-token: 
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

router.post('/get-token', async (req, res) => {
    
        if(Object.keys(req.query).length > 0){
           var  request = req.query;
            
        }else if(Object.keys(req.body).length > 0){
           var  request = req.body;
        }
      
        const {email, api_key} = request;
       
        try {
            const result = await usersController.autenticar(email, api_key);
        //  console.log('este es el resultado'+ result);
             res.json(result);
          //  console.log( result);
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

router.post('/users', async (req, res) => {
    usersController.create(req, res);
});

// obtenemos todos los libros
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
router.get('/libros', authenticateJWT, async (req, res) => {
     librosController.list(req, res);
});
// obtenemos un libro por su id
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
router.get('/libros/:id', async (req, res) => {
    librosController.show(req, res);
});
// creamos un libro
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
router.post('/libros', async (req, res) => {
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
router.put('/libros/:id', async (req, res) => {
    librosController.update(req, res);
});
// eliminamos un libro
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
router.delete('/libros/:id', async (req, res) => {
    librosController.remove(req, res);
});

app.use('/documentacion', swaggerUi.serve, swaggerUi.setup(swaggerSpec, optionsV1));

module.exports = router; 