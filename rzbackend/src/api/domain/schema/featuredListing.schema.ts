import mongoose, { Document, Schema } from "mongoose";

export interface IFeaturedListing extends Document {
  category_ids: number[]; // Can be unique_id or category name
  city_id: number[];
  listing_id: string;
  is_all_city_selected: boolean;
  is_all_category_selected: boolean;
  position: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const featuredListingSchema: Schema<IFeaturedListing> = new Schema(
  {
    category_ids: [{ type: Number, required: false }],

    city_id: [{ type: Number, ref: "City", required: false }],

    listing_id: {
      type: String,
      ref: "Listings",
      required: true,
      unique: true
    },

    is_all_city_selected: { type: Boolean, required: false, default: false },

    is_all_category_selected: { type: Boolean, required: false, default: false },

    position: { type: Number, required: true, default: 0 }
  },
  {
    timestamps: true
  }
);

const FeaturedListing = mongoose.model<IFeaturedListing>("FeaturedListing", featuredListingSchema);

export default FeaturedListing;
