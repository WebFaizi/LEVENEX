import mongoose, { Document, Schema } from "mongoose";

export interface IChatBoatUser extends Document {
    category_ids: number[]; 
    city_name: string;
    phone_number: string; 
    createdAt?: Date; 
    updatedAt?: Date; 
}

const ChatBoatUserSchema: Schema<IChatBoatUser> = new Schema(
    {
        category_ids: [{ type: Number, ref: 'Category' }], 
        city_name: { type: String, required: true },
        phone_number: { type: String, required: true },
    },
    {
        timestamps: true,  // Automatically adds `createdAt` and `updatedAt`
    }
);

const ChatBoatUser = mongoose.model<IChatBoatUser>("ChatBoatUser", ChatBoatUserSchema);

export default ChatBoatUser;
