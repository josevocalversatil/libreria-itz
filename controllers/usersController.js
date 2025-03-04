const { request } = require('express');
const db = require('../dbsql');    // importamos la db
// funcion para autenticar uaurios no sql SEGURA A INYECCION DE SQL
var User = require('../models/Users');
// npm i jsonwebtoken
const jwt = require('jsonwebtoken');

exports.autenticar = async function(email, api_key, res) {
//console.log('email autenticar'+ email);
//console.log('api_key autenticar '+ api_key);

    if (typeof email !== 'string' || typeof api_key !== 'string') {
        console.log('Error en los parametros');
        return res.status(500).json({message: 'Iintento de NOSQL Injection'});
        // mensaje de error y evitamos ataque inyectando objetos 
    }
    let user = await User.findOne({email, api_key});
   // console.log('user '+ user);
    if(!user){
        return res.status(404).json({message: 'API_ KEY NO VALIDA'});
    }
    if(user.saldo < 0){
        return res.status(404).json({message: 'Saldo insuficiente'});
    }

    // si la autenticacion fue correcta, generamos un token
    const token= jwt.sign({email, api_key},'tu-palabra-secreta',
        {expiresIn: '1h'});

    return {token, message: 'Token valido por 1 hora'};
   
}

exports.create = async function (req, res){
    // para que la api funcionee y reciba el request desde el body
  //  console.log('req.query'+ req.query);
  //  console.log('req.body'+ req.body);

    if(Object.keys(req.query).length > 0){
     var request = req.query;   
    }else if(Object.keys(req.body).length > 0){
     var  request = req.body;
    }

    // validamos campos obligatorios 
    if(!request.email || !request.password){
        return res.status(400).send({message: 'email y password campos obligatorios'});
    }

    try {
     const existinguser =   await User.findOne({email: request.email});
     if(existinguser){
         return res.status(400).send({message: 'email ya registrado'});
     }
     // crea y guarda el nuevo usuario
     const user = new User(request);
     await user.save();
     return res.json({user, message: 'usuario creado correctamente'});

    } catch (error) {
        return res.status(500).json({
            message: 'error al crear usuario',
            error: error.message
        })
        
    }
}

exports.updateUser = async function (req, res){
    const token = req.header=('Authorization');
    console.log('token'+ token);
    const decodedToken = jwt.verify(token, 'tu-palabra-secreta');
    console.log('decodedToken'+ decodedToken);
    //obtener el usuario
    const user = await User.findOne({api_key: decodedToken.api_key});
// verificamos si el usuario existe
    if(!user){
        return res.status(404).json({message: 'Usuario no encontrado'});
    }   
    // actualizamos el saldo 
    user.saldo = user.saldo -1;
    await user.save();
    return {user, message: 'Peticion Exitosa'};

}