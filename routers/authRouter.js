import express from "express"
import { checkUser, generateToken, getOnlineUsers, register } from "../controllers/authController.js";
import multer from "multer";
const authRouter=express.Router();
const upload=multer({dest:"uploads/auth"})
authRouter.post("/checkUser",checkUser)
authRouter.post("/register",upload.single('image'),register);
authRouter.post("/generateToken",generateToken)
authRouter.get("/getOnlineUsers",getOnlineUsers);
export default authRouter;