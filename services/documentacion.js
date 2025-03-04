const express = require('express');
const {swaggerUi, swaggerSpec, optionsV1} = require('../swagger');
const app = express();
const PORT = 3002;
const cors = require('cors');
app.use(cors());

// configuracion de swagger
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec, optionsV1));

app.listen(PORT, () => {    
    console.log(`Micro-servicio Documentacion corriendo en el puerto ${PORT}`);
});
