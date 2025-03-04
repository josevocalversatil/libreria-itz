//instalamos  npm i swagger-jsdoc swagger-ui-express swagger-themes
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const {SwaggerTheme, SwaggerThemeNameEnum} = require('swagger-themes');
const theme = new SwaggerTheme; 
const path = require('path');

// configuracion de swagger 
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Servicio REST de LIbros',
            description: 'API para administrar libros',
            version: '1.0.0',
            termsOfService: "http://localhost:3000/terms/",
            contact: {
                name: "Jose Nuñez",
                email: "josenu@itz.edu.mx",
                url: "http://localhost:3000/welcome/"
            }
        },
        components: {
            securitySchemes: {
                apiKeyAuth: {
                    type: 'apiKey',
                    name: 'Authorization',
                    in: 'header',
                    description: 'Añade tu token de seguridad en la cabecera de la solicitud'
                }
            },
        },
        security: [
            {
                apiKeyAuth: [] // Aplica esta configuración por defecto
            }
        ]
    },
    apis: [
         path.join(__dirname, 'routes.js'), 
        //   path.join(__dirname, 'services/libros.js'), 
        ///   path.join(__dirname, 'services/users.js')
        ],
};

const optionsV1 = {
    explorer: true,
    customCss: theme.getBuffer(SwaggerThemeNameEnum.DARK)
  };
  const optionsV2 = {
    explorer: true,
    customCss: theme.getBuffer(SwaggerThemeNameEnum.CLASSIC)
  }

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = {
    swaggerUi,
    swaggerSpec,
    optionsV1
};