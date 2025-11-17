import { number } from "joi";
import mongoose, { Document, Schema } from "mongoose";

export interface IStaticPage extends Document {
    page_name: string;
    page_content: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const StaticPageSchema: Schema<IStaticPage> = new Schema(
    {
        page_name: { type: String, required: true},
        page_content: { type: String, required: true}, 
    },
    {
        timestamps: true, 
    }
);

const Area = mongoose.model<IStaticPage>("StaticPage", StaticPageSchema);

export default Area;
