const mongoose = require('mongoose');   

const generateApiKey = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let api_key = '';
    for (let i = 0; i < 15; i++) {
         api_key += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return api_key;
}

// definimos el esquema del usuario
var UserSchema = new mongoose.Schema({
    email: {type:String, unique:true, required:true},
    password: {type:String, required:true},
    api_key: {type:String, required:true, unique:true, default:generateApiKey},
    saldo: {type:Number, default:5}
});

/*
UserSchema.pre('save', function(next) {
    if(!this.api_key) {
        this.api_key = generateApiKey();
    }
    next();
});
*/
// definimos el modelo del usuario
const User = mongoose.model('Users', UserSchema);
module.exports = User;