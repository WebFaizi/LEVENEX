"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIpBannedValidation = exports.deleteIpBlacklistValidation = exports.updateIpBlacklistValidation = exports.addIpBlacklistValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.addIpBlacklistValidation = joi_1.default.object({
    ip_address: joi_1.default.string().ip({ version: ['ipv4', 'ipv6'] }).required().messages({
        'string.base': '"ip_address" should be a string.',
        'string.ip': '"ip_address" should be a valid IP address.',
        'any.required': '"ip_address" is a required field.',
    }),
    status: joi_1.default.string().valid('allowed', 'banned').required().messages({
        'string.base': '"status" should be a string.',
        'any.required': '"status" is a required field.',
        'any.only': '"status" should be either "allowed" or "banned".',
    }),
    reason: joi_1.default.string().allow('').optional().messages({
        'string.base': '"reason" should be a string.',
    }),
    banned_by: joi_1.default.string().allow('').optional().messages({
        'string.base': '"banned_by" should be a string.',
    }),
});
exports.updateIpBlacklistValidation = joi_1.default.object({
    ip_blacklist_id: joi_1.default.string().required().messages({
        'string.base': '"ip_blacklist_id" should be a string.',
        'any.required': '"ip_blacklist_id" is a required field.',
    }),
    status: joi_1.default.string().valid('allowed', 'banned').optional().messages({
        'string.base': '"status" should be a string.',
        'any.only': '"status" should be either "allowed" or "banned".',
    }),
    reason: joi_1.default.string().allow('').optional().messages({
        'string.base': '"reason" should be a string.',
    }),
    banned_by: joi_1.default.string().allow('').optional().messages({
        'string.base': '"banned_by" should be a string.',
    }),
});
exports.deleteIpBlacklistValidation = joi_1.default.object({
    ip_blacklist_ids: joi_1.default.array().items(joi_1.default.string()).min(1).required().messages({
        'array.base': '"ip_blacklist_ids" should be an array.',
        'array.min': '"ip_blacklist_ids" should contain at least one ID.',
        'any.required': '"ip_blacklist_ids" is a required field.',
    }),
});
exports.checkIpBannedValidation = joi_1.default.object({
    ip_address: joi_1.default.string().ip({ version: ['ipv4', 'ipv6'] }).required().messages({
        'string.base': '"ip_address" should be a string.',
        'string.ip': '"ip_address" should be a valid IP address.',
        'any.required': '"ip_address" is a required field.',
    }),
});
//# sourceMappingURL=ipBlacklist.validation.js.map