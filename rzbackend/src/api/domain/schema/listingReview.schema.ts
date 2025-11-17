import mongoose, { Schema, Document } from 'mongoose';

// Interface for TypeScript support
export interface IListingReview extends Document {
    listing_id: mongoose.Types.ObjectId; // Reference to the listing being reviewed
    user_id: mongoose.Types.ObjectId;    // Reference to the user who left the review
    rating: number;                     // Rating (1-5 scale)
    comment: string;                    // Review text
    isApproved: boolean;                // Admin approval flag
    createdAt: Date;                    // Timestamp when the review was created
    updatedAt: Date;                    // Timestamp when the review was last updated
}

// Schema definition
const ListingReviewSchema: Schema = new Schema<IListingReview>({
    listing_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Listings', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 }, // Rating between 1 and 5
    comment: { type: String, required: true, trim: true },
    isApproved: { type: Boolean, default: false }, // Pending admin approval
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
});

// Create model
const ListingReview = mongoose.model<IListingReview>('ListingReview', ListingReviewSchema);

export default ListingReview;
