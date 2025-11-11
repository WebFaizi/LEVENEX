import mongoose, { Document, Schema } from "mongoose";

export interface IBanners extends Document {
    banner_type_id: mongoose.Types.ObjectId;
    category_ids: string[]; 
    select_all_categories: boolean; 
    country_id: number; 
    state_id: number;
    city_ids: number[];
    select_all_cities: boolean; 
    banner_title: string; 
    banner_url: string; 
    banner_image: string; 
    display_period_in_days: number; 
    banner_email: string; 
    hide_banner_city_ids: number[]; 
    createdAt?: Date; 
    updatedAt?: Date; 
}

const BannersSchema: Schema<IBanners> = new Schema(
    {
        banner_type_id:{ type: Schema.Types.ObjectId, ref: 'BannerTypes', required: true },
        category_ids: [{ type: Number, ref: 'Category' }], 
        select_all_categories: { type: Boolean, default: false }, 
        country_id:{ type: Number, ref: 'Country', required: true },
        state_id: { type: Number, ref: 'State', required: true }, 
        city_ids: [{ type: Number, ref: 'City' }], 
        select_all_cities: { type: Boolean, default: false },
        banner_title: { type: String, required: true }, 
        banner_url: { type: String, required: true },
        banner_image: { type: String, required: false }, 
        display_period_in_days: { type: Number, required: true },
        banner_email: { type: String, required: true }, 
        hide_banner_city_ids: [{ type: Number, ref: 'City' }], 
    },
    {
        timestamps: true, 
    }
);

const Banners = mongoose.model<IBanners>("Banners", BannersSchema);

export default Banners;
