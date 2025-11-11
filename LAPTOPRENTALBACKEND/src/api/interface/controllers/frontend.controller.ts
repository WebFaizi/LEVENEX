import e, { Request, Response } from "express";
import NodeCache from "node-cache";
import slugify from "slugify";
import { ParsedQs } from "qs";
import {
  successCreated,
  successResponse,
  ErrorResponse,
} from "../../helper/apiResponse";
import {
  listingSlugWiseResponse,
  generateFrontendSitemapUrl,
  storePremiumRequestModel,
  storeCategorySearchCountModel,
  categorySearchCountListModel,
} from "../../domain/models/frontend.model";
import categorySchema from "../../domain/schema/category.schema";
import categorySeoSchema from "../../domain/schema/categoryseo.schema";
import staticPageSchema from "../../domain/schema/staticPage.schema";
import citySchema from "../../domain/schema/city.schema";
import listingSchema from "../../domain/schema/listing.schema";
import subscribersSchema from "../../domain/schema/subscribers.schema";
import areaSchema from "../../domain/schema/area.schema";
import { getLocationDetails } from "../../services/currentLocation.service";
import { getCategoryDetails } from "../../services/categoryDetails.service";
import { getCategorySeoDetails } from "../../services/categorySeoDetails.service";
import { getPopulerArealist } from "../../services/populerAreaList.service";
import { getListingDetailsData } from "../../services/listingDetailsData.service";
import { getProductsByCategory } from "../../services/productListingByCategory.service";
import { getProductsByListing } from "../../services/productListByListing.service";
import { getProductById } from "../../services/productListById.service";
import getAdsBanners from "../../services/banners.service";
import { searchListings } from "../../services/categoryListing.service";
import { getLocationDetailsByName } from "../../services/getLocationDetailsByName.service";
import { ListingWiseReviewList } from "../../domain/models/listing.model";
import { BlogWiseReviewList } from "../../domain/models/blog.model";
import { submitContactUsFormModel } from "../../domain/models/contactus.model";
import {
  categoryListFrontend,
  getJobDetailByUniqueId,
  getJoblistingFrontendModel,
  getJobDetailFrontendModel,
} from "../../domain/models/JobCategory.model";

import { string } from "joi";
import { error } from "console";
import mongoose from "mongoose";
import JobsSchema from "../../domain/schema/jobs.schema";
import BlogsSchema from "../../domain/schema/blog.schema";
import getCategoryDetailswithReleted from "../../services/categoryDetailswithreled.service";
import Products from "../../domain/schema/product.schema";

const cache = new NodeCache({ stdTTL: 300 }); // Cache entries expire after 5 minutes
export default cache;

export const categorySearchCountList = async (req: Request, res: Response) => {
  try {
    const { search = "", page = 1, limit = 10, url_slug } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const categories = await categorySearchCountListModel(
      search as string,
      pageNum,
      limitNum
    );
    return successResponse(
      res,
      "get category wise Listing list successfully",
      categories
    );
  } catch (error) {
    ErrorResponse(res, "An error occurred during user registration.");
  }
};

export const storeCategorySearchCount = async (req: Request, res: Response) => {
  try {
    storeCategorySearchCountModel(
      req.body.category_id,
      (error: any, result: any) => {
        if (error) {
          ErrorResponse(res, error.message);
        }
        return successResponse(res, "Store search count Successfully", result);
      }
    );
  } catch (error) {
    ErrorResponse(res, "An error occurred during user registration.");
  }
};

export const getSlugWiseResponse = async (req: Request, res: Response) => {
  try {
    const { search = "", page = 1, limit = 10, url_slug } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const categories = await listingSlugWiseResponse(
      search as string,
      pageNum,
      limitNum
    );
    return successResponse(
      res,
      "get category wise Listing list successfully",
      categories
    );
  } catch (error) {
    ErrorResponse(res, "An error occurred during user registration.");
  }
};

