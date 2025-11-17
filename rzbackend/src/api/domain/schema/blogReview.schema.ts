import mongoose, { Schema, Document } from 'mongoose';


export interface IBlogReview extends Document {
    blog_id: mongoose.Types.ObjectId;    
    user_id: mongoose.Types.ObjectId;   
    rating: number;                    
    comment: string;                    
    isApproved: boolean;               
    createdAt: Date;                    
    updatedAt: Date;                    
}


const BlogReviewSchema: Schema = new Schema<IBlogReview>({
    blog_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, default: null }, 
    comment: { type: String, required: true, trim: true },
    isApproved: { type: Boolean, default: false }, 
}, {
    timestamps: true, 
});


const BlogReview = mongoose.model<IBlogReview>('BlogReview', BlogReviewSchema);

export default BlogReview;
