import e, { Request, Response } from "express";
import { successCreated, successResponse,ErrorResponse } from "../../helper/apiResponse";
import BlogSchema from "../../domain/schema/blog.schema";
import BlogReviewSchema from "../../domain/schema/blogReview.schema";
import ListingReviewSchema from "../../domain/schema/listingReview.schema";
import { blogList,storeBlogModel,blogDetail,updateBlogModel,blogReviewList,frontendBlogList,frontendBlogDetails,storeFrontendBlogReview,importBlogReviewDataModel,getAllBlogModel,storeBlogReviewModel,storeFrontendListingReview} from "../../domain/models/blog.model";
import { upload } from "../../services/upload.service";
import { storeUserActionActivity } from "../../services/userActionActivity.service";
import * as XLSX from "xlsx";
import path from "path"
import fs from "fs";
import { convertToWebpAndSave } from "../../services/imageService";
import { env } from "process";

interface FileWithBuffer extends Express.Multer.File {
    buffer: Buffer;
}

interface importBlogReviewData{
    blog_name:string;
    user_name:string;
    rating:string;
    comment:string;
}

export const deleteAllBlogList = async (req: Request, res: Response) => {
    try {
        const result = await BlogSchema.deleteMany({});

        if (result.deletedCount === 0) {
            return ErrorResponse(res, "No Blog found to delete.");
        }
        console.log("req.user.userIdreq.user.userIdreq.user.userId",req.user.userId)
        //  await storeUserActionActivity(req.user.userId, "BLog", "Delete", `Deleted all blogs.`)

        return successResponse(res, `Successfully deleted all Blog .`, result.deletedCount);
        
    } catch (error) {
        return ErrorResponse(res, "An error occurred while deleting all Blog .");
    }
};

