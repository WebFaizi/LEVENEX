import Joi from 'joi';

export const redirectsUrlStoreSchema = Joi.object({
    from_url: Joi.string().uri().min(3).required(), 
    to_url: Joi.string().uri().required(),   
    redirect_id: Joi.string().optional(),
});

export const deleteRedircetsUrlValidation = Joi.object({
    type: Joi.number()
        .valid(1, 2)
        .required()
        .messages({
            'number.base': '"type" should be an integer.',
            'any.required': '"type" is a required field.',
            'any.only': '"type" must be either 1 (delete selected) or 2 (delete all).',
        }),
        url_ids: Joi.alternatives()
        .conditional('type', {
            is: 1, 
            then: Joi.array()
                .items(Joi.string().required())
                .min(1)
                .required()
                .messages({
                    'array.base': '"url_ids" should be an array.',
                    'array.min': '"url_ids" must contain at least one ID when type is 1.',
                    'any.required': '"url_ids" is required when type is 1.',
                }),
            otherwise: Joi.forbidden(), 
        }),
});
