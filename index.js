const express = require('express');
const connectToMongo = require('./db');
const auth = require('./routes/auth');
const message = require('./routes/message');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
// const fetch = require('node-fetch')

const JWT_SECRET = "AbhiIsAVerySexyB$oy";




const app = express();
connectToMongo();


app.use(cors());
app.use(express.json());


const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
    },
});






io.on('connection', (socket) => {
    let currentRoomId;
    console.log(`A User with the id: ${socket.id} connected!!`);

    socket.on('sent_message', (sent_data) => {
        socket.to(sent_data.by + sent_data.to).emit('received_message', sent_data);
    })

    socket.on('room_changed', (payload) => {
        io.sockets.adapter.rooms.forEach((room) => {console.log(room);});
        socket.leaveAll();
        socket.join(payload.user_Id);
        socket.join(payload.id + payload.user_Id);
    })

    socket.on('typing', (payload) => {
        socket.to(payload.by + payload.to).emit('heIsTyping', payload);
    })

    socket.on('leave_room', (id) => {
        socket.leave(id);
    });

    socket.on('sent_fr_notification', (id) => {
        // console.log('Notification Sent');
        socket.to(id).emit('notification_received');
    })

    socket.on('userloggedin', (user_Id) => {
        socket.join(user_Id);
        currentRoomId = user_Id;
    })

    socket.on('sent_chat_notification', ({ id, user_Id }) => {
        socket.to(id).emit('chat_notification_received', user_Id);
    })

    socket.on('content_changed_refresh_discussions', (user_Id) => {
        socket.to(user_Id).emit('refresh_discussions')
    })

    socket.on('isOnline', (user_Id) => {

        console.log("Is this the fuck??");
        socket.broadcast.emit('cameOnline', user_Id);
    })

    socket.on('disconnecting', () => {
        socket.to(currentRoomId).emit('goOffine')
    })

    socket.on('disconnect', () => {
        // const goingOffline = async () => {
        //     const payload = {
        //         user: {
        //             id: currentRoomId
        //         }
        //     }
        
        //     // Signing the JWT(START)
        //     const token = jwt.sign(payload, JWT_SECRET);
        //     // Signing the JWT(END)

        
        
        //     const response = await fetch(`http://localhost:5000/api/auth/offline`, {
        //             method: 'PUT',
        //             headers: {
        //               'Content-Type': 'application/json',
        //               'auth-token': token    // Dude, this line fucking took me 10 mins to identify that i've not added it lol
        //             },
        //         });
        
        //         const json = await response.json();
        //         console.log(json);
        //       }
        //       goingOffline();

        socket.broadcast.emit('goingOffline', currentRoomId);
        console.log(`User with the id: ${currentRoomId} disconnected`);
    })
})


app.use('/api/auth', auth);
app.use('/api/message', message);

app.get('/', (req, res) => {
    res.send('ok!')
    console.log("ok")
});



const port = 5000;
server.listen(port, () => {
    console.log(`Server Started successfully at port ${port}`)
})