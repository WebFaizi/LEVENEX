import { string } from "joi";
import mongoose, { Document, Schema } from "mongoose";

export interface ISubscribers extends Document {
    name: string; 
    email: string; 
    status: boolean; 
    createdAt?: Date;
    updatedAt?: Date;
}

const SubscribersSchema: Schema = new Schema(
    {
        name: { type: String, required: false }, 
        email: { type: String, required: true }, 
        status: { type: Boolean, required: false, default: true }, 
    },
    {
        timestamps: true, 
    }
);

const Subscribers = mongoose.model<ISubscribers>("Subscribers   ", SubscribersSchema);
export default Subscribers;
