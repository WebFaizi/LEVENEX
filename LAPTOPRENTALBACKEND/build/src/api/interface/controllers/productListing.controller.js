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
exports.exportProduct = exports.deleteAllProduct = exports.deleteProductListing = exports.updateProductListing = exports.storeProductListing = exports.storeProductByUser = exports.listingProductList = exports.listingProductDetails = exports.importProduct = exports.userProductList = exports.removeProductImage = void 0;
const apiResponse_1 = require("../../helper/apiResponse");
const product_model_1 = require("../../domain/models/product.model");
const imageService_1 = require("../../services/imageService");
const product_schema_1 = __importDefault(require("../../domain/schema/product.schema"));
const userActionActivity_service_1 = require("../../services/userActionActivity.service");
const importFileStatus_schema_1 = __importDefault(require("../../domain/schema/importFileStatus.schema"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const XLSX = __importStar(require("xlsx"));
const removeProductImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { image_name } = req.body;
        if (!image_name) {
            return (0, apiResponse_1.ErrorResponse)(res, "Image name is required.");
        }
        // Assuming images are stored in this folder
        const uploadDir = path_1.default.join(__dirname, '../../../../uploads/product');
        const imagePath = path_1.default.join(uploadDir, image_name);
        // Delete image file if exists
        if (fs_1.default.existsSync(imagePath)) {
            try {
                fs_1.default.unlinkSync(imagePath);
            }
            catch (error) {
                console.error("Error deleting image file:", error);
                return (0, apiResponse_1.ErrorResponse)(res, "Failed to delete image file.");
            }
        }
        else {
            console.warn("Image file not found:", imagePath);
            // Optionally: You can treat this as error or ignore
        }
        // Call model to remove image data from DB or perform further cleanup
        yield (0, product_model_1.removeProductImageModel)(req.body, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Product image removed successfully", result);
        });
    }
    catch (err) {
        return (0, apiResponse_1.ErrorResponse)(res, err.message || "An unexpected error occurred");
    }
});
exports.removeProductImage = removeProductImage;
const userProductList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const categories = yield (0, product_model_1.userProductListModel)(req.user, search, pageNum, limitNum);
        return (0, apiResponse_1.successResponse)(res, "get category list successfully", categories);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.userProductList = userProductList;
const importProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet);
        const data = rawData.map((item) => ({
            unique_id: Number(item['Product Id'] || ''),
            product_name: String(item["Product Name"] || ""),
            product_category_id: String(item["Category Name"] || ""),
            product_listing_id: String(item["Listing Name"] || ""),
            product_description: String(item["Product Description"] || ""),
            product_price: String(item["Product Price"] || ""),
        }));
        const totalRecords = data.length;
        const avgTimePerRecord = 0.015; // seconds per record (adjust based on your system)
        const estimatedSeconds = Math.ceil(totalRecords * avgTimePerRecord);
        const estimatedMinutes = Math.ceil(estimatedSeconds / 60);
        const checkAfterMinutes = estimatedMinutes + 1;
        yield importFileStatus_schema_1.default.create({
            module_name: "Product",
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        // ✅ Send immediate response to the user
        res.status(200).json({
            message: `Your file with ${totalRecords} products is being imported in the background. Estimated time: ${estimatedMinutes} minute(s). Please check after ${checkAfterMinutes} minute(s).`
        });
        // ✅ Background processing
        setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield (0, product_model_1.importProductModel)(req.user, data, (error, result) => {
                    if (error) {
                        console.error("Import Error:", error.message);
                    }
                    else {
                        (0, userActionActivity_service_1.storeUserActionActivity)(req.user.userId, "Listing", "Import", `Product imported successfully`);
                        importFileStatus_schema_1.default.deleteOne({ module_name: "Product" });
                        console.log(`Product import completed. Total records: ${totalRecords}`);
                    }
                });
            }
            catch (bgError) {
                console.error("Background import failed:", bgError.message);
            }
        }), 100);
    }
    catch (error) {
        return res.status(500).json({ message: "Error importing products", error: error.message });
    }
});
exports.importProduct = importProduct;
const listingProductDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { product_id } = req.params;
        (0, product_model_1.productgDetailsModel)(product_id, (error, result) => {
            if (error) {
                console.error("Error:", error);
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Product details", result);
        });
    }
    catch (error) {
        console.error("Error:", error);
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred while fetching blog details.");
    }
});
exports.listingProductDetails = listingProductDetails;
const listingProductList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const categories = yield (0, product_model_1.listingProductListModel)(search, pageNum, limitNum);
        return (0, apiResponse_1.successResponse)(res, "get category list successfully", categories);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.listingProductList = listingProductList;
const storeProductByUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = req.files;
        const uploadDir = "uploads/product";
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        if (!req.body.product_images) {
            req.body.product_images = [];
        }
        for (const file of files) {
            // Convert to webp and save
            const savePath = yield (0, imageService_1.convertToWebpAndSave)(file.buffer, file.originalname, uploadDir);
            req.body.product_images.push(savePath);
        }
        const categories = yield (0, product_model_1.storeProductModel)(req.body, (error, result) => {
            if (error) {
                (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Listing stored in Database successfully", result);
        });
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.storeProductByUser = storeProductByUser;
const storeProductListing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = req.files;
        const uploadDir = "uploads/product";
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        if (!req.body.product_images) {
            req.body.product_images = [];
        }
        for (const file of files) {
            // Convert to webp and save
            const savePath = yield (0, imageService_1.convertToWebpAndSave)(file.buffer, file.originalname, uploadDir);
            req.body.product_images.push(savePath);
        }
        const categories = yield (0, product_model_1.storeProductModel)(req.body, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            (0, userActionActivity_service_1.storeUserActionActivity)(req.user.userId, "Product", "Create", `new Product successfully`);
            return (0, apiResponse_1.successResponse)(res, "Listing stored in Database successfully", result);
        });
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.storeProductListing = storeProductListing;
const updateProductListing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = req.files;
        const uploadDir = "uploads/product";
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        if (!req.body.product_images) {
            req.body.product_images = [];
        }
        // Convert and save new images only (no deletion of old images)
        for (const file of files) {
            const savePath = yield (0, imageService_1.convertToWebpAndSave)(file.buffer, file.originalname, uploadDir);
            req.body.product_images.push(savePath);
        }
        yield (0, product_model_1.updateProductModel)(req.body, (error, result) => {
            if (error) {
                console.log(error.message);
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            (0, userActionActivity_service_1.storeUserActionActivity)(req.user.userId, "Product", "Update", `Update Product Details successfully`);
            return (0, apiResponse_1.successResponse)(res, "Listing updated in Database successfully", result);
        });
    }
    catch (error) {
        console.error("Error:", error);
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during product update.');
    }
});
exports.updateProductListing = updateProductListing;
const deleteProductListing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { product_ids } = req.body;
        if (!product_ids || !Array.isArray(product_ids) || product_ids.length === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "Please provide at least one valid Product ID.");
        }
        // Fetch products to delete
        const products = yield product_schema_1.default.find({ _id: { $in: product_ids } });
        // Delete images for each product
        for (const product of products) {
            if (product.product_images && Array.isArray(product.product_images)) {
                for (const imagePath of product.product_images) {
                    if (fs_1.default.existsSync(imagePath)) {
                        try {
                            fs_1.default.unlinkSync(imagePath);
                        }
                        catch (err) {
                            console.error(`Error deleting image file ${imagePath}:`, err);
                            // Optional: continue deleting others even if one fails
                        }
                    }
                }
            }
        }
        // Delete product documents
        const result = yield product_schema_1.default.deleteMany({ _id: { $in: product_ids } });
        if (result.deletedCount === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No product found with the provided IDs.");
        }
        (0, userActionActivity_service_1.storeUserActionActivity)(req.user.userId, "Product", "Delete", `Deleted Product Listing(s) successfully`);
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted Listings(ies).`, result.deletedCount);
    }
    catch (error) {
        console.error(error);
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during product deletion.');
    }
});
exports.deleteProductListing = deleteProductListing;
const deleteAllProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Delete all product documents from DB
        const result = yield product_schema_1.default.deleteMany({});
        if (result.deletedCount === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No products found to delete.");
        }
        // Path to product upload directory
        const uploadDir = path_1.default.join(__dirname, '../../../../uploads/product');
        // Check if folder exists
        if (fs_1.default.existsSync(uploadDir)) {
            // Read all files in the directory
            const files = fs_1.default.readdirSync(uploadDir);
            // Delete each file inside the folder
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
        (0, userActionActivity_service_1.storeUserActionActivity)(req.user.userId, "Product", "Delete", `All products deleted successfully`);
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted all products and cleared images.`, result.deletedCount);
    }
    catch (error) {
        console.error(error);
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while deleting all products.");
    }
});
exports.deleteAllProduct = deleteAllProduct;
const exportProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filter = {};
        // const products = await ProductSchema.find(filter)
        //     .select('product_name product_price product_description product_category_id product_listing_id')
        //     .populate('product_listing_id', 'name')
        //     .populate('product_category_id', 'name')
        //     .sort({ sortingOrder: -1 })
        //     .lean(); // important for performance
        const products = yield product_schema_1.default.aggregate([
            { $match: filter },
            {
                $lookup: {
                    from: "categories",
                    localField: "product_category_id",
                    foreignField: "unique_id",
                    as: "product_category_id"
                }
            },
            {
                $unwind: {
                    path: "$product_category_id",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "listings",
                    localField: "product_listing_id",
                    foreignField: "listing_unique_id",
                    as: "product_listing_id"
                }
            },
            {
                $unwind: {
                    path: "$product_listing_id",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $sort: { sortingOrder: -1 }
            }
        ]);
        console.log("productsproductsproducts", products);
        const listingsData = products.map((product) => {
            var _a, _b, _c, _d;
            return ({
                'Product Id': product.unique_id || "N/A",
                'Product Name': product.product_name || "N/A",
                'Product Price': product.product_price || "N/A",
                'Category Name': (_b = (_a = product.product_category_id) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : "N/A",
                'Listing Name': (_d = (_c = product.product_listing_id) === null || _c === void 0 ? void 0 : _c.name) !== null && _d !== void 0 ? _d : "N/A",
                'Product Description': product.product_description || "N/A",
            });
        });
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(listingsData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Listings");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
        res.setHeader("Content-Disposition", "attachment; filename=products.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.send(excelBuffer);
    }
    catch (error) {
        console.error("Error exporting listings:", error);
        return res.status(500).json({ message: "Error exporting listings", error: error.message });
    }
});
exports.exportProduct = exportProduct;
//# sourceMappingURL=productListing.controller.js.map