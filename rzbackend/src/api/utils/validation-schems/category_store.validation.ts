import Joi from 'joi';

export const categoryStoreSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Category is required.',
    'string.base': 'Category must be a string.'
  }),
  slug: Joi.string().required().messages({
    'any.required': 'Category Slug is required.',
    'string.base': 'Category Slug must be a string.'
  }),
  subdomain_slug: Joi.string().required().messages({
    'any.required': 'Category Sub-Domain Slug is required.',
    'string.base': 'Category Sub-Domain Slug must be a string.'
  }),
//   desktop_image: Joi.any().required().messages({
//     'any.required': 'Desktop image is required.',
//   }),
//   mobile_image: Joi.any().required().messages({
//     'any.required': 'Mobile image is required.',
//   }),
  description: Joi.string().required().messages({
    'any.required': 'Description is required.',
    'string.base': 'Description must be a string.'
  }),
  subdomain_description: Joi.string().required().messages({
    'any.required': 'Subdomain description is required.',
    'string.base': 'Subdomain description must be a string.'
  }),
  page_top_keyword: Joi.string().required().messages({
    'any.required': 'Page top keyword is required.',
    'string.base': 'Page top keyword must be a string.'
  }),
  page_top_descritpion: Joi.string().required().messages({
    'any.required': 'Page top description is required.',
    'string.base': 'Page top description must be a string.'
  }),
  unique_id: Joi.string().optional().messages({
    'any.required': 'unique_id is required.',
    'string.base': 'unique_id must be a int.'
  }),
  related_categories : Joi.array().optional(),
  category_id: Joi.string().optional(),
  ratingvalue: Joi.any().optional(),
  ratingcount: Joi.any().optional()
});

export const categorydeleteSchema = Joi.object({
  category_ids: Joi.array().required().messages({
    'any.required': 'Category is required.',
    'string.base': 'Category must be a string.'
  })
});


export const categoryActionSchema = Joi.object({
  category_id: Joi.string().required().messages({
    'any.required': 'Category Id is required.',
    'string.base': 'Category Id must be a string.'
  }),
  type: Joi.string().required().messages({
    'any.required': 'Type is required.',
    'string.base': 'Type must be a string.'
  })
});

export const categorysortSchema = Joi.object({
  type: Joi.any().required().messages({
    'any.required': 'Type is required.',
  }),
  category_ids: Joi.array().messages({
    'any.required': 'Category is required.',
  })
});



