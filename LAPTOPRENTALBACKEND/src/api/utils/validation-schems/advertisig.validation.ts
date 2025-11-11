import Joi from "joi";

export const storeBannerValidation = Joi.object({
    banner_type_id: Joi.string().required().messages({
        "string.base": "Banner type id must be a string.",
        "any.required": "Banner type id is required."
    }),
    category_ids: Joi.array().messages({
        "string.base": "Category Ids must be in array",
        "any.required": "category ids required."
    }),
    country_id: Joi.string().required().messages({
        "string.base": "country Ids must be in string",
        "any.required": "country ids required."
    }),
    state_id: Joi.string().required().messages({
        "string.base": "state Ids must be in string",
        "any.required": "state ids required."
    }),
    city_ids: Joi.array().messages({
        "string.base": "city Ids must be in array",
        "any.required": "city ids required."
    }),
    banner_title: Joi.string().required().messages({
        "string.base": "banner Title Ids must be in string",
        "any.required": "state ids required."
    }),
    banner_url: Joi.string().uri().required().messages({
        "string.base": "banner url Ids must be in url formet",
        "any.required": "banner url required."
    }),
    banner_image: Joi.string().messages({
        "string.base": "banner image must be in string",
        "any.required": "banner image required."
    }),
    display_period_in_days: Joi.string().required().messages({
        "string.base": "banner image must be in string",
        "any.required": "banner image required."
    }),
    banner_email: Joi.string().required().messages({
        "string.base": "banner image must be in string",
        "any.required": "banner image required."
    }),
    hide_banner_city_ids : Joi.array().messages({
        "string.base": "banner url Ids must be in array",
        "any.required": "banner url required."
    }),
    select_all_categories: Joi.any().required().messages({
        "string.base": "banner image must be in string",
        "any.required": "banner image required."
    }),
    select_all_cities: Joi.any().required().messages({
        "string.base": "banner image must be in string",
        "any.required": "banner image required."
    }),
    banners_id: Joi.string().messages({
        "string.uri": "Invalid banners_id format. Must be a string.",
        "any.required": "banners_id is required."
    })
});

export const storeBannerTypeValidation = Joi.object({
    banner_title: Joi.string().required().messages({
        "string.base": "Banner title must be a string.",
        "any.required": "Banner title is required."
    }),
    banner_size: Joi.string().required().messages({
        "string.base": "Banner size must be a string.",
        "any.required": "Banner size is required."
    }),
    banner_price: Joi.string().required().messages({
        "string.base": "Banner price must be a string.",
        "any.required": "Banner price is required."
    }),
    banner_slots: Joi.string().required().messages({
        "string.base": "Banner slots must be a string.",
        "any.required": "Banner slots are required."
    }),
    banner_preview_url: Joi.string().uri().required().messages({
        "string.uri": "Invalid banner_preview_url format. Must be a valid URL.",
        "any.required": "banner_preview_url is required."
    }),
    banner_type_id: Joi.string().messages({
        "string.uri": "Invalid banner_type_id format. Must be a valid URL.",
        "any.required": "banner_type_id is required."
    })
    
});

export const bannerTypesidValidation = Joi.object({
    banner_type_id: Joi.string().required().messages({  'any.required': '"banner_type_id_id" is a required field.', }),    
})


export const deleteBannerTypeSchema = Joi.object({
  banner_type_ids: Joi.array().required(),
})

export const deleteBannerSchema = Joi.object({
    banner_ids: Joi.array().required(),
})

export const storeBannerThemeValidation = Joi.object({
    provide_name: Joi.string().required().messages({
        "string.base": "Banner slots must be a string.",
        "any.required": "Banner slots are required."
    }),
    status: Joi.any().required().messages({
        "string.uri": "Invalid banner_preview_url format. Must be a valid URL.",
        "any.required": "banner_preview_url is required."
    }),
    banner_type_code: Joi.array().messages({
        "string.uri": "Invalid banner_type_id format. Must be a valid URL.",
        "any.required": "banner_type_id is required."
    }),
    banner_theme_id: Joi.string().messages({
        "string.uri": "Invalid banner_type_id format. Must be a valid URL.",
        "any.required": "banner_type_id is required."
    }),
    
})



