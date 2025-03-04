var Libros = require('../models/Libros');   

// definimos el crud de libros

// crear libros
exports.create = async function(req, res) {
    console.log('req.query'+ req.query);
    console.log('req.body'+ req.body);
    try {
     // creamos un nuevo libro
    var libro = new Libros(req.body);
    await libro.save();
    return res.json(libro);

    } catch (error) {
        return res.status(500).json({
            message: 'Error al crear el libro',
            error: error
        });
    }
};

// obtener libros
exports.list = async function(req, res) {

        await Libros.find().then(function (libros) {
            return res.json(libros);
        }).catch(error => {
            return res.status(500).json({
                message: 'Error al obtener los libros',
                error: error
            });
        })
}

// actualizar libros
exports.update = async function(req, res) {
        try {
            const libroAct = await Libros.findByIdAndUpdate(
                req.params.id,
                req.body,
                // nos devuelve los libros atualizados
                {new: true}
            );

            if (!libroAct) {
                return res.status(404).json({
                    error: 'No se encontro el libro'
                });
            }
            return res.json(libroAct);
        } catch (error) {
            return res.status(500).json({
                message: 'Error al actualizar el libro',
                error: error
            });   
        }
}

// eliminar libros
exports.remove = async function(req, res) {  
    try {
        const libroElim = await Libros.findByIdAndDelete(req.params.id);
        if (!libroElim) {
            return res.status(404).json({
                error: 'No se encontro el libro'
            });
        }
        return res.status(204).json('Libro eliminado correctamente');
    } catch (error) {
        return res.status(500).json({
            message: 'Error al eliminar el libro',
            error: error
        });
    }
}

// mostrat un libro por su _id
exports.show = async function(req, res) {
    try {
        const libro = await Libros.findById(req.params.id);
        if (!libro) {
            return res.status(404).json({
                error: 'No se encontro el libro'
            });
        }
        return res.json(libro);
    } catch (error) {
        return res.status(500).json({
            message: 'Error al obtener el libro',
            error: error
        });
    }
}

