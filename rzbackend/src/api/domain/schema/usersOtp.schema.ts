import { string } from "joi";
import mongoose, { Document, Schema } from "mongoose";

export interface IUsersOtp extends Document {
    user: string; 
    otp: string; 
    ip: string;
    location: string;
    status: "pending" | "verified" | "expired"; 
    createdAt?: Date;
    updatedAt?: Date;
}

const UsersOtpSchema: Schema = new Schema(
    {
        user: { type: String, required: true }, 
        otp: { type: String, required: true }, 
        ip: { type: String, required: false }, 
        location: { type: String, required: false }, 
        status: { 
            type: String, 
            enum: ["pending", "verified", "expired"], 
            default: "pending" 
        }, 
    },
    {
        timestamps: true, 
    }
);

const UsersOtp = mongoose.model<IUsersOtp>("UsersOtp", UsersOtpSchema);
export default UsersOtp;