export const unsubscribeSite = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const subscriber = await subscribersSchema.findOne({ email });

    if (!subscriber) {
      return ErrorResponse(res, "Email not found in subscribers list.");
    }

    subscriber.status = false;
    await subscriber.save();

    return successResponse(res, "Unsubscribed from site successfully.", {});
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return ErrorResponse(res, "An error occurred during unsubscription.");
  }
};

const resolveCityAreaFromSlug = async (slug: string) => {
  const slugWords = slug.toLowerCase().split("-");
  const slugJoined = slugWords.join("");

  // Load all cities and areas
  const cities = await citySchema.find({}, "name");
  const areas = await areaSchema.find({}, "name");

  const cityList = cities.map((c) => c.name.toLowerCase());
  const areaList = areas.map((a) => a.name.toLowerCase());

  const matchedCities: string[] = [];
  const matchedAreas: string[] = [];

  // Try to match city names in the slug
  for (const city of cityList) {
    const citySlug = city.replace(/\s+/g, ""); // remove spaces
    if (slugJoined.includes(citySlug)) {
      matchedCities.push(city);
    }
  }

  // Try to match area names in the slug
  for (const area of areaList) {
    const areaSlug = area.replace(/\s+/g, ""); // remove spaces
    if (slugJoined.includes(areaSlug)) {
      matchedAreas.push(area);
    }
  }

  // Get all keyword templates from category
  const categories = await categorySeoSchema.find({}, "search_by_keyword");

  for (const category of categories) {
    for (const template of category?.search_by_keyword!) {
      const templateSlug = template
        .toLowerCase()
        .replace(/%city%/g, matchedCities[0]?.replace(/\s+/g, "") || "")
        .replace(/%area%/g, matchedAreas[0]?.replace(/\s+/g, "") || "");

      const templateSlugJoined = templateSlug.split("-").join("");

      if (slugJoined === templateSlugJoined) {
        return {
          city: matchedCities[0] || null,
          area: matchedAreas[0] || null,
          matchedCategory: category._id,
        };
      }
    }
  }

  return {
    city: matchedCities[0] || null,
    area: matchedAreas[0] || null,
    matchedCategory: null,
  };
};

export const storePremiumRequest = async (req: Request, res: Response) => {
  try {
    storePremiumRequestModel(req.body, (error: any, result: any) => {
      if (error) {
        ErrorResponse(res, error.message);
      }
      return successResponse(res, "Admin User register Successfully", result);
    });
  } catch (error) {
    ErrorResponse(res, "An error occurred during user registration.");
  }
};

export const sitemapFronendUrls = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;

    const product_data = await generateFrontendSitemapUrl(page, limit);

    return successResponse(res, "Data retrieved successfully", product_data);
  } catch (error) {
    console.error("Error fetching details:", error);
    return ErrorResponse(res, "Something went wrong");
  }
};

export const getListingWiseReviewList = async (req: Request, res: Response) => {
  try {
    const { listing_id } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    if (!listing_id || typeof listing_id !== "string") {
      return ErrorResponse(res, "Invalid provided listing id");
    }
    let data: Record<string, any> = {};
    const listing_review_list = await ListingWiseReviewList(
      listing_id,
      page,
      limit
    );
    return successResponse(
      res,
      "Data retrieved successfully",
      listing_review_list
    );
  } catch (error) {
    console.error("Error fetching details:", error);
    return ErrorResponse(res, "Something went wrong");
  }
};

export const getBlogWiseReviewList = async (req: Request, res: Response) => {
  try {
    const { blog_id } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    if (!blog_id || typeof blog_id !== "string") {
      return ErrorResponse(res, "Invalid provided listing id");
    }
    let data: Record<string, any> = {};
    const listing_review_list = await BlogWiseReviewList(blog_id, page, limit);
    return successResponse(
      res,
      "Data retrieved successfully",
      listing_review_list
    );
  } catch (error) {
    console.error("Error fetching details:", error);
    return ErrorResponse(res, "Something went wrong");
  }
};

const getQueryString = (
  value: string | string[] | ParsedQs | ParsedQs[] | undefined
): string | null => {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return null;
};

