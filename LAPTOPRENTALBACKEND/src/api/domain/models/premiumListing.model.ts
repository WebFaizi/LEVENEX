import IPremiumListingSchema from "../schema/premiumListing.schema";
import mongoose from "mongoose";
import ListingsSchema from "../schema/listing.schema";

interface PremiumListingInput {
  listing_id: string;
  premium_type: string;
  city_ids?: string[];
  start_date?: Date;
  end_date?: Date;
  premium_listing_id?: string;
}

interface importListingData {
  listing_name: string;
  premium_type: string;
  listing_unique_id: string;
  start_date: string;
  end_date: string;
}

export const importPremiumListingDataModel = async (
  listingData: importListingData[],
  callback: (error: any, result: any) => void
) => {
  try {    

    if (!Array.isArray(listingData) || listingData.length === 0) {
      return callback(new Error("No data to import"), null);
    }


    // Step 2: Prepare documents to insert
    const documentsToInsert = [];

    for (const item of listingData) {
     
      const startDate = item.start_date && item.start_date !== "null"
        ? new Date(item.start_date)
        : null;

      const endDate = item.end_date && item.end_date !== "null"
        ? new Date(item.end_date)
        : null;

      if (
        (startDate && isNaN(startDate.getTime())) ||
        (endDate && isNaN(endDate.getTime()))
      ) {
        console.warn(`Invalid dates for listing: ${item.listing_name}`);
        continue;
      }

      documentsToInsert.push({
        listing_id: item.listing_unique_id.trim(),
        premium_type: item.premium_type,
        start_date: startDate,
        end_date: endDate,
        status: true
      });
    }

    // Step 3: Insert all valid documents
    if (documentsToInsert.length > 0) {
      const result = await IPremiumListingSchema.insertMany(documentsToInsert);
      return callback(null, result);
    } else {
      return callback(new Error("No valid records to insert"), null);
    }

  } catch (error) {
    return callback(error, null);
  }
};

export const storePremiumListingModel = async (
  premiumListingData: PremiumListingInput,
  callback: (error: any, result: any) => void
) => {
  try {
    const premiumListing = new IPremiumListingSchema({
      listing_id: premiumListingData.listing_id,
      premium_type: premiumListingData.premium_type,
      city_id: premiumListingData?.city_ids?.map((id) => parseInt(id)) || [],
      start_date: premiumListingData.start_date,
      end_date: premiumListingData.end_date
    });

    const savedPremiumListing = await premiumListing.save();
    return callback(null, { savedPremiumListing });
  } catch (error) {
    console.error("Error storing premium listing:", error);
    return callback(error, null);
  }
};

export const premiumListingList = async (search: string, page: number, limit: number) => {
  try {
    const skip = (page - 1) * limit;

    const users = await IPremiumListingSchema.aggregate([
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
            { premium_type: { $regex: search || "", $options: "i" } },
            { "listing_id.name": { $regex: search || "", $options: "i" } }
          ]
        }
      },
      {
        $unwind: {
          path: "$listing_id",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          "listing_id._id": 1,
          "listing_id.name": 1,
          "city_id.unique_id": 1,
          "city_id.name": 1,
          premium_type: 1,
          start_date: 1,
          end_date: 1
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
      data: users[0]?.data,
      totalUsers: users[0]?.totalCount[0]?.count || 0,
      totalPages: Math.ceil(users[0]?.totalCount[0]?.count / limit) || 0,
      currentPage: page
    };
  } catch (error) {}
};

export const premiumListingDetail = async (
  listing_id: string,
  callback: (error: any, result: any) => void
) => {
  try {
    const [Listing_details] = await IPremiumListingSchema.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(listing_id) }
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
        $unwind: "$listing_id"
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
          listing_id: 1,
          "categories.name": 1,
          "city_id.name": 1,
          "city_id.unique_id": 1,
          premium_type: 1,
          start_date: 1,
          end_date: 1
        }
      }
    ]);

    return callback(null, { Listing_details });
  } catch (error) {
    console.error("Error storing blog:", error);
    return callback(error, null);
  }
};

export const updatePremiumListingModel = async (
  premiumListingData: PremiumListingInput,
  callback: (error: any, result: any) => void
) => {
  try {
    const updatedPremiumListing = await IPremiumListingSchema.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(premiumListingData.premium_listing_id) },
      {
        premium_type: premiumListingData.premium_type,
        city_id: premiumListingData?.city_ids?.map((id) => parseInt(id)) || [],
        start_date: premiumListingData.start_date,
        end_date: premiumListingData.end_date
      },
      { new: true, runValidators: true }
    );

    if (!updatedPremiumListing) {
      throw new Error("Premium listing not found");
    }

    return callback(null, { updatedPremiumListing });
  } catch (error) {
    console.error("Error storing premium listing:", error);
    return callback(error, null);
  }
};
