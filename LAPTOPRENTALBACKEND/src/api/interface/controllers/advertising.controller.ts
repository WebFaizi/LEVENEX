import e, { Request, Response } from "express";
import { successCreated, successResponse,ErrorResponse } from "../../helper/apiResponse";
import { storeBannerTypeModel,getBannerTypeModel,bannerTypeDetailModel,updateBannerTypeModel} from "../../domain/models/bannerTypes.model";
import {storeBannerModel,getBannerModel,bannerDetailModel,updateBannerModel,bannerThemeDetailModel,updateBannerThemeModel } from "../../domain/models/banners.model";
import { getBannerThemeModel } from "../../domain/models/bannersTheme.models";
import BannerTypesSchema from "../../domain/schema/bannerTypes.schema";
import BannersSchema from "../../domain/schema/banners.schema";
import { upload } from "../../services/upload.service";
import { convertToWebpAndSave } from "../../services/imageService";
import * as XLSX from "xlsx";
import path from "path"
import fs from "fs";
import { env } from "process";

interface FileWithBuffer extends Express.Multer.File {
    buffer: Buffer;
}

export const deleteAllbannerType = async (req: Request, res: Response) => {
    try {
        const result = await BannerTypesSchema.deleteMany({});

        if (result.deletedCount === 0) {
            return ErrorResponse(res, "No Banners Type found to delete.");
        }

        return successResponse(res, `Successfully deleted all Banners Type.`, result.deletedCount);
        
    } catch (error) {
        return ErrorResponse(res, "An error occurred while deleting all Banners Type.");
    }
};

export const deletetAllBanners = async (req: Request, res: Response) => {
    try {
        const result = await BannersSchema.deleteMany({});

        if (result.deletedCount === 0) {
            return ErrorResponse(res, "No Banners found to delete.");
        }

        return successResponse(res, `Successfully deleted all Banners.`, result.deletedCount);
        
    } catch (error) {
        return ErrorResponse(res, "An error occurred while deleting all Banners.");
    }
};



