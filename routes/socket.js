const socketio = require('socket.io')
const cookieParser = require('cookie-parser')
const {parse} = require('cookie')
const {getUserInstance} = require('../middleware/getUser')
const {createComment} = require('../routes/api')

const establishSocketConnection = (server) => {
    const io = socketio(server)

    io.on('connection',(socket)=>{

        console.log('Client connected');
        
        socket.on('comment', async (rawComment) => {

            // Parse cookies for authentication and get the user.

            const cookies = parse(socket.handshake.headers.cookie);
            const user = await getUserInstance('sessionToken' in cookies ? cookies.sessionToken : null);

            // If the user was not authenticated, do not proceed. They are not allowed to create comments, but they are allowed to receive new ones.

            if (user === null) {

                return;
            }

            // Otherwise, create the comment.

            const comment = await createComment(rawComment.postId, user, rawComment.comment);

            // Attach the username of the commentor to the comment output.

            comment.username = user.username;

            // And then broadcast the comment to all connected clients.

            console.log(comment);
            io.emit('newComment', comment);
        });
        socket.on('disconnect',() =>{
            console.log('Client disconnected');
        });
    });
    return io;
}

module.exports = establishSocketConnection