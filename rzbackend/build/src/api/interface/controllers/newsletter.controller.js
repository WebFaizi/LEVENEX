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
exports.newsletterDetails = exports.updateNewsletter = void 0;
const apiResponse_1 = require("../../helper/apiResponse");
const newsLetter_model_1 = require("../../domain/models/newsLetter.model");
const newsLetter_schema_1 = __importDefault(require("../../domain/schema/newsLetter.schema"));
const userActionActivity_service_1 = require("../../services/userActionActivity.service");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const updateNewsletter = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = req.files;
        const uploadDir = "uploads/newslatter";
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
        if (req.body.newsletter_banner_image) {
            const blogToUpdate = yield newsLetter_schema_1.default.findOne();
            if (blogToUpdate) {
                const oldImage = blogToUpdate === null || blogToUpdate === void 0 ? void 0 : blogToUpdate.newsletter_banner_image;
                if (oldImage) {
                    console.log(oldImage);
                    const oldImagePath = path_1.default.join(__dirname, '../../../../', oldImage);
                    if (fs_1.default.existsSync(oldImagePath)) {
                        try {
                            fs_1.default.unlinkSync(oldImagePath);
                        }
                        catch (error) {
                            console.error("Error deleting old image:", error);
                            return (0, apiResponse_1.ErrorResponse)(res, "Failed to delete old image.");
                        }
                    }
                }
            }
        }
        const categories = yield (0, newsLetter_model_1.storeNewsletterModel)(req.body, (error, result) => {
            if (error) {
                (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            (0, userActionActivity_service_1.storeUserActionActivity)(req.user.userId, "newsletter", "Update", `Update newsletter Details successfully`);
            return (0, apiResponse_1.successResponse)(res, "Update newsletter successfully", result);
        });
    }
    catch (error) {
        console.log(error);
        (0, apiResponse_1.ErrorResponse)(res, 'An error occurred during user registration.');
    }
});
exports.updateNewsletter = updateNewsletter;
const newsletterDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, newsLetter_model_1.getNewsletterDetail)(req.user, (error, result) => {
            if (error) {
                console.error("Error:", error);
                return (0, apiResponse_1.ErrorResponse)(res, error.message);
            }
            return (0, apiResponse_1.successResponse)(res, "Newsletter details", result);
        });
    }
    catch (error) {
        console.error("Error:", error);
        (0, apiResponse_1.ErrorResponse)(res, "An error occurred while fetching blog details.");
    }
});
exports.newsletterDetails = newsletterDetails;
//# sourceMappingURL=newsletter.controller.js.map