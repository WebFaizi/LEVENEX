"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAreaSchema = exports.areaStoreSchema = exports.deleteCitySchema = exports.cityStoreSchema = exports.deleteStateSchema = exports.statusStoreSchema = exports.submitContactUsFormValidation = exports.searchCityAreaValidation = exports.deleteCountrySchema = exports.countryStoreSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.countryStoreSchema = joi_1.default.object({
    name: joi_1.default.string().min(3).required(),
    country_id: joi_1.default.string()
});
exports.deleteCountrySchema = joi_1.default.object({
    country_ids: joi_1.default.array().required(),
});
exports.searchCityAreaValidation = joi_1.default.object({
    location: joi_1.default.string().required(),
});
exports.submitContactUsFormValidation = joi_1.default.object({
    name: joi_1.default.string().required(),
    email: joi_1.default.string().required(),
    subject: joi_1.default.string().required(),
});
exports.statusStoreSchema = joi_1.default.object({
    name: joi_1.default.string().min(3).required(),
    country_id: joi_1.default.string().required(),
    state_id: joi_1.default.string(),
});
exports.deleteStateSchema = joi_1.default.object({
    state_ids: joi_1.default.array().required(),
});
exports.cityStoreSchema = joi_1.default.object({
    name: joi_1.default.string().min(3).required(),
    state_id: joi_1.default.string().required(),
    city_id: joi_1.default.string(),
});
exports.deleteCitySchema = joi_1.default.object({
    city_ids: joi_1.default.array().required(),
});
exports.areaStoreSchema = joi_1.default.object({
    name: joi_1.default.string().min(3).required(),
    city_id: joi_1.default.string().required(),
    area_id: joi_1.default.string(),
});
exports.deleteAreaSchema = joi_1.default.object({
    area_ids: joi_1.default.array().required(),
});
//# sourceMappingURL=location.validation.js.map