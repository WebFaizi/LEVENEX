"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const adminLoginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        "string.email": "Invalid email format.",
        "any.required": "Email is required."
    }),
    password: joi_1.default.string().min(6).optional(),
    confirm_password: joi_1.default.string().min(6).optional(),
    name: joi_1.default.string().min(3).max(50).required().messages({
        "string.min": "Name must be at least 3 characters long.",
        "string.max": "Name cannot exceed 50 characters.",
        "any.required": "Name is required."
    }),
    profile_pic: joi_1.default.binary(),
    role: joi_1.default.string(),
    sub_role: joi_1.default.string().optional(),
    user_id: joi_1.default.string().optional(),
});
exports.default = adminLoginSchema;
//# sourceMappingURL=admin_store.validation.js.map