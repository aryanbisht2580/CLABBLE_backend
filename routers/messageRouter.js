import express from "express"
import { addImage, addMessage, getChattedContacts, getMessages, markRead } from "../controllers/messageController.js";
import multer from "multer";
const messageRouter=express.Router();

const upload=multer({dest:"uploads"})

messageRouter.post("/addMessage",addMessage)
messageRouter.post("/getMessages",getMessages)
messageRouter.post("/postImage",upload.single('image'),addImage)
messageRouter.post("/getChattedContacts",getChattedContacts);
messageRouter.post("/markRead",markRead);

export default messageRouter;