import mongoose, { Document, Schema } from "mongoose";
import { number } from "joi";

export interface IBannerTypes extends Document {
    banner_title: string;
    banner_size: string;
    banner_price:string;
    banner_slots: string;
    banner_sortcode: string;
    banner_preview_url:string;
    createdAt?: Date;
    updatedAt?: Date;
}

const BannerTypesSchema: Schema<IBannerTypes> = new Schema(
    {
        banner_title: { type: String, required: true, trim: true },
        banner_size: { type: String, required: true, trim: true },
        banner_price: { type: String, required: true, trim: true },
        banner_slots: { type: String, required: true, trim: true },
        banner_sortcode: { type: String, required: false, trim: true },
        banner_preview_url: { type: String, required: true, trim: true },
    },
    {
        timestamps: true, 
    }
);

const BannerTypes = mongoose.model<IBannerTypes>("BannerTypes", BannerTypesSchema);

export default BannerTypes;
