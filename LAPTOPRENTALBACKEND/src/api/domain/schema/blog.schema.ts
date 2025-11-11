import mongoose, { Document, Schema } from "mongoose";
import { number } from "joi";

export interface IBlog extends Document {
    categoryIds: mongoose.Types.ObjectId[];
    author_name: string;
    contact_no: string;
    slug:string;
    email: string;
    blog_title: string;
    content: string;
    status: number;
    images?: string | null; // Optional field for images
    createdAt?: Date;
    updatedAt?: Date;
}

const BlogSchema: Schema<IBlog> = new Schema(
    {
        blog_title: { type: String, required: true, trim: true },
        slug: { type: String, required: true, trim: true ,unique: true },
        content: { type: String, required: true, trim: true },
        author_name: { type: String, required: true, trim: true },
        contact_no: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true },
        categoryIds: [{ type: Schema.Types.ObjectId, ref: "BlogCategory", required: true }], 
        status: { type: Number, required: true, default: 1 },
        images: { type: String,required: false,default: null }, // Optional field for images
    },
    {
        timestamps: true, 
    }
);

BlogSchema.pre("save", function (next) {
    if (this.isModified("blog_title") || this.isNew) {
        this.slug = this.blog_title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    }
    next();
});

const Blog = mongoose.model<IBlog>("Blog", BlogSchema);

export default Blog;
