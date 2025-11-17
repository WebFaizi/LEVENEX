import Joi from 'joi';

export const featuredlistingStoreValidation = Joi.object({
    category_ids: Joi.any().optional(),

    city_ids: Joi.array().optional(),

    is_all_city_selected: Joi.any().optional(),
    
    is_all_category_selected: Joi.any().optional(),
    
    listing_id: Joi.string().required().messages({
        'any.required': 'Listing Id dsdsis required.',
    }),
    
     position
        :Joi.number().required().messages({
        'any.required': 'postion is required.',
    }),
    
    featured_listing_id: Joi.string().optional(),

});

export const addchatboatlistingValidation = Joi.object({

    city_id: Joi.string().optional(),

    is_city_select_all: Joi.any().optional(),
    
    listing_id: Joi.any().required().messages({
        'any.required': 'Listing Id dsdsis required.',
    }),
    
    chat_boat_id: Joi.string().optional(),
});



export const deleteFeaturedlistingValidation = Joi.object({
    listing_ids: Joi.array().required(),
})

export const deleteChatboatlistingValidation = Joi.object({
    chatboat_ids: Joi.array().required(),
})