export const getListingCategoryWise = async (req: Request, res: Response) => {
  try {
    const { category_id, current_location_id } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!category_id) {
      return ErrorResponse(res, "Category ID is required");
    }

    const cacheKey = `listing:${category_id}:location:${
      current_location_id || "none"
    }:page:${page}:limit:${limit}`;

    let current_location = {};

    if (current_location_id) {
      current_location = await getLocationDetails(
        current_location_id as string
      );
    }
    const cet_details = await categorySchema
      .findOne({ _id: category_id as string })
      .lean();
    if (!cet_details) {
      return ErrorResponse(res, "Category not found");
    }
    const categoryIdStr = getQueryString(req.query.category_id as string);

    if (!categoryIdStr) {
      return res.status(400).json({ message: "Invalid category_id" });
    }
    const cat_iid = cet_details.unique_id;
    const listing_data = await searchListings(
      [cat_iid],
      current_location,
      page,
      limit
    );

    // Save to cache with 10-minute expiry
    // await cache.set(cacheKey, listing_data);

    return successResponse(res, "Data retrieved successfully", listing_data);
  } catch (error) {
    console.error("Error fetching details:", error);
    return ErrorResponse(res, "Something went wrong");
  }
};

export const getCategoryWiseProductList = async (
  req: Request,
  res: Response
) => {
  try {
    const { category_unique_id } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!category_unique_id) {
      return ErrorResponse(res, "Category ID is required");
    }

    const cacheKey = `category_unique_id:${category_unique_id}:page:${page}:limit:${limit}`;
    const cachedData = await cache.get(cacheKey);

    if (cachedData) {
      return successResponse(res, "Data retrieved from cache", cachedData);
    }

    const listing_data = await getProductsByCategory(
      category_unique_id,
      page,
      limit
    );

    // Save to cache with 10-minute expiry
    await cache.set(cacheKey, listing_data);

    return successResponse(res, "Data retrieved successfully", listing_data);
  } catch (error) {
    console.error("Error fetching details:", error);
    return ErrorResponse(res, "Something went wrong");
  }
};

export const getListingWiseProductList = async (
  req: Request,
  res: Response
) => {
  try {
    const { listing_id } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!listing_id) {
      return ErrorResponse(res, "listing ID is required");
    }

    const cacheKey = `product_listing_id:${listing_id}:page:${page}:limit:${limit}`;
    const cachedData = await cache.get(cacheKey);

    if (cachedData) {
      return successResponse(res, "Data retrieved from cache", cachedData);
    }

    const product_data = await getProductsByListing(listing_id, page, limit);
    // Save to cache with 10-minute expiry
    await cache.set(cacheKey, product_data);

    return successResponse(res, "Data retrieved successfully", product_data);
  } catch (error) {
    console.error("Error fetching details:", error);
    return ErrorResponse(res, "Something went wrong");
  }
};

export const extractCategoryAndLocation = async (
  url_slug: string
): Promise<{
  category: string | null;
  location: any | null;
  category_unique_id: number | null;
  category_name?: string;
}> => {
  if (!url_slug || typeof url_slug !== "string") {
    throw new Error("Invalid slug provided");
  }

  let category: any = null;
  let category_name: string = "";
  let category_unique_id: any = null;
  let location: any = null;

  const parts = url_slug.split("-");

  for (let i = parts.length; i > 0; i--) {
    const possibleCategorySlug = parts.slice(0, i).join("-");
    let possibleLocationSlug = parts.slice(i).join("-");
    const categoryCheck = await categorySchema
      .findOne({ slug: possibleCategorySlug })
      .lean();

    if (categoryCheck) {
      category = categoryCheck._id;
      category_name = categoryCheck.name;
      category_unique_id = Number(categoryCheck.unique_id);
      possibleLocationSlug = possibleLocationSlug.replace(/-/g, " ");

      location = await areaSchema
        .findOne({
          name: { $regex: new RegExp(`^${possibleLocationSlug}$`, "i") },
        })
        .lean();

      if (!location) {
        location = await citySchema
          .findOne({
            name: { $regex: new RegExp(`^${possibleLocationSlug}$`, "i") },
          })
          .lean();
        if (location) {
        }
      }

      if (location) {
        location = location._id;
      }
      break;
    }
  }
  return { category, category_name, location, category_unique_id };
};

