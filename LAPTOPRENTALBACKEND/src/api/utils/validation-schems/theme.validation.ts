import Joi from 'joi';

export const themePageValidation = Joi.object({
    theme_name: Joi.string().required().messages({
        'string.base': '"theme_name" should be a string.',
        'string.empty': '"theme_name" cannot be an empty field.',
        'any.required': '"theme_name" is a required field.',
    }),
    box_shadow: Joi.string().required().messages({
        'string.base': '"box_shadow" should be a string.',
        'string.empty': '"box_shadow" cannot be an empty field.',
        'any.required': '"box_shadow" is a required field.',
    }),
    footer_background: Joi.string().required().messages({
        'string.base': '"footer_background" should be a string.',
        'string.empty': '"footer_background" cannot be an empty field.',
        'any.required': '"footer_background" is a required field.',
    }),
    button_shadow:Joi.string().optional().messages({
        'string.base': '"button_shadow" should be a string.', 
        'string.empty': '"button_shadow" cannot be an empty field.',
        'any.required': '"button_shadow" is a required field.', 
    }),
    body_background:Joi.string().optional().messages({
        'string.base': '"static_page_id" should be a string.',
        'string.empty': '"body_background" cannot be an empty field.',
        'any.required': '"body_background" is a required field.',   
    })
});