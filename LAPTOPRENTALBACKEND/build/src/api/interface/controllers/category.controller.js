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
exports.importCategoriesFromExcel = exports.exportCategoriesToExcel = exports.importSortingCategory = exports.exportSortingCategory = exports.categorySorting = exports.categoryDelete = exports.categoryUpdate = exports.getCategoryDetails = exports.storeCategory = exports.getdisableCategoryList = exports.categoryAction = exports.getCategoryList = exports.deleteAllCategory = exports.getAdminAllCategoryList = void 0;
const apiResponse_1 = require("../../helper/apiResponse");
const category_schema_1 = __importDefault(require("../../domain/schema/category.schema"));
const importFileStatus_schema_1 = __importDefault(require("../../domain/schema/importFileStatus.schema"));
const categoryList_model_1 = require("../../domain/models/categoryList.model");
const imageService_1 = require("../../services/imageService");
const userActionActivity_service_1 = require("../../services/userActionActivity.service");
const insertExportTaskService_service_1 = require("../../services/insertExportTaskService.service");
const XLSX = __importStar(require("xlsx"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const getAdminAllCategoryList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const categories = yield (0, categoryList_model_1.allAdminCategoryList)(search, pageNum, limitNum);
        return (0, apiResponse_1.successResponse)(res, "get category list successfully", categories);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.getAdminAllCategoryList = getAdminAllCategoryList;
const deleteAllCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield category_schema_1.default.find({});
        if (categories.length === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No Category found to delete.");
        }
        const uploadDir = path_1.default.join(__dirname, '../../../../uploads/category');
        if (fs_1.default.existsSync(uploadDir)) {
            const files = fs_1.default.readdirSync(uploadDir);
            for (const file of files) {
                const filePath = path_1.default.join(uploadDir, file);
                try {
                    fs_1.default.unlinkSync(filePath);
                }
                catch (err) {
                    console.error(`Failed to delete file ${filePath}:`, err);
                }
            }
        }
        const result = yield category_schema_1.default.deleteMany({});
        yield (0, userActionActivity_service_1.storeUserActionActivity)(req.user.userId, "Category", "Delete", `Deleted all categories.`);
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted all categories.`, result.deletedCount);
    }
    catch (error) {
        console.error("❌ Error in deleteAllCategory:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while deleting all categories.");
    }
});
exports.deleteAllCategory = deleteAllCategory;
const getCategoryList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const categories = yield (0, categoryList_model_1.categoryList)(search, pageNum, limitNum);
        return (0, apiResponse_1.successResponse)(res, "get category list successfully", categories);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.getCategoryList = getCategoryList;
const categoryAction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield (0, categoryList_model_1.categoryActionModel)(req.body, (error, result) => {
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
exports.categoryAction = categoryAction;
const getdisableCategoryList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield (0, categoryList_model_1.disableCategoryList)(req.body, (error, result) => {
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
exports.getdisableCategoryList = getdisableCategoryList;
const storeCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const savedFiles = []; // Track saved image paths
    try {
        const files = req.files;
        const uploadDir = "uploads/category";
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        for (const file of files) {
            const field_name = file.fieldname;
            const savePath = yield (0, imageService_1.convertToWebpAndSave)(file.buffer, file.originalname, uploadDir);
            savedFiles.push(savePath);
            req.body[field_name] = savePath;
        }
        (0, categoryList_model_1.storeCategoryModel)(req.user, req.body, (error, result) => {
            if (error) {
                // Delete saved images on DB error
                for (const filePath of savedFiles) {
                    if (fs_1.default.existsSync(filePath)) {
                        fs_1.default.unlinkSync(filePath);
                    }
                }
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Category stored in database successfully", result);
        });
    }
    catch (error) {
        // Cleanup if general error occurs
        for (const filePath of savedFiles) {
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
        }
        console.error("❌ Error in storeCategory:", error);
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred during category creation.");
    }
});
exports.storeCategory = storeCategory;
const getCategoryDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category_id } = req.params;
        (0, categoryList_model_1.getCategoryDetailModel)(category_id, (error, result) => {
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
exports.getCategoryDetails = getCategoryDetails;
const categoryUpdate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const savedFiles = [];
    try {
        const { category_id } = req.params;
        const files = req.files;
        const uploadDir = "uploads/category";
        // Ensure upload dir exists
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        // Fetch existing category details
        const category = yield category_schema_1.default.findById(category_id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }
        for (const file of files) {
            const field_name = file.fieldname;
            // Delete old image if exists
            const oldFilePath = category[field_name];
            if (oldFilePath && fs_1.default.existsSync(oldFilePath)) {
                fs_1.default.unlinkSync(oldFilePath);
            }
            // Convert and save new .webp image
            const savePath = yield (0, imageService_1.convertToWebpAndSave)(file.buffer, file.originalname, uploadDir);
            savedFiles.push(savePath);
            req.body[field_name] = savePath;
        }
        // Update category
        (0, categoryList_model_1.UpdateCategoryDetailModel)(req.user, category_id, req.body, (error, result) => {
            if (error) {
                // Cleanup newly saved images on DB error
                for (const filePath of savedFiles) {
                    if (fs_1.default.existsSync(filePath))
                        fs_1.default.unlinkSync(filePath);
                }
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Update category details successfully", result);
        });
    }
    catch (error) {
        // Cleanup on general error
        for (const filePath of savedFiles) {
            if (fs_1.default.existsSync(filePath))
                fs_1.default.unlinkSync(filePath);
        }
        console.error("❌ Error in categoryUpdate:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while updating category details.");
    }
});
exports.categoryUpdate = categoryUpdate;
const categoryDelete = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category_ids } = req.body;
        if (!category_ids || !Array.isArray(category_ids) || category_ids.length === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "Please provide at least one valid category ID.");
        }
        const cat_details = yield category_schema_1.default.find({ _id: { $in: category_ids } });
        const categoryNames = cat_details.map(cat => cat.name).join(', ');
        const result = yield category_schema_1.default.deleteMany({ _id: { $in: category_ids } });
        if (result.deletedCount === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No category found with the provided IDs.");
        }
        yield (0, userActionActivity_service_1.storeUserActionActivity)(req.user.userId, "Category", "Delete", `Deleted ${categoryNames} categories.`);
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted  category(ies).`, '');
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred during event retrieval.");
    }
});
exports.categoryDelete = categoryDelete;
const categorySorting = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category_ids, type } = req.body;
        if (type == "") {
            return (0, apiResponse_1.ErrorResponse)(res, "Please provide type");
        }
        if (type == 1) {
            (0, categoryList_model_1.getSortedCategoryList)((error, result) => {
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
            (0, categoryList_model_1.updateSortingList)(category_ids, (error, result) => {
                if (error) {
                    return (0, apiResponse_1.ErrorResponse)(res, error.message);
                }
                return (0, apiResponse_1.successResponse)(res, "Update category sorting successfully", result);
            });
            yield (0, userActionActivity_service_1.storeUserActionActivity)(req.user.userId, "Category", "Sorting", `categories sort.`);
        }
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred during event retrieval.");
    }
});
exports.categorySorting = categorySorting;
const exportSortingCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield category_schema_1.default.find({ status: true }, {
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
    }
    catch (error) {
        return res.status(500).json({ message: "Error exporting categories Sorting", error: error.message });
    }
});
exports.exportSortingCategory = exportSortingCategory;
const importSortingCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield importFileStatus_schema_1.default.create({
            module_name: "Category Sorting",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        res.status(200).json({
            message: `Your file with ${totalRecords} records is being imported in the background. Estimated time: ${estimatedMinutes} minute(s). Please check back after ${checkAfterMinutes} minute(s).`
        });
        // ✅ Background import
        setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const bulkOps = data.map((row) => {
                    const { ID, Name, SortingOrder, } = row;
                    return {
                        updateOne: {
                            filter: { unique_id: Number(ID) },
                            update: {
                                $set: {
                                    name: Name || "",
                                    sorting: SortingOrder ? Number(SortingOrder) : 0,
                                    unique_id: Number(ID),
                                    status: true,
                                },
                            },
                            upsert: true,
                        }
                    };
                });
                if (bulkOps.length > 0) {
                    yield category_schema_1.default.bulkWrite(bulkOps);
                }
                yield (0, userActionActivity_service_1.storeUserActionActivity)(req.user.userId, "Category", "Import", "categories Import.");
                const startResult = yield (0, insertExportTaskService_service_1.insertOrUpdateExportTaskService)("Category Import", "completed");
                yield importFileStatus_schema_1.default.deleteOne({ module_name: "Category" });
            }
            catch (err) {
                console.error("Category Background Import Error:", err);
            }
        }), 100);
    }
    catch (error) {
        console.error("Bulk import error:", error);
        return res.status(500).json({ message: "Error importing categories", error: error.message });
    }
});
exports.importSortingCategory = importSortingCategory;
const exportCategoriesToExcel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Only fetch required fields from DB to reduce memory and processing overhead
        const categories = yield category_schema_1.default.find({}, {
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
    }
    catch (error) {
        return res.status(500).json({ message: "Error exporting categories", error: error.message });
    }
});
exports.exportCategoriesToExcel = exportCategoriesToExcel;
const importCategoriesFromExcel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield importFileStatus_schema_1.default.create({
            module_name: "Category",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        const startResult = yield (0, insertExportTaskService_service_1.insertOrUpdateExportTaskService)("Category Import", "processing");
        // ✅ Send immediate response to user
        res.status(200).json({
            message: `Your file with ${totalRecords} records is being imported in the background. Estimated time: ${estimatedMinutes} minute(s). Please check back after ${checkAfterMinutes} minute(s).`
        });
        // ✅ Background import
        setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const bulkOps = data.map((row) => {
                    const { ID, Name, DesktopImage, MobileImage, SortingOrder, CategorySlug, CategorySubDomainSlug, CategoryDescription, CategorySubDomainDescription, PageTopKeyword, PageTopDescription, } = row;
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
                    yield category_schema_1.default.bulkWrite(bulkOps);
                }
                yield (0, userActionActivity_service_1.storeUserActionActivity)(req.user.userId, "Category", "Import", "categories Import.");
                const startResult = yield (0, insertExportTaskService_service_1.insertOrUpdateExportTaskService)("Category Import", "completed");
                yield importFileStatus_schema_1.default.deleteOne({ module_name: "Category" });
                console.log("Category import completed.");
            }
            catch (err) {
                console.error("Category Background Import Error:", err);
            }
        }), 100);
    }
    catch (error) {
        console.error("Bulk import error:", error);
        return res.status(500).json({ message: "Error importing categories", error: error.message });
    }
});
exports.importCategoriesFromExcel = importCategoriesFromExcel;
//# sourceMappingURL=category.controller.js.map