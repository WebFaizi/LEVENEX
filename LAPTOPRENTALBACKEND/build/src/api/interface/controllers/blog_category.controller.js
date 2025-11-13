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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.importBlogCategoriesFromExcel = exports.exportBlogCategoriesToExcel = exports.deleteBlogCategory = exports.updateBlogCategory = exports.getBlogCategoryDetails = exports.getBlogCategoryList = exports.deleteAllBlogCategory = exports.storeBlogCategory = void 0;
const apiResponse_1 = require("../../helper/apiResponse");
const blogcategory_schema_1 = __importDefault(require("../../domain/schema/blogcategory.schema"));
const blogCategoryList_model_1 = require("../../domain/models/blogCategoryList.model");
const userActionActivity_service_1 = require("../../services/userActionActivity.service");
const XLSX = __importStar(require("xlsx"));
const storeBlogCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield (0, blogCategoryList_model_1.storeBlogCategoryModel)(req.user, req.body, (error, result) => {
            if (error) {
                (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Category Stored in Database successfully", result);
        });
    }
    catch (error) {
        console.error(error);
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.storeBlogCategory = storeBlogCategory;
const deleteAllBlogCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield blogcategory_schema_1.default.deleteMany({});
        if (result.deletedCount === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No Blog Category found to delete.");
        }
        yield (0, userActionActivity_service_1.storeUserActionActivity)(req.user.userId, "Blog Category", "Delete", `Deleted all blog categories.`);
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted all Blog Category.`, result.deletedCount);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while deleting all Blog Category.");
    }
});
exports.deleteAllBlogCategory = deleteAllBlogCategory;
const getBlogCategoryList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const categories = yield (0, blogCategoryList_model_1.blogCategoryList)(search, pageNum, limitNum);
        return (0, apiResponse_1.successResponse)(res, "get category list successfully", categories);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.getBlogCategoryList = getBlogCategoryList;
const getBlogCategoryDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { blog_category_id } = req.params;
        const blogCategory = yield blogcategory_schema_1.default.findOne({ _id: blog_category_id });
        return (0, apiResponse_1.successResponse)(res, "get category list successfully", blogCategory);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.getBlogCategoryDetails = getBlogCategoryDetails;
const updateBlogCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield (0, blogCategoryList_model_1.updateBlogCategoryModel)(req.user, req.body, (error, result) => {
            if (error) {
                (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Category Stored in Database successfully", result);
        });
    }
    catch (error) {
        console.log(error);
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.updateBlogCategory = updateBlogCategory;
const deleteBlogCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { blog_category_ids } = req.body;
        if (!blog_category_ids || !Array.isArray(blog_category_ids) || blog_category_ids.length === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "Please provide at least one valid Blog Category ID.");
        }
        const result = yield blogcategory_schema_1.default.deleteMany({ _id: { $in: blog_category_ids } });
        if (result.deletedCount === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No country found with the provided IDs.");
        }
        const cat_details = yield blogcategory_schema_1.default.find({ _id: { $in: blog_category_ids } });
        const categoryNames = cat_details.map(cat => cat.name).join(', ');
        yield (0, userActionActivity_service_1.storeUserActionActivity)(req.user.userId, "Blog Category", "Delete", `Deleted ${categoryNames} blog categories.`);
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted  states(ies).`, result.deletedCount);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.deleteBlogCategory = deleteBlogCategory;
const exportBlogCategoriesToExcel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Use lean() and projection for faster and lightweight query
        const categories = yield blogcategory_schema_1.default
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
    }
    catch (error) {
        return res.status(500).json({
            message: "Error exporting blog categories",
            error: error.message
        });
    }
});
exports.exportBlogCategoriesToExcel = exportBlogCategoriesToExcel;
const importBlogCategoriesFromExcel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
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
        setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            for (const row of data) {
                const { Name } = row;
                if (!Name || typeof Name !== "string")
                    continue;
                const name = Name.trim();
                const existing = yield blogcategory_schema_1.default.findOne({ name });
                if (!existing) {
                    const slug = name
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-+|-+$/g, "");
                    yield blogcategory_schema_1.default.create({ name, slug });
                }
            }
            console.log("Blog category import complete.");
            yield (0, userActionActivity_service_1.storeUserActionActivity)(req.user.userId, "Category", "Import", `Blog categories Import.`);
        }), 100);
    }
    catch (error) {
        console.error("Blog category import error:", error);
        return res.status(500).json({ message: "Error importing blog categories", error: error.message });
    }
});
exports.importBlogCategoriesFromExcel = importBlogCategoriesFromExcel;
//# sourceMappingURL=blog_category.controller.js.map