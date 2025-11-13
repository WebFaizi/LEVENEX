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
exports.deleteStaticPage = exports.updateStaticPageDetails = exports.getStaticPageDetails = exports.getStaticPageList = exports.deleteAllStaticPages = exports.storeStaticPage = void 0;
const apiResponse_1 = require("../../helper/apiResponse");
const staticPage_schema_1 = __importDefault(require("../../domain/schema/staticPage.schema"));
const staticPage_model_1 = require("../../domain/models/staticPage.model");
const storeStaticPage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield (0, staticPage_model_1.storeStaticPageModel)(req.body, (error, result) => {
            if (error) {
                (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Page stored successfully", result);
        });
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.storeStaticPage = storeStaticPage;
const deleteAllStaticPages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield staticPage_schema_1.default.deleteMany({});
        if (result.deletedCount === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No Static Pages found to delete.");
        }
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted all Static Pages.`, result.deletedCount);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while deleting all Static Pages.");
    }
});
exports.deleteAllStaticPages = deleteAllStaticPages;
const getStaticPageList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const users = yield (0, staticPage_model_1.staticPageListModel)(search, pageNum, limitNum);
        return (0, apiResponse_1.successResponse)(res, "get static page list successfully", users);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.getStaticPageList = getStaticPageList;
const getStaticPageDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        (0, staticPage_model_1.StaticPageDetailModel)(id, (error, result) => {
            if (error) {
                console.error("Error:", error);
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Static page details", result);
        });
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred while fetching blog details.");
    }
});
exports.getStaticPageDetails = getStaticPageDetails;
const updateStaticPageDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, staticPage_model_1.updateStaticPageModel)(req.body, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Update static page details successfully", { result });
        });
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.updateStaticPageDetails = updateStaticPageDetails;
const deleteStaticPage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { static_ids } = req.body;
        if (!static_ids || !Array.isArray(static_ids) || static_ids.length === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "Please provide at least one valid Blog ID.");
        }
        const result = yield staticPage_schema_1.default.deleteMany({ _id: { $in: static_ids } });
        if (result.deletedCount === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No country found with the provided IDs.");
        }
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted  static page(ies).`, result.deletedCount);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.deleteStaticPage = deleteStaticPage;
//# sourceMappingURL=staticPage.controller.js.map