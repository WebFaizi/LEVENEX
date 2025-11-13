"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRedircetsUrlValidation = exports.redirectsUrlStoreSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.redirectsUrlStoreSchema = joi_1.default.object({
    from_url: joi_1.default.string().uri().min(3).required(),
    to_url: joi_1.default.string().uri().required(),
    redirect_id: joi_1.default.string().optional(),
});
exports.deleteRedircetsUrlValidation = joi_1.default.object({
    type: joi_1.default.number()
        .valid(1, 2)
        .required()
        .messages({
        'number.base': '"type" should be an integer.',
        'any.required': '"type" is a required field.',
        'any.only': '"type" must be either 1 (delete selected) or 2 (delete all).',
    }),
    url_ids: joi_1.default.alternatives()
        .conditional('type', {
        is: 1,
        then: joi_1.default.array()
            .items(joi_1.default.string().required())
            .min(1)
            .required()
            .messages({
            'array.base': '"url_ids" should be an array.',
            'array.min': '"url_ids" must contain at least one ID when type is 1.',
            'any.required': '"url_ids" is required when type is 1.',
        }),
        otherwise: joi_1.default.forbidden(),
    }),
});
//# sourceMappingURL=redirectsUrl.validation.js.map