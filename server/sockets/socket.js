const { io } = require('../server');
const { Usuarios } = require('../classes/usuario')
const { crearMensaje } = require('../utils/utilidades')


const usuarios = new Usuarios();

io.on('connection', (client) => {

    client.on('entrarChat', (usuario, callback) => {

        if (!usuario.nombre || !usuario.sala) {
            return callback({
                error: true,
                mensaje: 'El usaurio es necesario'
            })
        }

        client.join(usuario.sala);

        let personas = usuarios.agregarPersona(client.id, usuario.nombre, usuario.sala);

        client.broadcast.to(usuario.sala).emit('listaPersona', usuarios.getPersonasPorSala(usuario.sala));

        callback(personas)
    });

    client.on('crearMensaje', (data) => {
        let persona = usuarios.getPersona(client.id);
        let mensaje = crearMensaje(persona.nombre, data.mensaje);
        client.broadcast.to(persona.sala).emit('crearMensaje', mensaje);
    })

    client.on('disconnect', () => {
        let pesonaBorrada = usuarios.borrarPersona(client.id);

        client.broadcast.to(pesonaBorrada.sala).emit('crearMensaje', crearMensaje('Administrador', `${pesonaBorrada.nombre} Salio`));

        client.broadcast.to(pesonaBorrada.sala).emit('listaPersona', usuarios.getPersonasPorSala(pesonaBorrada.sala));

    })

    // mensajes privado

    client.on('mensajePrivado', data => {
        let persona = usuarios.getPersona(client.id);
        client.broadcast.to(data.para).emit('mensajePrivado', crearMensaje(persona.nombre, data.mensaje))
    })

});