const getCitiesFromState = async (state_id: string) => {
  try {
    const cities = await citySchema.find({ state_id }).select("_id").lean(); // Get city IDs from the state
    return cities.map((city) => city._id); // Return an array of city IDs
  } catch (error) {
    console.error("Error fetching cities from state:", error);
    return [];
  }
};

const getAreaFromCity = async (city_id: string) => {
  try {
    const cities = await areaSchema.find({ city_id }).select("_id").lean(); // Get city IDs from the state
    return cities.map((city) => city._id); // Return an array of city IDs
  } catch (error) {
    console.error("Error fetching cities from state:", error);
    return [];
  }
};

const getAreaDetails = async (area_id: string) => {
  try {
    const area = await areaSchema
      .findOne({ unique_id: area_id })
      .select("_id")
      .lean();
    return area?._id || null;
  } catch (error) {
    console.error("Error fetching area:", error);
    return [];
  }
};

const getCityDetails = async (city_id: string) => {
  try {
    const city = await citySchema
      .findOne({ unique_id: city_id })
      .select("_id")
      .lean();
    return city?._id || null;
  } catch (error) {
    console.error("Error fetching city:", error);
    return [];
  }
};

const extractLocationFromSlug = async (slug: string) => {
  const cleanedSlug = slug
    .replace(/^jobs-/, "") // remove "jobs-" prefix
    .replace(/-\d+$/, "") // remove trailing ID
    .toLowerCase();

  const slugWords = new Set(cleanedSlug.split("-")); // use Set for faster lookup

  // Cache cities and areas to avoid repeated DB calls
  const cities = await citySchema.find({}, "name"); // just get name field
  const areas = await areaSchema.find({}, "name");

  let matchedCity = "";
  let matchedArea = "";

  // Match area (support multi-word like "central mumbai")
  for (const area of areas) {
    const areaWords = area.name.toLowerCase().split(" ");
    // Check if all area words exist in the slugWords Set
    if (areaWords.every((word) => slugWords.has(word))) {
      matchedArea = area.name;
      break;
    }
  }

  // Match city
  for (const city of cities) {
    const cityName = city.name.toLowerCase();
    // Check if the city exists in the slugWords Set
    if (slugWords.has(cityName)) {
      matchedCity = city.name;
      break;
    }
  }

  // Return matched area if available, else return matched city
  return matchedArea || matchedCity || "mumbai"; // return null if neither matched
};

export const getListingDetails_data = async (req: Request, res: Response) => {
  try {
    const { url_slug, location_query } = req.query;
    const check_result = await resolveCityAreaFromSlug(url_slug as string);
    return check_result;
  } catch (error) {
    return error;
  }
};

