import Joi from 'joi';

export const productStoreValidation = Joi.object({
    product_category_id: Joi.string().required().messages({
        'any.required': 'Category is required.',
        'string.base': 'Category must be a string.'
    }),
    product_listing_id: Joi.string().required().messages({
        'any.required': 'Listing is required.',
        'string.base': 'Listing must be a string.'
    }),
    product_name: Joi.string().required().messages({
        'any.required': 'Product name is required.',
        'string.base': 'Product name must be a string.'
    }),
    product_price: Joi.string().required().messages({
        'any.required': 'Price is required.',
        'string.base': 'Price must be a string.'
    }),
    product_description: Joi.string().required().messages({
        'any.required': 'Description is required.',
        'string.base': 'Description must be a string.'
    }),
    product_id : Joi.optional(),
    ratingvalue: Joi.any().optional(),
    ratingcount: Joi.any().optional()
});

export const removeProductImageValidation = Joi.object({
    product_id: Joi.string().required().messages({
        'any.required': 'product id is required.',
    }),
    image_name: Joi.string().required().messages({
        'any.required': 'Product Image Name is required.',
    }),
});

export const deleteProductListingValidation = Joi.object({
   product_ids: Joi.array().required(),
})
