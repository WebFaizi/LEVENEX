import Joi from 'joi';

export const jobCategoryStoreSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Category is required.',
    'string.base': 'Category must be a string.'
  }),
  slug: Joi.string().required().messages({
    'any.required': 'Category Slug is required.',
    'string.base': 'Category Slug must be a string.'
  }),
  category_id: Joi.string().optional()
});

export const jobCategorydeleteSchema = Joi.object({
  category_ids: Joi.array().required().messages({
    'any.required': 'Category is required.',
    'string.base': 'Category must be a string.'
  })
});

export const deleteJobValidation = Joi.object({
  job_ids: Joi.array().required().messages({
    'any.required': 'job_ids is required.',
    'string.base': 'job_ids must be a string.'
  })
});

export const jobCategoryActionSchema = Joi.object({
  category_id: Joi.string().required().messages({
    'any.required': 'Category Id is required.',
    'string.base': 'Category Id must be a string.'
  }),
  type: Joi.string().required().messages({
    'any.required': 'Type is required.',
    'string.base': 'Type must be a string.'
  })
});

export const jobCategorysortSchema = Joi.object({
  type: Joi.any().required().messages({
    'any.required': 'Type is required.',
  }),
  category_ids: Joi.array().messages({
    'any.required': 'Category is required.',
  })
});

export const storeJobValidation = Joi.object({
    job_category_id: Joi.array().required().messages({
      'any.required': 'Job Category Id is required.',
      'string.base': 'Job Category Id must be a string.'
    }),
    job_title: Joi.string().required().messages({
      'any.required': 'job_title is required.',
      'string.base': 'job_title must be a string.'
    }),
    experience: Joi.string().required().messages({
      'any.required': 'experience is required.',
      'string.base': 'experience must be a string.'
    }),
    salary: Joi.string().required().messages({
      'any.required': 'salary is required.',
      'string.base': 'salary must be a string.'
    }),
    address: Joi.string().required().messages({
      'any.required': 'address is required.',
      'string.base': 'address must be a string.'
    }),
    phone_number: Joi.string().required().messages({
      'any.required': 'phone_number is required.',
      'string.base': 'phone_number must be a string.'
    }),
    keywords_tag: Joi.array().required().messages({
      'any.required': 'Type is required.',
      'string.base': 'Type must be a string.'
    }),
    is_approved: Joi.boolean().required().messages({
      'any.required': 'is_approved is required.',
      'string.base': 'is_approved must be a string.'
    }),
    description: Joi.string().required().messages({
      'any.required': 'description is required.',
      'string.base': 'description  be a string.'
    }),
    meta_title: Joi.string().required().messages({
      'any.required': 'meta_title is required.',
      'string.base': 'meta_title must be a string.'
    }),
    meta_description: Joi.string().required().messages({
      'any.required': 'meta_description is required.',
      'string.base': 'meta_description must be a string.'
    }),
    job_id: Joi.string().optional()
});


