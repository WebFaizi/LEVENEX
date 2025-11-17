import Joi from 'joi';

export const addIpBlacklistValidation = Joi.object({
    ip_address: Joi.string().ip({ version: ['ipv4', 'ipv6'] }).required().messages({
        'string.base': '"ip_address" should be a string.',
        'string.ip': '"ip_address" should be a valid IP address.',
        'any.required': '"ip_address" is a required field.',
    }),
    status: Joi.string().valid('allowed', 'banned').required().messages({
        'string.base': '"status" should be a string.',
        'any.required': '"status" is a required field.',
        'any.only': '"status" should be either "allowed" or "banned".',
    }),
    reason: Joi.string().allow('').optional().messages({
        'string.base': '"reason" should be a string.',
    }),
    banned_by: Joi.string().allow('').optional().messages({
        'string.base': '"banned_by" should be a string.',
    }),
});

export const updateIpBlacklistValidation = Joi.object({
    ip_blacklist_id: Joi.string().required().messages({
        'string.base': '"ip_blacklist_id" should be a string.',
        'any.required': '"ip_blacklist_id" is a required field.',
    }),
    status: Joi.string().valid('allowed', 'banned').optional().messages({
        'string.base': '"status" should be a string.',
        'any.only': '"status" should be either "allowed" or "banned".',
    }),
    reason: Joi.string().allow('').optional().messages({
        'string.base': '"reason" should be a string.',
    }),
    banned_by: Joi.string().allow('').optional().messages({
        'string.base': '"banned_by" should be a string.',
    }),
});

export const deleteIpBlacklistValidation = Joi.object({
    ip_blacklist_ids: Joi.array().items(Joi.string()).min(1).required().messages({
        'array.base': '"ip_blacklist_ids" should be an array.',
        'array.min': '"ip_blacklist_ids" should contain at least one ID.',
        'any.required': '"ip_blacklist_ids" is a required field.',
    }),
});

export const checkIpBannedValidation = Joi.object({
    ip_address: Joi.string().ip({ version: ['ipv4', 'ipv6'] }).required().messages({
        'string.base': '"ip_address" should be a string.',
        'string.ip': '"ip_address" should be a valid IP address.',
        'any.required': '"ip_address" is a required field.',
    }),
});
