import { number } from "joi";
import mongoose, { Document, Schema } from "mongoose";

export interface IContactUs extends Document {
    name: string;
    email: string;
    subject: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const ContactUsSchema: Schema<IContactUs> = new Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true },
        subject: { type: String, required: true, trim: true },
    },
    {
        timestamps: true, 
    }
);

const ContactUs = mongoose.model<IContactUs>("ContactUs", ContactUsSchema);

export default ContactUs;
