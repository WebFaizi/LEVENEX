import Joi from "joi";



export const deleteListingValidation = Joi.object({
    listing_ids: Joi.array().required(),
})

export const storeChatBoatUserValidation = Joi.object({
    category_ids: Joi.array()
      .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/))
      .required()
      .messages({
        "any.required": "Category IDs are required",
        "string.pattern.base": "Each category ID must be a valid ObjectId"
      }),
  
    city_name: Joi.string().trim().required().messages({
      "string.base": "City name must be a string",
      "string.empty": "City name cannot be empty",
      "any.required": "City name is required"
    }),
  
    phone_number: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .required()
      .messages({
        "string.pattern.base": "Phone number must be a 10-digit number",
        "any.required": "Phone number is required"
      }),
  });



export const premiumListingStoreValidation = Joi.object({
    listing_id: Joi.string().required().messages({
        'any.required': 'Listing Id is required.',
    }),

    premium_type: Joi.string()
        .valid('epremium', 'super_premium')
        .required()
        .messages({
            'any.required': 'Premium type is required.',
        }),

    city_ids: Joi.array().when('premium_type', {
        is: 'epremium',
        then: Joi.required().messages({
            'any.required': 'City Ids are required for epremium.',
        }),
        otherwise: Joi.optional(),
    }),

    start_date: Joi.date().when('premium_type', {
        is: 'epremium',
        then: Joi.required().messages({
            'any.required': 'Starting date is required for epremium.',
        }),
        otherwise: Joi.optional(),
    }),

    end_date: Joi.date().when('premium_type', {
        is: 'epremium',
        then: Joi.required().messages({
            'any.required': 'Ending date is required for epremium.',
        }),
        otherwise: Joi.optional(),
    }),
    premium_listing_id : Joi.optional(),
});


export const deletePremiumListingStoreValidation = Joi.object({
   listing_ids: Joi.array().required(),
})