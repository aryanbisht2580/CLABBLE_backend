import path from "path";
import prisma from "../config/prismaConfig.js";
import {renameSync} from 'fs'
export const addMessage = async (req, res, next) => {
    try {
        const { message, from, to } = req.body;
        const isFromOnline = onlineUsers.get(to);
        if (message, from, to) {
            const newMessage = await prisma.messages.create({
                data: {
                    senderId: parseInt(from),
                    // sender:{connect:{id:parseInt(from)}},
                    receiverId: parseInt(to),
                    // receiver:{connect:{id:parseInt(to)}},
                    messageStatus: isFromOnline ? "delivered" : "sent",
                    message
                }
            })
            return res.send({
                success: true,
                newMessage
            })
        }
        return res.send({
            success: false,
            message: "message, sender, receiver required!!!"
        })
    } catch (err) {
        console.log(err);
        next(err);
    }

}


export const getMessages = async (req, res, next) => {
    try {
        const {from, to } = req.body;
        
        if (from, to) {
            const messages=await prisma.messages.findMany({
                where:{
                    OR:[
                        {
                            senderId:parseInt(from),
                            receiverId:parseInt(to),
                        },
                        {
                            senderId:parseInt(to),
                            receiverId:parseInt(from)
                        }
                    ]
                },
                orderBy:{
                    id:"asc"
                }
            })
            let unread=[];
            messages.forEach((m,ind)=>{
                if(m.messageStatus!='read' && from==m.receiverId){
                    messages[ind].messageStatus='read'
                    unread.push(m.id);
                }
            })
            await prisma.messages.updateMany({
                where:{
                    id:{
                        in:unread,
                    }

                },
                data:{
                    messageStatus:'read'
                }
            })
            return res.send({
                success: true,
                messages
            })
        }
        return res.send({
            success: false,
            message: "sender, receiver required!!!"
        })
    } catch (err) {
        console.log(err);
        next(err);
    }

}

    export const addImage=async(req,res,next)=>{

        try{
            if(req.file){
                const {from,to}=req.body;
                if(from && to){
                    const date=Date.now();
                    const newFilePath="uploads/"+date+req.file.originalname;
                    renameSync(req.file.path,newFilePath);
                    const message=await prisma.messages.create({
                        data:{
                            senderId:parseInt(from),
                            receiverId:parseInt(to),
                            message:newFilePath, 
                            type:"image",
                            messageStatus:onlineUsers.get(parseInt(to))?"read":"sent"

                        }
                    })
                    res.send({
                        success:true,
                        message
                    })
                }
                else{
                    return res.send({
                        success:false,
                        message:"image is required!!!"
                    })
                }
            }
            else{
                return res.send({
                    success:false,
                    message:"image is required!!!"
                })
            }
        }catch(err){
            next(err);
        }
    }

    export const getChattedContacts=async(req,res,next)=>{
        try{
            const {userId}=req.body;
            if(!userId){
                return res.send({
                    success:false,
                    message:"userId REQUIRED"
                })
            }
            // console.log(userId)
            const user=await prisma.user.findUnique({
                where:{
                    id:userId
                },
                include:{
                    sentMessages:{
                        include:{
                            sender:true,
                            receiver:true
                        },
                        orderBy:{
                            createAt:"desc"
                        }
                    },
                    receivedMessages:{
                        include:{
                            sender:true,
                            receiver:true
                        },
                        orderBy:{
                            createAt:"desc"
                        }
                    }
                }
                
            })
            // console.log(user);
            const messages=[...user.sentMessages,...user.receivedMessages]
            messages.sort((a,b)=>b.createAt.getTime()-a.createAt.getTime());
            // console.log(messages)
            const chattedUsers=new Map();
            let changeStatus=[];
            messages.forEach((m)=>{
                const otherId=m.senderId==userId?m.receiverId:m.senderId;
                if(m.messageStatus=='sent' && m.receiverId==userId){
                    changeStatus.push(m.id);
                } 
                if(!chattedUsers.get(otherId)){
                    let u={...m,messageId:m.id};
                    if(m.senderId==userId){
                        u={...u,...m.receiver,totalUnreadMessages:0}
                    }
                    else{
                        u={...u,...m.sender,totalUnreadMessages:m.messageStatus=='read'?0:1}
                    }
                    chattedUsers.set(otherId,{...u});
                }else if(m.messageStatus!=="read" && m.senderId!=userId){
                    const u=chattedUsers.get(otherId);
                    chattedUsers.set(otherId,{...u,totalUnreadMessages:u.totalUnreadMessages+1});
                }
            })
            if(changeStatus.length){
                await prisma.messages.updateMany({
                    where:{
                        id:{
                            in:changeStatus,
                        }
    
                    },
                    data:{
                        messageStatus:'delivered'
                    }
                })
            }
            return res.send({
                success:true,
                chattedUsers:Array.from(chattedUsers.values()),
                onlineUsers:Array.from(onlineUsers.keys())
            })
        }catch(err){
            next(err);
        }
    }

    export const markRead=async(req,res)=>{
        const {messageId}=req.body;
        console.log(req.body);
        await prisma.messages.update({
            where:{
                id:messageId
            },
            data:{
                messageStatus:"read"
            }
        })
        res.send({status:"success"})
    }