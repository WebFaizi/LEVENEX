import mongoose, { Document, Schema } from "mongoose";

export interface IPremiumRequest extends Document {
    first_name: string; 
    last_name: string; 
    email: string; 
    phone_number: string; 
    subject: string; 
    createdAt?: Date; 
    updatedAt?: Date; 
}

const PremiumRequestSchema: Schema<IPremiumRequest> = new Schema(
    {
        first_name: { type: String, required: true },
        last_name:{ type: String, required: true },
        email: { type: String, required: true },
        phone_number: { type: String, required: true },
        subject: { type: String, required: true },
    },
    {
        timestamps: true, 
    }
);

const PremiumRequest = mongoose.model<IPremiumRequest>("PremiumRequest", PremiumRequestSchema);

export default PremiumRequest;
