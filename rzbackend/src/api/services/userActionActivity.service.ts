import userActionActivitySchema from "../domain/schema/userActionActivity.schema";
import mongoose from "mongoose";

export const storeUserActionActivity = async (
    user_id: mongoose.Types.ObjectId,
    module_type: string,
    action_type: string,
    message: string
) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(user_id)) {
            throw new Error("Invalid user ID");
        }

        const activity = await userActionActivitySchema.create({
            user_id: new mongoose.Types.ObjectId(user_id),
            module_name: module_type,
            action_type: action_type,
            message: message,
            status: true,
        });

        return activity;
        
    } catch (error) {
        console.error("Error in getLocationDetails:", error);
        throw error;
    }
};
