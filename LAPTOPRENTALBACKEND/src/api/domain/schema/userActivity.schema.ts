import mongoose, { Document, Schema } from "mongoose";
import { number } from "joi";

export interface IUserActivity extends Document {
    user_id: mongoose.Types.ObjectId;
    user_type:string;
    ip_address:string;
    country?: string;
    region?: string;
    city?: string;
    zipcode?: string;
    login_success?: string;
    message?:string;
    createdAt?: Date;
    updatedAt?: Date;
}

const userActivitySchema: Schema<IUserActivity> = new Schema(
    {
        user_id: { type: Schema.Types.ObjectId, ref: "User", required: true }, 
        ip_address: { type: String, required: true },
        user_type: { type: String, required: true },
        country: { type: String, required: false },
        region: { type: String, required: false },
        city: { type: String, required: false },
        zipcode: { type: String, required: false },
        login_success: { type: String, required: false },
        message: { type: String, required: false },
    },
    {
        timestamps: true, 
    }
);


const UserActivity = mongoose.model<IUserActivity>("UserActivity", userActivitySchema);

export default UserActivity;
