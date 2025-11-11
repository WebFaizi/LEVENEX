import listingSchema from "../domain/schema/listing.schema";
import fs from "fs";
import path from "path";

export const getListingDetailsData = async (listing_unique_id: number | null): Promise<object> => {
  try {
    if (!listing_unique_id) {
      return { error: "Category ID is required" };
    }

    const [listing_details] = await listingSchema.aggregate([
      { $match: { listing_unique_id: listing_unique_id.toString() } },
      {
        $lookup: {
          from: "areas",
          localField: "area_id",
          foreignField: "unique_id",
          as: "area_id"
        }
      },
      {
        $lookup: {
          from: "states",
          localField: "state_id",
          foreignField: "unique_id",
          as: "state_id"
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
        $lookup: {
          from: "categories",
          localField: "category_ids",
          foreignField: "unique_id",
          as: "category_ids"
        }
      },
      {
        $lookup: {
          from: "countries",
          localField: "country_id",
          foreignField: "unique_id",
          as: "country_id"
        }
      },
      { $unwind: { path: "$area_id", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$state_id", preserveNullAndEmptyArrays: true } },
      // { $unwind: { path: '$city_id', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$country_id", preserveNullAndEmptyArrays: true } }
    ]);

    if (!listing_details) {
      return { error: "Listing not found" };
    }

    if (listing_details) {
      await listingSchema.updateOne(
        { listing_unique_id: listing_unique_id.toString() },
        { $inc: { listing_views: 1 } }
      );
      listing_details.listing_views = (listing_details.listing_views || 0) + 1;
    }

    const grandparentDir = path.join(__dirname, "..", "..", "..","..");

    const defaultImageUrl = `${process.env.BASE_URL}/uploads/default.jpg`;

    const listingImagePath = path.join(grandparentDir, listing_details.listing_image || "");
    const coverImagePath = path.join(grandparentDir, listing_details.cover_image || "");
    const mobilecoverImagePath = path.join(grandparentDir, listing_details.mobile_cover_image || "");

    const listingImageExists = listing_details.listing_image && fs.existsSync(listingImagePath);
    const coverImageExists = listing_details.cover_image && fs.existsSync(coverImagePath);
    const mobilecoverImageExists = listing_details.mobile_cover_image && fs.existsSync(mobilecoverImagePath);


    // Assign image URLs
    listing_details.listing_image = listingImageExists
      ? `${process.env.BASE_URL}/${listing_details.listing_image}`
      : defaultImageUrl;

    listing_details.cover_image = coverImageExists
      ? `${process.env.BASE_URL}/${listing_details.cover_image}`
      : defaultImageUrl;

      listing_details.mobile_cover_image = mobilecoverImageExists
      ? `${process.env.BASE_URL}/${listing_details.mobile_cover_image}`
      : defaultImageUrl;

    return listing_details;
  } catch (error) {
    console.error("Error fetching category details:", error);
    return { error: "Failed to fetch category details" };
  }
};

export default getListingDetailsData;
