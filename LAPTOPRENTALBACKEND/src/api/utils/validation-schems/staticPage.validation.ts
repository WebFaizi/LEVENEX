import Joi from 'joi';

export const staticPageValidation = Joi.object({
    page_name: Joi.string().required().messages({
        'string.base': '"page_name" should be a string.',
        'string.empty': '"page_name" cannot be an empty field.',
        'any.required': '"page_name" is a required field.',
    }),
    page_content: Joi.string().required().messages({
        'string.base': '"page_content" should be a string.',
        'string.empty': '"page_content" cannot be an empty field.',
        'any.required': '"page_content" is a required field.',
    }),
    static_page_id:Joi.string().optional().messages({
        'string.base': '"static_page_id" should be a string.',  
    }),
});

export const deleteStaticPageValidation = Joi.object({
    static_ids:Joi.array().messages({
        'string.base': '"static_ids" should be a string.',  
    }),
});