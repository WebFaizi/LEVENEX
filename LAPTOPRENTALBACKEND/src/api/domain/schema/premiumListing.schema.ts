import mongoose, { Document, Schema } from "mongoose";

export interface IPremiumListing extends Document {
    listing_id: string; 
    city_id: number[]; 
    premium_type: string; 
    start_date: Date; 
    end_date: Date; 
    createdAt?: Date; 
    updatedAt?: Date; 
    status:boolean;
}

const PremiumListingSchema: Schema<IPremiumListing> = new Schema(
    {
        listing_id: { type: String, required: true, ref: "Listings" },
        city_id: [{ type: Number, ref: "City", required: false  }],
        premium_type: { type: String, required: true },
        start_date: { type: Date, required: false ,default:null},
        end_date: { type: Date, required: false ,default:null},
        status: { type: Boolean, required: false ,default:true},
    },
    {
        timestamps: true, 
    }
);

const PremiumListing = mongoose.model<IPremiumListing>("PremiumListing", PremiumListingSchema);

export default PremiumListing;
