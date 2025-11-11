import mongoose, { Document, Schema } from "mongoose";
import { number } from "joi";

export interface ISubdomainCategoryseo extends Document {
    category_id: number;
    category_seo_type:number;
    page_title?: string;
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
    search_by_keyword?: string;
    search_by_keyword_meta_des?: string;
    search_by_keyword_meta_keyword?: string;
    product_title?: string;
    product_meta_title?: string;
    product_meta_description?: string;
    product_meta_keywords?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const subdomaincategoryseoSchema: Schema<ISubdomainCategoryseo> = new Schema(
    {
        category_id: { type: Number, ref: "Category", required: true }, 
        category_seo_type: { type: Number, required: false },
        page_title: { type: String, required: false },
        meta_title: { type: String, required: false },
        meta_description: { type: String, required: false },
        meta_keywords: { type: String, required: false },
        search_by_keyword: { type: String, required: false },
        search_by_keyword_meta_des: { type: String, required: false },
        search_by_keyword_meta_keyword: { type: String, required: false },
        product_title: { type: String, required: false },
        product_meta_title: { type: String, required: false },
        product_meta_description: { type: String, required: false },
        product_meta_keywords: { type: String, required: false },
    },
    {
        timestamps: true, 
    }
);


const SubdomainCategoryseo = mongoose.model<ISubdomainCategoryseo>("SubdomainCategoryseo", subdomaincategoryseoSchema);

export default SubdomainCategoryseo;
