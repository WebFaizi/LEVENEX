import mongoose, { Document, Schema } from "mongoose";

export interface IFaq extends Document {
    question?: string;
    answer?: string
    createdAt?: Date;
    updatedAt?: Date;
}

const FaqSchema: Schema<IFaq> = new Schema(
    {
        question : { type: String, required: true, trim: true },
        answer: { type: String, required: true, trim: true },
    },
    {
        timestamps: true, 
    }
);

const FAQ = mongoose.model<IFaq>("FAQ", FaqSchema);

export default FAQ;
