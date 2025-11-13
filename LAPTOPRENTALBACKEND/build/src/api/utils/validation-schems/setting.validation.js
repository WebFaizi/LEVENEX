"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.homePageSeoValidation = exports.desktopDescriptionValidation = exports.footerDescriptionValidation = exports.settingValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.settingValidation = joi_1.default.object({
    super_admin: joi_1.default.string().required().messages({
        'any.required': '"super_admin" is a required field.',
    }),
    email_for_otp: joi_1.default.string().required().messages({
        'any.required': '"email_for_otp" is a required field.',
    }),
    contact_email: joi_1.default.string().required().messages({
        'any.required': '"contact_email" is a required field.',
    }),
    send_quotation_mail: joi_1.default.string().required().messages({
        'any.required': '"send_quotation_mail" is a required field.',
    }),
    home_page_layout_style: joi_1.default.string().allow('').optional(),
    quotation_emails: joi_1.default.string().required().messages({
        'any.required': '"quotation_emails" is a required field.',
    }),
    website_logo: joi_1.default.string().allow('').optional(),
    mobile_logo: joi_1.default.string().allow('').optional(),
    fav_icon: joi_1.default.string().allow('').optional(),
    phone_number: joi_1.default.string().allow('').optional(),
    desktop_listing_banner: joi_1.default.string().allow('').optional(),
    mobile_listing_banner: joi_1.default.string().allow('').optional(),
    pre_loader: joi_1.default.string().allow('').optional(),
    login_page_content: joi_1.default.string().required().messages({
        'any.required': '"login_page_content" is a required field.',
    }),
    category_box_links: joi_1.default.string().required().messages({
        'any.required': '"category_box_links" is a required field.',
    }),
    sidebar_button_sequence: joi_1.default.string().required().messages({
        'any.required': '"sidebar_button_sequence" is a required field.',
    }),
    facebook: joi_1.default.string().allow('').optional(),
    twitter: joi_1.default.string().allow('').optional(),
    linkedin: joi_1.default.string().allow('').optional(),
    theme_id: joi_1.default.any().allow('').optional(),
    quotation_number: joi_1.default.string().allow('').optional(),
    whatsapp_key: joi_1.default.string().allow('').optional(),
    send_whatsapp_message: joi_1.default.string().allow('').optional(),
    premium_testing_email: joi_1.default.string().allow('').optional(),
    send_mail_to_premium_listing: joi_1.default.string().allow('').optional(),
});
exports.footerDescriptionValidation = joi_1.default.object({
    footer_description: joi_1.default.string().required().messages({
        'any.required': '"footer_description" is a required field.',
    })
});
exports.desktopDescriptionValidation = joi_1.default.object({
    desktop_description: joi_1.default.string().required().messages({
        'any.required': '"desktop_description" is a required field.',
    })
});
exports.homePageSeoValidation = joi_1.default.object({
    page_title: joi_1.default.string().required().messages({ 'any.required': '"page_title" is a required field.', }),
    meta_title: joi_1.default.string().required().messages({ 'any.required': '"meta_title" is a required field.', }),
    meta_keywords: joi_1.default.string().required().messages({ 'any.required': '"meta_keywords" is a required field.', }),
    meta_description: joi_1.default.string().required().messages({ 'any.required': '"meta_description" is a required field.', }),
});
//# sourceMappingURL=setting.validation.js.map