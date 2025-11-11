import mongoose, { Document, Schema } from "mongoose";
import { number } from "joi";

export interface IListingseo extends Document {
    listing_id: string;
    page_title?: string;
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const listingseoSchema: Schema<IListingseo> = new Schema(
    {
        listing_id: { type: String, ref: "Listings", required: true }, 
        page_title: { type: String, required: false },
        meta_title: { type: String, required: false },
        meta_description: { type: String, required: false },
        meta_keywords: { type: String, required: false },
    },
    {
        timestamps: true, 
    }
);


const Listingseo = mongoose.model<IListingseo>("Listingseo", listingseoSchema);

export default Listingseo;
