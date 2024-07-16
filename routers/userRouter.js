import express from "express"
import { getAllUsers } from "../controllers/userController.js";
const userRouter=express.Router();
userRouter.get("/getAllUsers",getAllUsers)

export default userRouter;