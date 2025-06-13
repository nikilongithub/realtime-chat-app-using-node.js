const express = require('express');
const path = require('path');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: { origin: "*" }
});

// ✅ Serve static files (html, css, js, images, sound)
app.use(express.static(path.join(__dirname, 'public')));

const users = {};

io.on('connection', (socket) => {
    socket.on('new-user-joined', name => {
        users[socket.id] = name;
        socket.broadcast.emit('user-joined', name);
    });

    socket.on('send', message => {
        socket.broadcast.emit('recieve', {
            message: message,
            name: users[socket.id]
        });
    });

    socket.on('typing', name => {
        socket.broadcast.emit('displayTyping', name);
    });

    socket.on('stopTyping', () => {
        socket.broadcast.emit('hideTyping');
    });

    socket.on('disconnect', () => {
        const name = users[socket.id];
        if (name) {
            socket.broadcast.emit('user-left', name);
            delete users[socket.id];
        }
    });
});

const PORT = process.env.PORT || 8000;
http.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
