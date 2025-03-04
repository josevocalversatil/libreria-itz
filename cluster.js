const os = require('os');
const http = require('http'); // para hacer el balanceo de carga
// npm i cluster http-proxy 
const cluster = require('cluster');
const {createProxyServer} = require('http-proxy');
const { pid } = require('process');

// obtener el numero de CPUS disponibles en el sistema
const numCPUs = os.cpus().length;
//console.log ('numCPUs', numCPUs);
const MAX_PODS = 10;  // limitamos el numero macimo de pods a 10
let numPods = Math.min(4, numCPUs); // iniciamos con 4 pods o el numero de cpus diasponible( seleccionamos la que es menor)
const PORT = 8000; // puertO EN EL QUE EL BALANCEADOR DE CARGA ESCUCHARA LAS PETICIONES 

// veriricar el servidor actual es el server maestro }
if (cluster.isMaster) {
    console.log('servidor maestro iniciado en el puerto' + PORT);
    const pods = []; // lista de pods activos
    // crear los pods
    for (let i = 0; i < numPods; i++) {
        const pod =  cluster.fork();   // creamos un nuevo pod 
        pods.push(pod); // agregamos en la lista de pods activos 
    }

    let podSeleccionado = 0; // seleccionamos INDICE PARA EL BALANCEO DE CARGA (Round-activo,   CARGA EQUITATIVA)
    // si un pod muere, crear uno nuevo

    const proxy = createProxyServer(); // INSTANCIA DEL PROXY PARA redirijir el trafico a los pods 
// creamos el servidor que activara el balanceo de carga
    const server = http.createServer((req, res) => {
        if (pods.length > 0) {
            res.writeHead(503, {'Content-Type': 'text/plain'});
            res.end('No hay pods disponibles');
            return;
        }
        // seleccionamso un pod en el orden (round-robin)
        const pod = pods[podSeleccionado % pods.length];
        podSeleccionado++;
        // construir la URL del destino del pod
        const target = "http://localhost:"+pod.port;
        console.log('Redirigiendo peticion ' + req.url + ' al pod en el puerto  ' + pod.port);

        proxy.web(req, res, {target}, (err) => {
            res.writeHead(500, {'Content-Type': 'text/plain'});
            res.end('Error al redirigir la peticion al pod');
            console.error("Error al redirigir la peticion al", target, err);

        });


    
    });

    // iniciamos el servidor en el puerto definido
    server.listen(PORT, () => {
        console.log('Balanceador de carga iniciado en el puerto ' + PORT);
    });

    // manejamos errores en los pods o pods muertos
    cluster.on('exit', (pod) => {
        const newPod = cluster.fork();
        pods[pods.indexOf(pod)] = newPod; // reemplazamos el pod muerto por uno nuevo
     
    });
    
    // capturar mensajes de los pods, como su puerto y use de cpu y memoria 
    cluster.on('online', (pod) => {
        pod.on('message', (message) => {
            if(message.port){
                pod.port = message.port;
            }
            if(message.stats){
                console.log('Pod ' + pod.process.pid + ' CPU:' + message.stats.cpu + '  | Memoria:' + message.stats.memmory);	
            }
        });
    });

    //monitoreo el servidor master cada 5 segundo 
    setInterval(() => {
        const memoryUsage = process.memoryUsage().rss / 1024 / 1024; // memoria en MB
        const cpuUsage = os.loadavg()[0] / numCPUs * 100; // carga de cpu en porcentaje
        console.log('servidor maestro: ' + process.pid + ' CPU: ' + cpuUsage.toFixed(2) +'%'+ ' | Memoria: ' + memoryUsage.toFixed(2) + 'MB');

        // si el uso del CPU supera el 50% y no se ha alcanzado el maximo de pods
        // creamos un pod nuevo
        if(cpuUsage > 50 && pods.length < MAX_PODS){
            const newPod = cluster.fork();
            pods.push(newPod);
            numPods++;
            console.log('uso al 50% Creando un nuevo pod' + newPod.process.pid);
        }

    }, 5000)
} else {
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
const podPORT = 3000 + cluster.worker.id; 

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

// ruta principal para verificar que pod maneja la peticion 
app.get('/', (req, res) => {
    res.send('Pod en el puerto: ' + process.pid + "escuchando en el puerto: " + podPORT);
});


// iniciamos el servidor en el puerto asignado
const server = app.listen(podPORT, () => {
    console.log('Pod corriendo en el puerto' + podPORT);
    process.send({port: podPORT});  // enviamos el puerto al master
});

   //monitoreo el servidor master cada 5 segundo 
   setInterval(() => {
    const memoryUsage = process.memoryUsage().rss / 1024 / 1024; // memoria en MB
        const cpuUsage = os.loadavg()[0] / numCPUs * 100; // carga de cpu en porcentaje
   
    process.send({stats: {cpu: cpuUsage.toFixed(2), memmory: memoryUsage.toFixed(2)}});
}, 5000)


// iniciamos el servidor    
/*
app.listen(port, () => {
    console.log(`Pod corriendo Servidor funcionando en el puerto: ${port}`);
});
*/


}