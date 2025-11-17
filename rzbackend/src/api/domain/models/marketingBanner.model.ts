import MarketingBannerSchema from "../schema/marketingBanner.schema";
import ListingsSchema from "../schema/listing.schema";
import mongoose from "mongoose";
import { env } from "process";

// const baseUrl = env.BASE_URL || "http://localhost:3000";

interface IMarketingBanner {
  marketingbanner_description: string;
  marketingbanner_image: string;
  marketingbanner_listing_id: string[];
}

export const storeMarketingBannerModel = async (
  marketingBannerData: IMarketingBanner,
  callback: (error: any, result: any) => void
) => {
  try {
    const existingMarketingBanner = await MarketingBannerSchema.findOne();

    if (existingMarketingBanner) {      
      if (
        marketingBannerData.marketingbanner_image != undefined &&
        marketingBannerData.marketingbanner_image != ""
      ) {
        marketingBannerData.marketingbanner_image = marketingBannerData.marketingbanner_image;
      } else {
        marketingBannerData.marketingbanner_image = existingMarketingBanner.marketingbanner_image;
      }
      await MarketingBannerSchema.deleteOne({ _id: existingMarketingBanner._id });
    }

    const listingIds = marketingBannerData.marketingbanner_listing_id

    const newMarketingBanner = new MarketingBannerSchema({
      marketingbanner_description: marketingBannerData.marketingbanner_description,
      marketingbanner_image: marketingBannerData.marketingbanner_image,
      marketingbanner_listing_id: listingIds
    });

    await newMarketingBanner.save();
    return callback(null, newMarketingBanner);
  } catch (error) {
    console.error("Error storing banner:", error);
    return callback(error, null);
  }
};

export const getMarketingBannerDetail = async (
  listing_id: string,
  callback: (error: any, result: any) => void
) => {
  try {
    const [marketingBanner] = await MarketingBannerSchema.aggregate([
      {
        $lookup: {
          from: "listings",
          localField: "marketingbanner_listing_id",
          foreignField: "listing_unique_id",
          pipeline: [{ $project: { _id: 1, name: 1, listing_unique_id: 1  } }],
          as: "marketingbanner_listing_id"
        }
      }
    ]);

    if (!marketingBanner) {
      return callback(null, { message: "Marketing banner not found" });
    }

    marketingBanner.marketingbanner_image = `${process.env.BASE_URL}/${marketingBanner.marketingbanner_image}`;

    const allListings = await ListingsSchema.find({}, "_id name listing_unique_id").exec();

    const marketingListingIds = marketingBanner.marketingbanner_listing_id.map((listing: any) =>
      listing._id.toString()
    );

    const availableListings = allListings.filter(
      (listing: any) => !marketingListingIds.includes(listing._id.toString())
    );

    return callback(null, {
      marketing_banner: marketingBanner,
      available_listings: availableListings
    });
  } catch (error) {
    console.error("Error fetching marketing banner:", error);
    return callback(error, null);
  }
};
