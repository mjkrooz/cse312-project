const socketio = require('socket.io')

const establishSocketConnection = (server) => {
    const io = socketio(server)

    io.on('connection',(socket)=>{

        console.log('Client connected');
        
        socket.on('comment',(comment) =>{
            console.log(comment);
        });
        socket.on('disconnect',() =>{
            console.log('Client disconnected');
        });
    });
    return io;
}

module.exports = establishSocketConnection