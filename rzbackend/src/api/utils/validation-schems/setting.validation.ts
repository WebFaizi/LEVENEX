import Joi from 'joi';

export const settingValidation = Joi.object({
    super_admin: Joi.string().required().messages({
        'any.required': '"super_admin" is a required field.',
    }),
    email_for_otp: Joi.string().required().messages({
        'any.required': '"email_for_otp" is a required field.',
    }),
    contact_email: Joi.string().required().messages({
        'any.required': '"contact_email" is a required field.',
    }),
    send_quotation_mail: Joi.string().required().messages({
        'any.required': '"send_quotation_mail" is a required field.',
    }),
    home_page_layout_style: Joi.string().allow('').optional(),
    quotation_emails: Joi.string().required().messages({
        'any.required': '"quotation_emails" is a required field.',
    }),
    website_logo: Joi.string().allow('').optional(),
    mobile_logo: Joi.string().allow('').optional(),
    fav_icon: Joi.string().allow('').optional(),
    phone_number: Joi.string().allow('').optional(),
    desktop_listing_banner: Joi.string().allow('').optional(),
    mobile_listing_banner: Joi.string().allow('').optional(),
    pre_loader: Joi.string().allow('').optional(),
    login_page_content: Joi.string().required().messages({
        'any.required': '"login_page_content" is a required field.',
    }),
    category_box_links: Joi.string().required().messages({
        'any.required': '"category_box_links" is a required field.',
    }),
    sidebar_button_sequence: Joi.string().required().messages({
        'any.required': '"sidebar_button_sequence" is a required field.',
    }),
    facebook: Joi.string().allow('').optional(),
    twitter: Joi.string().allow('').optional(),
    linkedin: Joi.string().allow('').optional(),
    theme_id: Joi.any().allow('').optional(),
    quotation_number: Joi.string().allow('').optional(),
    whatsapp_key: Joi.string().allow('').optional(),
    send_whatsapp_message: Joi.string().allow('').optional(),
    premium_testing_email: Joi.string().allow('').optional(),
    send_mail_to_premium_listing : Joi.string().allow('').optional(),
});

export const footerDescriptionValidation = Joi.object({
    footer_description: Joi.string().required().messages({
        'any.required': '"footer_description" is a required field.',
    })
});

export const desktopDescriptionValidation = Joi.object({
    desktop_description: Joi.string().required().messages({
        'any.required': '"desktop_description" is a required field.',
    })
});

export const homePageSeoValidation = Joi.object({
    page_title: Joi.string().required().messages({  'any.required': '"page_title" is a required field.', }),    
    meta_title: Joi.string().required().messages({  'any.required': '"meta_title" is a required field.', }),
    meta_keywords: Joi.string().required().messages({  'any.required': '"meta_keywords" is a required field.', }),
    meta_description: Joi.string().required().messages({  'any.required': '"meta_description" is a required field.', }),
});