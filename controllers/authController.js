import prisma from "../config/prismaConfig.js";
import { renameSync } from 'fs'
import dotenv from "dotenv"
import { generateToken04 } from "../config/tokenGenerator.js";
dotenv.config();
export const checkUser = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {

            return res.send({
                success: false,
                message: "email is required"
            })
        }

        const user = await prisma.user.findUnique(
            {
                where: {
                    email
                }
            }
        )
        if (!user) {
            return res.send({
                success: false,
                message: "User not found"
            })
        }
        return res.send({
            success: true,
            message: "user found",
            user
        })
    } catch (err) {
        console.log(err);
        next(err);
    }

}
export const register = async (req, res, next) => {
    try {
        const { email, name, bio } = req.body;
        console.log(email+" "+name+" "+bio+" "+req.file.path);
        if (!email || !name || !req.file || !bio) {
            return res.send({
                success: false,
                message: "failed to create new user"
            })
        }
        const date = Date.now();
        const newFilePath = "uploads/auth/" + date + req.file.originalname
        renameSync(req.file.path, newFilePath)
        const newuser = await prisma.user.create({
            data: { email, name, image: `https://clabble-backend.onrender.com/${newFilePath}`, bio }
        });
        return res.send({
            success: true,
            newuser
        })
    } catch (err) {
        console.log(err);
        next(err);
    }
}

export const generateToken = (req, res, next) => {
    try {
        const appId = parseInt(process.env.ZEGO_APP_ID);
        const serverSecret = process.env.ZEGO_SERVER_ID;
        const  userId  = req.body.userId.toString();
        console.log(userId)
        const effectiveTime = 3600;
        const payload = "";
        if (appId && serverSecret && userId) {
            const token = generateToken04(appId, userId, serverSecret, effectiveTime, payload);
            return res.send({
                success: true,
                token
            })
        }
        return res.send({
            success: false,
            message:"appId , serverSecret and userId are required!!!"
        })
    }
    catch (err) {
        console.log(err);
    }
}

export const getOnlineUsers=(req,res)=>{
    return res.send({onlineUsers:Array.from(onlineUsers.keys())})
}