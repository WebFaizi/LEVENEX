"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.faqDeleteSchema = exports.faqUpdateSchema = exports.faqStoreSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.faqStoreSchema = joi_1.default.object({
    question: joi_1.default.any().required().messages({
        'any.required': 'Question is required.',
    }),
    answer: joi_1.default.any().required().messages({
        'any.required': 'Answer is required.',
    })
});
exports.faqUpdateSchema = joi_1.default.object({
    question: joi_1.default.any().required().messages({
        'any.required': 'Question is required.',
    }),
    answer: joi_1.default.any().required().messages({
        'any.required': 'Answer is required.',
    }),
    faq_id: joi_1.default.any().required().messages({
        'any.required': 'FAQ Id is required.',
    })
});
exports.faqDeleteSchema = joi_1.default.object({
    faq_ids: joi_1.default.array().required(),
});
//# sourceMappingURL=faq.validation.js.map