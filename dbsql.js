// npm i sqlite3
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:'); // creamos una db en memoria

// iniciamos la db
db.serialize(() => {   
    db.run(`CREATE TABLE users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
        ) `);

    // insertamos un usuario con  una contraseña 
    db.run(`INSERT INTO users(username, password) VALUES('admin', 'admin123')`);
});

console.log('Base de datos SQL creada en memoria');
 module.exports = db;