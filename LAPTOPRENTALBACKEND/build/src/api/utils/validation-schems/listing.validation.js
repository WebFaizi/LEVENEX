"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listingStatusValidation = exports.listingBannerValidation = exports.addAdminListingReviewValidation = exports.deleteListingValidation = exports.listingStoreValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.listingStoreValidation = joi_1.default.object({
    category_ids: joi_1.default.any().required().messages({
        'any.required': 'Category is required.',
    }),
    listing_image: joi_1.default.string().messages({
        'any.required': 'Image is required.',
    }),
    name: joi_1.default.string().required().messages({
        'any.required': 'Name is required.',
    }),
    description: joi_1.default.string().required().messages({
        'any.required': 'Description is required.',
        'string.base': 'Description must be a string.'
    }),
    address: joi_1.default.string().required().messages({
        'any.required': 'Address is required.',
    }),
    country_id: joi_1.default.string().required().messages({
        'any.required': 'COuntry is required.',
    }),
    state_id: joi_1.default.string().required().messages({
        'any.required': 'State is required.',
    }),
    city_ids: joi_1.default.array().optional(),
    area_id: joi_1.default.string().optional(),
    phone_number: joi_1.default.string().required().messages({
        'any.required': 'Phone No. is required.',
    }),
    email: joi_1.default.string().required().messages({
        'any.required': 'Email is required.',
    }),
    contact_person: joi_1.default.string().required().messages({
        'any.required': 'Contact Person name is required.',
    }),
    second_phone_no: joi_1.default.string().allow('').optional(),
    second_email: joi_1.default.string().allow('').optional(),
    website: joi_1.default.string().allow('').optional(),
    listing_type: joi_1.default.string().required().messages({
        'any.required': 'Listing Type is required.',
    }),
    price: joi_1.default.string().required().messages({
        'any.required': 'Listing Price is required.',
    }),
    time_duration: joi_1.default.string().required().messages({
        'any.required': 'Listing Duration is required.',
    }),
    cover_image: joi_1.default.string().allow('').optional(),
    is_city_all_selected: joi_1.default.any().optional(),
    is_area_all_selected: joi_1.default.any().optional(),
    video_url: joi_1.default.any().optional(),
    listing_id: joi_1.default.string().allow('').optional(),
    listing_reviews_count: joi_1.default.string().allow('').optional(),
    listing_avg_rating: joi_1.default.number().optional(),
});
exports.deleteListingValidation = joi_1.default.object({
    listing_ids: joi_1.default.array().required(),
});
exports.addAdminListingReviewValidation = joi_1.default.object({
    listing_id: joi_1.default.any().required().messages({
        'any.required': 'blog_id is required.',
    }),
    user_id: joi_1.default.any().required().messages({
        'any.required': 'user_id is required.',
    }),
    rating: joi_1.default.any().required().messages({
        'any.required': 'rating is required.',
    }),
    comment: joi_1.default.any().required().messages({
        'any.required': 'comment is required.',
    })
});
exports.listingBannerValidation = joi_1.default.object({
    cover_image: joi_1.default.string().allow('').optional(),
    listing_image: joi_1.default.string().allow('').optional(),
    listing_id: joi_1.default.string().allow('').required(),
});
exports.listingStatusValidation = joi_1.default.object({
    listing_id: joi_1.default.string().required().messages({
        'any.required': 'Listing Id is required.'
    }),
    status: joi_1.default.any().required().messages({
        'any.required': 'Listing Id is required.'
    }),
    type: joi_1.default.number().required().messages({
        'any.required': 'Type is required.'
    }),
});
//# sourceMappingURL=listing.validation.js.map