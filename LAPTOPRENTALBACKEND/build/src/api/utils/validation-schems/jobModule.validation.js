"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeJobValidation = exports.jobCategorysortSchema = exports.jobCategoryActionSchema = exports.deleteJobValidation = exports.jobCategorydeleteSchema = exports.jobCategoryStoreSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.jobCategoryStoreSchema = joi_1.default.object({
    name: joi_1.default.string().required().messages({
        'any.required': 'Category is required.',
        'string.base': 'Category must be a string.'
    }),
    slug: joi_1.default.string().required().messages({
        'any.required': 'Category Slug is required.',
        'string.base': 'Category Slug must be a string.'
    }),
    category_id: joi_1.default.string().optional()
});
exports.jobCategorydeleteSchema = joi_1.default.object({
    category_ids: joi_1.default.array().required().messages({
        'any.required': 'Category is required.',
        'string.base': 'Category must be a string.'
    })
});
exports.deleteJobValidation = joi_1.default.object({
    job_ids: joi_1.default.array().required().messages({
        'any.required': 'job_ids is required.',
        'string.base': 'job_ids must be a string.'
    })
});
exports.jobCategoryActionSchema = joi_1.default.object({
    category_id: joi_1.default.string().required().messages({
        'any.required': 'Category Id is required.',
        'string.base': 'Category Id must be a string.'
    }),
    type: joi_1.default.string().required().messages({
        'any.required': 'Type is required.',
        'string.base': 'Type must be a string.'
    })
});
exports.jobCategorysortSchema = joi_1.default.object({
    type: joi_1.default.any().required().messages({
        'any.required': 'Type is required.',
    }),
    category_ids: joi_1.default.array().messages({
        'any.required': 'Category is required.',
    })
});
exports.storeJobValidation = joi_1.default.object({
    job_category_id: joi_1.default.array().required().messages({
        'any.required': 'Job Category Id is required.',
        'string.base': 'Job Category Id must be a string.'
    }),
    job_title: joi_1.default.string().required().messages({
        'any.required': 'job_title is required.',
        'string.base': 'job_title must be a string.'
    }),
    experience: joi_1.default.string().required().messages({
        'any.required': 'experience is required.',
        'string.base': 'experience must be a string.'
    }),
    salary: joi_1.default.string().required().messages({
        'any.required': 'salary is required.',
        'string.base': 'salary must be a string.'
    }),
    address: joi_1.default.string().required().messages({
        'any.required': 'address is required.',
        'string.base': 'address must be a string.'
    }),
    phone_number: joi_1.default.string().required().messages({
        'any.required': 'phone_number is required.',
        'string.base': 'phone_number must be a string.'
    }),
    keywords_tag: joi_1.default.array().required().messages({
        'any.required': 'Type is required.',
        'string.base': 'Type must be a string.'
    }),
    is_approved: joi_1.default.boolean().required().messages({
        'any.required': 'is_approved is required.',
        'string.base': 'is_approved must be a string.'
    }),
    description: joi_1.default.string().required().messages({
        'any.required': 'description is required.',
        'string.base': 'description  be a string.'
    }),
    meta_title: joi_1.default.string().required().messages({
        'any.required': 'meta_title is required.',
        'string.base': 'meta_title must be a string.'
    }),
    meta_description: joi_1.default.string().required().messages({
        'any.required': 'meta_description is required.',
        'string.base': 'meta_description must be a string.'
    }),
    job_id: joi_1.default.string().optional()
});
//# sourceMappingURL=jobModule.validation.js.map