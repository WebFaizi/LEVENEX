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
exports.deleteChatboatlisting = exports.storeChatboatListing = exports.getListingCityWise = exports.getChatboatListingList = exports.getChatboatListingDetails = exports.ChatBoatUserExport = exports.chatBoatUserList = exports.storeChatBoatUser = exports.deleteAllChatboatListings = exports.clearChatBoat = void 0;
const apiResponse_1 = require("../../helper/apiResponse");
const chatboat_schema_1 = __importDefault(require("../../domain/schema/chatboat.schema"));
const chatboatUser_schema_1 = __importDefault(require("../../domain/schema/chatboatUser.schema"));
const chatboatListing_model_1 = require("../../domain/models/chatboatListing.model");
const mongoose_1 = __importDefault(require("mongoose"));
const XLSX = __importStar(require("xlsx"));
const clearChatBoat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield chatboatUser_schema_1.default.deleteMany({});
        return (0, apiResponse_1.successResponse)(res, 'All Chatboat user listings deleted successfully', result);
    }
    catch (error) {
        console.error('❌ Error while deleting chatboat listings:', error);
        return (0, apiResponse_1.ErrorResponse)(res, 'Something went wrong while clearing Chatboat listings');
    }
});
exports.clearChatBoat = clearChatBoat;
const deleteAllChatboatListings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield chatboatUser_schema_1.default.deleteMany({});
        if (result.deletedCount === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No Chatboat listings found to delete.");
        }
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted all Chatboat listings.`, result.deletedCount);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while deleting all Chatboat listings.");
    }
});
exports.deleteAllChatboatListings = deleteAllChatboatListings;
const storeChatBoatUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category_ids = [], city_name, phone_number } = req.body;
        // Validate category_ids
        const validCategoryIds = Array.isArray(category_ids)
            ? category_ids.filter((id) => mongoose_1.default.isValidObjectId(id))
            : [];
        if (!city_name || !phone_number) {
            return (0, apiResponse_1.ErrorResponse)(res, "City name and phone number are required.");
        }
        const newChatBoatUser = new chatboatUser_schema_1.default({
            category_ids: validCategoryIds,
            city_name,
            phone_number,
        });
        const savedUser = yield newChatBoatUser.save();
        return (0, apiResponse_1.successResponse)(res, "ChatBoat User stored successfully", savedUser);
    }
    catch (error) {
        console.error("Error storing ChatBoatUser:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "Something went wrong while storing user.");
    }
});
exports.storeChatBoatUser = storeChatBoatUser;
const chatBoatUserList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const categories = yield (0, chatboatListing_model_1.chatboatUserListModel)(search, pageNum, limitNum);
        return (0, apiResponse_1.successResponse)(res, "get category list successfully", categories);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.chatBoatUserList = chatBoatUserList;
const ChatBoatUserExport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield chatboatUser_schema_1.default.aggregate([
            {
                $sort: { sortingOrder: -1 }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category_ids',
                    foreignField: 'unique_id',
                    as: 'category_ids'
                }
            },
            {
                $project: {
                    _id: 1,
                    sortingOrder: 1,
                    createdAt: 1,
                    city_name: 1,
                    phone_number: 1,
                    category_ids: {
                        $map: {
                            input: "$category_ids",
                            as: "cat",
                            in: {
                                _id: "$$cat._id",
                                name: "$$cat.name",
                                unique_id: "$$cat.unique_id"
                            }
                        }
                    }
                }
            }
        ]);
        const categoryData = categories.map((category) => ({
            CategoryName: Array.isArray(category.category_ids)
                ? category.category_ids.map((cat) => cat.name).join(", ")
                : "",
            CreatedAt: category.createdAt,
            CityName: category.city_name,
            PhoneNumber: category.phone_number
        }));
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(categoryData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Categories");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
        res.setHeader("Content-Disposition", "attachment; filename=chatboat_user.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.send(excelBuffer);
    }
    catch (error) {
        return res.status(500).json({ message: "Error exporting categories", error: error.message });
    }
});
exports.ChatBoatUserExport = ChatBoatUserExport;
const getChatboatListingDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chat_boat_listing_id } = req.params;
        (0, chatboatListing_model_1.chatboatListingDetails)(chat_boat_listing_id, (error, result) => {
            if (error) {
                console.error("Error:", error);
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Featured Listing details", result);
        });
    }
    catch (error) {
        console.error("Error:", error);
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred while fetching blog details.");
    }
});
exports.getChatboatListingDetails = getChatboatListingDetails;
const getChatboatListingList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const categories = yield (0, chatboatListing_model_1.chatboatListingModel)(search, pageNum, limitNum);
        return (0, apiResponse_1.successResponse)(res, "get chatboat list successfully", categories);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.getChatboatListingList = getChatboatListingList;
const getListingCityWise = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { city_id, chat_boat_id } = req.query;
        const categories = yield (0, chatboatListing_model_1.chatBoatListingCityWise)(city_id, chat_boat_id);
        return (0, apiResponse_1.successResponse)(res, "get chatboat list successfully", categories);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.getListingCityWise = getListingCityWise;
const storeChatboatListing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, chatboatListing_model_1.storeChatboatListingModel)(req.body, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Chatboat listing stored successfully", result);
        });
    }
    catch (error) {
        console.error("Store chatboat listing error:", error);
        return (0, apiResponse_1.ErrorResponse)(res, "Failed to store chatboat listing");
    }
});
exports.storeChatboatListing = storeChatboatListing;
const deleteChatboatlisting = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chatboat_ids } = req.body;
        if (!chatboat_ids || !Array.isArray(chatboat_ids) || chatboat_ids.length === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "Please provide at least one valid Quotation ID.");
        }
        const result = yield chatboat_schema_1.default.deleteMany({ _id: { $in: chatboat_ids } });
        if (result.deletedCount === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No quotation found with the provided IDs.");
        }
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted  Listings(ies).`, result.deletedCount);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.deleteChatboatlisting = deleteChatboatlisting;
//# sourceMappingURL=chatboatListing.controller.js.map