import Joi from "joi";

export const updateMarketingBannerValidation = Joi.object({
    marketingbanner_image: Joi.optional(),
    marketingbanner_description: Joi.string().messages({
        'any.required': 'Newsletter Description is required.',
    }),
    marketingbanner_listing_id:Joi.optional()
});

export const customUrlValidation = Joi.object({
    urls: Joi.optional(),
    type: Joi.string().required(),
});

export const getGeneratedUrlValidation = Joi.object({
    module_name: Joi.required(),
    type: Joi.optional(),
});


export const deleteKeywordValidation = Joi.object({
    keyword_ids: Joi.array().required(),
})
export const updateKeywordValidation = Joi.object({
    keyword_id: Joi.required(),
    words: Joi.required(),
})






