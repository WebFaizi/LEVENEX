"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteIpAddressValidation = exports.ipAddressValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.ipAddressValidation = joi_1.default.object({
    ip_address: joi_1.default.string().ip().required().messages({
        'string.base': '"ip_address" should be a string.',
        'string.empty': '"ip_address" cannot be an empty field.',
        'string.ip': '"ip_address" should be a valid IP address.',
        'any.required': '"ip_address" is a required field.',
    }),
    device_type: joi_1.default.string().required().messages({
        'string.base': '"device_type" should be a string.',
        'string.empty': '"device_type" cannot be an empty field.',
        'any.required': '"device_type" is a required field.',
    }),
    ip_holder_name: joi_1.default.string().required().messages({
        'string.base': '"ip_holder_name" should be a string.',
        'string.empty': '"ip_holder_name" cannot be an empty field.',
        'any.required': '"ip_holder_name" is a required field.',
    }),
});
exports.deleteIpAddressValidation = joi_1.default.object({
    type: joi_1.default.number()
        .valid(1, 2)
        .required()
        .messages({
        'number.base': '"type" should be an integer.',
        'any.required': '"type" is a required field.',
        'any.only': '"type" must be either 1 (delete selected) or 2 (delete all).',
    }),
    ip_address_id: joi_1.default.alternatives()
        .conditional('type', {
        is: 1, // When type is 1, ip_address_id is required and must be an array
        then: joi_1.default.array()
            .items(joi_1.default.string().required())
            .min(1)
            .required()
            .messages({
            'array.base': '"ip_address_id" should be an array.',
            'array.min': '"ip_address_id" must contain at least one ID when type is 1.',
            'any.required': '"ip_address_id" is required when type is 1.',
        }),
        otherwise: joi_1.default.forbidden(), // If type is not 1, ip_address_id is not allowed
    }),
});
//# sourceMappingURL=ipAddress.validation.js.map