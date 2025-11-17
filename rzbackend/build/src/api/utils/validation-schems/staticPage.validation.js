"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStaticPageValidation = exports.staticPageValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.staticPageValidation = joi_1.default.object({
    page_name: joi_1.default.string().required().messages({
        'string.base': '"page_name" should be a string.',
        'string.empty': '"page_name" cannot be an empty field.',
        'any.required': '"page_name" is a required field.',
    }),
    page_content: joi_1.default.string().required().messages({
        'string.base': '"page_content" should be a string.',
        'string.empty': '"page_content" cannot be an empty field.',
        'any.required': '"page_content" is a required field.',
    }),
    static_page_id: joi_1.default.string().optional().messages({
        'string.base': '"static_page_id" should be a string.',
    }),
});
exports.deleteStaticPageValidation = joi_1.default.object({
    static_ids: joi_1.default.array().messages({
        'string.base': '"static_ids" should be a string.',
    }),
});
//# sourceMappingURL=staticPage.validation.js.map