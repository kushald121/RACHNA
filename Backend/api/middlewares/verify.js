import jwt from "jsonwebtoken";

export const verifyToken = (req,res,next) => {
    const authHeader = req.headers.authorization;
    if(!authHeader) return res.status(401).json({message: "No token provided"});


 const token = authHeader.split(' ')[1];

 try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
 }  catch(error) {
    console.error(error);
    return res.status(401).json({message: "Invalid or expired token"});
 }
};