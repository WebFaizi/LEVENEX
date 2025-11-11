import Joi from 'joi';

export const homePageSeoValidation = Joi.object({
    page_title: Joi.string().required().messages({  'any.required': '"page_title" is a required field.', }),    
    meta_title: Joi.string().required().messages({  'any.required': '"meta_title" is a required field.', }),
    meta_keywords: Joi.string().required().messages({  'any.required': '"meta_keywords" is a required field.', }),
    meta_description: Joi.string().required().messages({  'any.required': '"meta_description" is a required field.', }),
});

export const serverSideMetaDetailsValidation = Joi.object({
    slug: Joi.string().required().messages({  'any.required': '"slug" is a required field.' }),
    type: Joi.string().required().messages({  'any.required': '"type" is a required field.'}),
    current_url: Joi.string().required().messages({  'any.required': '"current_url" is a required field.'}),
});


export const subdomainCategorySeoDetailValidation = Joi.object({
    category_id: Joi.string().required().messages({  'any.required': '"category_id" is a required field.', }),    
    category_seo_type: Joi.string().required().messages({  'any.required': '"meta_title" is a required field.', }),
})
export const categorySeoDetailValidation = Joi.object({
    category_id: Joi.string().required().messages({  'any.required': '"category_id" is a required field.', }),    
    category_seo_type: Joi.string().required().messages({  'any.required': '"meta_title" is a required field.', }),
})

export const categorySeoValidation = Joi.object({
    category_id: Joi.string().allow('').optional(),
    category_seo_type: Joi.number().allow('').optional(),
    page_title: Joi.string().allow('').optional(),
    meta_title: Joi.string().allow('').optional(),
    meta_keywords: Joi.string().allow('').optional(),
    meta_description: Joi.string().allow('').optional(),
    search_by_keyword: Joi.string().allow('').optional(),
    search_by_keyword_meta_des: Joi.string().allow('').optional(),
    search_by_keyword_meta_keyword: Joi.string().allow('').optional(),
    product_title: Joi.string().allow('').optional(),
    product_meta_description: Joi.string().required().allow('').optional(),
    product_meta_keywords: Joi.string().allow('').optional(),
});

export const listingSeoValidation = Joi.object({
    listing_id: Joi.string().allow('').optional(),
    page_title: Joi.string().allow('').optional(),
    meta_title: Joi.string().allow('').optional(),
    meta_keywords: Joi.string().allow('').optional(),
    meta_description: Joi.string().allow('').optional(),
});

export const listingSeoDetailValidation = Joi.object({
    listing_id: Joi.string().required().messages({  'any.required': '"category_id" is a required field.', }),    
})


export const subdomainCategorySeoValidation = Joi.object({
    category_id: Joi.string().allow('').optional(),
    category_seo_type: Joi.number().allow('').optional(),
    page_title: Joi.string().allow('').optional(),
    meta_title: Joi.string().allow('').optional(),
    meta_keywords: Joi.string().allow('').optional(),
    meta_description: Joi.string().allow('').optional(),
    search_by_keyword: Joi.string().allow('').optional(),
    search_by_keyword_meta_des: Joi.string().allow('').optional(),
    search_by_keyword_meta_keyword: Joi.string().allow('').optional(),
    product_title: Joi.string().allow('').optional(),
    product_meta_description: Joi.string().required().allow('').optional(),
    product_meta_keywords: Joi.string().allow('').optional(),
});