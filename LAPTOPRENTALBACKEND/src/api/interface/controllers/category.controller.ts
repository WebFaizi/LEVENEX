import e, { Request, Response } from "express";
import sharp from "sharp";
import { successCreated, successResponse,ErrorResponse } from "../../helper/apiResponse";
import categorySchema from "../../domain/schema/category.schema";
import importFileStatusSchema from "../../domain/schema/importFileStatus.schema";
import { allAdminCategoryList,categoryList,storeCategoryModel,getCategoryDetailModel,UpdateCategoryDetailModel,getSortedCategoryList,updateSortingList,disableCategoryList,categoryActionModel} from "../../domain/models/categoryList.model";
import { upload } from "../../services/upload.service";
import { convertToWebpAndSave } from "../../services/imageService";
import { storeUserActionActivity } from "../../services/userActionActivity.service";
import {insertOrUpdateExportTaskService} from "../../services/insertExportTaskService.service";
import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";
interface FileWithBuffer extends Express.Multer.File {
    buffer: Buffer;
}

export const getAdminAllCategoryList = async (req: Request, res: Response) => {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const categories = await allAdminCategoryList(search as string, pageNum, limitNum);
        return successResponse(res, "get category list successfully", categories);
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const deleteAllCategory = async (req: Request, res: Response) => {
    try {
        const categories = await categorySchema.find({});

        if (categories.length === 0) {
            return ErrorResponse(res, "No Category found to delete.");
        }

        const uploadDir = path.join(__dirname, '../../../../uploads/category');
        if (fs.existsSync(uploadDir)) {
            const files = fs.readdirSync(uploadDir);
            for (const file of files) {
                const filePath = path.join(uploadDir, file);
                try {
                    fs.unlinkSync(filePath);
                } catch (err) {
                    console.error(`Failed to delete file ${filePath}:`, err);
                }
            }
        }

        const result = await categorySchema.deleteMany({});

        await storeUserActionActivity(req.user.userId, "Category", "Delete", `Deleted all categories.`);

        return successResponse(res, `Successfully deleted all categories.`, result.deletedCount);

    } catch (error) {
        console.error("❌ Error in deleteAllCategory:", error);
        return ErrorResponse(res, "An error occurred while deleting all categories.");
    }
};

export const getCategoryList = async (req: Request, res: Response) => {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const categories = await categoryList(search as string, pageNum, limitNum);
        return successResponse(res, "get category list successfully", categories);
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const categoryAction = async (req: Request, res: Response) => {
    try {
        const categories = await categoryActionModel(req.body, (error:any, result:any) => {
            if (error) {
                ErrorResponse(res,error.message);
            }
            return successResponse(res, "Category Stored in Database successfully", result);
        });
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
};

export const getdisableCategoryList = async (req: Request, res: Response) => {
    try {
        const categories = await disableCategoryList(req.body, (error:any, result:any) => {
            if (error) {
                ErrorResponse(res,error.message);
            }
            return successResponse(res, "Category Stored in Database successfully", result);
        });
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const storeCategory = async (req: Request, res: Response) => {
    const savedFiles: string[] = []; // Track saved image paths

    try {
        const files = req.files as FileWithBuffer[];
        const uploadDir = "uploads/category";

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        for (const file of files) {
            const field_name = file.fieldname;

            const savePath = await convertToWebpAndSave(file.buffer, file.originalname, uploadDir);
            savedFiles.push(savePath);
            req.body[field_name] = savePath;
        }

        storeCategoryModel(req.user, req.body, (error: any, result: any) => {
            if (error) {
                // Delete saved images on DB error
                for (const filePath of savedFiles) {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                }
                return ErrorResponse(res, error.message);
            }

            return successResponse(res, "Category stored in database successfully", result);
        });

    } catch (error) {
        // Cleanup if general error occurs
        for (const filePath of savedFiles) {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        console.error("❌ Error in storeCategory:", error);
        ErrorResponse(res, "An error occurred during category creation.");
    }
};

export const getCategoryDetails = async (req: Request, res: Response) => {
    try {
        const { category_id } = req.params; 
        getCategoryDetailModel(category_id, (error: any, result: any) => {
            if (error) {
                return ErrorResponse(res, error.message);
            }
            return successResponse(res, "Category details fetched successfully", result);
        });
    } catch (error) {
        return ErrorResponse(res, "An error occurred while fetching category details.");
    }
}

export const categoryUpdate = async (req: Request, res: Response) => {
    const savedFiles: string[] = [];

    try {
        const { category_id } = req.params;
        const files = req.files as FileWithBuffer[];
        const uploadDir = "uploads/category";

        // Ensure upload dir exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Fetch existing category details
        const category = await categorySchema.findById(category_id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        for (const file of files) {
            const field_name = file.fieldname;

            // Delete old image if exists
            const oldFilePath = (category as any)[field_name];
            if (oldFilePath && fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }

            // Convert and save new .webp image
            const savePath = await convertToWebpAndSave(file.buffer, file.originalname, uploadDir);
            savedFiles.push(savePath);
            req.body[field_name] = savePath;
        }

        // Update category
        UpdateCategoryDetailModel(req.user, category_id, req.body, (error: any, result: any) => {
            if (error) {
                // Cleanup newly saved images on DB error
                for (const filePath of savedFiles) {
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                }
                return ErrorResponse(res, error.message);
            }

            return successResponse(res, "Update category details successfully", result);
        });

    } catch (error) {
        // Cleanup on general error
        for (const filePath of savedFiles) {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        console.error("❌ Error in categoryUpdate:", error);
        return ErrorResponse(res, "An error occurred while updating category details.");
    }
};

export const categoryDelete = async (req: Request, res: Response) => {
    try {
        const { category_ids } = req.body; 

        if (!category_ids || !Array.isArray(category_ids) || category_ids.length === 0) {
            return ErrorResponse(res, "Please provide at least one valid category ID.");
        }

        const cat_details = await categorySchema.find({ _id: { $in: category_ids } });
        const categoryNames = cat_details.map(cat => cat.name).join(', ');

        const result = await categorySchema.deleteMany({ _id: { $in: category_ids } });

        if (result.deletedCount === 0) {
            return ErrorResponse(res, "No category found with the provided IDs.");
        }
        
        await storeUserActionActivity(
            req.user.userId,
            "Category",
            "Delete",
            `Deleted ${categoryNames} categories.`
        );

        return successResponse(res, `Successfully deleted  category(ies).`,'');

    } catch (error) {
        return ErrorResponse(res, "An error occurred during event retrieval.");
    }
}

export const categorySorting = async (req: Request, res: Response) => {
    try {
        const { category_ids , type } = req.body; 

        if (type == "") {
            return ErrorResponse(res, "Please provide type");
        }

        if(type == 1){

            getSortedCategoryList((error: any, result: any) => {
                if (error) {
                    return ErrorResponse(res, error.message);
                }
                return successResponse(res, "sorting category list successfully", result);
            });

        }else{

            if (!category_ids || !Array.isArray(category_ids) || category_ids.length === 0) {
                return ErrorResponse(res, "Please provide at least one valid category ID.");
            }

            updateSortingList(category_ids, (error: any, result: any) => {
                if (error) {
                    return ErrorResponse(res, error.message);
                }
                return successResponse(res, "Update category sorting successfully", result);
            });

            await storeUserActionActivity(
                req.user.userId,
                "Category",
                "Sorting",
                `categories sort.`
            );

        }

    } catch (error) {
        return ErrorResponse(res, "An error occurred during event retrieval.");
    }
}
export const exportSortingCategory =async (req : Request,res :Response) =>{
   try{
     const categories =await categorySchema.find({ status: true},{
        unique_id: 1,
        name: 1,
        sorting: 1,
    }).sort({ sortingOrder: -1 }).lean();
    const categoryData = categories.map(category => ({
        ID: category.unique_id,
        Name: category.name,
        SortingOrder: category.sorting,
    }));
    // Create workbook and sheet
        const worksheet = XLSX.utils.json_to_sheet(categoryData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Categories Soring");        
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });        
        res.setHeader("Content-Disposition", "attachment; filename=categories.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.send(excelBuffer);
   }catch(error: any){
    return res.status(500).json({ message: "Error exporting categories Sorting", error: error.message });
   }

}

export const importSortingCategory = async (req : Request,res :Response) => {
     try {

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        const totalRecords = data.length;
        const avgTimePerRecord = 0.01; // seconds per record (adjust if needed)
        const estimatedSeconds = Math.ceil(totalRecords * avgTimePerRecord);
        const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
        const checkAfterMinutes = estimatedMinutes + 1;

        await importFileStatusSchema.create({
            module_name: "Category Sorting",
            createdAt: new Date(),
            updatedAt: new Date(),
        });                
        res.status(200).json({

            message: `Your file with ${totalRecords} records is being imported in the background. Estimated time: ${estimatedMinutes} minute(s). Please check back after ${checkAfterMinutes} minute(s).`
        });

        // ✅ Background import
        setTimeout(async () => {
            try {
                const bulkOps = data.map((row: any) => {
                    const {
                        ID,
                        Name,                        
                        SortingOrder,                       
                    } = row;

                    return {
                        updateOne: {
                            filter: { unique_id: Number(ID) },
                            update: {
                                $set: {
                                    name: Name || "",                                   
                                    sorting: SortingOrder ? Number(SortingOrder) : 0,
                                    unique_id: Number(ID),
                                    status:  true ,
                                },
                            },
                            upsert: true,
                        }
                    };
                });

                if (bulkOps.length > 0) {
                    await categorySchema.bulkWrite(bulkOps);
                }

                await storeUserActionActivity(
                    req.user.userId,
                    "Category",
                    "Import",
                    "categories Import."
                );
                const startResult = await insertOrUpdateExportTaskService("Category Import", "completed");
                await importFileStatusSchema.deleteOne({ module_name: "Category" });                
            } catch (err) {
                console.error("Category Background Import Error:", err);
            }
        }, 100);

    } catch (error: any) {
        console.error("Bulk import error:", error);
        return res.status(500).json({ message: "Error importing categories", error: error.message });
    }
}

export const exportCategoriesToExcel = async (req: Request, res: Response) => {
    try {
        // Only fetch required fields from DB to reduce memory and processing overhead
        const categories = await categorySchema.find({}, {
            unique_id: 1,
            name: 1,
            desktop_image: 1,
            mobile_image: 1,
            sorting: 1,
            slug: 1,
            subdomain_slug: 1,
            description: 1,
            subdomain_description: 1,
            page_top_keyword: 1,
            page_top_descritpion: 1,
            _id: 0
        }).sort({ sortingOrder: -1 }).lean(); // use .lean() for faster performance

        // Map data directly without unnecessary variables
        const categoryData = categories.map(category => ({
            ID: category.unique_id,
            Name: category.name,
            DesktopImage: category.desktop_image ? category.desktop_image.split('/').pop() : '',
            MobileImage: category.mobile_image ? category.mobile_image.split('/').pop() : '',
            SortingOrder: category.sorting,
            CategorySlug: category.slug,
            CategorySubDomainSlug: category.subdomain_slug,
            CategoryDescription: category.description,
            CategorySubDomainDescription: category.subdomain_description,
            PageTopKeyword: category.page_top_keyword,
            PageTopDescription: category.page_top_descritpion,
        }));

        // Create workbook and sheet
        const worksheet = XLSX.utils.json_to_sheet(categoryData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Categories");

        // Write to buffer
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

        // Set headers and send
        res.setHeader("Content-Disposition", "attachment; filename=categories.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

        res.send(excelBuffer);
    } catch (error: any) {
        return res.status(500).json({ message: "Error exporting categories", error: error.message });
    }
};

export const importCategoriesFromExcel = async (req: Request, res: Response) => {
    try {

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        const totalRecords = data.length;
        const avgTimePerRecord = 0.01; // seconds per record (adjust if needed)
        const estimatedSeconds = Math.ceil(totalRecords * avgTimePerRecord);
        const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
        const checkAfterMinutes = estimatedMinutes + 1;

        await importFileStatusSchema.create({
            module_name: "Category",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const startResult = await insertOrUpdateExportTaskService("Category Import", "processing");
        // ✅ Send immediate response to user
        res.status(200).json({

            message: `Your file with ${totalRecords} records is being imported in the background. Estimated time: ${estimatedMinutes} minute(s). Please check back after ${checkAfterMinutes} minute(s).`
        });

        // ✅ Background import
        setTimeout(async () => {
            try {
                const bulkOps = data.map((row: any) => {
                    const {
                        ID,
                        Name,
                        DesktopImage,
                        MobileImage,
                        SortingOrder,
                        CategorySlug,
                        CategorySubDomainSlug,
                        CategoryDescription,
                        CategorySubDomainDescription,
                        PageTopKeyword,
                        PageTopDescription,
                    } = row;

                    return {
                        updateOne: {
                            filter: { unique_id: Number(ID) },
                            update: {
                                $set: {
                                    name: Name || "",
                                    desktop_image: "uploads/category/" + DesktopImage || "",
                                    mobile_image: "uploads/category/" + MobileImage || "",
                                    slug: CategorySlug || "",
                                    subdomain_slug: CategorySubDomainSlug || "",
                                    description: CategoryDescription || "",
                                    subdomain_description: CategorySubDomainDescription || "",
                                    page_top_keyword: PageTopKeyword || "",
                                    page_top_descritpion: PageTopDescription || "",
                                    sorting: SortingOrder ? Number(SortingOrder) : 0,
                                    unique_id: Number(ID),
                                    status: SortingOrder && Number(SortingOrder) != 0 ? true : false,
                                },
                            },
                            upsert: true,
                        }
                    };
                });

                if (bulkOps.length > 0) {
                    await categorySchema.bulkWrite(bulkOps);
                }

                await storeUserActionActivity(
                    req.user.userId,
                    "Category",
                    "Import",
                    "categories Import."
                );

                const startResult = await insertOrUpdateExportTaskService("Category Import", "completed");

                await importFileStatusSchema.deleteOne({ module_name: "Category" });
                console.log("Category import completed.");
            } catch (err) {
                console.error("Category Background Import Error:", err);
            }
        }, 100);

    } catch (error: any) {
        console.error("Bulk import error:", error);
        return res.status(500).json({ message: "Error importing categories", error: error.message });
    }
};