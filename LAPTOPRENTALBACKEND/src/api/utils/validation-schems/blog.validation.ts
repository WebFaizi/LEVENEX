import Joi from 'joi';


export const blogCategoryStoreSchema = Joi.object({
  name: Joi.any().required().messages({
    'any.required': 'Blog Category is required.',
  })
});

export const addAdminBlogReviewValidation = Joi.object({
  blog_id: Joi.any().required().messages({
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




export const reviewDeleteSchema = Joi.object({
  review_ids: Joi.array().required(),
})

export const reviewapproveSchema = Joi.object({
  review_id: Joi.any().required(),
  type: Joi.any().required().messages({
    'any.required': 'type is required.',
  }),
})



export const blogCategoryUpdateSchema = Joi.object({
  name: Joi.any().required().messages({
    'any.required': 'Blog Category name is required.',
  }),
  blog_category_id:Joi.any().required().messages({
    'any.required': 'Blog Category Id is required.',
  })
});

export const addUserBlogReviewValidation = Joi.object({
  blog_id: Joi.any().required().messages({
    'any.required': 'Blog id is required.',
  }),
  rating: Joi.any().required().messages({
    'any.required': 'Blog Rating is required.',
  }),
  comment: Joi.any().required().messages({
    'any.required': 'Blog comment is required.',
  })
});

export const addUserListingReviewValidation = Joi.object({
  listing_id: Joi.any().required().messages({
    'any.required': 'Blog id is required.',
  }),
  rating: Joi.any().required().messages({
    'any.required': 'Blog Rating is required.',
  }),
  comment: Joi.any().required().messages({
    'any.required': 'Blog comment is required.',
  })
});


export const blogCategoryDeleteSchema = Joi.object({
  blog_category_ids: Joi.array().required(),
})

export const storeBlogDetailsSchema = Joi.object({
  author_name: Joi.any().required().messages({
    'any.required': 'Blog Author Name is required.',
  }),
  categoryIds: Joi.any().required().messages({
    'any.required': 'Blog Category is required.',
  }),
  contact_no: Joi.any().required().messages({
    'any.required': 'Contact No is required.',
  }),
  email: Joi.any().required().messages({
    'any.required': 'Email is required.',
  }),
  blog_title: Joi.any().required().messages({
    'any.required': 'Blog Title is required.',
  }),
  content: Joi.any().required().messages({
    'any.required': 'Blog content is required.',
  })
});

export const updateBlogDetailsSchema = Joi.object({
  author_name: Joi.any().required().messages({
    'any.required': 'Blog Author Name is required.',
  }),
  categoryIds: Joi.any().required().messages({
    'any.required': 'Blog Category is required.',
  }),
  contact_no: Joi.any().required().messages({
    'any.required': 'Contact No is required.',
  }),
  email: Joi.any().required().messages({
    'any.required': 'Email is required.',
  }),
  blog_title: Joi.any().required().messages({
    'any.required': 'Blog Title is required.',
  }),
  content: Joi.any().required().messages({
    'any.required': 'Blog content is required.',
  }),
  blog_id: Joi.any().required().messages({
    'any.required': 'Blog Id is required.',
  })
});

export const blogDeleteSchema = Joi.object({
  blog_ids: Joi.array().required(),
})

