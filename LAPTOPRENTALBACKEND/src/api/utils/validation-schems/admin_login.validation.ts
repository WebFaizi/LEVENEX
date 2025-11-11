import Joi from 'joi';

export const actionUserValidation = Joi.object({
  user_id: Joi.string().required().messages({
      "string.base": '"user_id" should be a string.',
      "string.empty": '"user_id" cannot be an empty field.',
      "any.required": '"user_id" is required.',
  }),
  type: Joi.string().required().valid("0","1", "2", "3", "4").messages({
      "number.base": '"type" should be a number.',
      "number.empty": '"type" cannot be an empty field.',
      "any.required": '"type" is required.',
  }),
  password: Joi.string().optional().when("type", {
      is: 4,
      then: Joi.string().min(6).required().messages({
          "string.base": '"password" should be a string.',
          "string.empty": '"password" cannot be an empty field.',
          "string.min": '"password" should be at least 6 characters long.',
          "any.required": '"password" is required when type is 4.',
      }),
  }),
});

export const resetPasswordValidation = Joi.object({
  password: Joi.string().min(3).required().messages({
    'string.base': '"Password" should be a string.',
    'string.empty': '"Password" cannot be empty.',
    'string.min': '"Password" should have at least 3 characters.',
    'any.required': '"Password" is required.'
  }),
  confirm_password: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': '"Confirm password" must match "Password".',
    'string.base': '"Confirm password" should be a string.',
    'string.empty': '"Confirm password" cannot be empty.',
    'any.required': '"Confirm password" is required.'
  }),
  token: Joi.string().required().messages({
      "any.required": "Token is required."
  }),
});

export const adminLoginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        "string.email": "Invalid email format.",
        "any.required": "Email is required."
    }),
    login_method: Joi.string().valid("otp", "password").required().messages({
        "any.only": "Login method must be either 'otp' or 'password'.",
        "any.required": "Login method is required."
    }),
    password: Joi.when("login_method", {
        is: "password",
        then: Joi.string().required().messages({
            "any.required": "Password is required when login method is 'password'."
        }),
        otherwise: Joi.forbidden() 
    }),
    otp: Joi.when("login_method", {
        is: "otp",
        then: Joi.string().required().messages({
            "any.required": "OTP is required when login method is 'otp'."
        }),
        otherwise: Joi.forbidden() 
    })
});



export const userUpdatePasswordValidation = Joi.object({
  old_password: Joi.string().min(3).required().messages({
    'string.base': '"Old Password" should be a string.',
    'string.empty': '"Old Password" cannot be empty.',
    'string.min': '"Old Password" should have at least 3 characters.',
    'any.required': '"Old Password" is required.'
  }),
  password: Joi.string().min(3).required().messages({
    'string.base': '"Password" should be a string.',
    'string.empty': '"Password" cannot be empty.',
    'string.min': '"Password" should have at least 3 characters.',
    'any.required': '"Password" is required.'
  }),
  confirm_password: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': '"Confirm password" must match "Password".',
    'string.base': '"Confirm password" should be a string.',
    'string.empty': '"Confirm password" cannot be empty.',
    'any.required': '"Confirm password" is required.'
  })
  
});

export const checkSuperadminUserValidation = Joi.object({
    email: Joi.string().min(3).required().messages({
        'string.base': '"email" should be a string.',
        'string.empty': '"email" cannot be an empty field.',
    })
});

export const createUserValidation = Joi.object({
  name: Joi.string().min(3).required().messages({
      'string.base': '"email" should be a string.',
      'string.empty': '"email" cannot be an empty field.',
  }),
  email: Joi.string().min(3).required().messages({
      'string.base': '"email" should be a string.',
      'string.empty': '"email" cannot be an empty field.',
  }),
  password: Joi.string().min(3).required().messages({
    'string.base': '"email" should be a string.',
    'string.empty': '"email" cannot be an empty field.',
  }),
  confirm_password: Joi.string().min(3).required().messages({
    'string.base': '"email" should be a string.',
    'string.empty': '"email" cannot be an empty field.',
  })
});

