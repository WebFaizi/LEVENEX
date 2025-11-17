import Joi from 'joi';

export const faqStoreSchema = Joi.object({
  question: Joi.any().required().messages({
    'any.required': 'Question is required.',
  }),
  answer: Joi.any().required().messages({
    'any.required': 'Answer is required.',
  })  
});

export const faqUpdateSchema = Joi.object({
question: Joi.any().required().messages({
    'any.required': 'Question is required.',
  }),
  answer: Joi.any().required().messages({
    'any.required': 'Answer is required.',
  }),
  faq_id:Joi.any().required().messages({
    'any.required': 'FAQ Id is required.',
  })
});

export const faqDeleteSchema = Joi.object({
  faq_ids: Joi.array().required(),
})

