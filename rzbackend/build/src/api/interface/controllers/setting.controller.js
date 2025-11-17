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
exports.updateEmailPermmision = exports.getEmailpermmistion = exports.exportedBackgroundProcessList = exports.updateDesktopDescription = exports.updateFooterDescription = exports.updateSetting = exports.getSetting = exports.getTheme = exports.storeTheme = exports.getDashboardDetails = exports.getAllListingData = exports.getAllUserData = exports.getPremiumRequest = exports.clearSetting = exports.getFrontendAds = exports.getFrontendFooter = exports.getFrontendSetting = exports.checkRedirectCurrentUrl = void 0;
const apiResponse_1 = require("../../helper/apiResponse");
const theme_model_1 = require("../../domain/models/theme.model");
const imageService_1 = require("../../services/imageService");
const setting_model_1 = require("../../domain/models/setting.model");
const theme_schema_1 = __importDefault(require("../../domain/schema/theme.schema"));
const setting_schema_1 = __importDefault(require("../../domain/schema/setting.schema"));
const userActivity_schema_1 = __importDefault(require("../../domain/schema/userActivity.schema"));
const subscribers_schema_1 = __importDefault(require("../../domain/schema/subscribers.schema"));
const categorySearch_schema_1 = __importDefault(require("../../domain/schema/categorySearch.schema"));
const user_schema_1 = __importDefault(require("../../domain/schema/user.schema"));
const quotation_schema_1 = __importDefault(require("../../domain/schema/quotation.schema"));
const listing_schema_1 = __importDefault(require("../../domain/schema/listing.schema"));
const premiumRequest_schema_1 = __importDefault(require("../../domain/schema/premiumRequest.schema"));
const chatboatUser_schema_1 = __importDefault(require("../../domain/schema/chatboatUser.schema"));
const userActionActivity_service_1 = require("../../services/userActionActivity.service");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const process_1 = require("process");
const fs_1 = __importDefault(require("fs"));
const baseURL = process_1.env.BASE_URL || "http://localhost:3000";
const upload = (0, multer_1.default)();
const checkRedirectCurrentUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { from_url } = req.query;
        if (!from_url) {
            return (0, apiResponse_1.ErrorResponse)(res, "from_url is required");
        }
        (0, setting_model_1.checkRedirectCurrentUrlModel)(from_url, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message || "Failed to check redirect");
            }
            return (0, apiResponse_1.successResponse)(res, "get Redirect status successfully!", result);
        });
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while checking the redirect.");
    }
});
exports.checkRedirectCurrentUrl = checkRedirectCurrentUrl;
const getFrontendSetting = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { current_city_id = "", category_id = "" } = req.query;
        const categories = yield (0, setting_model_1.frontendSettingModel)(current_city_id, category_id);
        return (0, apiResponse_1.successResponse)(res, "get premium request list successfully", categories);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred during user registration.");
    }
});
exports.getFrontendSetting = getFrontendSetting;
const getFrontendFooter = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { current_city_id, category_id = "" } = req.query;
        const categories = yield (0, setting_model_1.frontendFooterModel)(current_city_id, category_id);
        return (0, apiResponse_1.successResponse)(res, "get premium request list successfully", categories);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred during user registration.");
    }
});
exports.getFrontendFooter = getFrontendFooter;
const getFrontendAds = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { current_city_id = "", category_id = "" } = req.query;
        const categories = yield (0, setting_model_1.frontendAdsModel)(current_city_id, category_id);
        return (0, apiResponse_1.successResponse)(res, "get premium request list successfully", categories);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred during user registration.");
    }
});
exports.getFrontendAds = getFrontendAds;
const clearSetting = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type } = req.query;
        (0, setting_model_1.clearSettingModel)(type, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            if (type == "1") {
                return (0, apiResponse_1.successResponse)(res, "Clear data sucessfully!", []);
            }
            else {
                return (0, apiResponse_1.successResponse)(res, "Clear cache sucessfully!!", []);
            }
        });
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred during user registration.");
    }
});
exports.clearSetting = clearSetting;
const getPremiumRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = "", page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const categories = yield (0, setting_model_1.getPremiumRequestList)(search, pageNum, limitNum);
        return (0, apiResponse_1.successResponse)(res, "get premium request list successfully", categories);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred during user registration.");
    }
});
exports.getPremiumRequest = getPremiumRequest;
const getAllUserData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const User = yield user_schema_1.default.find().sort({ createdAt: -1 });
        return (0, apiResponse_1.successResponse)(res, "Fetched dashboard details successfully!", User);
    }
    catch (error) {
        console.error("Error in getDashboardDetails:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while fetching dashboard details.");
    }
});
exports.getAllUserData = getAllUserData;
const getAllListingData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const User = yield listing_schema_1.default.find().sort({ createdAt: -1 });
        return (0, apiResponse_1.successResponse)(res, "Fetched dashboard details successfully!", User);
    }
    catch (error) {
        console.error("Error in getDashboardDetails:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while fetching dashboard details.");
    }
});
exports.getAllListingData = getAllListingData;
const getDashboardDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const UserActivity = yield userActivity_schema_1.default.find().sort({ createdAt: -1 }).limit(20);
        const total_user = yield user_schema_1.default.countDocuments();
        const total_seller = yield user_schema_1.default.countDocuments({ role: 2 });
        const pending_seller_approval = yield user_schema_1.default.countDocuments({ role: 2, is_approved: "No" });
        const pending_listing = yield listing_schema_1.default.countDocuments({ approved: false });
        const premium_request = yield premiumRequest_schema_1.default.countDocuments();
        const live_seller = 0;
        const total_subscriber = yield subscribers_schema_1.default.countDocuments();
        const quotations = yield quotation_schema_1.default.countDocuments();
        const chatboatuser = yield chatboatUser_schema_1.default.countDocuments();
        const listing_view = yield listing_schema_1.default.find().sort({ listing_views: -1 }).limit(20);
        const topCategoriesMonthWise = yield categorySearch_schema_1.default.aggregate([
            {
                $addFields: {
                    year: { $year: "$search_date" },
                    month: { $month: "$search_date" },
                },
            },
            {
                $group: {
                    _id: {
                        category_id: "$category_id",
                        year: "$year",
                        month: "$month",
                    },
                    searchCount: { $sum: 1 },
                },
            },
            {
                $sort: { searchCount: -1 },
            },
            { $limit: 10 },
            {
                $lookup: {
                    from: "categories",
                    localField: "_id.category_id",
                    foreignField: "_id",
                    as: "category",
                },
            },
            { $unwind: "$category" },
            {
                $project: {
                    _id: 0,
                    category_id: "$_id.category_id",
                    category_name: "$category.name",
                    slug: "$category.slug",
                    unique_id: "$category.unique_id",
                    searchCount: 1,
                    year: "$_id.year",
                    month: "$_id.month",
                    // Optional: formatted month name
                    formatted_month: {
                        $concat: [
                            {
                                $arrayElemAt: [
                                    ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                                    "$_id.month",
                                ],
                            },
                            ", ",
                            { $toString: "$_id.year" },
                        ],
                    },
                },
            },
        ]);
        const data = {
            pending_seller_approval,
            total_seller,
            total_user,
            pending_listing,
            premium_request,
            quotations,
            live_seller: live_seller,
            total_subscriber,
            chat_boat: chatboatuser,
            login_details: UserActivity,
            listing_view: listing_view,
            topCategories: topCategoriesMonthWise,
        };
        return (0, apiResponse_1.successResponse)(res, "Fetched dashboard details successfully!", data);
    }
    catch (error) {
        console.error("Error in getDashboardDetails:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while fetching dashboard details.");
    }
});
exports.getDashboardDetails = getDashboardDetails;
const storeTheme = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, theme_model_1.storeThemeModel)(req.body, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Added Theme successfully!", []);
        });
    }
    catch (error) {
        console.log(error);
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred during user registration.");
    }
});
exports.storeTheme = storeTheme;
const getTheme = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const theme = yield theme_schema_1.default.find();
        if (!theme) {
            return (0, apiResponse_1.ErrorResponse)(res, "Theme not found");
        }
        return (0, apiResponse_1.successResponse)(res, "Theme fetched successfully", theme);
    }
    catch (error) {
        console.error("Error fetching theme:", error);
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred while fetching the theme.");
    }
});
exports.getTheme = getTheme;
const getSetting = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const setting = yield setting_schema_1.default.findOne();
        if (!setting) {
            return (0, apiResponse_1.ErrorResponse)(res, "setting not found");
        }
        if (setting.website_logo) {
            setting.website_logo = `${process.env.BASE_URL}/${setting.website_logo}`;
        }
        if (setting.mobile_logo) {
            setting.mobile_logo = `${process.env.BASE_URL}/${setting.mobile_logo}`;
        }
        if (setting.fav_icon) {
            setting.fav_icon = `${process.env.BASE_URL}/${setting.fav_icon}`;
        }
        if (setting.pre_loader) {
            setting.pre_loader = `${process.env.BASE_URL}/${setting.pre_loader}`;
        }
        if (setting.mobile_listing_banner) {
            setting.mobile_listing_banner = `${process.env.BASE_URL}/${setting.mobile_listing_banner}`;
        }
        if (setting.desktop_listing_banner) {
            setting.desktop_listing_banner = `${process.env.BASE_URL}/${setting.desktop_listing_banner}`;
        }
        return (0, apiResponse_1.successResponse)(res, "setting fetched successfully", setting);
    }
    catch (error) {
        console.error("Error fetching theme:", error);
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred while fetching the theme.");
    }
});
exports.getSetting = getSetting;
const updateSetting = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = req.files; // Assuming you have this interface
        const uploadDir = "uploads/website_default_images";
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        // Convert and save uploaded images as WebP
        if (files && files.length > 0) {
            for (const file of files) {
                const field_name = file.fieldname;
                const savePath = yield (0, imageService_1.convertToWebpAndSave)(file.buffer, file.originalname, uploadDir);
                req.body[field_name] = savePath;
            }
        }
        // Fetch current setting to delete old images if replaced
        const settingUpdate = yield setting_schema_1.default.findOne();
        if (settingUpdate) {
            const imageFields = ["website_logo", "mobile_logo", "fav_icon", "pre_loader", "mobile_listing_banner", "desktop_listing_banner"];
            for (const field of imageFields) {
                if (req.body[field]) {
                    const oldImage = settingUpdate[field];
                    if (oldImage && oldImage !== "") {
                        const oldImagePath = path_1.default.join(__dirname, "../../../../", oldImage);
                        if (fs_1.default.existsSync(oldImagePath)) {
                            try {
                                fs_1.default.unlinkSync(oldImagePath);
                            }
                            catch (err) {
                                console.error(`Failed to delete old image for ${field}:`, err);
                            }
                        }
                    }
                }
            }
        }
        // Update settings in DB
        (0, setting_model_1.updateSettingModel)(req.body, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            (0, userActionActivity_service_1.storeUserActionActivity)(req.user.userId, "Setting", "Update", `Updated Website Setting Details successfully`);
            return (0, apiResponse_1.successResponse)(res, "Updated Setting successfully!", []);
        });
    }
    catch (error) {
        console.error("❌ Error in updateSetting:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred during settings update.");
    }
});
exports.updateSetting = updateSetting;
const updateFooterDescription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const settingUpdate = yield setting_schema_1.default.findOne();
        if (settingUpdate) {
            settingUpdate.footer_description = req.body.footer_description;
            settingUpdate.save();
        }
        return (0, apiResponse_1.successResponse)(res, "Update Footer Description successfully!", []);
    }
    catch (error) {
        console.log(error);
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred during user registration.");
    }
});
exports.updateFooterDescription = updateFooterDescription;
const updateDesktopDescription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const settingUpdate = yield setting_schema_1.default.findOne();
        if (settingUpdate) {
            settingUpdate.desktop_description = req.body.desktop_description;
            settingUpdate.save();
        }
        return (0, apiResponse_1.successResponse)(res, "Update Desktop Description successfully!", []);
    }
    catch (error) {
        console.log(error);
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred during user registration.");
    }
});
exports.updateDesktopDescription = updateDesktopDescription;
const exportedBackgroundProcessList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const search = typeof req.query.search === "string" ? req.query.search : "";
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const exportTasks = yield (0, setting_model_1.getExportTasksByModuleName)(search, page, limit);
        return (0, apiResponse_1.successResponse)(res, "Export tasks fetched successfully", exportTasks);
    }
    catch (error) {
        console.error("Error fetching export tasks:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while fetching export tasks.");
    }
});
exports.exportedBackgroundProcessList = exportedBackgroundProcessList;
const getEmailpermmistion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const emailPermmision = yield setting_schema_1.default.findOne().select("send_quotation_mail");
        return (0, apiResponse_1.successResponse)(res, "Email permission fetched successfully", emailPermmision);
    }
    catch (error) {
        console.error("Error fetching details:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "Something went wrong");
    }
});
exports.getEmailpermmistion = getEmailpermmistion;
const updateEmailPermmision = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingSetting = yield setting_schema_1.default.findOne();
        let updatedSetting;
        if (existingSetting) {
            updatedSetting = yield setting_schema_1.default.findByIdAndUpdate(existingSetting._id, req.body, { new: true });
        }
        return (0, apiResponse_1.successResponse)(res, "Email permission updated successfully", updatedSetting);
    }
    catch (error) {
        console.error("Error fetching details:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "Something went wrong");
    }
});
exports.updateEmailPermmision = updateEmailPermmision;
//# sourceMappingURL=setting.controller.js.map