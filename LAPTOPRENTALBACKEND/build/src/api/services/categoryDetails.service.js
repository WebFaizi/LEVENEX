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
exports.getCategoryDetails = void 0;
const city_schema_1 = __importDefault(require("../domain/schema/city.schema"));
const area_schema_1 = __importDefault(require("../domain/schema/area.schema"));
const category_schema_1 = __importDefault(require("../domain/schema/category.schema"));
const ReplaceText_service_1 = require("../services/ReplaceText.service");
const slugify_1 = __importDefault(require("slugify"));
function replaceAnchorHrefWithLocation(metaDescription, currentUrl) {
    if (!metaDescription || !metaDescription.includes('<a'))
        return metaDescription || '';
    return metaDescription.replace(/<a\s+[^>]*href=(["'])([^"']*setdynamicurl[^"']*)\1([^>]*)>(.*?)<\/a>/gi, `<a href="${currentUrl}"$3>$4</a>`);
}
const getCategoryDetails = (categoryId, categoryType, locationDetails) => __awaiter(void 0, void 0, void 0, function* () {
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
        const category = yield category_schema_1.default.findOne({ _id: categoryId }).lean();
        if (!category) {
            return { error: "Category not found" };
        }
        // ✅ Replace placeholders in all meta fields asynchronously
        const slugPart = (0, slugify_1.default)(`${category.slug} ${replacements_location.location}`, {
            lower: true,
            strict: true, // remove special characters
        });
        const url = process.env.BASE_URL_TWO + '/' + slugPart + '/' + category.unique_id;
        category.description = yield replaceAnchorHrefWithLocation(category.description, url);
        yield Promise.all([
            category.description && (category.description = yield (0, ReplaceText_service_1.replacePlaceholders)(category.description, replacements_location)),
            category.subdomain_description && (category.subdomain_description = yield (0, ReplaceText_service_1.replacePlaceholders)(category.subdomain_description, replacements_location)),
            category.page_top_descritpion && (category.page_top_descritpion = yield (0, ReplaceText_service_1.replacePlaceholders)(category.page_top_descritpion, replacements_location)),
            category.page_top_keyword && (category.page_top_keyword = yield (0, ReplaceText_service_1.replacePlaceholders)(category.page_top_keyword, replacements_location)),
        ]);
        const baseUrl = process.env.BASE_URL || "https://api.latoprental.co";
        // Assuming `category.desktop_image` is a filename or relative path like "image.jpg"
        category.desktop_image = `${baseUrl}/${category.desktop_image}`;
        category.mobile_image = `${baseUrl}/${category.mobile_image}`;
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
exports.getCategoryDetails = getCategoryDetails;
exports.default = exports.getCategoryDetails;
//# sourceMappingURL=categoryDetails.service.js.map