"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNewsletterValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.updateNewsletterValidation = joi_1.default.object({
    newsletter_banner_image: joi_1.default.optional(),
    newsletter_description: joi_1.default.string().messages({
        'any.required': 'Newsletter Description is required.',
    }),
    newsletter_listing_id: joi_1.default.optional()
});
//# sourceMappingURL=newsletter.validation.js.map