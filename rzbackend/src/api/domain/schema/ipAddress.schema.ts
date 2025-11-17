import mongoose, { Document, Schema } from "mongoose";

export interface IIpAddress extends Document {
    ip_address: string;
    ip_holder_name: string;
    device_type: string;
    status: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const IpAddressSchema: Schema<IIpAddress> = new Schema(
    {
        ip_address: { type: String, required: true },
        ip_holder_name: { type: String, required: true },
        device_type: { type: String, required: true },
        status: { type: String, required: false, default: "active" },
    },
    {
        timestamps: true, 
    }
);

const IpAddress = mongoose.model<IIpAddress>("IpAddress", IpAddressSchema);

export default IpAddress;