export const storeBannerType = async (req: Request, res: Response) => {
    try {
        storeBannerTypeModel(req.body, (error:any, result:any) => {
            if (error) {
               return ErrorResponse(res,error.message);
            }
            return successResponse(res, "Store Banner Type successfully", result);
        });
    } catch (error) {
        return ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const getBannerTypesList = async (req: Request, res: Response) => {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const categories = await getBannerTypeModel(search as string, pageNum, limitNum);
        return successResponse(res, "get Bannertype list successfully", categories);
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const getBannerTypesDetails = async (req: Request, res: Response) => {
    try {
        const { bannertype_id } = req.params;
        
        bannerTypeDetailModel(bannertype_id as string, (error: any, result: any) => {
            if (error) {
                console.error("Error:", error);
                return ErrorResponse(res, error.message);
            }

            return successResponse(res, "Get Banner Type details", result); 
        });
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const updateBannerType = async (req: Request,res:Response) => {
    try {
        updateBannerTypeModel(req.body, (error:any, result:any) => {
            if (error) {
               return ErrorResponse(res,error.message);
            }
            return successResponse(res, "Update banner type successfully", result);
        });
    } catch (error) {
        return ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const deleteBannerType = async (req:Request,res:Response) => {
    try{
        const { banner_type_ids } = req.body; 

        if (!banner_type_ids || !Array.isArray(banner_type_ids) || banner_type_ids.length === 0) {
            return ErrorResponse(res, "Please provide at least one valid Blog ID.");
        }

        const result = await BannerTypesSchema.deleteMany({ _id: { $in: banner_type_ids } });

        if (result.deletedCount === 0) {
            return ErrorResponse(res, "No country found with the provided IDs.");
        }

        return successResponse(res, `Successfully deleted  Banner Type(ies).`,result.deletedCount);

    }catch (error){
        return ErrorResponse(res,'An error occurred during user registration.');
    }
}

//banner types 

export const storeBanner = async (req: Request, res: Response) => {
    try {
        const files = req.files as FileWithBuffer[];
        const uploadDir = "uploads/banners";

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        for (const file of files) {
            const field_name = file.fieldname;

            // Convert and save to .webp format
            const savePath = await convertToWebpAndSave(file.buffer, file.originalname, uploadDir);
            req.body[field_name] = savePath;
        }

        storeBannerModel(req.body, (error: any, result: any) => {
            if (error) {
                return ErrorResponse(res, error.message);
            }
            return successResponse(res, "Store Banner successfully", result);
        });
    } catch (error) {
        return ErrorResponse(res, 'An error occurred during banner creation.');
    }
};

export const getBannerList = async (req: Request, res: Response) => {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const categories = await getBannerModel(search as string, pageNum, limitNum);
        return successResponse(res, "get Banner list successfully", categories);
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const getBannerDetails = async (req: Request, res: Response) => {
    try {
        const { banners_id } = req.params;
        
        bannerDetailModel(banners_id as string, (error: any, result: any) => {
            if (error) {
                console.error("Error:", error);
                return ErrorResponse(res, error.message);
            }

            return successResponse(res, "Get Banner details", result); 
        });
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const updateBanner = async (req: Request, res: Response) => {
    try {
        const files = req.files as FileWithBuffer[];
        const uploadDir = "uploads/banners";

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Get current banner from DB
        const banner = await BannersSchema.findById(req.body.banners_id); // assuming _id is passed in req.body
        if (!banner) {
            return ErrorResponse(res, "Banner not found");
        }

        for (const file of files) {
            const field_name = file.fieldname;

            const oldImagePath = (banner as any)[field_name];
            if (oldImagePath && fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }

            const savePath = await convertToWebpAndSave(file.buffer, file.originalname, uploadDir);
            req.body[field_name] = savePath;
        }

        updateBannerModel(req.body, (error: any, result: any) => {
            if (error) {
                return ErrorResponse(res, error.message);
            }
            return successResponse(res, "Update Banner Details successfully", result);
        });
    } catch (error) {
        return ErrorResponse(res, "An error occurred while updating banner.");
    }
};

export const deleteBanner = async (req: Request, res: Response) => {
    try {
        const { banner_ids } = req.body;

        if (!banner_ids || !Array.isArray(banner_ids) || banner_ids.length === 0) {
            return ErrorResponse(res, "Please provide at least one valid banner ID.");
        }

        // Fetch banners to delete to get image paths
        const banners = await BannersSchema.find({ _id: { $in: banner_ids } });

        // Delete associated image files
        for (const banner of banners) {
            const imageFields = ['cover_image', 'banner_image']; // add other image field names if any

            imageFields.forEach((field) => {
                const imagePath = (banner as any)[field];
                if (imagePath && fs.existsSync(imagePath)) {
                    try {
                        fs.unlinkSync(imagePath);
                    } catch (err) {
                        console.error(`Failed to delete image: ${imagePath}`, err);
                    }
                }
            });
        }

        // Delete banners from database
        const result = await BannersSchema.deleteMany({ _id: { $in: banner_ids } });

        if (result.deletedCount === 0) {
            return ErrorResponse(res, "No banners found with the provided IDs.");
        }

        return successResponse(res, `Successfully deleted banner(s).`, result.deletedCount);

    } catch (error) {
        return ErrorResponse(res, "An error occurred while deleting banners.");
    }
};

export const getBannerThemeList = async (req: Request, res: Response) => {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const categories = await getBannerThemeModel(search as string, pageNum, limitNum);
        return successResponse(res, "get banners theme list successfully", categories);
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const getBannerThemeDetails = async (req: Request, res: Response) => {
    try {
        const { banners_theme_id } = req.params;
        
        bannerThemeDetailModel(banners_theme_id as string, (error: any, result: any) => {
            if (error) {
                console.error("Error:", error);
                return ErrorResponse(res, error.message);
            }

            return successResponse(res, "Theme details", result); 
        });
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const updateBannerTheme = async (req: Request,res:Response) => {
    try {

        updateBannerThemeModel(req.body, (error:any, result:any) => {
            if (error) {
               return ErrorResponse(res,error.message);
            }
            return successResponse(res, "Update Banner themes successfully", result);
        });
    } catch (error) {
        return ErrorResponse(res,'An error occurred during user registration.');
    }
}









