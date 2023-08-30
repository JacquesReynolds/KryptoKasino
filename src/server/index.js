// main app
//import * as gameLogic from './game-logic.mjs';
const gameLogic = require('./game-logic.js')
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config({
    path: './config.env'
})

const express = require('express');
const app = express();
const socketUtils = require('./utils/socketUtils');

const server = http.createServer(app);
const io = socketUtils.sio(server);
socketUtils.connection(io);

const socketIOMiddleware = (req, res, next) => {
    req.io = io;
    next();
};

// CORS
app.use(cors());

// ROUTES
// app.use('/', socketIOMiddleware, (req, res) => {
//     req.io.emit("game_data", `Hello ${req.originalUrl}`);
//     res.send("I have power!")
// });


// LISTEN
//const port = process.env.PORT;
const port = 3000;
server.listen(port, 'localhost', () => {
    console.log(`App running on port ${port}...`)
})