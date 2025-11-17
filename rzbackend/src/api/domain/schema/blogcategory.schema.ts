import { number } from "joi";
import mongoose, { Document, Schema } from "mongoose";

export interface IBlogCategory extends Document {
    name:string;
    slug:string;
    sorting:string;
}

const blogCategorySchema: Schema<IBlogCategory> = new Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true },
    },
    {
        timestamps: true,
    }
);

blogCategorySchema.pre("save", function (next) {
    if (this.isModified("name") || this.isNew) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    }
    next();
});

const BlogCategory = mongoose.model<IBlogCategory>("BlogCategory", blogCategorySchema);

export default BlogCategory;