export const getListingDetails = async (req: Request, res: Response) => {
  try {
    const { url_slug, location_query } = req.query;
    const cacheKey = `listingDetails:${url_slug}:${location_query}`;

    let location_query_id = (location_query as string) || "";
    let current_location: Record<string, any> = {};

    // Check if data is in cache
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return successResponse(
        res,
        "Data retrieved successfully (from cache)",
        cachedData
      );
    }

    if (!url_slug || typeof url_slug !== "string") {
      return ErrorResponse(res, "Invalid slug provided");
    }

    let data: Record<string, any> = {};
    if (
      url_slug.includes("/") &&
      !url_slug.startsWith("product-list-") &&
      !url_slug.startsWith("pro-") &&
      !url_slug.includes("-jobs-in-") &&
      !url_slug.includes("jobs-")
    ) {
      data.type = "category_location";
      const [categorySlug] = url_slug.split("/");
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const category_type = 1;

      const { category, location, category_unique_id } =
        await extractCategoryAndLocation(categorySlug);

      if (location) {
        current_location = await getLocationDetails(location);
        data.current_location = current_location;
      }

      if (page == 1) {
        const [category_details, populer_areas_res, listing_data_res] =
          await Promise.all([
            getCategoryDetails(category, category_type, current_location),
            getPopulerArealist(category, category_type, current_location),
            searchListings(
              [category_unique_id as number],
              current_location,
              page,
              limit
            ),
          ]);

        data.populer_areas = populer_areas_res;
        data.listing_data = listing_data_res;
        data.category_details = category_details;
      } else {
        data.listing_data = await searchListings(
          [category_unique_id as number],
          current_location,
          page,
          limit
        );
      }
    } else if (
      typeof url_slug == "string" &&
      url_slug.includes("product-list-")
    ) {
      const [categorySlug, category_id] = url_slug
        .replace("product-list-", "")
        .split("/");
      const category_details = await categorySchema
        .findOne({ unique_id: category_id })
        .lean();
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      if (/^\d+$/.test(category_id)) {
        data = {
          type: "product_listing",
          category_id,
          category_details,
          products: await getProductsByCategory(category_id, page, limit),
        };
      }
    } else if (typeof url_slug == "string" && url_slug.includes("-jobs-in-")) {
      const [categorySlug, category_id] = url_slug.split("/");
      const parts = categorySlug.split("jobs-in-");
      const converted_location = parts.length > 1 ? parts[1] : "";
      const current_location = converted_location
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
      const location_details = await getLocationDetailsByName(current_location);
      if (/^\d+$/.test(category_id)) {
        const category_list = await categoryListFrontend(
          "",
          1,
          1000,
          location_details.current_location_id
        );
        let current_location_string;
        if (location_details.area_name) {
          current_location_string = location_details.area_name;
        } else {
          current_location_string = location_details.city_name;
        }
        data = {
          type: "job_listing",
          category_list: category_list.data,
          categorty_details: await getJobDetailByUniqueId(category_id),
          current_location: location_details,
          job_list: await getJoblistingFrontendModel(
            location_details ?? {},
            category_id,
            1,
            10
          ),
        };
      }
    } else if (typeof url_slug == "string" && url_slug.includes("jobs-")) {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const slugParts = url_slug.split("-");
      const jobId = slugParts[slugParts.length - 1];
      const find_location = await extractLocationFromSlug(url_slug);
      current_location = await getLocationDetailsByName(find_location);

      // Fetch ads and products in parallel
      const [job_detail] = await Promise.all([
        getJobDetailFrontendModel(jobId, current_location),
      ]);
      data = {
        type: "job_details",
        current_location,
        job_detail,
      };
    } else if (url_slug.startsWith("pro-")) {
      const slugParts = url_slug.split("-");
      const lastPart = slugParts[slugParts.length - 1];

      if (/^\d+$/.test(lastPart)) {
        const product_id = parseInt(lastPart);
        const product_details: any = await getProductById(product_id);
        if (!product_details) return;
        const product_data = product_details.product_listing_id;
        let listing_details: Record<string, any> = {};
        listing_details = await getListingDetailsData(
          parseInt(product_data as string, 10)
        );

        // Determine locationPromise based on listing settings
        let locationPromise: Promise<string> = Promise.resolve("");
        if (
          listing_details.is_area_all_selected &&
          listing_details.is_city_all_selected
        ) {
          locationPromise = getCitiesFromState(
            listing_details.state_id?.unique_id
          ).then((cities) => String(cities?.[0] || ""));
        } else if (listing_details.is_area_all_selected) {
          locationPromise = getAreaFromCity(
            listing_details.city_id[0]?.unique_id
          ).then((areas) =>
            String(areas?.[0] || listing_details?.area_id?._id || "")
          );
        } else if (!listing_details.is_area_all_selected) {
          locationPromise = Promise.resolve(
            String(listing_details.area_id._id || "")
          );
        } else if (!listing_details.is_city_all_selected) {
          locationPromise = Promise.resolve(
            String(listing_details.city_id?.[0]?._id || "")
          );
        }
        // Fetch review + location in parallel
        const [location_id] = await Promise.all([locationPromise]);

        const current_location = await getLocationDetails(
          location_query_id || location_id
        );

        data = {
          type: "product_details",
          product_details,
          current_location,
          listing_details,
        };
      }
    } else if (url_slug.includes("-")) {
      const slugParts = url_slug.split("-");
      const lastPart = slugParts[slugParts.length - 1];

      if (/^\d+$/.test(lastPart)) {
        const listing_id = parseInt(lastPart);
        let listing_details: Record<string, any> = {};
        listing_details = await getListingDetailsData(listing_id);
        if (!listing_details) return; // Early return on failure
        // Prepare review promise
        const reviewPromise = ListingWiseReviewList(listing_details._id, 1, 10);

        // Determine locationPromise based on listing settings
        let locationPromise: Promise<string> = Promise.resolve("");
        if (
          listing_details.is_area_all_selected &&
          listing_details.is_city_all_selected
        ) {
          locationPromise = getCitiesFromState(
            listing_details.state_id?.unique_id
          ).then((cities) => String(cities?.[0] || ""));
        } else if (listing_details.is_area_all_selected) {
          locationPromise = getAreaFromCity(
            listing_details.city_id[0]?.unique_id
          ).then((areas) => String(areas?.[0] || listing_details.area_id));
        } else if (!listing_details.is_area_all_selected) {
          locationPromise = Promise.resolve(
            String(listing_details?.area_id?._id || "")
          );
        } else if (!listing_details.is_city_all_selected) {
          locationPromise = Promise.resolve(
            String(listing_details?.city_id?.[0]?._id || "")
          );
        }

        // Fetch review + location in parallel
        const [listing_review_list, location_id] = await Promise.all([
          reviewPromise,
          locationPromise,
        ]);

        const current_location = await getLocationDetails(
          location_query_id || location_id
        );

        // Fetch ads and products in parallel
        const [product_data] = await Promise.all([
          getProductsByListing(listing_details?.listing_unique_id, 1, 10),
        ]);

        data = {
          type: "listing_details",
          current_location,
          listing_details,
          listing_review_list,
          product_data,
        };
      }
    }

    return successResponse(res, "Data retrieved successfully", data);
  } catch (error) {
    console.error("Error fetching details:", error);
    return ErrorResponse(res, "Something went wrong");
  }
};

