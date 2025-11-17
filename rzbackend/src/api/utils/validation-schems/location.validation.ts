import Joi from 'joi';

export const countryStoreSchema = Joi.object({
    name: Joi.string().min(3).required(),
    country_id: Joi.string()
});

export const deleteCountrySchema = Joi.object({
    country_ids: Joi.array().required(),
})

export const searchCityAreaValidation = Joi.object({
    location: Joi.string().required(),
})

export const submitContactUsFormValidation = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    subject: Joi.string().required(),
})

export const statusStoreSchema = Joi.object({
    name: Joi.string().min(3).required(),
    country_id: Joi.string().required(),
    state_id: Joi.string(),
})

export const deleteStateSchema = Joi.object({
    state_ids: Joi.array().required(),
})

export const cityStoreSchema = Joi.object({
    name: Joi.string().min(3).required(),
    state_id: Joi.string().required(),
    city_id: Joi.string(),
})

export const deleteCitySchema = Joi.object({
    city_ids: Joi.array().required(),
})

export const areaStoreSchema = Joi.object({
    name: Joi.string().min(3).required(),
    city_id: Joi.string().required(),
    area_id: Joi.string(),
})

export const deleteAreaSchema = Joi.object({
    area_ids: Joi.array().required(),
})



