import City from "../domain/schema/city.schema";
import Area from "../domain/schema/area.schema";
import categorySchema from "../domain/schema/category.schema";
import { replacePlaceholders } from "../services/ReplaceText.service";
import mongoose from "mongoose";
import slugify from "slugify";

function replaceAnchorHrefWithLocation(
  metaDescription: string | undefined,
  currentUrl: string
): string {
  if (!metaDescription || !metaDescription.includes("<a"))
    return metaDescription || "";

  return metaDescription.replace(
    /<a\s+[^>]*href=(["'])([^"']*setdynamicurl[^"']*)\1([^>]*)>(.*?)<\/a>/gi,
    `<a href="${currentUrl}"$3>$4</a>`
  );
}

export const getCategoryDetailswithReleted = async (
  categoryId: string | null,
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
    // const category = await categorySchema.findOne({ _id: categoryId }).lean();
    const categoryCheck = await categorySchema.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(categoryId),
        },
      },
      {
        $addFields: {
          related_categories_numbers: {
            $map: {
              input: "$related_categories",
              as: "rc",
              in: { $toInt: "$$rc" },
            },
          },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "related_categories_numbers",
          foreignField: "unique_id",
          as: "related_categories",
        },
      },
      {
        $project: {
          related_categories_numbers: 0, // hide temp field
        },
      },
    ]);    
    const category = categoryCheck[0];
    if (!category) {
      return { error: "Category not found" };
    }

    // ✅ Replace placeholders in all meta fields asynchronously
    const slugPart = slugify(
      `${category?.slug} ${replacements_location.location}`,
      {
        lower: true,
        strict: true, // remove special characters
      }
    );
    const url =
      process.env.BASE_URL_TWO + "/" + slugPart + "/" + category.unique_id;
    category.description = await replaceAnchorHrefWithLocation(
      category.description,
      url
    );
    await Promise.all([
      category.description &&
        (category.description = await replacePlaceholders(
          category.description,
          replacements_location
        )),
      category.subdomain_description &&
        (category.subdomain_description = await replacePlaceholders(
          category.subdomain_description,
          replacements_location
        )),
      category.page_top_descritpion &&
        (category.page_top_descritpion = await replacePlaceholders(
          category.page_top_descritpion,
          replacements_location
        )),
      category.page_top_keyword &&
        (category.page_top_keyword = await replacePlaceholders(
          category.page_top_keyword,
          replacements_location
        )),
    ]);
    const baseUrl = process.env.BASE_URL || "https://api.latoprental.co";

    // Assuming `category.desktop_image` is a filename or relative path like "image.jpg"
    category.desktop_image = `${baseUrl}/${category.desktop_image}`;
    category.mobile_image = `${baseUrl}/${category.mobile_image}`;
    // ✅ Lookup location (city/area) correctly
    let location = null;
    if (locationDetails) {
      location =
        (await City.findOne({ name: locationDetails.city_name }).lean()) ||
        (await Area.findOne({ name: locationDetails.area_name }).lean());
    }    
    return category;
  } catch (error) {
    console.error("Error fetching category details:", error);
    return { error: "Failed to fetch category details" };
  }
};

export default getCategoryDetailswithReleted;
