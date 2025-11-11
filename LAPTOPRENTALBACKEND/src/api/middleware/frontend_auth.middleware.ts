import { Request, Response, NextFunction } from "express";
// import { AuthService } from "../services/auth.service";
import { env } from "../../infrastructure/env";
import jwt from 'jsonwebtoken'

declare global {
    namespace Express {
        interface Request {
            user?: any;  // Use `any` or replace with the correct type for `user`
        }
    }
}



export const protectedFrontendRoute = async(req:Request, res:Response, next: NextFunction) =>{
    let token;
    let message = 'Not authorized to access this route.';
    let msg = 'The user belonging to this token does not exist.';

    // check header for authorization
    if (req.headers.authorization) {
        
        if (req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            // console.log(token);
        }
        else {
            token = req.headers.authorization;
        }
    }

    if (!token) {
        res.status(401).json({ message: message });
        return
    }

    try {
        const decoded = jwt.verify(token,  process.env.JWT_SECRET_KEY || "defaultsecretkey"  as string);
        req.user = decoded;
        const user_Details = req.user;
        if (!user_Details || user_Details.role != 2) {
            return res.status(403).json({ message: "Unauthorized: Insufficient permissions" });
        }
        next()
    } catch (error) {
        res.status(403).json({ message: "Invalid or expired token" })
    }
}

export const LoginUserData = async(req:Request, res:Response) =>{
    let token;
    let message = 'Not authorized to access this route.';
    let msg = 'The user belonging to this token does not exist.';

    // check header for authorization
    if (req.headers.authorization) {
        
        if (req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            console.log(token);
        }
        else {
            token = req.headers.authorization;
        }
    }

    if (!token) {
        res.status(401).json({ message: message });
        return
    }

    try {
        const decoded = jwt.verify(token,  process.env.JWT_SECRET_KEY || "defaultsecretkey"  as string);
        return decoded;
    } catch (error) {
        res.status(403).json({ message: "Invalid or expired token" })
    }
}