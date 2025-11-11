import Joi from "joi";

export const updateNewsletterValidation = Joi.object({
    newsletter_banner_image: Joi.optional(),
    newsletter_description: Joi.string().messages({
        'any.required': 'Newsletter Description is required.',
    }),
    newsletter_listing_id:Joi.optional()
});