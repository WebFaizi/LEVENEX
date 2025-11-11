import e, { Request, Response } from "express";
import {successResponse,ErrorResponse } from "../../helper/apiResponse";
import {homePageModels,getChatboatListingModel} from "../../domain/models/setting.model";


export const homePage = async (req: Request, res: Response) =>{
    try {
        homePageModels(req.body, (error:any, result:any) => {
            if (error) {
                console.log(error);
               return ErrorResponse(res,error.message);
            }
            return successResponse(res, "Login User Successfully", result);
        });
    } catch (error) {
        return ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const getChatboatListing = async (req: Request, res: Response) =>{
    try {
        getChatboatListingModel(req.body, (error:any, result:any) => {
            if (error) {
                console.log(error);
               return ErrorResponse(res,error.message);
            }
            return successResponse(res, "Listing information list", result);
        });
    } catch (error) {
        return ErrorResponse(res,'An error occurred during user registration.');
    }
}
