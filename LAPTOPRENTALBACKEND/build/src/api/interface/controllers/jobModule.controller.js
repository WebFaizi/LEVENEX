"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobCategoryDelete = exports.JobCategoryUpdate = exports.getJobCategoryDetails = exports.storeJobCategory = exports.importJobCategoriesFromExcel = exports.exportJobCategoriesToExcel = exports.jobCategorySorting = exports.getdisableJobCategoryList = exports.jobCategoryAction = exports.getJobCategoryList = exports.getFrontendJobDetails = exports.getJobDetails = exports.jobDelete = exports.getJobList = exports.applyForJob = exports.storeJob = exports.getJobApplication = exports.getFrontendJobList = exports.getFrontendJobCategoryList = exports.deleteAllJobs = exports.deleteAllJobCategory = exports.updateJobDetails = void 0;
const apiResponse_1 = require("../../helper/apiResponse");
const jobCategory_schema_1 = __importDefault(require("../../domain/schema/jobCategory.schema"));
const jobs_schema_1 = __importDefault(require("../../domain/schema/jobs.schema"));
const JobCategory_model_1 = require("../../domain/models/JobCategory.model");
const XLSX = __importStar(require("xlsx"));
const fs_1 = __importDefault(require("fs"));
const imageService_1 = require("../../services/imageService");
const updateJobDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { job_id } = req.params;
        (0, JobCategory_model_1.UpdateJobModel)(job_id, req.body, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Update Job Details successfully", result);
        });
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while fetching category details.");
    }
});
exports.updateJobDetails = updateJobDetails;
const deleteAllJobCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield jobCategory_schema_1.default.deleteMany({});
        if (result.deletedCount === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No Job Category found to delete.");
        }
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted all Job Category.`, result.deletedCount);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while deleting all Job Category.");
    }
});
exports.deleteAllJobCategory = deleteAllJobCategory;
const deleteAllJobs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield jobs_schema_1.default.deleteMany({});
        if (result.deletedCount === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No Jobs found to delete.");
        }
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted all Jobs.`, result.deletedCount);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while deleting all Jobs.");
    }
});
exports.deleteAllJobs = deleteAllJobs;
const getFrontendJobCategoryList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = '', page = 1, limit = 10, location_id = "" } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const categories = yield (0, JobCategory_model_1.categoryListFrontend)(search, pageNum, limitNum, location_id);
        return (0, apiResponse_1.successResponse)(res, "get Job category list successfully", categories);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.getFrontendJobCategoryList = getFrontendJobCategoryList;
const getFrontendJobList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = '', page = 1, limit = 10, location_id = "" } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const categories = yield (0, JobCategory_model_1.jobListFrontend)(search, pageNum, limitNum, location_id);
        return (0, apiResponse_1.successResponse)(res, "get Job category list successfully", categories);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.getFrontendJobList = getFrontendJobList;
const getJobApplication = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const categories = yield (0, JobCategory_model_1.jobApplicationList)(search, pageNum, limitNum);
        return (0, apiResponse_1.successResponse)(res, "get Job category list successfully", categories);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.getJobApplication = getJobApplication;
const storeJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield (0, JobCategory_model_1.storeJobModel)(req.body, (error, result) => {
            if (error) {
                (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Job Stored in Database successfully", result);
        });
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.storeJob = storeJob;
const applyForJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield (0, JobCategory_model_1.applyForJobModel)(req.body, (error, result) => {
            if (error) {
                (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "details stored in Database successfully", result);
        });
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.applyForJob = applyForJob;
const getJobList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const categories = yield (0, JobCategory_model_1.jobList)(search, pageNum, limitNum);
        return (0, apiResponse_1.successResponse)(res, "get Job category list successfully", categories);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.getJobList = getJobList;
const jobDelete = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { job_ids } = req.body;
        if (!job_ids || !Array.isArray(job_ids) || job_ids.length === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "Please provide at least one valid job ID.");
        }
        const result = yield jobs_schema_1.default.deleteMany({ _id: { $in: job_ids } });
        if (result.deletedCount === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No job found with the provided IDs.");
        }
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted  job(ies).`, result.deletedCount);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred during event retrieval.");
    }
});
exports.jobDelete = jobDelete;
const getJobDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { job_id } = req.params;
        (0, JobCategory_model_1.getJobDetailModel)(job_id, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Job details fetched successfully", result);
        });
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while fetching category details.");
    }
});
exports.getJobDetails = getJobDetails;
const getFrontendJobDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { job_id } = req.params;
        (0, JobCategory_model_1.getJobDetailModel)(job_id, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Job details fetched successfully", result);
        });
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while fetching category details.");
    }
});
exports.getFrontendJobDetails = getFrontendJobDetails;
const getJobCategoryList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const categories = yield (0, JobCategory_model_1.categoryList)(search, pageNum, limitNum);
        return (0, apiResponse_1.successResponse)(res, "get Job category list successfully", categories);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.getJobCategoryList = getJobCategoryList;
const jobCategoryAction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield (0, JobCategory_model_1.categoryActionModel)(req.body, (error, result) => {
            if (error) {
                (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Job Category action successfully", result);
        });
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.jobCategoryAction = jobCategoryAction;
const getdisableJobCategoryList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield (0, JobCategory_model_1.disableCategoryList)(req.body, (error, result) => {
            if (error) {
                (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Category Stored in Database successfully", result);
        });
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.getdisableJobCategoryList = getdisableJobCategoryList;
const jobCategorySorting = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category_ids, type } = req.body;
        if (type == "") {
            return (0, apiResponse_1.ErrorResponse)(res, "Please provide type");
        }
        if (type == 1) {
            (0, JobCategory_model_1.getSortedCategoryList)((error, result) => {
                if (error) {
                    return (0, apiResponse_1.ErrorResponse)(res, error.message);
                }
                return (0, apiResponse_1.successResponse)(res, "sorting category list successfully", result);
            });
        }
        else {
            if (!category_ids || !Array.isArray(category_ids) || category_ids.length === 0) {
                return (0, apiResponse_1.ErrorResponse)(res, "Please provide at least one valid category ID.");
            }
            (0, JobCategory_model_1.updateSortingList)(category_ids, (error, result) => {
                if (error) {
                    return (0, apiResponse_1.ErrorResponse)(res, error.message);
                }
                return (0, apiResponse_1.successResponse)(res, "Update category sorting successfully", result);
            });
        }
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred during event retrieval.");
    }
});
exports.jobCategorySorting = jobCategorySorting;
const exportJobCategoriesToExcel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch only needed fields and use .lean() for performance
        const categories = yield jobCategory_schema_1.default.find({}, {
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
    }
    catch (error) {
        return res.status(500).json({
            message: "Error exporting categories",
            error: error.message
        });
    }
});
exports.exportJobCategoriesToExcel = exportJobCategoriesToExcel;
const importJobCategoriesFromExcel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                for (const row of data) {
                    const { UniqueId, Name, SortingOrder, CategorySlug } = row;
                    if (!Name || !SortingOrder)
                        continue;
                    const existingCategory = yield jobCategory_schema_1.default.findOne({ sorting: SortingOrder });
                    if (existingCategory) {
                        yield jobCategory_schema_1.default.updateOne({ sorting: SortingOrder }, {
                            name: Name,
                            slug: CategorySlug || "",
                            sorting: SortingOrder,
                            unique_id: UniqueId || null
                        });
                    }
                    else {
                        yield jobCategory_schema_1.default.create({
                            name: Name,
                            sorting: SortingOrder,
                            slug: CategorySlug || "",
                            unique_id: UniqueId || null
                        });
                    }
                }
                console.log(`Job Category Import Done. Total records: ${totalRecords}`);
            }
            catch (err) {
                console.error("Background job category import error:", err.message);
            }
        }), 100);
    }
    catch (error) {
        return res.status(500).json({ message: "Error importing job categories", error: error.message });
    }
});
exports.importJobCategoriesFromExcel = importJobCategoriesFromExcel;
const storeJobCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = req.files;
        const uploadDir = "uploads/job_category";
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        if (files && files.length > 0) {
            for (const file of files) {
                const field_name = file.fieldname;
                const savePath = yield (0, imageService_1.convertToWebpAndSave)(file.buffer, file.originalname, uploadDir);
                req.body[field_name] = savePath;
            }
        }
        (0, JobCategory_model_1.storeCategoryModel)(req.body, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Category stored in database successfully", result);
        });
    }
    catch (error) {
        console.error(error);
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred during category creation.");
    }
});
exports.storeJobCategory = storeJobCategory;
const getJobCategoryDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category_id } = req.params;
        (0, JobCategory_model_1.getCategoryDetailModel)(category_id, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Category details fetched successfully", result);
        });
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while fetching category details.");
    }
});
exports.getJobCategoryDetails = getJobCategoryDetails;
const JobCategoryUpdate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category_id } = req.params;
        const files = req.files;
        const uploadDir = "uploads/job_category";
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        // Fetch existing category details
        const category = yield jobCategory_schema_1.default.findById(category_id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }
        if (files && files.length > 0) {
            for (const file of files) {
                const field_name = file.fieldname;
                // Convert and save new webp image
                const savePath = yield (0, imageService_1.convertToWebpAndSave)(file.buffer, file.originalname, uploadDir);
                // Delete old image if exists
                const oldFilePath = category[field_name];
                if (oldFilePath && fs_1.default.existsSync(oldFilePath)) {
                    fs_1.default.unlinkSync(oldFilePath);
                }
                req.body[field_name] = savePath;
            }
        }
        (0, JobCategory_model_1.UpdateCategoryDetailModel)(category_id, req.body, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Category details updated successfully", result);
        });
    }
    catch (error) {
        console.error(error);
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while updating category details.");
    }
});
exports.JobCategoryUpdate = JobCategoryUpdate;
const jobCategoryDelete = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category_ids } = req.body;
        if (!category_ids || !Array.isArray(category_ids) || category_ids.length === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "Please provide at least one valid category ID.");
        }
        // Step 1: Fetch categories
        const categories = yield jobCategory_schema_1.default.find({ _id: { $in: category_ids } });
        // Step 2: Delete associated image files
        for (const category of categories) {
            const fieldsToCheck = ["icon", "banner", "image"]; // Adjust fields as needed
            for (const field of fieldsToCheck) {
                const imagePath = category[field];
                if (imagePath && fs_1.default.existsSync(imagePath)) {
                    try {
                        fs_1.default.unlinkSync(imagePath);
                    }
                    catch (err) {
                        console.error(`Error deleting file ${imagePath}:`, err);
                    }
                }
            }
        }
        // Step 3: Delete category records
        const result = yield jobCategory_schema_1.default.deleteMany({ _id: { $in: category_ids } });
        if (result.deletedCount === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No category found with the provided IDs.");
        }
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted ${result.deletedCount} category(ies).`, result);
    }
    catch (error) {
        console.error(error);
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred during category deletion.");
    }
});
exports.jobCategoryDelete = jobCategoryDelete;
//# sourceMappingURL=jobModule.controller.js.map