import e, { Request, Response } from "express";
import { successCreated, successResponse,ErrorResponse } from "../../helper/apiResponse";
import categorySchema from "../../domain/schema/category.schema";
import blogcategorySchema from "../../domain/schema/blogcategory.schema";
import { storeBlogCategoryModel ,blogCategoryList,updateBlogCategoryModel } from "../../domain/models/blogCategoryList.model";
import { upload } from "../../services/upload.service";
import { storeUserActionActivity } from "../../services/userActionActivity.service";
import * as XLSX from "xlsx";


export const storeBlogCategory = async (req: Request, res: Response) => {
    try {
      
        const categories = await storeBlogCategoryModel(req.user,req.body, (error:any, result:any) => {
            if (error) {
                ErrorResponse(res,error.message);
            }
            return successResponse(res, "Category Stored in Database successfully", result);
        });
        
    } catch (error) {
        console.error(error);
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const deleteAllBlogCategory = async (req: Request, res: Response) => {
    try {
        const result = await blogcategorySchema.deleteMany({});

        if (result.deletedCount === 0) {
            return ErrorResponse(res, "No Blog Category found to delete.");
        }

        await storeUserActionActivity(req.user.userId, "Blog Category", "Delete", `Deleted all blog categories.`)

        return successResponse(res, `Successfully deleted all Blog Category.`, result.deletedCount);
        
    } catch (error) {
        return ErrorResponse(res, "An error occurred while deleting all Blog Category.");
    }
};

export const getBlogCategoryList = async (req: Request, res: Response) => {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const categories = await blogCategoryList(search as string, pageNum, limitNum);
        return successResponse(res, "get category list successfully", categories);
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const getBlogCategoryDetails = async (req: Request, res: Response) => {
    try {
        const {blog_category_id} = req.params;
        const blogCategory = await blogcategorySchema.findOne({ _id: blog_category_id });
        return successResponse(res, "get category list successfully", blogCategory);
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const updateBlogCategory = async (req: Request, res: Response) => {
    try {
      
        const categories = await updateBlogCategoryModel(req.user,req.body, (error:any, result:any) => {
            if (error) {
                ErrorResponse(res,error.message);
            }
            return successResponse(res, "Category Stored in Database successfully", result);
        });
        
    } catch (error) {
        console.log(error);
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const deleteBlogCategory = async (req:Request,res:Response) => {
    try{
        const { blog_category_ids } = req.body; 

        if (!blog_category_ids || !Array.isArray(blog_category_ids) || blog_category_ids.length === 0) {
            return ErrorResponse(res, "Please provide at least one valid Blog Category ID.");
        }

        const result = await blogcategorySchema.deleteMany({ _id: { $in: blog_category_ids } });

        if (result.deletedCount === 0) {
            return ErrorResponse(res, "No country found with the provided IDs.");
        }

        const cat_details = await blogcategorySchema.find({ _id: { $in: blog_category_ids } });
        const categoryNames = cat_details.map(cat => cat.name).join(', ');

        await storeUserActionActivity(req.user.userId, "Blog Category", "Delete",`Deleted ${categoryNames} blog categories.`)

        return successResponse(res, `Successfully deleted  states(ies).`,result.deletedCount);

    }catch (error){
        return ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const exportBlogCategoriesToExcel = async (req: Request, res: Response) => {
    try {
        // Use lean() and projection for faster and lightweight query
        const categories = await blogcategorySchema
            .find({}, { name: 1, _id: 0 })
            .sort({ sortingOrder: -1 })
            .lean();

        // Map efficiently
        const categoryData = categories.map((category, index) => ({
            ID: index + 1,
            Name: category.name,
        }));

        // Create workbook and worksheet
        const worksheet = XLSX.utils.json_to_sheet(categoryData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Blog Categories");

        // Create Excel buffer
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

        // Set headers and return file
        res.setHeader("Content-Disposition", "attachment; filename=blog-categories.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

        res.send(excelBuffer);
    } catch (error: any) {
        return res.status(500).json({
            message: "Error exporting blog categories",
            error: error.message
        });
    }
};

export const importBlogCategoriesFromExcel = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

        // Estimate time
        const totalRecords = data.length;
        const avgTimePerRecord = 0.01; // seconds per record
        const estimatedSeconds = Math.ceil(totalRecords * avgTimePerRecord);
        const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
        const checkAfterMinutes = estimatedMinutes + 1;

        // Immediate response
        res.status(200).json({
            message: `Your file with ${totalRecords} blog categories is being imported in the background. Estimated time: ${estimatedMinutes} minute(s). Please check after ${checkAfterMinutes} minute(s).`
        });

        // Background processing
        setTimeout(async () => {
            for (const row of data) {
                const { Name } = row;
                if (!Name || typeof Name !== "string") continue;

                const name = Name.trim();
                const existing = await blogcategorySchema.findOne({ name });

                if (!existing) {
                    const slug = name
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-+|-+$/g, "");

                    await blogcategorySchema.create({ name, slug });
                }
            }

            console.log("Blog category import complete.");

            await storeUserActionActivity(
                req.user.userId,
                "Category",
                "Import",
                `Blog categories Import.`
            );

        }, 100);

    } catch (error: any) {
        console.error("Blog category import error:", error);
        return res.status(500).json({ message: "Error importing blog categories", error: error.message });
    }
};
