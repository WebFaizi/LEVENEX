"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeBannerThemeValidation = exports.deleteBannerSchema = exports.deleteBannerTypeSchema = exports.bannerTypesidValidation = exports.storeBannerTypeValidation = exports.storeBannerValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.storeBannerValidation = joi_1.default.object({
    banner_type_id: joi_1.default.string().required().messages({
        "string.base": "Banner type id must be a string.",
        "any.required": "Banner type id is required."
    }),
    category_ids: joi_1.default.array().messages({
        "string.base": "Category Ids must be in array",
        "any.required": "category ids required."
    }),
    country_id: joi_1.default.string().required().messages({
        "string.base": "country Ids must be in string",
        "any.required": "country ids required."
    }),
    state_id: joi_1.default.string().required().messages({
        "string.base": "state Ids must be in string",
        "any.required": "state ids required."
    }),
    city_ids: joi_1.default.array().messages({
        "string.base": "city Ids must be in array",
        "any.required": "city ids required."
    }),
    banner_title: joi_1.default.string().required().messages({
        "string.base": "banner Title Ids must be in string",
        "any.required": "state ids required."
    }),
    banner_url: joi_1.default.string().uri().required().messages({
        "string.base": "banner url Ids must be in url formet",
        "any.required": "banner url required."
    }),
    banner_image: joi_1.default.string().messages({
        "string.base": "banner image must be in string",
        "any.required": "banner image required."
    }),
    display_period_in_days: joi_1.default.string().required().messages({
        "string.base": "banner image must be in string",
        "any.required": "banner image required."
    }),
    banner_email: joi_1.default.string().required().messages({
        "string.base": "banner image must be in string",
        "any.required": "banner image required."
    }),
    hide_banner_city_ids: joi_1.default.array().messages({
        "string.base": "banner url Ids must be in array",
        "any.required": "banner url required."
    }),
    select_all_categories: joi_1.default.any().required().messages({
        "string.base": "banner image must be in string",
        "any.required": "banner image required."
    }),
    select_all_cities: joi_1.default.any().required().messages({
        "string.base": "banner image must be in string",
        "any.required": "banner image required."
    }),
    banners_id: joi_1.default.string().messages({
        "string.uri": "Invalid banners_id format. Must be a string.",
        "any.required": "banners_id is required."
    })
});
exports.storeBannerTypeValidation = joi_1.default.object({
    banner_title: joi_1.default.string().required().messages({
        "string.base": "Banner title must be a string.",
        "any.required": "Banner title is required."
    }),
    banner_size: joi_1.default.string().required().messages({
        "string.base": "Banner size must be a string.",
        "any.required": "Banner size is required."
    }),
    banner_price: joi_1.default.string().required().messages({
        "string.base": "Banner price must be a string.",
        "any.required": "Banner price is required."
    }),
    banner_slots: joi_1.default.string().required().messages({
        "string.base": "Banner slots must be a string.",
        "any.required": "Banner slots are required."
    }),
    banner_preview_url: joi_1.default.string().uri().required().messages({
        "string.uri": "Invalid banner_preview_url format. Must be a valid URL.",
        "any.required": "banner_preview_url is required."
    }),
    banner_type_id: joi_1.default.string().messages({
        "string.uri": "Invalid banner_type_id format. Must be a valid URL.",
        "any.required": "banner_type_id is required."
    })
});
exports.bannerTypesidValidation = joi_1.default.object({
    banner_type_id: joi_1.default.string().required().messages({ 'any.required': '"banner_type_id_id" is a required field.', }),
});
exports.deleteBannerTypeSchema = joi_1.default.object({
    banner_type_ids: joi_1.default.array().required(),
});
exports.deleteBannerSchema = joi_1.default.object({
    banner_ids: joi_1.default.array().required(),
});
exports.storeBannerThemeValidation = joi_1.default.object({
    provide_name: joi_1.default.string().required().messages({
        "string.base": "Banner slots must be a string.",
        "any.required": "Banner slots are required."
    }),
    status: joi_1.default.any().required().messages({
        "string.uri": "Invalid banner_preview_url format. Must be a valid URL.",
        "any.required": "banner_preview_url is required."
    }),
    banner_type_code: joi_1.default.array().messages({
        "string.uri": "Invalid banner_type_id format. Must be a valid URL.",
        "any.required": "banner_type_id is required."
    }),
    banner_theme_id: joi_1.default.string().messages({
        "string.uri": "Invalid banner_type_id format. Must be a valid URL.",
        "any.required": "banner_type_id is required."
    }),
});
//# sourceMappingURL=advertisig.validation.js.map