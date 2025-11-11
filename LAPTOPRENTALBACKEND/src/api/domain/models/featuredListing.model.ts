import { loggerMsg } from "../../lib/logger";
import FeaturedListing from "../schema/featuredListing.schema";
import ListingsSchema from "../schema/listing.schema";
import categorySchema from "../schema/category.schema";
import countrySchema from "../schema/country.schema";
import stateSchema from "../schema/state.schema";
import citySchema from "../schema/city.schema";
import areaSchema from "../schema/area.schema";
import mongoose from "mongoose";

interface FeaturedListingInterface {
  category_ids: number[];
  city_ids: number[];
  listing_id: string;
  is_all_city_selected: boolean;
  is_all_category_selected: boolean;
  position: number;
  featured_listing_id?: string;
}

interface importListingData {
  listing_name: string;
  category_name: string;
  city_name: string;
  position: string;
}

const getIdsFromNames = async (Model: any, names: string): Promise<string[]> => {
  const nameArray = names.split(",").map((name) => name.trim());
  const records = await Model.find({ name: { $in: nameArray } });
  return records.map((record: any) => record._id.toString());
};

const getSingleIdFromName = async (schema: any, name: string): Promise<string | null> => {
  const result = await schema.findOne({ name: name.trim() });
  return result ? result._id.toString() : null;
};

export const importFeaturedListingDataModel = async (
  listingData: importListingData[],
  callback: (error: any, result: any) => void
) => {
  try {
    const results = await Promise.all(
      listingData.map(async (item) => {
        const listing = await ListingsSchema.findOne({ name: item.listing_name });

        const categoryNames = item.category_name.split(",").map((name) => name.trim());
        const categories = await categorySchema.find({ name: { $in: categoryNames } });
        const categoryIds = categories.map((cat) => cat.unique_id);

        const cityNames = item.city_name.split(",").map((name) => name.trim());
        const cities = await citySchema.find({ name: { $in: cityNames } });
        const cityIds = cities.map(
          (city) => city.unique_id
        );
        if (listing && categoryIds && cityIds) {
          const existingListing = await FeaturedListing.findOne({
            listing_id: listing?.listing_unique_id
          });

          if (existingListing) {
            await FeaturedListing.deleteOne({ _id: existingListing._id });
          }

          const newFeaturedListing = new FeaturedListing({
            listing_id: listing?.listing_unique_id,
            category_ids: categoryIds,
            city_id: cityIds,
            position: item.position || 0,
            is_all_category_selected: categoryIds.length > 0 ? false : true,
            is_all_city_selected: cityIds.length > 0 ? false : true
          });

          await newFeaturedListing.save();
        }
      })
    );

    return callback(null, results);
  } catch (error) {
    return callback(error, null);
  }
};

export const storeFetauredListingModel = async (
  featuredListingData: FeaturedListingInterface,
  callback: (error: any, result: any) => void
) => {
  try {
    const {
      category_ids,
      city_ids,
      listing_id,
      is_all_city_selected,
      is_all_category_selected,
      position
    } = featuredListingData;

    await FeaturedListing.deleteOne({ listing_id });

    // Validate listing_id
    if (!listing_id) {
      return callback(new Error("Listing ID is required"), null);
    }

    // Check if listing already exists
    const existingListing = await FeaturedListing.findOne({ listing_id }).lean();
    if (existingListing) {
      return callback(new Error("Listing already exists in featured section"), null);
    }

    let cityObjectIds: number[] = [];
    cityObjectIds = city_ids?.map((id) => Number(id)) || [];

    // Create and save new Featured Listing
    const newFeaturedListing = new FeaturedListing({
      category_ids: category_ids,
      city_id: cityObjectIds,
      listing_id,
      is_all_city_selected,
      is_all_category_selected,
      position
    });

    const savedListing = await newFeaturedListing.save();

    loggerMsg("✅ Featured listing stored successfully.");
    return callback(null, savedListing);
  } catch (error) {
    console.error("❌ Error storing featured listing:", error);
    return callback(new Error("Error storing featured listing"), null);
  }
};

export const FeaturedListingList = async (search: string, page: number, limit: number) => {
  try {
    const skip = (page - 1) * limit;
    const searchQuery: any = [
      {
        $lookup: {
          from: "categories",
          localField: "category_ids",
          foreignField: "unique_id",
          as: "category_ids"
        }
      },
      {
        $lookup: {
          from: "listings",
          localField: "listing_id",
          foreignField: "listing_unique_id",
          as: "listing_id"
        }
      },
      {
        $lookup: {
          from: "cities",
          localField: "city_id",
          foreignField: "unique_id",
          as: "city_id"
        }
      },
      {
        $match: {
          $or: [
            { "listing_id.name": { $regex: search || "", $options: "i" } },
            { "category_ids.name": { $regex: search || "", $options: "i" } },
            { "city_id.name": { $regex: search || "", $options: "i" } }
          ]
        }
      },
      {
        $project: {
          "category_ids.name": 1,
          "listing_id.name": 1,
          "city_id.name": 1,
          is_all_city_selected: 1,
          is_all_category_selected: 1,
          position: 1
        }
      },
      {
        $unwind: {
          path: "$listing_id",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $facet: {
          totalCount: [{ $count: "count" }],
          data: [{ $skip: skip }, { $limit: limit }, { $sort: { position: -1 } }]
        }
      }
    ];

    const result: any = await FeaturedListing.aggregate(searchQuery).exec();    

    return {
      data: result[0]?.data || [],
      totalUsers: result[0]?.totalCount[0]?.count || 0,
      totalPages: Math.ceil(result[0]?.totalCount[0]?.count / limit) || 0,
      currentPage: page
    };
  } catch (error) {
    console.error(error);
  }
};

export const featuredListingDetails = async (
  listing_id: string,
  callback: (error: any, result: any) => void
) => {
  try {
    const featured_listing = await FeaturedListing.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(listing_id) } },
      {
        $lookup: {
          from: "categories",
          localField: "category_ids",
          foreignField: "unique_id",
          as: "category_ids"
        }
      },
      {
        $lookup: {
          from: "listings",
          localField: "listing_id",
          foreignField: "listing_unique_id",
          as: "listing_id"
        }
      },
      {
        $lookup: {
          from: "cities",
          localField: "city_id",
          foreignField: "unique_id",
          as: "city_id"
        }
      },
      {
        $project: {
          _id: 1,
          "category_ids.unique_id": 1,
          "category_ids.name": 1,
          "category_ids._id": 1,
          "listing_id.listing_unique_id": 1,
          "listing_id.name": 1,
          "listing_id._id": 1,
          "city_id._id": 1,
          "city_id.name": 1,
          "city_id.unique_id": 1,
          is_all_city_selected: 1,
          is_all_category_selected: 1,
          position: 1
        }
      },
      {
        $unwind: {
          path: "$listing_id",
          preserveNullAndEmptyArrays: true
        }
      }
    ]).exec();

    return callback(null, { featured_listing: featured_listing[0] });
  } catch (error) {
    console.error("Error storing blog:", error);
    return callback(error, null);
  }
};
