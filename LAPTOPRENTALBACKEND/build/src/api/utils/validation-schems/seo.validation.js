"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subdomainCategorySeoValidation = exports.listingSeoDetailValidation = exports.listingSeoValidation = exports.categorySeoValidation = exports.categorySeoDetailValidation = exports.subdomainCategorySeoDetailValidation = exports.serverSideMetaDetailsValidation = exports.homePageSeoValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.homePageSeoValidation = joi_1.default.object({
    page_title: joi_1.default.string().required().messages({ 'any.required': '"page_title" is a required field.', }),
    meta_title: joi_1.default.string().required().messages({ 'any.required': '"meta_title" is a required field.', }),
    meta_keywords: joi_1.default.string().required().messages({ 'any.required': '"meta_keywords" is a required field.', }),
    meta_description: joi_1.default.string().required().messages({ 'any.required': '"meta_description" is a required field.', }),
});
exports.serverSideMetaDetailsValidation = joi_1.default.object({
    slug: joi_1.default.string().required().messages({ 'any.required': '"slug" is a required field.' }),
    type: joi_1.default.string().required().messages({ 'any.required': '"type" is a required field.' }),
    current_url: joi_1.default.string().required().messages({ 'any.required': '"current_url" is a required field.' }),
});
exports.subdomainCategorySeoDetailValidation = joi_1.default.object({
    category_id: joi_1.default.string().required().messages({ 'any.required': '"category_id" is a required field.', }),
    category_seo_type: joi_1.default.string().required().messages({ 'any.required': '"meta_title" is a required field.', }),
});
exports.categorySeoDetailValidation = joi_1.default.object({
    category_id: joi_1.default.string().required().messages({ 'any.required': '"category_id" is a required field.', }),
    category_seo_type: joi_1.default.string().required().messages({ 'any.required': '"meta_title" is a required field.', }),
});
exports.categorySeoValidation = joi_1.default.object({
    category_id: joi_1.default.string().allow('').optional(),
    category_seo_type: joi_1.default.number().allow('').optional(),
    page_title: joi_1.default.string().allow('').optional(),
    meta_title: joi_1.default.string().allow('').optional(),
    meta_keywords: joi_1.default.string().allow('').optional(),
    meta_description: joi_1.default.string().allow('').optional(),
    search_by_keyword: joi_1.default.string().allow('').optional(),
    search_by_keyword_meta_des: joi_1.default.string().allow('').optional(),
    search_by_keyword_meta_keyword: joi_1.default.string().allow('').optional(),
    product_title: joi_1.default.string().allow('').optional(),
    product_meta_description: joi_1.default.string().required().allow('').optional(),
    product_meta_keywords: joi_1.default.string().allow('').optional(),
});
exports.listingSeoValidation = joi_1.default.object({
    listing_id: joi_1.default.string().allow('').optional(),
    page_title: joi_1.default.string().allow('').optional(),
    meta_title: joi_1.default.string().allow('').optional(),
    meta_keywords: joi_1.default.string().allow('').optional(),
    meta_description: joi_1.default.string().allow('').optional(),
});
exports.listingSeoDetailValidation = joi_1.default.object({
    listing_id: joi_1.default.string().required().messages({ 'any.required': '"category_id" is a required field.', }),
});
exports.subdomainCategorySeoValidation = joi_1.default.object({
    category_id: joi_1.default.string().allow('').optional(),
    category_seo_type: joi_1.default.number().allow('').optional(),
    page_title: joi_1.default.string().allow('').optional(),
    meta_title: joi_1.default.string().allow('').optional(),
    meta_keywords: joi_1.default.string().allow('').optional(),
    meta_description: joi_1.default.string().allow('').optional(),
    search_by_keyword: joi_1.default.string().allow('').optional(),
    search_by_keyword_meta_des: joi_1.default.string().allow('').optional(),
    search_by_keyword_meta_keyword: joi_1.default.string().allow('').optional(),
    product_title: joi_1.default.string().allow('').optional(),
    product_meta_description: joi_1.default.string().required().allow('').optional(),
    product_meta_keywords: joi_1.default.string().allow('').optional(),
});
//# sourceMappingURL=seo.validation.js.map