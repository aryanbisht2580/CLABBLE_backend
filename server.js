import express from "express"
import dotenv from "dotenv"
import authRouter from "./routers/authRouter.js";
import cors from "cors"
import userRouter from "./routers/userRouter.js";
import messageRouter from "./routers/messageRouter.js";
import { Server } from "socket.io";

dotenv.config();
const app=express();
app.use(cors())
app.use(express.json());
app.use("/uploads",express.static("uploads"))

app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)
app.use("/api/messages",messageRouter)

app.get("/",(req,res)=>{
    return res.send("ehllo")
})
const s=app.listen(process.env.PORT,()=>{
    console.log("server is listening")
})
global.onlineUsers=new Map();


const io=new Server(s,{
    cors:"*"
});
io.on("connection",(socket)=>{
    global.gSocket=socket;
    socket.on("add-user",(userId)=>{
        onlineUsers.set(userId,socket.id)
        socket.broadcast.emit("addIt",{
            onlineUsers:Array.from(onlineUsers.keys())
        })
    })
    socket.on("logOut",(userId)=>{
        onlineUsers.delete(userId)
        socket.broadcast.emit("remove-user",{
            onlineUsers:Array.from(onlineUsers.keys())
        })
    })
    socket.on("send-msg",(data)=>{
        const sendUserSocket=onlineUsers.get(data.to);
        if(sendUserSocket){
            socket.to(sendUserSocket).emit("receive-msg",{
                ...data,receiverId:data.to,senderId:data.from
            })
        }
    })
    // socket.on("message-read",(data)=>{
    //     const sendUserSocket=onlineUsers.get(data.senderId);
    //     console.log("message-read")
    //     console.log(data);
        
    //     if(sendUserSocket){
    //         socket.to(sendUserSocket).emit("message-has-been-read",data)
    //     }
    // })
    
    socket.on("outgoing-voice-call",(data)=>{
        const sendUserSocket=onlineUsers.get(data.to);
        if(sendUserSocket){
            socket.to(sendUserSocket).emit("incoming-voice-call",{...data})
        }
    })    
    socket.on("outgoing-video-call",(data)=>{
        const sendUserSocket=onlineUsers.get(data.to);
        
        if(sendUserSocket){
            socket.to(sendUserSocket).emit("incoming-video-call",{...data})
        }
    })
    socket.on("reject-voice-call",(data)=>{
        const sendUserSocket=onlineUsers.get(data.from.id);
        if(sendUserSocket){
            socket.to(sendUserSocket).emit("reject-voice-call")
        }
    })
        socket.on("reject-video-call",(data)=>{
        const sendUserSocket=onlineUsers.get(data.from.id);
        if(sendUserSocket){
            socket.to(sendUserSocket).emit("reject-video-call")
        }
    })

    socket.on("accept-incoming-call",(data)=>{
        const sendUserSocket=onlineUsers.get(data.from.id);
        if(sendUserSocket){
            socket.to(sendUserSocket).emit("call-accepted")
        }
    })
})