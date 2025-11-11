import e, { Request, Response } from "express";
import { successResponse,ErrorResponse } from "../../helper/apiResponse";
import { storeNewsletterModel,getNewsletterDetail } from "../../domain/models/newsLetter.model";
import NewsLetterSchema from "../../domain/schema/newsLetter.schema";
import {storeUserActionActivity} from "../../services/userActionActivity.service";
import path from "path"
import mongoose from 'mongoose';
import fs from "fs";
import { env } from "process";

interface FileWithBuffer extends Express.Multer.File {
    buffer: Buffer;
}

export const updateNewsletter = async (req: Request, res: Response) => {
    try {

        const files = req.files as FileWithBuffer[];
        const uploadDir = "uploads/newslatter";
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        files.forEach((file) => {
            const field_name = file.fieldname;
            const fileName = `${Date.now()}-${file.originalname}`;
            const savePath = path.join(uploadDir, fileName);
            fs.writeFileSync(savePath, file.buffer);
            req.body[field_name] = savePath;
        });

        if (req.body.newsletter_banner_image ) {
            const blogToUpdate = await NewsLetterSchema.findOne();
           
            if (blogToUpdate) {
                const oldImage = blogToUpdate?.newsletter_banner_image;
                if(oldImage){
                    console.log(oldImage)
                    const oldImagePath = path.join(__dirname, '../../../../', oldImage as string);
                    

                    if (fs.existsSync(oldImagePath)) {
                        try {
                            fs.unlinkSync(oldImagePath); 
                        } catch (error) {
                            console.error("Error deleting old image:", error);
                            return ErrorResponse(res, "Failed to delete old image.");
                        }
                    }
                }
            }
        }

        const categories = await storeNewsletterModel(req.body, (error:any, result:any) => {
            if (error) {
                ErrorResponse(res,error.message);
            }
             storeUserActionActivity(req.user.userId, "newsletter", "Update", `Update newsletter Details successfully`);
            return successResponse(res, "Update newsletter successfully", result);
        });
        
    } catch (error) {
        console.log(error);
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const newsletterDetails = async (req: Request, res: Response) => {
    try {
        getNewsletterDetail(req.user, (error: any, result: any) => {
            if (error) {
                console.error("Error:", error);
                return ErrorResponse(res, error.message);
            }

            return successResponse(res, "Newsletter details", result); 
        });

    } catch (error) {
        console.error("Error:", error);
        ErrorResponse(res, "An error occurred while fetching blog details.");
    }
};