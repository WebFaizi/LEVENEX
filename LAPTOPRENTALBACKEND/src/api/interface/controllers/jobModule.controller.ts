import e, { Request, Response } from "express";
import { successCreated, successResponse,ErrorResponse } from "../../helper/apiResponse";
import JobCategorySchema from "../../domain/schema/jobCategory.schema";
import jobSchema from "../../domain/schema/jobs.schema";
import { categoryList,storeCategoryModel,getCategoryDetailModel,UpdateCategoryDetailModel,getSortedCategoryList,updateSortingList,disableCategoryList,categoryActionModel,storeJobModel,jobList,getJobDetailModel,UpdateJobModel,jobApplicationList,categoryListFrontend,jobListFrontend,applyForJobModel} from "../../domain/models/JobCategory.model";
import { upload } from "../../services/upload.service";
import * as XLSX from "xlsx";
import fs from "fs";
import { convertToWebpAndSave } from "../../services/imageService";
import path from "path";
interface FileWithBuffer extends Express.Multer.File {
    buffer: Buffer;
}

export const updateJobDetails = async (req: Request, res: Response) => {
    try {
        const {job_id} = req.params; 
        UpdateJobModel(job_id as string,req.body, (error: any, result: any) => {
            if (error) {
                return ErrorResponse(res, error.message);
            }
            return successResponse(res, "Update Job Details successfully", result);
        });
    } catch (error) {
        return ErrorResponse(res, "An error occurred while fetching category details.");
    }
}

export const deleteAllJobCategory = async (req: Request, res: Response) => {
    try {
        const result = await JobCategorySchema.deleteMany({});

        if (result.deletedCount === 0) {
            return ErrorResponse(res, "No Job Category found to delete.");
        }

        return successResponse(res, `Successfully deleted all Job Category.`, result.deletedCount);
        
    } catch (error) {
        return ErrorResponse(res, "An error occurred while deleting all Job Category.");
    }
};

export const deleteAllJobs = async (req: Request, res: Response) => {
    try {
        const result = await jobSchema.deleteMany({});

        if (result.deletedCount === 0) {
            return ErrorResponse(res, "No Jobs found to delete.");
        }

        return successResponse(res, `Successfully deleted all Jobs.`, result.deletedCount);
        
    } catch (error) {
        return ErrorResponse(res, "An error occurred while deleting all Jobs.");
    }
};

