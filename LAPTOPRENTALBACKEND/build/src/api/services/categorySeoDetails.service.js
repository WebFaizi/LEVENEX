"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategorySeoDetails = void 0;
const city_schema_1 = __importDefault(require("../domain/schema/city.schema"));
const area_schema_1 = __importDefault(require("../domain/schema/area.schema"));
const categoryseo_schema_1 = __importDefault(require("../domain/schema/categoryseo.schema"));
const ReplaceText_service_1 = require("../services/ReplaceText.service");
const getCategorySeoDetails = (categoryId, categoryType, locationDetails) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!categoryId) {
            return { error: "Category ID is required" };
        }
        // ✅ Define placeholders for replacement
        const replacements_location = {
            area: (locationDetails === null || locationDetails === void 0 ? void 0 : locationDetails.area_name) || "",
            city: (locationDetails === null || locationDetails === void 0 ? void 0 : locationDetails.city_name) || "",
            location: (locationDetails === null || locationDetails === void 0 ? void 0 : locationDetails.area_name) || (locationDetails === null || locationDetails === void 0 ? void 0 : locationDetails.city_name) || "",
            location1: (locationDetails === null || locationDetails === void 0 ? void 0 : locationDetails.area_name) || (locationDetails === null || locationDetails === void 0 ? void 0 : locationDetails.city_name) || "",
        };
        // ✅ Fetch category SEO details
        const category = yield categoryseo_schema_1.default.findOne({ category_id: categoryId }).lean();
        if (!category) {
            return { error: "Category not found" };
        }
        // ✅ Replace placeholders in all meta fields asynchronously
        yield Promise.all([
            category.page_title && (category.page_title = yield (0, ReplaceText_service_1.replacePlaceholders)(category.page_title, replacements_location)),
            category.meta_title && (category.meta_title = yield (0, ReplaceText_service_1.replacePlaceholders)(category.meta_title, replacements_location)),
            category.meta_description && (category.meta_description = yield (0, ReplaceText_service_1.replacePlaceholders)(category.meta_description, replacements_location)),
            category.meta_keywords && (category.meta_keywords = yield (0, ReplaceText_service_1.replacePlaceholders)(category.meta_keywords, replacements_location)),
            category.search_by_keyword && (category.search_by_keyword = yield (0, ReplaceText_service_1.replacePlaceholders)(category.search_by_keyword, replacements_location)),
            category.search_by_keyword_meta_des && (category.search_by_keyword_meta_des = yield (0, ReplaceText_service_1.replacePlaceholders)(category.search_by_keyword_meta_des, replacements_location)),
            category.search_by_keyword_meta_keyword && (category.search_by_keyword_meta_keyword = yield (0, ReplaceText_service_1.replacePlaceholders)(category.search_by_keyword_meta_keyword, replacements_location))
        ]);
        // ✅ Lookup location (city/area) correctly
        let location = null;
        if (locationDetails) {
            location = (yield city_schema_1.default.findOne({ name: locationDetails.city_name }).lean())
                || (yield area_schema_1.default.findOne({ name: locationDetails.area_name }).lean());
        }
        return category;
    }
    catch (error) {
        console.error("Error fetching category details:", error);
        return { error: "Failed to fetch category details" };
    }
});
exports.getCategorySeoDetails = getCategorySeoDetails;
exports.default = exports.getCategorySeoDetails;
//# sourceMappingURL=categorySeoDetails.service.js.map