export const getListingStaticData = async (req: Request, res: Response) => {
  try {
    const { url_slug, location_query } = req.query;
    let current_location: Record<string, any> = {};
    let data: Record<string, any> = {};
    if (!url_slug || typeof url_slug !== "string") {
      return ErrorResponse(res, "Invalid slug provided");
    }

    if (url_slug?.includes("/")) {
      const [categorySlug] = url_slug.split("/");

      const { category, category_name, location } =
        await extractCategoryAndLocation(categorySlug);

      let my_cat_array = category_name?.split(" ") || [];
      my_cat_array = my_cat_array.filter(
        (item: any) =>
          item.toLowerCase() !== "in" &&
          item.toLowerCase() !== "rental" &&
          item.toLowerCase() !== "rent" &&
          item.toLowerCase() !== "on"
      );

      const regexKeywords = my_cat_array.map(
        (word) => new RegExp(`\\b${word}\\b`, "i")
      );

      const matchedCategories = await categorySchema.find(
        {
          name: { $in: regexKeywords },
        },
        {
          name: 1,
          slug: 1,
          _id: 1,
          unique_id: 1,
        }
      );

      const top_city = citySchema.aggregate([
        {
          $match: {
            is_top_city: true,
          },
        },
        {
          $lookup: {
            from: "states",
            let: {
              stateIdObjectId: "$state_id",
              stateIdNumber: "$state_id",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: [
                      { $eq: ["$_id", "$$stateIdObjectId"] }, // for ObjectId
                      { $eq: ["$unique_id", "$$stateIdNumber"] }, // for string "1" to match numeric unique_id
                    ],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  name: 1,
                  unique_id: 1,
                },
              },
            ],
            as: "state_id",
          },
        },

        {
          $unwind: {
            path: "$state_id",
            preserveNullAndEmptyArrays: true,
          },
        },

        { $sort: { createdAt: -1 } },
      ]);
      if (location) {
        current_location = await getLocationDetails(location);
        data.current_location = current_location;
      }
      
      const [top_city_details, category_details,populer_area] = await Promise.all([
        top_city,
        getCategoryDetailswithReleted(category, 1, {}),
        getPopulerArealist(category, 1, current_location),
      ]);

      data.top_city = top_city_details;
      data.category_details = category_details;
      data.similer_category = matchedCategories;
      data.populer_area =populer_area;
    }
    return successResponse(res, "Data retrieved successfully", data);
  } catch (error) {
    console.error("Error fetching details:", error);
    return ErrorResponse(res, "Something went wrong");
  }
};

