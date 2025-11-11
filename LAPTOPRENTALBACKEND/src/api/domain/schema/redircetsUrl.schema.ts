import { number } from "joi";
import mongoose, { Document, Schema } from "mongoose";

export interface IRedirectsUrl extends Document {
    from_url: string;
    to_url: string;
}

const RedirectsUrlSchema: Schema<IRedirectsUrl> = new Schema(
    {
        from_url: { type: String, required: true},
        to_url: { type: String, required: true }, 
    },
    {
        timestamps: true, 
    }
);

const RedirectsUrl = mongoose.model<IRedirectsUrl>("RedirectsUrl", RedirectsUrlSchema);

export default RedirectsUrl;
