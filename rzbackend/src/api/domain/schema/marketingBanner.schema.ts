import mongoose, { Document, Schema } from "mongoose";

export interface IMarketingBanner extends Document {
  marketingbanner_description: string;
  marketingbanner_image: string;
  marketingbanner_listing_id: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const MarketingBannerSchema: Schema<IMarketingBanner> = new Schema(
  {
    marketingbanner_description: { type: String, required: false },
    marketingbanner_image: { type: String, required: false },
    marketingbanner_listing_id: [{ type: String, ref: "Listings", required: false }]
  },
  {
    timestamps: true
  }
);

const MarketingBanner = mongoose.model<IMarketingBanner>("IMarketingBanner", MarketingBannerSchema);

export default MarketingBanner;
