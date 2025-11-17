"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categorysortSchema = exports.categoryActionSchema = exports.categorydeleteSchema = exports.categoryStoreSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.categoryStoreSchema = joi_1.default.object({
    name: joi_1.default.string().required().messages({
        'any.required': 'Category is required.',
        'string.base': 'Category must be a string.'
    }),
    slug: joi_1.default.string().required().messages({
        'any.required': 'Category Slug is required.',
        'string.base': 'Category Slug must be a string.'
    }),
    subdomain_slug: joi_1.default.string().required().messages({
        'any.required': 'Category Sub-Domain Slug is required.',
        'string.base': 'Category Sub-Domain Slug must be a string.'
    }),
    //   desktop_image: Joi.any().required().messages({
    //     'any.required': 'Desktop image is required.',
    //   }),
    //   mobile_image: Joi.any().required().messages({
    //     'any.required': 'Mobile image is required.',
    //   }),
    description: joi_1.default.string().required().messages({
        'any.required': 'Description is required.',
        'string.base': 'Description must be a string.'
    }),
    subdomain_description: joi_1.default.string().required().messages({
        'any.required': 'Subdomain description is required.',
        'string.base': 'Subdomain description must be a string.'
    }),
    page_top_keyword: joi_1.default.string().required().messages({
        'any.required': 'Page top keyword is required.',
        'string.base': 'Page top keyword must be a string.'
    }),
    page_top_descritpion: joi_1.default.string().required().messages({
        'any.required': 'Page top description is required.',
        'string.base': 'Page top description must be a string.'
    }),
    unique_id: joi_1.default.string().optional().messages({
        'any.required': 'unique_id is required.',
        'string.base': 'unique_id must be a int.'
    }),
    related_categories: joi_1.default.array().optional(),
    category_id: joi_1.default.string().optional(),
    ratingvalue: joi_1.default.any().optional(),
    ratingcount: joi_1.default.any().optional()
});
exports.categorydeleteSchema = joi_1.default.object({
    category_ids: joi_1.default.array().required().messages({
        'any.required': 'Category is required.',
        'string.base': 'Category must be a string.'
    })
});
exports.categoryActionSchema = joi_1.default.object({
    category_id: joi_1.default.string().required().messages({
        'any.required': 'Category Id is required.',
        'string.base': 'Category Id must be a string.'
    }),
    type: joi_1.default.string().required().messages({
        'any.required': 'Type is required.',
        'string.base': 'Type must be a string.'
    })
});
exports.categorysortSchema = joi_1.default.object({
    type: joi_1.default.any().required().messages({
        'any.required': 'Type is required.',
    }),
    category_ids: joi_1.default.array().messages({
        'any.required': 'Category is required.',
    })
});
//# sourceMappingURL=category_store.validation.js.map