export const addAdminBlogReview = async (req: Request, res: Response) => {
    try {
       
        storeBlogReviewModel(req.user,req.body, (error: any, result: any) => {
            if (error) {
                return ErrorResponse(res, error.message);
            }
            return successResponse(res, "Add blog review successfully", { result });
        });
        
    } catch (error) {
        console.log(error);
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const getAllBlogList = async (req: Request, res: Response) => {    
    try {
      
        const { search = ''} = req.query;

        const users = await getAllBlogModel(search as string);

        return successResponse(res, "get blog list successfully", users);

    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const importBlogReview = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

        const data: importBlogReviewData[] = rawData.map((item) => ({
            blog_name: String(item["Blog Name"] || ""),
            user_name: String(item["User Name"] || ""),
            rating: String(item["Rating"] || ""),
            comment: String(item["Comment"] || "")
        }));

        // Estimate time
        const totalRecords = data.length;
        const avgTimePerRecord = 0.01; // seconds per row
        const estimatedSeconds = Math.ceil(totalRecords * avgTimePerRecord);
        const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
        const checkAfterMinutes = estimatedMinutes + 1;

        // Respond immediately
        res.status(200).json({
            message: `Your file with ${totalRecords} blog review(s) is being imported in the background. Estimated time: ${estimatedMinutes} minute(s). Please check after ${checkAfterMinutes} minute(s).`
        });

        // Process in background
        setTimeout(() => {
            importBlogReviewDataModel(req.user, data, (error: any, result: any) => {
                if (error) {
                    console.error("Blog Review Import Error:", error.message);
                } else {
                    console.log("Blog reviews stored successfully:", result);
                }
            });
        }, 100);

    } catch (error: any) {
        return res.status(500).json({ message: "Error importing blog reviews", error: error.message });
    }
}

export const getReviewImportExcel = async (req: Request, res: Response) => {
    try {

        const { type } = req.query
        console.log("typetypetypetype",type)
        const workbook = XLSX.utils.book_new();
        if(type == "1" ){
        const headers = [
            { "Blog Name":"","User Name": "", "Rating": "", "Comment": "" }
        ];
        
        const worksheet = XLSX.utils.json_to_sheet(headers, {
            header: ["Blog Name","User Name", "Rating", "Comment"],
            skipHeader: false, 
        }); 

        worksheet["!cols"] = [
            { wch: 40 },
            { wch: 40 },
            { wch: 30 }, 
            { wch: 40 }, 
        ];
        XLSX.utils.book_append_sheet(workbook, worksheet, "CategorySEO");

        const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", 'attachment; filename="blog_review_formet.xlsx"');
        res.send(buffer);    
        }else{
            const headers = [
                { "Listing Name":"","User Name": "", "Rating": "", "Comment": "" }
            ];
            
            const worksheet = XLSX.utils.json_to_sheet(headers, {
                header: ["Listing Name","User Name", "Rating", "Comment"],
                skipHeader: false, 
            }); 
    
            worksheet["!cols"] = [
                { wch: 40 },
                { wch: 40 },
                { wch: 30 }, 
                { wch: 40 }, 
            ];
            XLSX.utils.book_append_sheet(workbook, worksheet, "CategorySEO");
    
            const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    
            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.setHeader("Content-Disposition", 'attachment; filename="listing_review_formet.xlsx"');
            res.send(buffer);  
        }

        

    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const approveReviewList = async (req: Request, res: Response) => {
    try {
        const { review_id, type } = req.body;

        let result;

        if (type == 1) {
            result = await BlogReviewSchema.updateOne(
                { _id: review_id },
                { $set: { isApproved: true } }
            );
        } else {
            result = await ListingReviewSchema.updateOne(
                { _id: review_id },
                { $set: { isApproved: true } }
            );
        }

        return successResponse(res, "Review successfully approved.", result);
    } catch (error) {
        console.error("Error approving review:", error);
        return ErrorResponse(res,'An error occurred during user registration.');
    }
};

export const deleteBlogReviewList = async (req:Request,res:Response) => {
    try{
        const { review_ids } = req.body;
        console.log("review_idsreview_ids",review_ids) 

        if (!review_ids || !Array.isArray(review_ids) || review_ids.length === 0) {
            return ErrorResponse(res, "Please provide at least one valid Blog ID.");
        }

        const result = await BlogReviewSchema.deleteMany({ _id: { $in: review_ids } });

        if (result.deletedCount === 0) {
            return ErrorResponse(res, "No country found with the provided IDs.");
        }
        // await storeUserActionActivity(req.user.userId, "BLog Review", "Delete", `delete review of blogs.`)
        return successResponse(res, `Successfully deleted  Blog reviews(ies).`,result.deletedCount);

    }catch (error){
        return ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const getBlogReviewList = async (req: Request, res: Response) => {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const data = await blogReviewList(search as string, pageNum, limitNum);
      
        return successResponse(res, "get blog review list successfully", data);
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const getBlogList = async (req: Request, res: Response) => {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const categories = await blogList(search as string, pageNum, limitNum);
        return successResponse(res, "get blog list successfully", categories);
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const storeBlog = async (req: Request, res: Response) => {
    try {
        const files = req.files as FileWithBuffer[];
        const uploadDir = "uploads/blog";
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
        storeBlogModel(req.body,req.body, (error: any, result: any) => {
            if (error) {
                return ErrorResponse(res, error.message);
            }
            return successResponse(res, "Blog Added successfully", { result });
        });
        
    } catch (error) {
        console.log(error);
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const storeBlogByUser = async (req: Request, res: Response) => {
    const uploadDir = "uploads/blog";
    const savedFiles: string[] = [];

    try {
        const files = req.files as FileWithBuffer[];

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        for (const file of files) {
            const field_name = file.fieldname;

            // Convert and save new .webp image
            const savePath = await convertToWebpAndSave(file.buffer, file.originalname, uploadDir);
            savedFiles.push(savePath);
            req.body[field_name] = savePath;
        }

        storeBlogModel(req.user, req.body, async (error: any, result: any) => {
            if (error) {
                // Cleanup saved files on DB error
                for (const filePath of savedFiles) {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                }
                return ErrorResponse(res, error.message);
            }

            return successResponse(res, "Blog added successfully", { result });
        });

    } catch (error) {
        // Cleanup saved files on unexpected error
        for (const filePath of savedFiles) {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        console.error("❌ Error in storeBlogByUser:", error);
        ErrorResponse(res, "An error occurred while storing the blog.");
    }
};

export const blogDetails = async (req: Request, res: Response) => {
    try {

        const { id } = req.params;

        blogDetail(id as string, (error: any, result: any) => {
            if (error) {
                console.error("Error:", error);
                return ErrorResponse(res, error.message);
            }

            return successResponse(res, "Blog details", result); 
        });

    } catch (error) {
        console.error("Error:", error);
        ErrorResponse(res, "An error occurred while fetching blog details.");
    }
};

export const updateBlog = async (req: Request, res: Response) => {
    const uploadDir = "uploads/blog";
    const savedFiles: string[] = [];

    try {
        const files = req.files as FileWithBuffer[];

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const blogToUpdate = await BlogSchema.findById(req.body.blog_id);
        if (!blogToUpdate) {
            return ErrorResponse(res, "Blog not found");
        }

        for (const file of files) {
            const field_name = file.fieldname;

            // Delete old image if exists
            const oldImagePath = (blogToUpdate as any)[field_name];
            if (oldImagePath && fs.existsSync(oldImagePath)) {
                try {
                    fs.unlinkSync(oldImagePath);
                } catch (error) {
                    console.error("❌ Failed to delete old image:", error);
                }
            }

            // Convert and save new .webp image
            const savePath = await convertToWebpAndSave(file.buffer, file.originalname, uploadDir);
            savedFiles.push(savePath);
            req.body[field_name] = savePath;
        }

        updateBlogModel(req.user, req.body, (error: any, result: any) => {
            if (error) {
                // Cleanup new images if DB update fails
                for (const filePath of savedFiles) {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                }
                return ErrorResponse(res, error.message);
            }

            return successResponse(res, "Blog updated successfully", { result });
        });

    } catch (error) {
        // Cleanup new images if unexpected error
        for (const filePath of savedFiles) {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        console.error("❌ Error in updateBlog:", error);
        ErrorResponse(res, "An error occurred while updating the blog.");
    }
};

export const deleteBlog = async (req: Request, res: Response) => {
    try {
        const { blog_ids } = req.body;

        if (!blog_ids || !Array.isArray(blog_ids) || blog_ids.length === 0) {
            return ErrorResponse(res, "Please provide at least one valid Blog ID.");
        }

        // Fetch blogs to get image paths before deleting
        const blogsToDelete = await BlogSchema.find({ _id: { $in: blog_ids } });

        if (!blogsToDelete.length) {
            return ErrorResponse(res, "No blog found with the provided IDs.");
        }

        // Delete associated images
        for (const blog of blogsToDelete) {
            // Assuming images fields may be 'image', 'thumbnail', or similar. Adjust as needed.
            // If images is a string path:
            if (blog.images) {
                const imagePath = path.resolve(blog.images); // convert relative path to absolute if needed
                if (fs.existsSync(imagePath)) {
                    try {
                        fs.unlinkSync(imagePath);
                    } catch (err) {
                        console.error("Error deleting blog image:", err);
                    }
                }
            }
            // If blog has multiple image fields, handle them here similarly
        }

        // Now delete the blog documents
        const result = await BlogSchema.deleteMany({ _id: { $in: blog_ids } });

        if (result.deletedCount === 0) {
            return ErrorResponse(res, "No blog found to delete.");
        }

        // await storeUserActionActivity(req.user.userId, "Blog", "Delete", `Deleted blog(s) successfully.`);

        return successResponse(res, `Successfully deleted blog(s).`, result.deletedCount);

    } catch (error) {
        console.error("❌ Error in deleteBlog:", error);
        return ErrorResponse(res, 'An error occurred while deleting blogs.');
    }
};

export const getBlogListFrontend = async (req:Request,res:Response) => {
    try {
        const { search = '', page = 1, limit = 10, current_location_id } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        frontendBlogList(search as string, pageNum, limitNum, current_location_id as string, (error:any, result:any) => {
            if (error) {
                console.log(error);
                return ErrorResponse(res,error.message);
            }
            return successResponse(res, "get blog list successfully", result);
        });
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const getBlogDetailFrontend = async (req: Request, res: Response) => {
    try {
        const { blog_id} = req.params;
        const { current_city_id } = req.query;
        const page = parseInt((req.query.page as string) || "1", 10);
        const limit = parseInt((req.query.limit as string) || "10", 10);
        frontendBlogDetails(blog_id,current_city_id, page, limit, (error, result) => {
            if (error) return ErrorResponse(res, error.message);
            return successResponse(res, "Blog details fetched successfully", result.data);
        });
    } catch (error) {
        return ErrorResponse(res, "An error occurred while fetching blog details.");
    }
};

export const addUserBlogReview = async (req:Request,res:Response) => {
    try {
        storeFrontendBlogReview(req.user,req.body, (error:any, result:any) => {
            if (error) {
                return ErrorResponse(res,error.message);
            }
            return successResponse(res, "Your Blog review added Successfully. Your review under review section", result.data);
        });
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const addUserListingReview = async (req:Request,res:Response) => {
    try {
        storeFrontendListingReview(req.user,req.body, (error:any, result:any) => {
            if (error) {
                return ErrorResponse(res,error.message);
            }
            return successResponse(res, "Your Blog review added Successfully. Your review under review section", result.data);
        });
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}







