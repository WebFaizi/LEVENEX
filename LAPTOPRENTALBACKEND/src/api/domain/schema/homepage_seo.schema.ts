import mongoose, { Document, Schema } from "mongoose";

export interface IHomepageSeo extends Document {
    page_title: string;
    meta_title: string;
    meta_keywords: string;
    meta_description: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const HomepageSeoSchema: Schema<IHomepageSeo> = new Schema(
    {
        page_title: { type: String, required: false },
        meta_title: { type: String, required: false },
        meta_keywords: { type: String, required: false },
        meta_description: { type: String, required: false },
    },
    {
        timestamps: true, 
    }
);

const HomepageSeo = mongoose.model<IHomepageSeo>("Homepage_seo", HomepageSeoSchema);

export default HomepageSeo;
