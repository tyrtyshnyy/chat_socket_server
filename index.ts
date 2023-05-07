import express, { Express, Request, Response } from "express";
import { Socket } from "socket.io";
import { Users } from "./types/Users";

// import dotenv from 'dotenv';

// dotenv.config();

const app: Express = express();
const http = require("http").Server(app);
const cors = require("cors");

const port = 5001;

const socketIO = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});

//Add this before the app.get() block
let users: Users[] = [];

socketIO.on('connection', (socket: Socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);
  socket.on('message', (data) => {
    socketIO.emit('messageResponse', data);
  });
  socket.on('typing', (data) => {socket.broadcast.emit('typingResponse', data);  console.log(data);});
 
  
  //Listens when a new user joins the server
  socket.on('newUser', (data) => {
    //Adds the new user to the list of users
    users.push(data);
  
    //Sends the list of users to the client
    socketIO.emit('newUserResponse', users);
  });

  socket.on('disconnect', () => {
    console.log('🔥: A user disconnected');
    //Updates the list of users when a user disconnects from the server
    users = users.filter((user) => user.socketID !== socket.id);
    // console.log(users);
    //Sends the list of users to the client
    socketIO.emit('newUserResponse', users);
    socket.disconnect();
  });
});



app.use(cors());
app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.get("/api", (req: Request, res: Response) => {
  res.json({
    message: "Hello world",
  });
});

http.listen(port, () => {
  console.log(`⚡️[server]: Server is running on ${port} port`);
});
