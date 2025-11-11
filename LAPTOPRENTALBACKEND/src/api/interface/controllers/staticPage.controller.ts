import e, { Request, Response } from "express";
import { successCreated, successResponse,ErrorResponse } from "../../helper/apiResponse";
import SataticPageSchema from "../../domain/schema/staticPage.schema";
import { storeStaticPageModel,staticPageListModel,StaticPageDetailModel,updateStaticPageModel } from "../../domain/models/staticPage.model";
import { upload } from "../../services/upload.service";
import * as XLSX from "xlsx";


export const storeStaticPage = async (req: Request, res: Response) => {
    try {
        const categories = await storeStaticPageModel(req.body, (error:any, result:any) => {
            if (error) {
                ErrorResponse(res,error.message);
            }
            return successResponse(res, "Page stored successfully", result);
        });
        
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const deleteAllStaticPages = async (req: Request, res: Response) => {
    try {
        const result = await SataticPageSchema.deleteMany({});

        if (result.deletedCount === 0) {
            return ErrorResponse(res, "No Static Pages found to delete.");
        }

        return successResponse(res, `Successfully deleted all Static Pages.`, result.deletedCount);
        
    } catch (error) {
        return ErrorResponse(res, "An error occurred while deleting all Static Pages.");
    }
};

export const getStaticPageList = async (req: Request, res: Response) => {    
    try {
      
        const { search = '', page = 1, limit = 10 } = req.query;

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);

        const users = await staticPageListModel(search as string, pageNum, limitNum);

        return successResponse(res, "get static page list successfully", users);

    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const getStaticPageDetails = async (req: Request, res: Response) => {
    try {

        const { id } = req.params;

        StaticPageDetailModel(id as string, (error: any, result: any) => {
            if (error) {
                console.error("Error:", error);
                return ErrorResponse(res, error.message);
            }

            return successResponse(res, "Static page details", result); 
        });

    } catch (error) {
        ErrorResponse(res, "An error occurred while fetching blog details.");
    }
};

export const updateStaticPageDetails = async (req: Request, res: Response) => {
    try {
        updateStaticPageModel(req.body, (error: any, result: any) => {
            if (error) {
                return ErrorResponse(res, error.message);
            }
            return successResponse(res, "Update static page details successfully", { result });
        });
    } catch (error) {
            ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const deleteStaticPage = async (req:Request,res:Response) => {
    try{
        const { static_ids } = req.body; 

        if (!static_ids || !Array.isArray(static_ids) || static_ids.length === 0) {
            return ErrorResponse(res, "Please provide at least one valid Blog ID.");
        }

        const result = await SataticPageSchema.deleteMany({ _id: { $in: static_ids   } });

        if (result.deletedCount === 0) {
            return ErrorResponse(res, "No country found with the provided IDs.");
        }

        return successResponse(res, `Successfully deleted  static page(ies).`,result.deletedCount);

    }catch (error){
        return ErrorResponse(res,'An error occurred during user registration.');
    }
}