export const getFrontendJobCategoryList = async (req: Request, res: Response) => {
    try {
        const { search = '', page = 1, limit = 10 ,location_id = ""} = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const categories = await categoryListFrontend(search as string, pageNum, limitNum,location_id as string);
        return successResponse(res, "get Job category list successfully", categories);
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const getFrontendJobList = async (req: Request, res: Response) => {
    try {
        const { search = '', page = 1, limit = 10 ,location_id = ""} = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const categories = await jobListFrontend(search as string, pageNum, limitNum,location_id as string);
        return successResponse(res, "get Job category list successfully", categories);
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const getJobApplication = async (req: Request, res: Response) => {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const categories = await  jobApplicationList(search as string, pageNum, limitNum);
        return successResponse(res, "get Job category list successfully", categories);
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const storeJob = async (req: Request, res: Response) => {
    try {
        const categories = await storeJobModel(req.body, (error:any, result:any) => {
            if (error) {
                ErrorResponse(res,error.message);
            }
            return successResponse(res, "Job Stored in Database successfully", result);
        });
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const applyForJob = async (req: Request, res: Response) => {
    try {
        const categories = await applyForJobModel(req.body, (error:any, result:any) => {
            if (error) {
                ErrorResponse(res,error.message);
            }
            return successResponse(res, "details stored in Database successfully", result);
        });
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const getJobList = async (req: Request, res: Response) => {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const categories = await  jobList(search as string, pageNum, limitNum);
        return successResponse(res, "get Job category list successfully", categories);
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const jobDelete = async (req: Request, res: Response) => {
    try {
        const { job_ids } = req.body; 

        if (!job_ids || !Array.isArray(job_ids) || job_ids.length === 0) {
            return ErrorResponse(res, "Please provide at least one valid job ID.");
        }

        const result = await jobSchema.deleteMany({ _id: { $in: job_ids } });

        if (result.deletedCount === 0) {
            return ErrorResponse(res, "No job found with the provided IDs.");
        }

        return successResponse(res, `Successfully deleted  job(ies).`,result.deletedCount);

    } catch (error) {
        return ErrorResponse(res, "An error occurred during event retrieval.");
    }
}

export const getJobDetails = async (req: Request, res: Response) => {
    try {
        const { job_id } = req.params; 
        getJobDetailModel(job_id, (error: any, result: any) => {
            if (error) {
                return ErrorResponse(res, error.message);
            }
            return successResponse(res, "Job details fetched successfully", result);
        });
    } catch (error) {
        return ErrorResponse(res, "An error occurred while fetching category details.");
    }
}

export const getFrontendJobDetails = async (req: Request, res: Response) => {
    try {
        const { job_id } = req.params; 
        getJobDetailModel(job_id, (error: any, result: any) => {
            if (error) {
                return ErrorResponse(res, error.message);
            }
            return successResponse(res, "Job details fetched successfully", result);
        });
    } catch (error) {
        return ErrorResponse(res, "An error occurred while fetching category details.");
    }
}

export const getJobCategoryList = async (req: Request, res: Response) => {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const categories = await categoryList(search as string, pageNum, limitNum);
        return successResponse(res, "get Job category list successfully", categories);
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
}

export const jobCategoryAction = async (req: Request, res: Response) => {
    try {
        const categories = await categoryActionModel(req.body, (error:any, result:any) => {
            if (error) {
                ErrorResponse(res,error.message);
            }
            return successResponse(res, "Job Category action successfully", result);
        });
    } catch (error) {
        ErrorResponse(res,'An error occurred during user registration.');
    }
};

export const getdisableJobCategoryList = async (req: Request, res: Response) => {
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

export const jobCategorySorting = async (req: Request, res: Response) => {
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

        }

    } catch (error) {
        return ErrorResponse(res, "An error occurred during event retrieval.");
    }
}

export const exportJobCategoriesToExcel = async (req: Request, res: Response) => {
    try {
        // Fetch only needed fields and use .lean() for performance
        const categories = await JobCategorySchema.find({}, {
            unique_id: 1,
            name: 1,
            sorting: 1,
            slug: 1,
            _id: 0
        }).sort({ sortingOrder: -1 }).lean();

        // Map efficiently
        const categoryData = categories.map(category => ({
            UniqueId: category.unique_id,
            Name: category.name,
            SortingOrder: category.sorting,
            CategorySlug: category.slug,
        }));

        const worksheet = XLSX.utils.json_to_sheet(categoryData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Categories");

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "buffer"
        });

        res.setHeader("Content-Disposition", "attachment; filename=JobCategories.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

        res.send(excelBuffer);
    } catch (error: any) {
        return res.status(500).json({
            message: "Error exporting categories",
            error: error.message
        });
    }
};

export const importJobCategoriesFromExcel = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Parse Excel data
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        const totalRecords = data.length;
        const avgTimePerRecord = 0.015; // seconds per row
        const estimatedSeconds = Math.ceil(totalRecords * avgTimePerRecord);
        const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
        const checkAfterMinutes = estimatedMinutes + 1;

        // Immediate response to user
        res.status(200).json({
            message: `Your file with ${totalRecords} job categories is being imported in the background. Estimated time: ${estimatedMinutes} minute(s). Please check after ${checkAfterMinutes} minute(s).`
        });

        // Background import process
        setTimeout(async () => {
            try {
                for (const row of data) {
                    const { UniqueId, Name, SortingOrder, CategorySlug } = row as any;

                    if (!Name || !SortingOrder) continue;

                    const existingCategory = await JobCategorySchema.findOne({ sorting: SortingOrder });

                    if (existingCategory) {
                        await JobCategorySchema.updateOne(
                            { sorting: SortingOrder },
                            {
                                name: Name,
                                slug: CategorySlug || "",
                                sorting: SortingOrder,
                                unique_id: UniqueId || null
                            }
                        );
                    } else {
                        await JobCategorySchema.create({
                            name: Name,
                            sorting: SortingOrder,
                            slug: CategorySlug || "",
                            unique_id: UniqueId || null
                        });
                    }
                }

                console.log(`Job Category Import Done. Total records: ${totalRecords}`);
            } catch (err: any) {
                console.error("Background job category import error:", err.message);
            }
        }, 100);

    } catch (error: any) {
        return res.status(500).json({ message: "Error importing job categories", error: error.message });
    }
};

export const storeJobCategory = async (req: Request, res: Response) => {
    try {
        const files = req.files as FileWithBuffer[];
        const uploadDir = "uploads/job_category";

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        if (files && files.length > 0) {
            for (const file of files) {
                const field_name = file.fieldname;
                const savePath = await convertToWebpAndSave(file.buffer, file.originalname, uploadDir);
                req.body[field_name] = savePath;
            }
        }

        storeCategoryModel(req.body, (error: any, result: any) => {
            if (error) {
                return ErrorResponse(res, error.message);
            }
            return successResponse(res, "Category stored in database successfully", result);
        });
    } catch (error) {
        console.error(error);
        return ErrorResponse(res, "An error occurred during category creation.");
    }
};

export const getJobCategoryDetails = async (req: Request, res: Response) => {
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

export const JobCategoryUpdate = async (req: Request, res: Response) => {
    try {
        const { category_id } = req.params; 
        const files = req.files as FileWithBuffer[];
        const uploadDir = "uploads/job_category";

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Fetch existing category details
        const category = await JobCategorySchema.findById(category_id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        if (files && files.length > 0) {
            for (const file of files) {
                const field_name = file.fieldname;

                // Convert and save new webp image
                const savePath = await convertToWebpAndSave(file.buffer, file.originalname, uploadDir);

                // Delete old image if exists
                const oldFilePath = (category as any)[field_name];
                if (oldFilePath && fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }

                req.body[field_name] = savePath;
            }
        }

        UpdateCategoryDetailModel(category_id, req.body, (error: any, result: any) => {
            if (error) {
                return ErrorResponse(res, error.message);
            }
            return successResponse(res, "Category details updated successfully", result);
        });
    } catch (error) {
        console.error(error);
        return ErrorResponse(res, "An error occurred while updating category details.");
    }
};

export const jobCategoryDelete = async (req: Request, res: Response) => {
    try {
        const { category_ids } = req.body;

        if (!category_ids || !Array.isArray(category_ids) || category_ids.length === 0) {
            return ErrorResponse(res, "Please provide at least one valid category ID.");
        }

        // Step 1: Fetch categories
        const categories = await JobCategorySchema.find({ _id: { $in: category_ids } });

        // Step 2: Delete associated image files
        for (const category of categories) {
            const fieldsToCheck = ["icon", "banner", "image"]; // Adjust fields as needed
            for (const field of fieldsToCheck) {
                const imagePath = (category as any)[field];
                if (imagePath && fs.existsSync(imagePath)) {
                    try {
                        fs.unlinkSync(imagePath);
                    } catch (err) {
                        console.error(`Error deleting file ${imagePath}:`, err);
                    }
                }
            }
        }

        // Step 3: Delete category records
        const result = await JobCategorySchema.deleteMany({ _id: { $in: category_ids } });

        if (result.deletedCount === 0) {
            return ErrorResponse(res, "No category found with the provided IDs.");
        }

        return successResponse(res, `Successfully deleted ${result.deletedCount} category(ies).`, result);
    } catch (error) {
        console.error(error);
        return ErrorResponse(res, "An error occurred during category deletion.");
    }
};



