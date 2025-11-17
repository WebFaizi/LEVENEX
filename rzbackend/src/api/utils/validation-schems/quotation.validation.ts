import Joi from 'joi';
import { subscribe } from 'node:diagnostics_channel';

export const quotationStoreValidation = Joi.object({
    category_ids: Joi.array().items(Joi.string()).required().messages({
        'array.base': '"category_ids" should be an array.',
        'any.required': '"category_ids" is a required field.',
    }),
    quotation_type: Joi.string().valid('Company', 'Individual').required().messages({
        'string.base': '"quotation_type" should be a string.',
        'any.required': '"quotation_type" is a required field.',
        'any.only': '"quotation_type" should be one of ["Company", "Individual"].',
    }),
    name: Joi.string().required().messages({
        'string.base': '"name" should be a string.',
        'string.empty': '"name" cannot be an empty field.',
        'any.required': '"name" is a required field.',
    }),
    quantity: Joi.number().integer().min(1).required().messages({
        'number.base': '"quantity" should be a number.',
        'number.integer': '"quantity" should be an integer.',
        'any.required': '"quantity" is a required field.',
        'number.min': '"quantity" should be at least 1.',
    }),
    email: Joi.string().email().required().messages({
        'string.base': '"email" should be a string.',
        'string.email': '"email" should be a valid email address.',
        'any.required': '"email" is a required field.',
    }),
    phone_number: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required().messages({
        'string.base': '"phone_number" should be a string.',
        'string.pattern.base': '"phone_number" should be a valid phone number.',
        'any.required': '"phone_number" is a required field.',
    }),
    location: Joi.string().required().messages({
        'string.base': '"location" should be a string.',
        'string.empty': '"location" cannot be an empty field.',
        'any.required': '"location" is a required field.',
    }),
    message: Joi.string().required().messages({
        'string.base': '"message" should be a string.',
        'string.empty': '"message" cannot be an empty field.',
        'any.required': '"message" is a required field.',
    }),
    ip_address: Joi.string().optional().allow('').messages({
        'string.base': '"ip_address" should be a string.',
    }),
});

export const deleteQuotationValidation = Joi.object({
    quotation_ids: Joi.array().required(),
})

export const deleteSubscribersValidation = Joi.object({
    subscribe_id: Joi.array().required(),
})

export const addFrontendQoutationValidation = Joi.object({
    category_ids: Joi.array().items(Joi.string()).required().messages({
        'array.base': '"category_ids" should be an array.',
        'any.required': '"category_ids" is a required field.',
    }),
    quotation_type: Joi.string().valid('Company', 'Individual').required().messages({
        'string.base': '"quotation_type" should be a string.',
        'any.required': '"quotation_type" is a required field.',
        'any.only': '"quotation_type" should be one of ["Company", "Individual"].',
    }),
    name: Joi.string().required().messages({
        'string.base': '"name" should be a string.',
        'string.empty': '"name" cannot be an empty field.',
        'any.required': '"name" is a required field.',
    }),
    quantity: Joi.number().integer().min(1).required().messages({
        'number.base': '"quantity" should be a number.',
        'number.integer': '"quantity" should be an integer.',
        'any.required': '"quantity" is a required field.',
        'number.min': '"quantity" should be at least 1.',
    }),
    email: Joi.string().email().required().messages({
        'string.base': '"email" should be a string.',
        'string.email': '"email" should be a valid email address.',
        'any.required': '"email" is a required field.',
    }),
    phone_number: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required().messages({
        'string.base': '"phone_number" should be a string.',
        'string.pattern.base': '"phone_number" should be a valid phone number.',
        'any.required': '"phone_number" is a required field.',
    }),
    location: Joi.string().required().messages({
        'string.base': '"location" should be a string.',
        'string.empty': '"location" cannot be an empty field.',
        'any.required': '"location" is a required field.',
    }),
    message: Joi.string().required().messages({
        'string.base': '"message" should be a string.',
        'string.empty': '"message" cannot be an empty field.',
        'any.required': '"message" is a required field.',
    }),
});

export const updateQuotationStatusValidation = Joi.object({
    quotation_id: Joi.string().required().messages({
        'string.base': '"quotation_id" should be a string.',
        'any.required': '"quotation_id" is a required field.',
        'any.only': '"quotation_id" should be one of ["Company", "Individual"].',
    }),
    status: Joi.string().required().messages({
        'string.base': '"status" should be a string.',
        'string.empty': '"status" cannot be an empty field.',
        'any.required': '"status" is a required field.',
    }),
    type: Joi.string().required().messages({
        'string.base': '"type" should be a string.',
        'string.empty': '"type" cannot be an empty field.',
        'any.required': '"type" is a required field.',
    }),
})

export const exportQuotationValidation = Joi.object({
    quotation_list_type:Joi.string().optional(),
    start_date: Joi.string()
        .optional()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)  
        .messages({
            'string.base': '"start_date" should be a string.',
            'string.pattern.base': '"start_date" must be in the format YYYY-MM-DD.',
        }),
    end_date: Joi.string()
        .optional()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)  
        .messages({
            'string.base': '"end_date" should be a string.',
            'string.pattern.base': '"end_date" must be in the format YYYY-MM-DD.',
        })
        .custom((value, helpers) => {
            const { start_date } = helpers.state.ancestors[0]; 
            if (start_date && value) {
                const startDate = new Date(start_date);
                const endDate = new Date(value);
                if (endDate < startDate) {
                    return helpers.error('any.invalid', { message: '"end_date" must be later than "start_date".' });
                }
            }
            return value;
        }),
});



