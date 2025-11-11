import City from "../domain/schema/city.schema";
import Area from "../domain/schema/area.schema";
import categorySchema from "../domain/schema/category.schema";
import slugify from "slugify";

export const getPopulerArealist = async (
    categoryId: string | null,
    categoryType: number | null,
    locationDetails: { area_name?: string; city_name?: string } | null
): Promise<object> => {
    try {
        if (!categoryId) return { error: "Category ID is required" };

        const city_name = locationDetails?.city_name || "";
        if (!city_name) return { error: "City name is required" };

        // Fetch category details
        const category = await categorySchema.findById(categoryId);
        if (!category) return { error: "Category not found" };

        const categoryName = category.name;
        const categorySlug = slugify(categoryName, { lower: true });

        // Fetch city by name
        const city = await City.findOne({ name: new RegExp(`^${city_name}$`, "i") });
        if (!city) return { error: "City not found" };

        // Get 10 random areas from this city
        const areas = await Area.aggregate([
            { $match: { city_id: city.unique_id } },
            { $sample: { size: 15 } }
        ]);

        // Format each area
        const formattedAreas = areas.map((area: any) => {
            const areaName = area.name;
            const combinedName = `${categoryName} in ${areaName}`;
            const areaSlug = slugify(areaName, { lower: true });
            const categorySlug = slugify(category.slug, { lower: true });
        
            const finalSlug = `${categorySlug}-${areaSlug}/${category.unique_id}`;
        
            return {
                name: combinedName,
                url: `${process.env.BASE_URL}/${finalSlug}`,
            };
        });
        

        return { area: formattedAreas };
    } catch (error) {
        console.error("Error fetching area list:", error);
        return { error: "Failed to fetch area list" };
    }
};

export default getPopulerArealist;
