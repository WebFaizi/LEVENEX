"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.themePageValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.themePageValidation = joi_1.default.object({
    theme_name: joi_1.default.string().required().messages({
        'string.base': '"theme_name" should be a string.',
        'string.empty': '"theme_name" cannot be an empty field.',
        'any.required': '"theme_name" is a required field.',
    }),
    box_shadow: joi_1.default.string().required().messages({
        'string.base': '"box_shadow" should be a string.',
        'string.empty': '"box_shadow" cannot be an empty field.',
        'any.required': '"box_shadow" is a required field.',
    }),
    footer_background: joi_1.default.string().required().messages({
        'string.base': '"footer_background" should be a string.',
        'string.empty': '"footer_background" cannot be an empty field.',
        'any.required': '"footer_background" is a required field.',
    }),
    button_shadow: joi_1.default.string().optional().messages({
        'string.base': '"button_shadow" should be a string.',
        'string.empty': '"button_shadow" cannot be an empty field.',
        'any.required': '"button_shadow" is a required field.',
    }),
    body_background: joi_1.default.string().optional().messages({
        'string.base': '"static_page_id" should be a string.',
        'string.empty': '"body_background" cannot be an empty field.',
        'any.required': '"body_background" is a required field.',
    })
});
//# sourceMappingURL=theme.validation.js.map