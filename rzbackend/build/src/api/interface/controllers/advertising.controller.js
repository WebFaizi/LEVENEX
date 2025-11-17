"use strict";
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
exports.updateBannerTheme = exports.getBannerThemeDetails = exports.getBannerThemeList = exports.deleteBanner = exports.updateBanner = exports.getBannerDetails = exports.getBannerList = exports.storeBanner = exports.deleteBannerType = exports.updateBannerType = exports.getBannerTypesDetails = exports.getBannerTypesList = exports.storeBannerType = exports.deletetAllBanners = exports.deleteAllbannerType = void 0;
const apiResponse_1 = require("../../helper/apiResponse");
const bannerTypes_model_1 = require("../../domain/models/bannerTypes.model");
const banners_model_1 = require("../../domain/models/banners.model");
const bannersTheme_models_1 = require("../../domain/models/bannersTheme.models");
const bannerTypes_schema_1 = __importDefault(require("../../domain/schema/bannerTypes.schema"));
const banners_schema_1 = __importDefault(require("../../domain/schema/banners.schema"));
const imageService_1 = require("../../services/imageService");
const fs_1 = __importDefault(require("fs"));
const deleteAllbannerType = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield bannerTypes_schema_1.default.deleteMany({});
        if (result.deletedCount === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No Banners Type found to delete.");
        }
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted all Banners Type.`, result.deletedCount);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while deleting all Banners Type.");
    }
});
exports.deleteAllbannerType = deleteAllbannerType;
const deletetAllBanners = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield banners_schema_1.default.deleteMany({});
        if (result.deletedCount === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No Banners found to delete.");
        }
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted all Banners.`, result.deletedCount);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while deleting all Banners.");
    }
});
exports.deletetAllBanners = deletetAllBanners;
const storeBannerType = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, bannerTypes_model_1.storeBannerTypeModel)(req.body, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Store Banner Type successfully", result);
        });
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.storeBannerType = storeBannerType;
const getBannerTypesList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const categories = yield (0, bannerTypes_model_1.getBannerTypeModel)(search, pageNum, limitNum);
        return (0, apiResponse_1.successResponse)(res, "get Bannertype list successfully", categories);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.getBannerTypesList = getBannerTypesList;
const getBannerTypesDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bannertype_id } = req.params;
        (0, bannerTypes_model_1.bannerTypeDetailModel)(bannertype_id, (error, result) => {
            if (error) {
                console.error("Error:", error);
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Get Banner Type details", result);
        });
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.getBannerTypesDetails = getBannerTypesDetails;
const updateBannerType = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, bannerTypes_model_1.updateBannerTypeModel)(req.body, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Update banner type successfully", result);
        });
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.updateBannerType = updateBannerType;
const deleteBannerType = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { banner_type_ids } = req.body;
        if (!banner_type_ids || !Array.isArray(banner_type_ids) || banner_type_ids.length === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "Please provide at least one valid Blog ID.");
        }
        const result = yield bannerTypes_schema_1.default.deleteMany({ _id: { $in: banner_type_ids } });
        if (result.deletedCount === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No country found with the provided IDs.");
        }
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted  Banner Type(ies).`, result.deletedCount);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.deleteBannerType = deleteBannerType;
//banner types 
const storeBanner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = req.files;
        const uploadDir = "uploads/banners";
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        for (const file of files) {
            const field_name = file.fieldname;
            // Convert and save to .webp format
            const savePath = yield (0, imageService_1.convertToWebpAndSave)(file.buffer, file.originalname, uploadDir);
            req.body[field_name] = savePath;
        }
        (0, banners_model_1.storeBannerModel)(req.body, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Store Banner successfully", result);
        });
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during banner creation.');
    }
});
exports.storeBanner = storeBanner;
const getBannerList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const categories = yield (0, banners_model_1.getBannerModel)(search, pageNum, limitNum);
        return (0, apiResponse_1.successResponse)(res, "get Banner list successfully", categories);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.getBannerList = getBannerList;
const getBannerDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { banners_id } = req.params;
        (0, banners_model_1.bannerDetailModel)(banners_id, (error, result) => {
            if (error) {
                console.error("Error:", error);
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Get Banner details", result);
        });
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.getBannerDetails = getBannerDetails;
const updateBanner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = req.files;
        const uploadDir = "uploads/banners";
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        // Get current banner from DB
        const banner = yield banners_schema_1.default.findById(req.body.banners_id); // assuming _id is passed in req.body
        if (!banner) {
            return (0, apiResponse_1.ErrorResponse)(res, "Banner not found");
        }
        for (const file of files) {
            const field_name = file.fieldname;
            const oldImagePath = banner[field_name];
            if (oldImagePath && fs_1.default.existsSync(oldImagePath)) {
                fs_1.default.unlinkSync(oldImagePath);
            }
            const savePath = yield (0, imageService_1.convertToWebpAndSave)(file.buffer, file.originalname, uploadDir);
            req.body[field_name] = savePath;
        }
        (0, banners_model_1.updateBannerModel)(req.body, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Update Banner Details successfully", result);
        });
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while updating banner.");
    }
});
exports.updateBanner = updateBanner;
const deleteBanner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { banner_ids } = req.body;
        if (!banner_ids || !Array.isArray(banner_ids) || banner_ids.length === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "Please provide at least one valid banner ID.");
        }
        // Fetch banners to delete to get image paths
        const banners = yield banners_schema_1.default.find({ _id: { $in: banner_ids } });
        // Delete associated image files
        for (const banner of banners) {
            const imageFields = ['cover_image', 'banner_image']; // add other image field names if any
            imageFields.forEach((field) => {
                const imagePath = banner[field];
                if (imagePath && fs_1.default.existsSync(imagePath)) {
                    try {
                        fs_1.default.unlinkSync(imagePath);
                    }
                    catch (err) {
                        console.error(`Failed to delete image: ${imagePath}`, err);
                    }
                }
            });
        }
        // Delete banners from database
        const result = yield banners_schema_1.default.deleteMany({ _id: { $in: banner_ids } });
        if (result.deletedCount === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No banners found with the provided IDs.");
        }
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted banner(s).`, result.deletedCount);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while deleting banners.");
    }
});
exports.deleteBanner = deleteBanner;
const getBannerThemeList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const categories = yield (0, bannersTheme_models_1.getBannerThemeModel)(search, pageNum, limitNum);
        return (0, apiResponse_1.successResponse)(res, "get banners theme list successfully", categories);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.getBannerThemeList = getBannerThemeList;
const getBannerThemeDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { banners_theme_id } = req.params;
        (0, banners_model_1.bannerThemeDetailModel)(banners_theme_id, (error, result) => {
            if (error) {
                console.error("Error:", error);
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Theme details", result);
        });
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.getBannerThemeDetails = getBannerThemeDetails;
const updateBannerTheme = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, banners_model_1.updateBannerThemeModel)(req.body, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Update Banner themes successfully", result);
        });
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.updateBannerTheme = updateBannerTheme;
//# sourceMappingURL=advertising.controller.js.map