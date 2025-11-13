"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePremiumListingStoreValidation = exports.premiumListingStoreValidation = exports.storeChatBoatUserValidation = exports.deleteListingValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.deleteListingValidation = joi_1.default.object({
    listing_ids: joi_1.default.array().required(),
});
exports.storeChatBoatUserValidation = joi_1.default.object({
    category_ids: joi_1.default.array()
        .items(joi_1.default.string().regex(/^[0-9a-fA-F]{24}$/))
        .required()
        .messages({
        "any.required": "Category IDs are required",
        "string.pattern.base": "Each category ID must be a valid ObjectId"
    }),
    city_name: joi_1.default.string().trim().required().messages({
        "string.base": "City name must be a string",
        "string.empty": "City name cannot be empty",
        "any.required": "City name is required"
    }),
    phone_number: joi_1.default.string()
        .pattern(/^[0-9]{10}$/)
        .required()
        .messages({
        "string.pattern.base": "Phone number must be a 10-digit number",
        "any.required": "Phone number is required"
    }),
});
exports.premiumListingStoreValidation = joi_1.default.object({
    listing_id: joi_1.default.string().required().messages({
        'any.required': 'Listing Id is required.',
    }),
    premium_type: joi_1.default.string()
        .valid('epremium', 'super_premium')
        .required()
        .messages({
        'any.required': 'Premium type is required.',
    }),
    city_ids: joi_1.default.array().when('premium_type', {
        is: 'epremium',
        then: joi_1.default.required().messages({
            'any.required': 'City Ids are required for epremium.',
        }),
        otherwise: joi_1.default.optional(),
    }),
    start_date: joi_1.default.date().when('premium_type', {
        is: 'epremium',
        then: joi_1.default.required().messages({
            'any.required': 'Starting date is required for epremium.',
        }),
        otherwise: joi_1.default.optional(),
    }),
    end_date: joi_1.default.date().when('premium_type', {
        is: 'epremium',
        then: joi_1.default.required().messages({
            'any.required': 'Ending date is required for epremium.',
        }),
        otherwise: joi_1.default.optional(),
    }),
    premium_listing_id: joi_1.default.optional(),
});
exports.deletePremiumListingStoreValidation = joi_1.default.object({
    listing_ids: joi_1.default.array().required(),
});
//# sourceMappingURL=premiumListing.validation.js.map