export const updateUserProfileDetailsValidation = Joi.object({
  name: Joi.string().min(3).required().messages({
      'string.base': '"email" should be a string.',
      'string.empty': '"email" cannot be an empty field.',
  }),
  email: Joi.string().min(3).required().messages({
      'string.base': '"email" should be a string.',
      'string.empty': '"email" cannot be an empty field.',
  }),
  phone_number: Joi.string().optional(),
  website: Joi.string().optional(),
  profile_banner: Joi.string().optional(),
  profile_pic: Joi.string().optional(),
});


export const deleteUserListValidation = Joi.object({
  user_ids: Joi.array().required().messages({
      'string.base': '"email" should be a string.',
      'string.empty': '"user_id" cannot be an empty field.',
  })
});

export const sendOtpValidation = Joi.object({
  email: Joi.string().required().messages({
      'string.base': '"email" should be a string.',
      'string.empty': '"email" cannot be an empty field.',
  })
});

export const verifyOtpValidation = Joi.object({
  email: Joi.string().required().messages({
      'string.base': '"email" should be a string.',
      'string.empty': '"email" cannot be an empty field.',
  }),
  otp: Joi.string().required().messages({
    'string.base': '"otp" should be a string.',
    'string.empty': '"otp" cannot be an empty field.',
})
});


export const forntendLoginValidation = Joi.object({
    email: Joi.string().min(3).required().messages({
        'string.base': '"email" should be a string.',
        'string.empty': '"email" cannot be an empty field.',
    }),
    password: Joi.string().min(3).required().messages({
        'string.empty': '"password" cannot be an empty field.',
    })
});


export const forntendRegistrationValidation = Joi.object({
  email: Joi.string().email().required().messages({
    "string.base": '"email" should be a string.',
    "string.empty": '"email" cannot be an empty field.',
    "string.email": '"email" must be a valid email address.',
    "any.required": '"email" is required.',
  }),

  password: Joi.string().min(6).required().messages({
    "string.base": '"password" should be a string.',
    "string.empty": '"password" cannot be an empty field.',
    "string.min": '"password" should have a minimum length of 6.',
    "any.required": '"password" is required.',
  }),

  confirm_password: Joi.string().required().valid(Joi.ref("password")).messages({
    "any.only": '"confirm_password" must match "password".',
    "string.empty": '"confirm_password" cannot be an empty field.',
    "any.required": '"confirm_password" is required.',
  }),

  name: Joi.string().min(3).required().messages({
    "string.base": '"name" should be a string.',
    "string.empty": '"name" cannot be an empty field.',
    "string.min": '"name" should have a minimum length of 3.',
    "any.required": '"name" is required.',
  }),

  phone_number: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .required()
    .messages({
      "string.pattern.base": '"phone" must be a valid phone number (10-15 digits).',
      "string.empty": '"phone" cannot be an empty field.',
      "any.required": '"phone" is required.',
    }),

  country_id: Joi.number().required().messages({
    "string.base": '"country_id" must be a number.',
    "any.required": '"country_id" is required.',
  }),

  state_id: Joi.number().required().messages({
    "string.base": '"state_id" must be a number.',
    "any.required": '"state_id" is required.',
  }),

  city_id: Joi.number().required().messages({
    "string.base": '"city_id" must be a number.',
    "any.required": '"city_id" is required.',
  }),
});



export const updatePasswordValidation = Joi.object({
    old_password: Joi.string().min(6).required().messages({ 
        'string.base': '"old password" should be a string.',
        'string.empty': '"old password" cannot be an empty field.',
        'string.min': '"old password" should have a minimum length of {#limit}.'
    }),
    password: Joi.string().min(6).required().messages({ 
        'string.base': '"password" should be a string.',
        'string.empty': '"password" cannot be an empty field.',
        'string.min': '"password" should have a minimum length of {#limit}.'
    }),
    confirm_password: Joi.any().valid(Joi.ref('password')).required().messages({ 
        'any.only': '"password" and "confirm_password" should be same.',
        'any.required': '"confirm_password" is required.'
    })
});


