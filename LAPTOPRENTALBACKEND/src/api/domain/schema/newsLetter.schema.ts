import mongoose, { Document, Schema } from "mongoose";

export interface INewsLetter extends Document {
    newsletter_description: string;
    newsletter_banner_image:string;
    newsletter_listing_id:[];
    createdAt?: Date;
    updatedAt?: Date;
}

const NewsLetterSchema: Schema<INewsLetter> = new Schema(
    {
        newsletter_description: { type: String, required: false },
        newsletter_banner_image: { type: String, required: false },
        newsletter_listing_id: [{type : mongoose.Schema.Types.Mixed}], 
    },
    {
        timestamps: true, 
    }
);

const NewsLetter = mongoose.model<INewsLetter>("NewsLetter", NewsLetterSchema);

export default NewsLetter;
