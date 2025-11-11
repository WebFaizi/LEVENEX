import mongoose, { Document, Schema } from "mongoose";

export interface IUserActionActivity extends Document {
    user_id: mongoose.Types.ObjectId;
    module_name?: string;
    action_type?: string;
    message?: string;
    status?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const userActionActivitySchema: Schema<IUserActionActivity> = new Schema(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        module_name: {
            type: String,
            required: false,
            trim: true,
        },
        action_type: {
            type: String,
            required: false,
            trim: true,
            enum: ["Create", "Update", "Delete","Import", "Login", "Logout", "View","Sorting", "Other"], // Optional enum
        },
        message: {
            type: String,
            required: false,
            trim: true,
        },
        status: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
    }
);

// category ,blog cat,blogs,listing banner
const UserActionActivity = mongoose.model<IUserActionActivity>("UserActionActivity", userActionActivitySchema);

export default UserActionActivity;
