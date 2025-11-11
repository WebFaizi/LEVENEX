import { loggerMsg } from "../../lib/logger";
import categorySchema from "../schema/category.schema";
import citySchema from "../schema/city.schema";
import areaSchema from "../schema/area.schema";
import premiumRequest from "../schema/premiumRequest.schema";
import categorySearch from "../schema/categorySearch.schema";
import { PipelineStage } from "mongoose";

interface SitemapEntry {
  title: string;
  url: string;
}
interface premiumDetailsInterface {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  subject: string;
}

/**
 * Convert a string into a URL-friendly slug
 */
const slugify = (text: string): string =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^a-z0-9\-]/g, "") // Remove all non-alphanumeric and -
    .replace(/-+/g, "-"); // Replace multiple - with single -

/**
 * Generate a paginated slice of sitemap entries for category + location combinations,
 * without building the full list in memory.
 * @param page - 1-based page number of the slice
 * @param limit - number of entries per page
 * @returns Array of SitemapEntry objects for the given page
 */

export const categorySearchCountListModel = async (
  search: string,
  page: number,
  limit: number
) => {
  try {
    const skip = (page - 1) * limit;

    // Search match condition
    const matchStage: any[] = [];

    if (search) {
      matchStage.push({
        $match: {
          "category.name": { $regex: search, $options: "i" },
        },
      });
    }

    const pipeline = [
      {
        $lookup: {
          from: "categories",
          localField: "category_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      ...matchStage,
      {
        $group: {
          _id: {
            category_id: "$category._id",
            name: "$category.name",
            slug: "$category.slug",
            unique_id: "$category.unique_id",
            image: "$category.image",
            year: { $year: "$search_date" },
            month: { $month: "$search_date" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          category_id: "$_id.category_id",
          category_name: "$_id.name",
          slug: "$_id.slug",
          unique_id: "$_id.unique_id",
          image: "$_id.image",
          count: 1,
          formatted_month: {
            $concat: [
              {
                $arrayElemAt: [
                  [
                    "",
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December",
                  ],
                  "$_id.month",
                ],
              },
              ", ",
              { $toString: "$_id.year" },
            ],
          },
        },
      },
      { $sort: { count: -1, formatted_month: -1, category_name: 1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    // Count pipeline (for pagination)
    const countPipeline = [
      {
        $lookup: {
          from: "categories",
          localField: "category_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      ...matchStage,
      {
        $group: {
          _id: {
            category_id: "$category._id",
            year: { $year: "$search_date" },
            month: { $month: "$search_date" },
          },
        },
      },
      { $count: "total" },
    ];

    const [results, countResult] = await Promise.all([
      categorySearch.aggregate(pipeline),
      categorySearch.aggregate(countPipeline),
    ]);

    const totalCategories = countResult[0]?.total || 0;

    return {
      data: results,
      totalCategories,
      totalPages: Math.ceil(totalCategories / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error in categorySearchCountListModel:", error);
    throw new Error("Error fetching month-wise category search count");
  }
};

export const categoriesTopListing = async () => {
  try {
    const pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: "categories",
          localField: "category_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $group: {
          _id: {
            category_id: "$category._id",
            name: "$category.name",
            slug: "$category.slug",
            unique_id: "$category.unique_id",
            image: "$category.image",
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          category_id: "$_id.category_id",
          category_name: "$_id.name",
          slug: "$_id.slug",
          unique_id: "$_id.unique_id",
          image: "$_id.image",
          count: 1,
        },
      },
      { $sort: { count: -1, category_name: 1 } },
      { $limit: 15 },
    ];

    // Count pipeline (for pagination)
    const countPipeline = [
      {
        $lookup: {
          from: "categories",
          localField: "category_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $group: {
          _id: "$category._id",
        },
      },
      { $count: "total" },
    ];

    const [results, countResult] = await Promise.all([
      categorySearch.aggregate(pipeline),
      categorySearch.aggregate(countPipeline),
    ]);

    const totalCategories = countResult[0]?.total || 0;

    return {
      data: results,
      totalCategories,
    };
  } catch (error) {
    console.error("Error in categorySearchCountListModel:", error);
    throw new Error("Error fetching month-wise category search count");
  }
};

export const storeCategorySearchCountModel = async (
  categoryId: string,
  callback: (error: any, result: any) => void
) => {
  try {
    const category = await categorySchema
      .findOne({ unique_id: categoryId })
      .lean();
    if (!category) {
      return callback(new Error("Category not found"), null);
    }

    const today = new Date();
    const dateOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const newSearch = new categorySearch({
      category_id: category._id,
      search_date: dateOnly,
    });

    const savedEntry = await newSearch.save();
    return callback(null, savedEntry);
  } catch (error) {
    console.error("Error storing category search count:", error);
    return callback(error, null);
  }
};

export const generateFrontendSitemapUrl = async (
  page: number,
  limit: number
): Promise<{
  entries: SitemapEntry[];
  totalPages: number;
  currentPage: number;
  totalUrls: number;
}> => {
  try {
    // Fetch all categories, cities, and areas
    const [categories, cities, areas] = await Promise.all([
      categorySchema.find().lean(),
      citySchema.find().select("name").lean(),
      areaSchema.find().select("name").lean(),
    ]);

    const basePath = process.env.BASE_URL_TWO || "basedd";

    // Build locations array
    const locations = [
      ...cities.map((c) => c.name),
      ...areas.map((a) => a.name),
    ];

    const catCount = categories.length;
    const locCount = locations.length;
    const totalCombinations = catCount * locCount;

    const totalPages = Math.ceil(totalCombinations / limit);

    // Calculate start and end index
    const startIdx = (page - 1) * limit;
    if (startIdx >= totalCombinations) {
      return {
        entries: [],
        totalPages,
        currentPage: page,
        totalUrls: totalCombinations,
      };
    }

    const endIdx = Math.min(startIdx + limit, totalCombinations);
    const entries: SitemapEntry[] = [];

    // Generate only the required slice
    for (let idx = startIdx; idx < endIdx; idx++) {
      const catIndex = Math.floor(idx / locCount);
      const locIndex = idx % locCount;
      const cat = categories[catIndex];
      const loc = locations[locIndex];
      const catSlug = slugify(cat.slug);
      const locSlug = slugify(loc);
      const title = `${cat.name} in ${loc}`;
      const url = `${basePath}/${catSlug}-${locSlug}/1`;
      entries.push({ title, url });
    }

    return {
      entries,
      totalPages,
      currentPage: page,
      totalUrls: totalCombinations,
    };
  } catch (error) {
    console.error("Error generating paginated sitemap URLs:", error);
    throw error;
  }
};

export const storePremiumRequestModel = async (
  premiumDetails: premiumDetailsInterface,
  callback: (error: any, result: any) => void
) => {
  try {
    const newBlog = new premiumRequest({
      first_name: premiumDetails.first_name,
      last_name: premiumDetails.last_name,
      email: premiumDetails.email,
      phone_number: premiumDetails.phone_number,
      subject: premiumDetails.subject,
    });

    const savedBlog = await newBlog.save();

    return callback(null, { savedBlog });
  } catch (error) {
    console.error("Error storing blog:", error);
    return callback(error, null);
  }
};
export const listingSlugWiseResponse = async (
  search: string,
  page: number,
  limit: number
) => {
  try {
    const searchQuery = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { slug: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const skip = (page - 1) * limit;

    const users = await categorySchema
      .find(searchQuery)
      .skip(skip)
      .limit(limit)
      .exec();

    const totalUsers = await categorySchema.countDocuments(searchQuery);

    return {
      data: users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
    };
  } catch (error) {
    // return callback(error, null);
  }
};
