import  { Request, Response } from "express";
import { successResponse,ErrorResponse } from "../../helper/apiResponse";
import FaqSchema from "../../domain/schema/faq.schema";
import { faqDetail, faqList, frontendFaqList, storeFaqModel, updateFaqModel } from "../../domain/models/faq.model";

interface FileWithBuffer extends Express.Multer.File {
    buffer: Buffer;
}

export const deleteAllFaqList = async (req: Request, res: Response) => {
    try {
        const result = await FaqSchema.deleteMany({});

        if (result.deletedCount === 0) {
            return ErrorResponse(res, "No Faq found to delete.");
        }
        //  await storeUserActionActivity(req.user.userId, "BLog", "Delete", `Deleted all blogs.`)

        return successResponse(res, `Successfully deleted all faqs .`, result.deletedCount);
        
    } catch (error) {
        return ErrorResponse(res, "An error occurred while deleting all Faqs .");
    }
};

export const getFaqList = async (req: Request, res: Response) => {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const categories = await faqList(search as string, pageNum, limitNum);
        return successResponse(res, "get slider list successfully", categories);
    } catch (error) {
        ErrorResponse(res,'An error occurred during slider registration.');
    }
}

export const storeFaq = async (req: Request, res: Response) => {
    try {
       
        storeFaqModel(req.body,req.body, (error: any, result: any) => {
            if (error) {
                return ErrorResponse(res, error.message);
            }
            return successResponse(res, "Faq Added successfully", { result });
        });
        
    } catch (error) {
        console.log(error);
        ErrorResponse(res,'An error occurred during user registration.');
    }
}


export const faqDetails = async (req: Request, res: Response) => {
    try {

        const { id } = req.params;

        faqDetail(id as string, (error: any, result: any) => {
            if (error) {
                console.error("Error:", error);
                return ErrorResponse(res, error.message);
            }

            return successResponse(res, "Slider details", result); 
        });

    } catch (error) {
        console.error("Error:", error);
        ErrorResponse(res, "An error occurred while fetching Slider details.");
    }
};

export const updateFaq = async (req: Request, res: Response) => {
    
    try {

        const faqToUpdate = await FaqSchema.findById(req.body.faq_id);
        if (!faqToUpdate) {
            return ErrorResponse(res, "Faq not found");
        }

        updateFaqModel(req.user, req.body, (error: any, result: any) => {
            if (error) {

                return ErrorResponse(res, error.message);
            }

            return successResponse(res, "Slider updated successfully", { result });
        });

    } catch (error) {
        console.error("❌ Error in update Slider:", error);
        ErrorResponse(res, "An error occurred while updating the Slider.");
    }
};

export const deleteFaq= async (req: Request, res: Response) => {
    try {
        const { faq_ids } = req.body;

        if (!faq_ids || !Array.isArray(faq_ids) || faq_ids.length === 0) {
            return ErrorResponse(res, "Please provide at least one valid Faq ID.");
        }

        // Fetch blogs to get image paths before deleting
        const faqToDelete = await FaqSchema.find({ _id: { $in: faq_ids } });

        if (!faqToDelete.length) {
            return ErrorResponse(res, "No Faq found with the provided IDs.");
        }


        // Now delete the faq documents
        const result = await FaqSchema.deleteMany({ _id: { $in: faq_ids } });

        if (result.deletedCount === 0) {
            return ErrorResponse(res, "No Faq found to delete.");
        }

        // await storeUserActionActivity(req.user.userId, "Blog", "Delete", `Deleted blog(s) successfully.`);

        return successResponse(res, `Successfully deleted faq(s).`, result.deletedCount);

    } catch (error) {
        console.error("❌ Error in delete faq:", error);
        return ErrorResponse(res, 'An error occurred while deleting faq.');
    }
};

export const getFaqListFrontend = async (req:Request,res:Response) => {
    try {
        frontendFaqList((error:any, result:any) => {
            if (error) {
                console.log(error);
                return ErrorResponse(res,error.message);
            }
            return successResponse(res, "get slider list successfully", result);
        });
    } catch (error) {
        ErrorResponse(res,'An error occurred during fetching slider .');
    }
}









