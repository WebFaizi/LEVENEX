import Joi from 'joi';

export const homePageValidation = Joi.object({
  current_location_id: Joi.any().required().messages({
    'any.required': 'Location is required.',
  }),
  current_location_type: Joi.any().optional()
});

export const unsubdcribeSiteValidation = Joi.object({
  email: Joi.any().required().messages({
    'any.required': 'Email is required.',
  })
});

export const storeCategorySearchCountValidation = Joi.object({
   category_id: Joi.any().required().messages({
    'any.required': 'Category Id is required.',
  })
})

export const storePremiumRequestValidation = Joi.object({
  first_name: Joi.any().required().messages({
    'any.required': 'Firt Name is required.',
  }),
  last_name: Joi.any().required().messages({
    'any.required': 'Last Name is required.',
  }),
  email: Joi.any().required().messages({
    'any.required': 'Email is required.',
  }),
  phone_number: Joi.any().required().messages({
    'any.required': 'Phone Number is required.',
  }),
  subject: Joi.any().required().messages({
    'any.required': 'Subject is required.',
  }),
});



export const getChatboatListingValidation = Joi.object({
  mobile_number: Joi.any().required().messages({
    'any.required': 'Location is required.',
  }),
  category: Joi.any().required().messages({
    'any.required': 'Location is required.',
  }),
  location: Joi.any().required().messages({
    'any.required': 'Location is required.',
  }),
});

export const jobApplyValidation = Joi.object({
  job_id: Joi.string().required().messages({
    'any.required': 'Job Id is required.',
  }),
  name: Joi.string().required().messages({
    'any.required': 'name is required.',
  }),
  email: Joi.string().required().messages({
    'any.required': 'email is required.',
  }),
  phone_number: Joi.string().required().messages({
    'any.required': 'contact_no is required.',
  }),
});

export const frontend_validation = Joi.object({
  current_location_id: Joi.any().required().messages({
    'any.required': 'Location is required.',
  }),
  current_location_type: Joi.any().optional()
});

export const getListingDetailsValidation = Joi.object({
  url_slug: Joi.any().required().messages({
    'any.required': 'Url Slug is required.',
  }),
  page: Joi.any().optional(),
  limit:Joi.any().optional(),
});

export const getListingWiseReviewValidation = Joi.object({
  listing_id: Joi.any().required().messages({
    'any.required': 'Url Slug is required.',
  }),
  page: Joi.any().optional(),
  limit:Joi.any().optional(),
});



