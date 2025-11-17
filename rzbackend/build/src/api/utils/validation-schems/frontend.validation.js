"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getListingWiseReviewValidation = exports.getListingDetailsValidation = exports.frontend_validation = exports.jobApplyValidation = exports.getChatboatListingValidation = exports.storePremiumRequestValidation = exports.storeCategorySearchCountValidation = exports.unsubdcribeSiteValidation = exports.homePageValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.homePageValidation = joi_1.default.object({
    current_location_id: joi_1.default.any().required().messages({
        'any.required': 'Location is required.',
    }),
    current_location_type: joi_1.default.any().optional()
});
exports.unsubdcribeSiteValidation = joi_1.default.object({
    email: joi_1.default.any().required().messages({
        'any.required': 'Email is required.',
    })
});
exports.storeCategorySearchCountValidation = joi_1.default.object({
    category_id: joi_1.default.any().required().messages({
        'any.required': 'Category Id is required.',
    })
});
exports.storePremiumRequestValidation = joi_1.default.object({
    first_name: joi_1.default.any().required().messages({
        'any.required': 'Firt Name is required.',
    }),
    last_name: joi_1.default.any().required().messages({
        'any.required': 'Last Name is required.',
    }),
    email: joi_1.default.any().required().messages({
        'any.required': 'Email is required.',
    }),
    phone_number: joi_1.default.any().required().messages({
        'any.required': 'Phone Number is required.',
    }),
    subject: joi_1.default.any().required().messages({
        'any.required': 'Subject is required.',
    }),
});
exports.getChatboatListingValidation = joi_1.default.object({
    mobile_number: joi_1.default.any().required().messages({
        'any.required': 'Location is required.',
    }),
    category: joi_1.default.any().required().messages({
        'any.required': 'Location is required.',
    }),
    location: joi_1.default.any().required().messages({
        'any.required': 'Location is required.',
    }),
});
exports.jobApplyValidation = joi_1.default.object({
    job_id: joi_1.default.string().required().messages({
        'any.required': 'Job Id is required.',
    }),
    name: joi_1.default.string().required().messages({
        'any.required': 'name is required.',
    }),
    email: joi_1.default.string().required().messages({
        'any.required': 'email is required.',
    }),
    phone_number: joi_1.default.string().required().messages({
        'any.required': 'contact_no is required.',
    }),
});
exports.frontend_validation = joi_1.default.object({
    current_location_id: joi_1.default.any().required().messages({
        'any.required': 'Location is required.',
    }),
    current_location_type: joi_1.default.any().optional()
});
exports.getListingDetailsValidation = joi_1.default.object({
    url_slug: joi_1.default.any().required().messages({
        'any.required': 'Url Slug is required.',
    }),
    page: joi_1.default.any().optional(),
    limit: joi_1.default.any().optional(),
});
exports.getListingWiseReviewValidation = joi_1.default.object({
    listing_id: joi_1.default.any().required().messages({
        'any.required': 'Url Slug is required.',
    }),
    page: joi_1.default.any().optional(),
    limit: joi_1.default.any().optional(),
});
//# sourceMappingURL=frontend.validation.js.map