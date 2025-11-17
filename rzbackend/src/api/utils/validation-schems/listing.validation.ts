import Joi from 'joi';

export const listingStoreValidation = Joi.object({
    category_ids: Joi.any().required().messages({
      'any.required': 'Category is required.',
    }),
    listing_image: Joi.string().messages({
        'any.required': 'Image is required.',
    }),
    name: Joi.string().required().messages({
        'any.required': 'Name is required.',
    }),
    description: Joi.string().required().messages({
        'any.required': 'Description is required.',
        'string.base': 'Description must be a string.'
    }),
    address: Joi.string().required().messages({
        'any.required': 'Address is required.',
    }),
    country_id: Joi.string().required().messages({
        'any.required': 'COuntry is required.',
    }),
    state_id: Joi.string().required().messages({
        'any.required': 'State is required.',
    }),
    city_ids: Joi.array().optional(),
    area_id: Joi.string().optional(),
    phone_number: Joi.string().required().messages({
        'any.required': 'Phone No. is required.',
    }),
    email: Joi.string().required().messages({
        'any.required': 'Email is required.',
    }),
    contact_person: Joi.string().required().messages({
        'any.required': 'Contact Person name is required.',
    }),
    second_phone_no: Joi.string().allow('').optional(),
    second_email: Joi.string().allow('').optional(),
    website: Joi.string().allow('').optional(),
    listing_type: Joi.string().required().messages({
        'any.required': 'Listing Type is required.',
    }),
    price: Joi.string().required().messages({
        'any.required': 'Listing Price is required.',
    }),
    time_duration: Joi.string().required().messages({
        'any.required': 'Listing Duration is required.',
    }),
    cover_image: Joi.string().allow('').optional(),
    is_city_all_selected: Joi.any().optional(),
    is_area_all_selected: Joi.any().optional(),
    video_url: Joi.any().optional(),
    listing_id: Joi.string().allow('').optional(),
    listing_reviews_count: Joi.string().allow('').optional(),
    listing_avg_rating: Joi.number().optional(),
});

export const deleteListingValidation = Joi.object({
    listing_ids: Joi.array().required(),
})

export const addAdminListingReviewValidation = Joi.object({
  listing_id: Joi.any().required().messages({
    'any.required': 'blog_id is required.',
  }),
  user_id: Joi.any().required().messages({
    'any.required': 'user_id is required.',
  }),
  rating: Joi.any().required().messages({
    'any.required': 'rating is required.',
  }),
  comment: Joi.any().required().messages({
    'any.required': 'comment is required.',
  })
});

export const listingBannerValidation = Joi.object({
    cover_image: Joi.string().allow('').optional(),
    listing_image: Joi.string().allow('').optional(),
    listing_id:Joi.string().allow('').required(),
})

export const listingStatusValidation = Joi.object({
    listing_id: Joi.string().required().messages({
        'any.required': 'Listing Id is required.'
    }),
    status: Joi.any().required().messages({
        'any.required': 'Listing Id is required.'
    }),
    type: Joi.number().required().messages({
        'any.required': 'Type is required.'
    }),
})