function generateSlug(name: any, listing_unique_id: any) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-");
  return `${slug}-${listing_unique_id}`;
}
export const getAllListingWithSlug = async (req: Request, res: Response) => {
  try {
    const [listings, jobs, blogs, products] = await Promise.all([
      listingSchema.find({}, "name listing_unique_id"),
      JobsSchema.find({}, "job_title unique_id"),
      BlogsSchema.find({}, "_id, blog_title"),
      Products.find({}, "_id product_name unique_id"),
    ]);

    const listingsWithSlugs = listings.map((item) => ({
      listing_unique_id: item.listing_unique_id,
      name: item.name,
      slug: generateSlug(item.name, item.listing_unique_id),
    }));

    const jobsWithSlugs = jobs.map((job) => ({
      unique_id: job.unique_id,
      job_title: job.job_title,
      slug: generateJobSlug(job.job_title, job.unique_id),
    }));

    const blogsWithSlugs = blogs.map((blog) => ({
      _id: blog._id,
      blog_title: blog.blog_title,
      slug: generateBlogSlug(blog._id),
    }));
     const productsWithSlugs = products.map((product) => ({
      _id: product._id,
      name: product.product_name,
      slug: generateProductSlug(product.product_name, product.unique_id),
    }));
    const data = {
      listing: listingsWithSlugs,
      jobs: jobsWithSlugs,
      blogs: blogsWithSlugs,
      products: productsWithSlugs,
    };

    return successResponse(res, "Data retrieved successfully", data);
  } catch (error) {
    console.error("Error fetching data:", error);
    return ErrorResponse(res, "Something went wrong");
  }
};
function generateJobSlug(title: string, job_unique_id: any) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, ""); // Trim leading/trailing hyphens
  return `jobs-${slug}-${job_unique_id}`;
}
function generateBlogSlug(id: any) {
  return `blog-details/${id}`;
}
function generateProductSlug(title: string, unique_id: any) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, ""); // Trim leading/trailing hyphens
  return `pro-${slug}-${unique_id}`;
}

export const getAllBlogsSlug = async (req: Request, res: Response) => {
  try {
    const [blogs] = await Promise.all([
      BlogsSchema.find({}, "_id, blog_title")
    ]);

    const blogsWithSlugs = blogs.map((blog) => ({
      _id: blog._id,
      blog_title: blog.blog_title,
      slug: generateBlogSlug(blog._id),
    }));

    const data = {
      blogs: blogsWithSlugs    
    };

    return successResponse(res, "Data retrieved successfully", data);
  } catch (error) {
    console.error("Error fetching data:", error);
    return ErrorResponse(res, "Something went wrong");
  }
};
export const getSeachCategory = async (req: Request, res: Response) => {
  try {
    const { name, location } = req.query;
    const locationName = location;
    if (!locationName) {
      return ErrorResponse(res, "Location name is required");
    }
    const baseUrl = process.env.BASE_URL || "https://api.latoprental.co";
    const imageBaseUrl = process.env.IMAGE_BASE_URL || process.env.BASE_URL || "https://api.latoprental.co";
    // Get all active categories sorted by 'sorting' field
    const home_page_category = await categorySchema
      .find({ status: true, name: { $regex: new RegExp(name as string, "i") } })
      .sort({ sorting: 1 })
      .limit(5)
      .select("name slug desktop_image mobile_image unique_id")
      .lean();

    const locationSlug = slugify(locationName as string, { lower: true });

    const category_result = home_page_category.map((category: any) => {
      const categorySlug = slugify(category.slug, { lower: true });

      const categoryImageBaseUrl = `${imageBaseUrl}/${
        category.desktop_image || "default.jpg"
      }`;
      const mobileImageBaseUrl = `${imageBaseUrl}/${
        category.mobile_image || "default.jpg"
      }`;
      const defaultImageUrl = `${imageBaseUrl}/uploads/default.jpg`;
      return {
        ...category,
        desktop_image: category.desktop_image
          ? categoryImageBaseUrl
          : defaultImageUrl,
        mobile_image: category.mobile_image
          ? mobileImageBaseUrl
          : defaultImageUrl,
        current_url: `${baseUrl}/${categorySlug}-${locationSlug}/${category.unique_id}`,
      };
    });

    return successResponse(res, "Data retrieved successfully", category_result);
  } catch (error) {
    console.error("Error fetching category data:", error);
    return ErrorResponse(res, "Something went wrong");
  }
};

