const jwt = require('jsonwebtoken');
const Users = require('./models/Users');


const authenticateJWT = async (req, res, next) => {
    const token = req.header('authorization');
    console.log('TOKEN: ' + token);
    if (!token) {
     ///   return res.status(401).json({message: 'Acceso denegado'});
     res.json  ({message: 'Hola mundo desde Middleware de users'});
    }
    try {
        const user = jwt.verify(token, 'tu-palabra-secreta');
        console.log(user.api_key);
        const usuario = await Users.findOne({api_key: user.api_key});
        if (!usuario) {
            return res.status(401).json({message: 'usuario no valido'});
        }
        if(usuario.saldo <= 0){
            return res.status(401).json({message: 'Saldo insuficiente'});
        }
        req.user = user;
        next();

      
    } catch (error) {
        return res.status(400).json({message: 'Token invalid'});
    }
}

module.exports = authenticateJWT;
