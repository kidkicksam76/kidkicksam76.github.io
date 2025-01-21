const io = require('socket.io')(3000);

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('chat message', (msg) => {
        io.emit('chat message', msg); // Send the message to all connected clients
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});
