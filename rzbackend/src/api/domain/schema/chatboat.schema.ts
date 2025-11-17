import { string } from "joi";
import mongoose, { Document, Schema } from "mongoose";

export interface IListingItem {
    id: mongoose.Schema.Types.ObjectId | string | number;
    order: number;
}

export interface IChatboatListing extends Document {
    city_id?: number;
    is_city_select_all?: boolean;
    listing_id?: IListingItem[];
    createdAt?: Date;
    updatedAt?: Date;
}

const ListingItemSchema: Schema<IListingItem> = new Schema(
    {
        id: { type: mongoose.Schema.Types.Mixed, required: true },
        order: { type: Number, required: true },
    },
    { _id: false }
);

const ChatboatListingSchema: Schema<IChatboatListing> = new Schema(
    {
        city_id: { type: Number, ref: "City", required: false },
        is_city_select_all: { type: Boolean, default: false },
        listing_id: [ListingItemSchema],
    },
    {
        timestamps: true,
    }
);

const ChatboatListing = mongoose.model<IChatboatListing>("ChatboatListing", ChatboatListingSchema);

export default ChatboatListing;