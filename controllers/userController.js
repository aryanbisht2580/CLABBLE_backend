import prisma from "../config/prismaConfig.js"

export const getAllUsers=async (req,res,next)=>{
try{
    const users=await prisma.user.findMany({
        orderBy:{
            name:"asc"
        }
    });
    const groupedUsers={};
    users.forEach((u)=>{
        const first=u.name.charAt(0).toUpperCase();
        if(!groupedUsers[first]){
            groupedUsers[first]=[];
        }
        groupedUsers[first].push(u)
    })
    // console.log(users);
    return res.send({
        success:true,
        users:groupedUsers
    })
}catch(err){
    console.log(err);
    next(err);
    
}
}