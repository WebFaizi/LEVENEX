"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteChatboatlistingValidation = exports.deleteFeaturedlistingValidation = exports.addchatboatlistingValidation = exports.featuredlistingStoreValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.featuredlistingStoreValidation = joi_1.default.object({
    category_ids: joi_1.default.any().optional(),
    city_ids: joi_1.default.array().optional(),
    is_all_city_selected: joi_1.default.any().optional(),
    is_all_category_selected: joi_1.default.any().optional(),
    listing_id: joi_1.default.string().required().messages({
        'any.required': 'Listing Id dsdsis required.',
    }),
    position: joi_1.default.number().required().messages({
        'any.required': 'postion is required.',
    }),
    featured_listing_id: joi_1.default.string().optional(),
});
exports.addchatboatlistingValidation = joi_1.default.object({
    city_id: joi_1.default.string().optional(),
    is_city_select_all: joi_1.default.any().optional(),
    listing_id: joi_1.default.any().required().messages({
        'any.required': 'Listing Id dsdsis required.',
    }),
    chat_boat_id: joi_1.default.string().optional(),
});
exports.deleteFeaturedlistingValidation = joi_1.default.object({
    listing_ids: joi_1.default.array().required(),
});
exports.deleteChatboatlistingValidation = joi_1.default.object({
    chatboat_ids: joi_1.default.array().required(),
});
//# sourceMappingURL=featuredListing.validation.js.map