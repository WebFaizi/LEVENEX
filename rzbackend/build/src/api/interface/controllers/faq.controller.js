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
exports.getFaqListFrontend = exports.deleteFaq = exports.updateFaq = exports.faqDetails = exports.storeFaq = exports.getFaqList = exports.deleteAllFaqList = void 0;
const apiResponse_1 = require("../../helper/apiResponse");
const faq_schema_1 = __importDefault(require("../../domain/schema/faq.schema"));
const faq_model_1 = require("../../domain/models/faq.model");
const deleteAllFaqList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield faq_schema_1.default.deleteMany({});
        if (result.deletedCount === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No Faq found to delete.");
        }
        //  await storeUserActionActivity(req.user.userId, "BLog", "Delete", `Deleted all blogs.`)
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted all faqs .`, result.deletedCount);
    }
    catch (error) {
        return (0, apiResponse_1.ErrorResponse)(res, "An error occurred while deleting all Faqs .");
    }
});
exports.deleteAllFaqList = deleteAllFaqList;
const getFaqList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const categories = yield (0, faq_model_1.faqList)(search, pageNum, limitNum);
        return (0, apiResponse_1.successResponse)(res, "get slider list successfully", categories);
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during slider registration.');
    }
});
exports.getFaqList = getFaqList;
const storeFaq = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, faq_model_1.storeFaqModel)(req.body, req.body, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Faq Added successfully", { result });
        });
    }
    catch (error) {
        console.log(error);
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.storeFaq = storeFaq;
const faqDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        (0, faq_model_1.faqDetail)(id, (error, result) => {
            if (error) {
                console.error("Error:", error);
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Slider details", result);
        });
    }
    catch (error) {
        console.error("Error:", error);
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred while fetching Slider details.");
    }
});
exports.faqDetails = faqDetails;
const updateFaq = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const faqToUpdate = yield faq_schema_1.default.findById(req.body.faq_id);
        if (!faqToUpdate) {
            return (0, apiResponse_1.ErrorResponse)(res, "Faq not found");
        }
        (0, faq_model_1.updateFaqModel)(req.user, req.body, (error, result) => {
            if (error) {
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Slider updated successfully", { result });
        });
    }
    catch (error) {
        console.error("❌ Error in update Slider:", error);
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred while updating the Slider.");
    }
});
exports.updateFaq = updateFaq;
const deleteFaq = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { faq_ids } = req.body;
        if (!faq_ids || !Array.isArray(faq_ids) || faq_ids.length === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "Please provide at least one valid Faq ID.");
        }
        // Fetch blogs to get image paths before deleting
        const faqToDelete = yield faq_schema_1.default.find({ _id: { $in: faq_ids } });
        if (!faqToDelete.length) {
            return (0, apiResponse_1.ErrorResponse)(res, "No Faq found with the provided IDs.");
        }
        // Now delete the faq documents
        const result = yield faq_schema_1.default.deleteMany({ _id: { $in: faq_ids } });
        if (result.deletedCount === 0) {
            return (0, apiResponse_1.ErrorResponse)(res, "No Faq found to delete.");
        }
        // await storeUserActionActivity(req.user.userId, "Blog", "Delete", `Deleted blog(s) successfully.`);
        return (0, apiResponse_1.successResponse)(res, `Successfully deleted faq(s).`, result.deletedCount);
    }
    catch (error) {
        console.error("❌ Error in delete faq:", error);
        return (0, apiResponse_1.ErrorResponse)(res, 'An error occurred while deleting faq.');
    }
});
exports.deleteFaq = deleteFaq;
const getFaqListFrontend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, faq_model_1.frontendFaqList)((error, result) => {
            if (error) {
                console.log(error);
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "get slider list successfully", result);
        });
    }
    catch (error) {
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during fetching slider .');
    }
});
exports.getFaqListFrontend = getFaqListFrontend;
//# sourceMappingURL=faq.controller.js.map