export const submitContactUsForm = async (req: Request, res: Response) => {
  try {
    const categories = await submitContactUsFormModel(
      req.body,
      (error: any, result: any) => {
        if (error) {
          ErrorResponse(res, error.message);
        }
        return successResponse(
          res,
          "Submited contact us form  in Database successfully",
          result
        );
      }
    );
  } catch (error) {
    ErrorResponse(res, "An error occurred during user registration.");
  }
};

export const getStaticPage = async (req: Request, res: Response) => {
  try {
    const { page_name } = req.query;
    if (!page_name) {
      return ErrorResponse(res, "Page name is required");
    }

    const static_page_data = await staticPageSchema
      .findOne({ page_name: { $regex: new RegExp(page_name as string, "i") } })
      .lean();

    return successResponse(
      res,
      "Data retrieved successfully",
      static_page_data
    );
  } catch (error) {
    console.error("Error fetching category data:", error);
    return ErrorResponse(res, "Something went wrong");
  }
};

export const sitemapData = async (req: Request, res: Response) => {
  try {
    // await categoryListFrontend('',1,1000);
    return successResponse(res, "Data retrieved successfully", []);
  } catch (error) {
    console.error("Error fetching details:", error);
    return ErrorResponse(res, "Something went wrong");
  }
};

// export const getListingDetails = async (req: Request, res: Response) => {
//     try {
//         const { url_slug } = req.query;
//         const page = parseInt(req.query.page as string) || 1;
//         const limit = parseInt(req.query.limit as string) || 10;
//         let category_type = 1;
//         let page_type = "categroy_listing";

//         if (!url_slug || typeof url_slug !== "string") {
//             return ErrorResponse(res, "Invalid slug provided");
//         }

//         let categorySlug = "";
//         let listingId = "";

//         if (url_slug.includes("/") && !url_slug.includes("product-list")) {
//             const parts = url_slug.split("/");
//             if (parts.length === 2) {
//                 categorySlug = parts[0];
//                 listingId = parts[1];
//             }
//         } else {
//             categorySlug = url_slug;
//         }

//         const { category, location } = await extractCategoryAndLocation(categorySlug);

//         let current_location = {};
//         if (location) {
//             current_location = await getLocationDetails(location);
//         }

//         let category_details: Record<string, any> = {};
//         let listing_data: Record<string, any> | null = null; // ✅ Declared outside to maintain scope

//         if (category) {
//             category_details = await getCategoryDetails(category, category_type, current_location);
//         }

//         if (page_type === "categroy_listing") {
//             if (category_details?.category_id) {
//                 listing_data = await searchListings([category_details.category_id], current_location, page, limit);
//             }
//         }

//         if (!category && !location) {
//             return ErrorResponse(res, "No matching category or location found");
//         }

//         const cat_data = category_details ?? null;
//         const data = { category, current_location, cat_data, listing_data }; // ✅ Now listing_data is accessible

//         return successResponse(res, "Category-wise listing retrieved successfully", data);

//     } catch (error) {
//         console.error("Error fetching listing details:", error);
//         return ErrorResponse(res, "Something went wrong");
//     }
// };
