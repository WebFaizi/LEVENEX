import mongoose, { Document, Schema } from "mongoose";

export interface IIpBlacklist extends Document {
    ip_address: string;
    status: 'allowed' | 'banned';
    reason?: string;
    banned_by?: string;
    banned_at?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const IpBlacklistSchema: Schema<IIpBlacklist> = new Schema(
    {
        ip_address: { 
            type: String, 
            required: true,
            unique: true,
            trim: true 
        },
        status: { 
            type: String, 
            required: true, 
            enum: ['allowed', 'banned'], 
            default: 'allowed' 
        },
        reason: { 
            type: String, 
            required: false,
            default: '' 
        },
        banned_by: { 
            type: String, 
            required: false 
        },
        banned_at: { 
            type: Date, 
            required: false 
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
IpBlacklistSchema.index({ ip_address: 1 });
IpBlacklistSchema.index({ status: 1 });

const IpBlacklist = mongoose.model<IIpBlacklist>("IpBlacklist", IpBlacklistSchema);

export default IpBlacklist;
