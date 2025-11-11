import mongoose, { Document, Schema } from "mongoose";

export interface IKeywords extends Document {
    words: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const KeywordsSchema: Schema<IKeywords> = new Schema(
    {
        words: { type: String, required: true },
    },
    {
        timestamps: true, 
    }
);

const Keywords = mongoose.model<IKeywords>("Keyword", KeywordsSchema);

export default Keywords;
