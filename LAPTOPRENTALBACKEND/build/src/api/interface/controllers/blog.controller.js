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
exports.addUserListingReview = exports.addUserBlogReview = exports.getBlogDetailFrontend = exports.getBlogListFrontend = exports.deleteBlog = exports.updateBlog = exports.blogDetails = exports.storeBlogByUser = exports.storeBlog = exports.getBlogList = exports.getBlogReviewList = exports.deleteBlogReviewList = exports.approveReviewList = exports.getReviewImportExcel = exports.importBlogReview = exports.getAllBlogList = exports.addAdminBlogReview = exports.deleteAllBlogList = void 0;
const apiResponse_1 = require("../../helper/apiResponse");
const blog_schema_1 = __importDefault(require("../../domain/schema/blog.schema"));
const blogReview_schema_1 = __importDefault(require("../../domain/schema/blogReview.schema"));
const listingReview_schema_1 = __importDefault(require("../../domain/schema/listingReview.schema"));
const blog_model_1 = require("../../domain/models/blog.model");
const XLSX = __importStar(require("xlsx"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const imageService_1 = require("../../services/imageService");
const deleteAllBlogList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield blog_schema_1.default.deleteMany({});
        if (result.deletedCount === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No Blog found to delete.");
        }
        console.log("req.user.userIdreq.user.userIdreq.user.userId", req.user.userId);
        //  await storeUserActionActivity(req.user.userId, "BLog", "Delete", `Deleted all blogs.`)
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted all Blog .`, result.deletedCount);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while deleting all Blog .");
    }
});
exports.deleteAllBlogList = deleteAllBlogList;
const addAdminBlogReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, blog_model_1.storeBlogReviewModel)(req.user, req.body, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Add blog review successfully", { result });
        });
    }
    catch (error) {
        console.log(error);
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.addAdminBlogReview = addAdminBlogReview;
const getAllBlogList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = '' } = req.query;
        const users = yield (0, blog_model_1.getAllBlogModel)(search);
        return (0, apiResponse_1.successResponse)(res, "get blog list successfully", users);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.getAllBlogList = getAllBlogList;
const importBlogReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet);
        const data = rawData.map((item) => ({
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
            (0, blog_model_1.importBlogReviewDataModel)(req.user, data, (error, result) => {
                if (error) {
                    console.error("Blog Review Import Error:", error.message);
                }
                else {
                    console.log("Blog reviews stored successfully:", result);
                }
            });
        }, 100);
    }
    catch (error) {
        return res.status(500).json({ message: "Error importing blog reviews", error: error.message });
    }
});
exports.importBlogReview = importBlogReview;
const getReviewImportExcel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type } = req.query;
        console.log("typetypetypetype", type);
        const workbook = XLSX.utils.book_new();
        if (type == "1") {
            const headers = [
                { "Blog Name": "", "User Name": "", "Rating": "", "Comment": "" }
            ];
            const worksheet = XLSX.utils.json_to_sheet(headers, {
                header: ["Blog Name", "User Name", "Rating", "Comment"],
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
        }
        else {
            const headers = [
                { "Listing Name": "", "User Name": "", "Rating": "", "Comment": "" }
            ];
            const worksheet = XLSX.utils.json_to_sheet(headers, {
                header: ["Listing Name", "User Name", "Rating", "Comment"],
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
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.getReviewImportExcel = getReviewImportExcel;
const approveReviewList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { review_id, type } = req.body;
        let result;
        if (type == 1) {
            result = yield blogReview_schema_1.default.updateOne({ _id: review_id }, { $set: { isApproved: true } });
        }
        else {
            result = yield listingReview_schema_1.default.updateOne({ _id: review_id }, { $set: { isApproved: true } });
        }
        return (0, apiResponse_1.successResponse)(res, "Review successfully approved.", result);
    }
    catch (error) {
        console.error("Error approving review:", error);
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.approveReviewList = approveReviewList;
const deleteBlogReviewList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { review_ids } = req.body;
        console.log("review_idsreview_ids", review_ids);
        if (!review_ids || !Array.isArray(review_ids) || review_ids.length === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "Please provide at least one valid Blog ID.");
        }
        const result = yield blogReview_schema_1.default.deleteMany({ _id: { $in: review_ids } });
        if (result.deletedCount === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No country found with the provided IDs.");
        }
        // await storeUserActionActivity(req.user.userId, "BLog Review", "Delete", `delete review of blogs.`)
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted  Blog reviews(ies).`, result.deletedCount);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.deleteBlogReviewList = deleteBlogReviewList;
const getBlogReviewList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const data = yield (0, blog_model_1.blogReviewList)(search, pageNum, limitNum);
        return (0, apiResponse_1.successResponse)(res, "get blog review list successfully", data);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.getBlogReviewList = getBlogReviewList;
const getBlogList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const categories = yield (0, blog_model_1.blogList)(search, pageNum, limitNum);
        return (0, apiResponse_1.successResponse)(res, "get blog list successfully", categories);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.getBlogList = getBlogList;
const storeBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = req.files;
        const uploadDir = "uploads/blog";
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        files.forEach((file) => {
            const field_name = file.fieldname;
            const fileName = `${Date.now()}-${file.originalname}`;
            const savePath = path_1.default.join(uploadDir, fileName);
            fs_1.default.writeFileSync(savePath, file.buffer);
            req.body[field_name] = savePath;
        });
        (0, blog_model_1.storeBlogModel)(req.body, req.body, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Blog Added successfully", { result });
        });
    }
    catch (error) {
        console.log(error);
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.storeBlog = storeBlog;
const storeBlogByUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uploadDir = "uploads/blog";
    const savedFiles = [];
    try {
        const files = req.files;
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        for (const file of files) {
            const field_name = file.fieldname;
            // Convert and save new .webp image
            const savePath = yield (0, imageService_1.convertToWebpAndSave)(file.buffer, file.originalname, uploadDir);
            savedFiles.push(savePath);
            req.body[field_name] = savePath;
        }
        (0, blog_model_1.storeBlogModel)(req.user, req.body, (error, result) => __awaiter(void 0, void 0, void 0, function* () {
            if (error) {
                // Cleanup saved files on DB error
                for (const filePath of savedFiles) {
                    if (fs_1.default.existsSync(filePath)) {
                        fs_1.default.unlinkSync(filePath);
                    }
                }
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Blog added successfully", { result });
        }));
    }
    catch (error) {
        // Cleanup saved files on unexpected error
        for (const filePath of savedFiles) {
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
        }
        console.error("❌ Error in storeBlogByUser:", error);
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred while storing the blog.");
    }
});
exports.storeBlogByUser = storeBlogByUser;
const blogDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        (0, blog_model_1.blogDetail)(id, (error, result) => {
            if (error) {
                console.error("Error:", error);
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Blog details", result);
        });
    }
    catch (error) {
        console.error("Error:", error);
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred while fetching blog details.");
    }
});
exports.blogDetails = blogDetails;
const updateBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const uploadDir = "uploads/blog";
    const savedFiles = [];
    try {
        const files = req.files;
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        const blogToUpdate = yield blog_schema_1.default.findById(req.body.blog_id);
        if (!blogToUpdate) {
            return (0, apiResponse_1.ErrorResponse)(res, "Blog not found");
        }
        for (const file of files) {
            const field_name = file.fieldname;
            // Delete old image if exists
            const oldImagePath = blogToUpdate[field_name];
            if (oldImagePath && fs_1.default.existsSync(oldImagePath)) {
                try {
                    fs_1.default.unlinkSync(oldImagePath);
                }
                catch (error) {
                    console.error("❌ Failed to delete old image:", error);
                }
            }
            // Convert and save new .webp image
            const savePath = yield (0, imageService_1.convertToWebpAndSave)(file.buffer, file.originalname, uploadDir);
            savedFiles.push(savePath);
            req.body[field_name] = savePath;
        }
        (0, blog_model_1.updateBlogModel)(req.user, req.body, (error, result) => {
            if (error) {
                // Cleanup new images if DB update fails
                for (const filePath of savedFiles) {
                    if (fs_1.default.existsSync(filePath)) {
                        fs_1.default.unlinkSync(filePath);
                    }
                }
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Blog updated successfully", { result });
        });
    }
    catch (error) {
        // Cleanup new images if unexpected error
        for (const filePath of savedFiles) {
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
        }
        console.error("❌ Error in updateBlog:", error);
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred while updating the blog.");
    }
});
exports.updateBlog = updateBlog;
const deleteBlog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { blog_ids } = req.body;
        if (!blog_ids || !Array.isArray(blog_ids) || blog_ids.length === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "Please provide at least one valid Blog ID.");
        }
        // Fetch blogs to get image paths before deleting
        const blogsToDelete = yield blog_schema_1.default.find({ _id: { $in: blog_ids } });
        if (!blogsToDelete.length) {
            return (0, apiResponse_1.ErrorResponse)(res, "No blog found with the provided IDs.");
        }
        // Delete associated images
        for (const blog of blogsToDelete) {
            // Assuming images fields may be 'image', 'thumbnail', or similar. Adjust as needed.
            // If images is a string path:
            if (blog.images) {
                const imagePath = path_1.default.resolve(blog.images); // convert relative path to absolute if needed
                if (fs_1.default.existsSync(imagePath)) {
                    try {
                        fs_1.default.unlinkSync(imagePath);
                    }
                    catch (err) {
                        console.error("Error deleting blog image:", err);
                    }
                }
            }
            // If blog has multiple image fields, handle them here similarly
        }
        // Now delete the blog documents
        const result = yield blog_schema_1.default.deleteMany({ _id: { $in: blog_ids } });
        if (result.deletedCount === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No blog found to delete.");
        }
        // await storeUserActionActivity(req.user.userId, "Blog", "Delete", `Deleted blog(s) successfully.`);
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted blog(s).`, result.deletedCount);
    }
    catch (error) {
        console.error("❌ Error in deleteBlog:", error);
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred while deleting blogs.');
    }
});
exports.deleteBlog = deleteBlog;
const getBlogListFrontend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = '', page = 1, limit = 10, current_location_id } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        (0, blog_model_1.frontendBlogList)(search, pageNum, limitNum, current_location_id, (error, result) => {
            if (error) {
                console.log(error);
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "get blog list successfully", result);
        });
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.getBlogListFrontend = getBlogListFrontend;
const getBlogDetailFrontend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { blog_id } = req.params;
        const { current_city_id } = req.query;
        const page = parseInt(req.query.page || "1", 10);
        const limit = parseInt(req.query.limit || "10", 10);
        (0, blog_model_1.frontendBlogDetails)(blog_id, current_city_id, page, limit, (error, result) => {
            if (error)
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            return (0, apiResponse_1.successResponse)(res, "Blog details fetched successfully", result.data);
        });
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while fetching blog details.");
    }
});
exports.getBlogDetailFrontend = getBlogDetailFrontend;
const addUserBlogReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, blog_model_1.storeFrontendBlogReview)(req.user, req.body, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Your Blog review added Successfully. Your review under review section", result.data);
        });
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.addUserBlogReview = addUserBlogReview;
const addUserListingReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, blog_model_1.storeFrontendListingReview)(req.user, req.body, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Your Blog review added Successfully. Your review under review section", result.data);
        });
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.addUserListingReview = addUserListingReview;
//# sourceMappingURL=blog.controller.js.map