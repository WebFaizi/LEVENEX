"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductListingValidation = exports.removeProductImageValidation = exports.productStoreValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.productStoreValidation = joi_1.default.object({
    product_category_id: joi_1.default.string().required().messages({
        'any.required': 'Category is required.',
        'string.base': 'Category must be a string.'
    }),
    product_listing_id: joi_1.default.string().required().messages({
        'any.required': 'Listing is required.',
        'string.base': 'Listing must be a string.'
    }),
    product_name: joi_1.default.string().required().messages({
        'any.required': 'Product name is required.',
        'string.base': 'Product name must be a string.'
    }),
    product_price: joi_1.default.string().required().messages({
        'any.required': 'Price is required.',
        'string.base': 'Price must be a string.'
    }),
    product_description: joi_1.default.string().required().messages({
        'any.required': 'Description is required.',
        'string.base': 'Description must be a string.'
    }),
    product_id: joi_1.default.optional(),
    ratingvalue: joi_1.default.any().optional(),
    ratingcount: joi_1.default.any().optional()
});
exports.removeProductImageValidation = joi_1.default.object({
    product_id: joi_1.default.string().required().messages({
        'any.required': 'product id is required.',
    }),
    image_name: joi_1.default.string().required().messages({
        'any.required': 'Product Image Name is required.',
    }),
});
exports.deleteProductListingValidation = joi_1.default.object({
    product_ids: joi_1.default.array().required(),
});
//# sourceMappingURL=productListing.validation.js.map