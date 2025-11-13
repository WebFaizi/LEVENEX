"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateKeywordValidation = exports.deleteKeywordValidation = exports.getGeneratedUrlValidation = exports.customUrlValidation = exports.updateMarketingBannerValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.updateMarketingBannerValidation = joi_1.default.object({
    marketingbanner_image: joi_1.default.optional(),
    marketingbanner_description: joi_1.default.string().messages({
        'any.required': 'Newsletter Description is required.',
    }),
    marketingbanner_listing_id: joi_1.default.optional()
});
exports.customUrlValidation = joi_1.default.object({
    urls: joi_1.default.optional(),
    type: joi_1.default.string().required(),
});
exports.getGeneratedUrlValidation = joi_1.default.object({
    module_name: joi_1.default.required(),
    type: joi_1.default.optional(),
});
exports.deleteKeywordValidation = joi_1.default.object({
    keyword_ids: joi_1.default.array().required(),
});
exports.updateKeywordValidation = joi_1.default.object({
    keyword_id: joi_1.default.required(),
    words: joi_1.default.required(),
});
//# sourceMappingURL=marketingBanner.validation.js.map