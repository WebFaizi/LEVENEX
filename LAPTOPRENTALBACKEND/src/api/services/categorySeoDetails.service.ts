import City from "../domain/schema/city.schema";
import Area from "../domain/schema/area.schema";
import categorySchema from "../domain/schema/category.schema";
import categorySeoSchema from "../domain/schema/categoryseo.schema";
import { replacePlaceholders } from "../services/ReplaceText.service";
import mongoose from "mongoose";

export const getCategorySeoDetails = async (
    categoryId: number | null,
    categoryType: number | null,
    locationDetails: { area_name?: string; city_name?: string } | null
): Promise<object> => {
    try {
        if (!categoryId) {
            return { error: "Category ID is required" };
        }

        // ✅ Define placeholders for replacement
        const replacements_location = {
            area: locationDetails?.area_name || "",
            city: locationDetails?.city_name || "",
            location: locationDetails?.area_name || locationDetails?.city_name || "",
            location1: locationDetails?.area_name || locationDetails?.city_name || "",
        };

        // ✅ Fetch category SEO details
        const category = await categorySeoSchema.findOne({ category_id: categoryId }).lean();
        if (!category) {
            return { error: "Category not found" };
        }
        

        // ✅ Replace placeholders in all meta fields asynchronously
        await Promise.all([
            category.page_title && (category.page_title = await replacePlaceholders(category.page_title, replacements_location)),
            category.meta_title && (category.meta_title = await replacePlaceholders(category.meta_title, replacements_location)),
            category.meta_description && (category.meta_description = await replacePlaceholders(category.meta_description, replacements_location)),
            category.meta_keywords && (category.meta_keywords = await replacePlaceholders(category.meta_keywords, replacements_location)),
            category.search_by_keyword && (category.search_by_keyword = await replacePlaceholders(category.search_by_keyword, replacements_location)),
            category.search_by_keyword_meta_des && (category.search_by_keyword_meta_des = await replacePlaceholders(category.search_by_keyword_meta_des, replacements_location)),
            category.search_by_keyword_meta_keyword && (category.search_by_keyword_meta_keyword = await replacePlaceholders(category.search_by_keyword_meta_keyword, replacements_location))
        ]);
        // ✅ Lookup location (city/area) correctly
        let location = null;
        if (locationDetails) {
            location = await City.findOne({ name: locationDetails.city_name }).lean()
                || await Area.findOne({ name: locationDetails.area_name }).lean();
        }

        return category;
    } catch (error) {
        console.error("Error fetching category details:", error);
        return { error: "Failed to fetch category details" };
    }
};

export default getCategorySeoDetails;
