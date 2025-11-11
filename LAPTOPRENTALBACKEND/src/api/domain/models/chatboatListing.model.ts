import { loggerMsg } from "../../lib/logger";
import FeaturedListing from "../schema/featuredListing.schema";
import ChatBoatUserSchema from "../schema/chatboatUser.schema";
import ListingsSchema from "../schema/listing.schema";
import categorySchema, { ICategory } from "../schema/category.schema";
import countrySchema from "../schema/country.schema";
import stateSchema from "../schema/state.schema";
import citySchema from "../schema/city.schema";
import areaSchema from "../schema/area.schema";
import ChatboatListing from "../schema/chatboat.schema";
import mongoose, { Types } from "mongoose";

export const chatboatUserListModel = async (search: string, page: number, limit: number) => {
  try {
    const skip = (page - 1) * limit;

    const result = await ChatBoatUserSchema.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "category_ids",
          foreignField: "unique_id",
          as: "category_ids"
        }
      },
      {
        $match: {
          $or: [
            { "category_ids.name": { $regex: search || "", $options: "i" } },
            { phone_number: { $regex: search || "", $options: "i" } },
            { city_name: { $regex: search || "", $options: "i" } }
          ]
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          "category_ids.name": 1,
          city_name: 1,
          phone_number: 1,
          createdAt: 1
        }
      },
      {
        $facet: {
          totalCount: [{ $count: "count" }],
          data: [{ $skip: skip }, { $limit: limit }]
        }
      }
    ]);

    return {
      data: result[0].data,
      totalUsers: result[0]?.totalCount[0]?.count || 0,
      totalPages: Math.ceil(result[0]?.totalCount[0]?.count / limit) || 0,
      currentPage: page
    };
  } catch (error) {
    console.error(error);
  }
};

export const chatboatListingDetails = async (
  chatboat_id: string,
  callback: (error: any, result: any) => void
) => {
  try {
    // Fetch ChatboatListing as plain object
    const chatboat_listing = await ChatboatListing.findOne({ _id: chatboat_id }).lean();

    if (!chatboat_listing) {
      return callback(new Error("Chatboat listing not found"), null);
    }

    // Handle city_id enrichment
    const cityId = chatboat_listing.city_id;
    let enrichedCity: any = null;

    if (typeof cityId !== "undefined" && cityId !== null) {
      enrichedCity = await mongoose.connection.collection("cities").findOne({ unique_id: cityId }, {
        projection: { _id: 1, unique_id: 1, name: 1 }
      });
    }

    // Extract listing IDs from the new structure and create order map
    const listingIds: string[] = [];
    const listingOrderMap = new Map<string, number>();

    if (Array.isArray(chatboat_listing.listing_id)) {
      chatboat_listing.listing_id.forEach((item: any, index: number) => {
        const id = typeof item === 'object' && item.id ? item.id : item;
        const order = typeof item === 'object' && item.order !== undefined ? item.order : index;
        
        listingIds.push(id);
        listingOrderMap.set(String(id), order);
      });
    }

    // Fetch listings by listing_unique_id
    const listingsFromSchema = await ListingsSchema.aggregate([
      {
        $match: {
          listing_unique_id: { $in: listingIds }
        }
      },
      {
        $lookup: {
          from: "cities",
          localField: "city_id",
          foreignField: "unique_id",
          as: "city_info"
        }
      },
      {
        $addFields: {
          city_id: {
            $map: {
              input: "$city_info",
              as: "city",
              in: {
                _id: "$$city._id",
                unique_id: "$$city.unique_id",
                name: "$$city.name"
              }
            }
          }
        }
      },
      {
        $project: {
          city_info: 0
        }
      }
    ]);

    // Sort listings and add order field
    const sortedListingsWithOrder = listingsFromSchema
      .map((listing) => ({
        ...listing,
        order: listingOrderMap.get(String(listing.listing_unique_id)) ?? 999
      }))
      .sort((a, b) => a.order - b.order);

    console.log(sortedListingsWithOrder);

    const chatboat_listing_response = {
      ...chatboat_listing,
      city_id: enrichedCity,
      listing_id: sortedListingsWithOrder
    };

    return callback(null, { chatboat_listing: chatboat_listing_response });

  } catch (error) {
    console.error("Error in chatboatListingDetails:", error);
    return callback(error, null);
  }
};

