import Joi from 'joi';

const adminLoginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        "string.email": "Invalid email format.",
        "any.required": "Email is required."
    }),
    password: Joi.string().min(6).optional(),
    confirm_password: Joi.string().min(6).optional(),
    name: Joi.string().min(3).max(50).required().messages({
        "string.min": "Name must be at least 3 characters long.",
        "string.max": "Name cannot exceed 50 characters.",
        "any.required": "Name is required."
    }),
    profile_pic:Joi.binary(),
    role: Joi.string(),
    sub_role:Joi.string().optional(),
    user_id:Joi.string().optional(),
});



export default adminLoginSchema;
