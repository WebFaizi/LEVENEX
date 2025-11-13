"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePasswordValidation = exports.forntendRegistrationValidation = exports.forntendLoginValidation = exports.verifyOtpValidation = exports.sendOtpValidation = exports.deleteUserListValidation = exports.updateUserProfileDetailsValidation = exports.createUserValidation = exports.checkSuperadminUserValidation = exports.userUpdatePasswordValidation = exports.adminLoginSchema = exports.resetPasswordValidation = exports.actionUserValidation = void 0;
const joi_1 = __importDefault(require("joi"));
exports.actionUserValidation = joi_1.default.object({
    user_id: joi_1.default.string().required().messages({
        "string.base": '"user_id" should be a string.',
        "string.empty": '"user_id" cannot be an empty field.',
        "any.required": '"user_id" is required.',
    }),
    type: joi_1.default.string().required().valid("0", "1", "2", "3", "4").messages({
        "number.base": '"type" should be a number.',
        "number.empty": '"type" cannot be an empty field.',
        "any.required": '"type" is required.',
    }),
    password: joi_1.default.string().optional().when("type", {
        is: 4,
        then: joi_1.default.string().min(6).required().messages({
            "string.base": '"password" should be a string.',
            "string.empty": '"password" cannot be an empty field.',
            "string.min": '"password" should be at least 6 characters long.',
            "any.required": '"password" is required when type is 4.',
        }),
    }),
});
exports.resetPasswordValidation = joi_1.default.object({
    password: joi_1.default.string().min(3).required().messages({
        'string.base': '"Password" should be a string.',
        'string.empty': '"Password" cannot be empty.',
        'string.min': '"Password" should have at least 3 characters.',
        'any.required': '"Password" is required.'
    }),
    confirm_password: joi_1.default.string().valid(joi_1.default.ref('password')).required().messages({
        'any.only': '"Confirm password" must match "Password".',
        'string.base': '"Confirm password" should be a string.',
        'string.empty': '"Confirm password" cannot be empty.',
        'any.required': '"Confirm password" is required.'
    }),
    token: joi_1.default.string().required().messages({
        "any.required": "Token is required."
    }),
});
exports.adminLoginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        "string.email": "Invalid email format.",
        "any.required": "Email is required."
    }),
    login_method: joi_1.default.string().valid("otp", "password").required().messages({
        "any.only": "Login method must be either 'otp' or 'password'.",
        "any.required": "Login method is required."
    }),
    password: joi_1.default.when("login_method", {
        is: "password",
        then: joi_1.default.string().required().messages({
            "any.required": "Password is required when login method is 'password'."
        }),
        otherwise: joi_1.default.forbidden()
    }),
    otp: joi_1.default.when("login_method", {
        is: "otp",
        then: joi_1.default.string().required().messages({
            "any.required": "OTP is required when login method is 'otp'."
        }),
        otherwise: joi_1.default.forbidden()
    })
});
exports.userUpdatePasswordValidation = joi_1.default.object({
    old_password: joi_1.default.string().min(3).required().messages({
        'string.base': '"Old Password" should be a string.',
        'string.empty': '"Old Password" cannot be empty.',
        'string.min': '"Old Password" should have at least 3 characters.',
        'any.required': '"Old Password" is required.'
    }),
    password: joi_1.default.string().min(3).required().messages({
        'string.base': '"Password" should be a string.',
        'string.empty': '"Password" cannot be empty.',
        'string.min': '"Password" should have at least 3 characters.',
        'any.required': '"Password" is required.'
    }),
    confirm_password: joi_1.default.string().valid(joi_1.default.ref('password')).required().messages({
        'any.only': '"Confirm password" must match "Password".',
        'string.base': '"Confirm password" should be a string.',
        'string.empty': '"Confirm password" cannot be empty.',
        'any.required': '"Confirm password" is required.'
    })
});
exports.checkSuperadminUserValidation = joi_1.default.object({
    email: joi_1.default.string().min(3).required().messages({
        'string.base': '"email" should be a string.',
        'string.empty': '"email" cannot be an empty field.',
    })
});
exports.createUserValidation = joi_1.default.object({
    name: joi_1.default.string().min(3).required().messages({
        'string.base': '"email" should be a string.',
        'string.empty': '"email" cannot be an empty field.',
    }),
    email: joi_1.default.string().min(3).required().messages({
        'string.base': '"email" should be a string.',
        'string.empty': '"email" cannot be an empty field.',
    }),
    password: joi_1.default.string().min(3).required().messages({
        'string.base': '"email" should be a string.',
        'string.empty': '"email" cannot be an empty field.',
    }),
    confirm_password: joi_1.default.string().min(3).required().messages({
        'string.base': '"email" should be a string.',
        'string.empty': '"email" cannot be an empty field.',
    })
});
exports.updateUserProfileDetailsValidation = joi_1.default.object({
    name: joi_1.default.string().min(3).required().messages({
        'string.base': '"email" should be a string.',
        'string.empty': '"email" cannot be an empty field.',
    }),
    email: joi_1.default.string().min(3).required().messages({
        'string.base': '"email" should be a string.',
        'string.empty': '"email" cannot be an empty field.',
    }),
    phone_number: joi_1.default.string().optional(),
    website: joi_1.default.string().optional(),
    profile_banner: joi_1.default.string().optional(),
    profile_pic: joi_1.default.string().optional(),
});
exports.deleteUserListValidation = joi_1.default.object({
    user_ids: joi_1.default.array().required().messages({
        'string.base': '"email" should be a string.',
        'string.empty': '"user_id" cannot be an empty field.',
    })
});
exports.sendOtpValidation = joi_1.default.object({
    email: joi_1.default.string().required().messages({
        'string.base': '"email" should be a string.',
        'string.empty': '"email" cannot be an empty field.',
    })
});
exports.verifyOtpValidation = joi_1.default.object({
    email: joi_1.default.string().required().messages({
        'string.base': '"email" should be a string.',
        'string.empty': '"email" cannot be an empty field.',
    }),
    otp: joi_1.default.string().required().messages({
        'string.base': '"otp" should be a string.',
        'string.empty': '"otp" cannot be an empty field.',
    })
});
exports.forntendLoginValidation = joi_1.default.object({
    email: joi_1.default.string().min(3).required().messages({
        'string.base': '"email" should be a string.',
        'string.empty': '"email" cannot be an empty field.',
    }),
    password: joi_1.default.string().min(3).required().messages({
        'string.empty': '"password" cannot be an empty field.',
    })
});
exports.forntendRegistrationValidation = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        "string.base": '"email" should be a string.',
        "string.empty": '"email" cannot be an empty field.',
        "string.email": '"email" must be a valid email address.',
        "any.required": '"email" is required.',
    }),
    password: joi_1.default.string().min(6).required().messages({
        "string.base": '"password" should be a string.',
        "string.empty": '"password" cannot be an empty field.',
        "string.min": '"password" should have a minimum length of 6.',
        "any.required": '"password" is required.',
    }),
    confirm_password: joi_1.default.string().required().valid(joi_1.default.ref("password")).messages({
        "any.only": '"confirm_password" must match "password".',
        "string.empty": '"confirm_password" cannot be an empty field.',
        "any.required": '"confirm_password" is required.',
    }),
    name: joi_1.default.string().min(3).required().messages({
        "string.base": '"name" should be a string.',
        "string.empty": '"name" cannot be an empty field.',
        "string.min": '"name" should have a minimum length of 3.',
        "any.required": '"name" is required.',
    }),
    phone_number: joi_1.default.string()
        .pattern(/^[0-9]{10,15}$/)
        .required()
        .messages({
        "string.pattern.base": '"phone" must be a valid phone number (10-15 digits).',
        "string.empty": '"phone" cannot be an empty field.',
        "any.required": '"phone" is required.',
    }),
    country_id: joi_1.default.number().required().messages({
        "string.base": '"country_id" must be a number.',
        "any.required": '"country_id" is required.',
    }),
    state_id: joi_1.default.number().required().messages({
        "string.base": '"state_id" must be a number.',
        "any.required": '"state_id" is required.',
    }),
    city_id: joi_1.default.number().required().messages({
        "string.base": '"city_id" must be a number.',
        "any.required": '"city_id" is required.',
    }),
});
exports.updatePasswordValidation = joi_1.default.object({
    old_password: joi_1.default.string().min(6).required().messages({
        'string.base': '"old password" should be a string.',
        'string.empty': '"old password" cannot be an empty field.',
        'string.min': '"old password" should have a minimum length of {#limit}.'
    }),
    password: joi_1.default.string().min(6).required().messages({
        'string.base': '"password" should be a string.',
        'string.empty': '"password" cannot be an empty field.',
        'string.min': '"password" should have a minimum length of {#limit}.'
    }),
    confirm_password: joi_1.default.any().valid(joi_1.default.ref('password')).required().messages({
        'any.only': '"password" and "confirm_password" should be same.',
        'any.required': '"confirm_password" is required.'
    })
});
//# sourceMappingURL=admin_login.validation.js.map