export const chatboatListingModel = async (search: string, page: number, limit: number) => {
  try {
    const skip = (page - 1) * limit;

    const pipeline: any[] = [
      // Stage 1: Add a field to extract listing IDs from the new structure
      {
        $addFields: {
          listing_ids_extracted: {
            $map: {
              input: "$listing_id",
              as: "item",
              in: {
                $cond: {
                  if: { $eq: [{ $type: "$$item" }, "object"] },
                  then: "$$item.id",
                  else: "$$item"
                }
              }
            }
          }
        }
      },
      // Stage 2: Lookup Listings using extracted IDs
      {
        $lookup: {
          from: "listings",
          localField: "listing_ids_extracted",
          foreignField: "listing_unique_id",
          as: "listing_info_array"
        }
      },
      // Stage 3: Lookup Cities
      {
        $lookup: {
          from: "cities",
          localField: "city_id",
          foreignField: "unique_id",
          as: "city_info_array"
        }
      },
      // Stage 4: Apply initial Match condition
      {
        $match: {
          $or: [
            { "listing_info_array.name": { $regex: search || "", $options: "i" } },
            { "city_info_array.name": { $regex: search || "", $options: "i" } }
          ]
        }
      },
      // Stage 5: Deconstruct listing_info_array
      {
        $unwind: {
          path: "$listing_info_array",
          preserveNullAndEmptyArrays: true
        }
      },
      // Stage 6: Deconstruct city_info_array
      {
        $unwind: {
          path: "$city_info_array",
          preserveNullAndEmptyArrays: true
        }
      },
      // Stage 7: Group back to collect all matched names as arrays
      {
        $group: {
          _id: "$_id",
          is_city_select_all: { $first: "$is_city_select_all" },
          createdAt: { $first: "$createdAt" },
          listing_id_original: { $first: "$listing_id" },
          listing_names: {
            $addToSet: { 
              _id: "$listing_info_array._id", 
              listing_unique_id: "$listing_info_array.listing_unique_id",  
              name: "$listing_info_array.name"
            }
          },
          city_names: {
            $addToSet: { 
              _id: "$city_info_array._id", 
              unique_id: "$city_info_array.unique_id", 
              name: "$city_info_array.name"
            }
          }
        }
      },
      // Stage 8: Project the final desired fields
      {
        $project: {
          _id: 1,
          listing_id: "$listing_names",
          listing_id_with_order: "$listing_id_original",
          city_id: "$city_names",
          is_city_select_all: 1,
          createdAt: 1
        }
      },
      // Stage 9: Sort before pagination
      {
        $sort: { createdAt: -1 }
      },
      // Stage 10: Facet for total count and paginated data
      {
        $facet: {
          totalCount: [{ $count: "count" }],
          data: [{ $skip: skip }, { $limit: limit }]
        }
      }
    ];

    const result = await ChatboatListing.aggregate(pipeline);

    return {
      data: result[0]?.data,
      totalUsers: result[0]?.totalCount[0]?.count || 0,
      totalPages: Math.ceil(result[0]?.totalCount[0]?.count / limit) || 0,
      currentPage: page
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const chatBoatListingCityWise = async (city_id: string, chat_boat_id: string) => {
  try {
    let listings;

    if (mongoose.isValidObjectId(chat_boat_id)) {
      const chatboatListing = await ChatboatListing.findById(chat_boat_id).exec();

      if (!chatboatListing) {
        throw new Error("Chatboat listing not found.");
      }

      // Extract listing IDs from the new structure
      const excludedListingIds = Array.isArray(chatboatListing.listing_id)
        ? chatboatListing.listing_id.map((item: any) => {
            // Handle both new format {id, order} and old format
            return typeof item === 'object' && item.id ? item.id : item;
          })
        : [];

      const cityidNum = Number(city_id);
      const cityFilter = !isNaN(cityidNum)
        ? { city_id: { $in: [cityidNum] } }
        : {};

      listings = await ListingsSchema.aggregate([
        { 
          $match: { 
            ...cityFilter, 
            listing_unique_id: { $nin: excludedListingIds } 
          } 
        },
        {
          $lookup: {
            from: "cities",
            localField: "city_id",
            foreignField: "unique_id",
            as: "city_info"
          }
        },
        {
          $unwind: {
            path: "$city_info",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $addFields: {
            city_id: {
              _id: "$city_info._id",
              unique_id: "$city_info.unique_id",
              name: "$city_info.name"
            }
          }
        },
        {
          $project: {
            city_info: 0
          }
        },
        {
          $group: {
            _id: "$_id",
            doc: { $first: "$$ROOT" }
          }
        },
        {
          $replaceRoot: {
            newRoot: "$doc"
          }
        }
      ]);
    } else {
      const cityidNum = Number(city_id);
      const cityFilter = !isNaN(cityidNum)
        ? { city_id: { $in: [cityidNum] } }
        : {};

      listings = await ListingsSchema.aggregate([
        { $match: cityFilter },
        {
          $lookup: {
            from: "cities",
            localField: "city_id",
            foreignField: "unique_id",
            as: "city_info"
          }
        },
        {
          $unwind: {
            path: "$city_info",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $addFields: {
            city_id: {
              _id: "$city_info._id",
              unique_id: "$city_info.unique_id",
              name: "$city_info.name"
            }
          }
        },
        {
          $project: {
            city_info: 0
          }
        },
        {
          $group: {
            _id: "$_id",
            doc: { $first: "$$ROOT" }
          }
        },
        {
          $replaceRoot: {
            newRoot: "$doc"
          }
        }
      ]);
    }

    return listings;
  } catch (error) {
    console.error("Error in chatBoatListingCityWise:", error);
    throw error;
  }
};

export const storeChatboatListingModel = async (body: any, callback: Function) => {
  try {
    let { city_id, listing_id , chat_boat_id = "" } = body;
    let is_city_select_all;
    
    
    if (body.is_city_select_all == "true") {
      is_city_select_all = true;
    } else {
      is_city_select_all = false;
    }

    // Validate city ID
    let numericCityId: number | null = null;
    if (city_id && !is_city_select_all) {
      const parsedCityId = Number(city_id);
      if (isNaN(parsedCityId)) {
        return callback(new Error("Invalid city ID"), null);
      }
      numericCityId = parsedCityId;
    }

    // Validate and format listing IDs with order
    let formattedListingIds: any[] = [];
    listing_id = JSON.parse(listing_id)
    if (Array.isArray(listing_id) && listing_id.length > 0) {            
      // Parse listing_id if it's a string
      let parsedListingId = listing_id;
      if (typeof listing_id === 'string') {
        try {
          parsedListingId = JSON.parse(listing_id);
        } catch (e) {
          console.error("Error parsing listing_id:", e);
        }
      }      
      
      formattedListingIds = parsedListingId
        .map((item: any) => {
          // Handle both new format {id, order} and old format (plain id)
          if (typeof item === 'object' && item.id !== undefined) {
            return {
              id: String(item.id), // Ensure id is stored as string
              order: item.order !== undefined ? Number(item.order) : 0
            };
          } else if (typeof item === 'string' || typeof item === 'number') {
            // Backward compatibility for old format
            return {
              id: String(item),
              order: 0
            };
          }
          return null;
        })
        .filter((item): item is any => item !== null);
    }    

    let result;

    if (chat_boat_id && mongoose.isValidObjectId(chat_boat_id)) {
      // ✅ UPDATE existing record
      result = await ChatboatListing.findByIdAndUpdate(
        chat_boat_id,
        {
          city_id: numericCityId,
          is_city_select_all: is_city_select_all,
          listing_id: formattedListingIds
        },
        { new: true }
      );
    } else {
      // ✅ CREATE new record
      const chatboat = new ChatboatListing({
        city_id: numericCityId,
        is_city_select_all: is_city_select_all,
        listing_id: formattedListingIds
      });
      result = await chatboat.save();
    }
    
    callback(null, result);
  } catch (error: any) {
    callback(error, null);
  }
};