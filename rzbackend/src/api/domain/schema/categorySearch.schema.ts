import mongoose, { Document, Schema } from "mongoose";

export interface ICategorySearch extends Document {
    category_id: mongoose.Types.ObjectId;
    search_date: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

const categorySearchSchema: Schema<ICategorySearch> = new Schema(
    {
        category_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        search_date: {
            type: Date,
            required: true,
            default: () => {
                const today = new Date();
                return new Date(today.getFullYear(), today.getMonth(), today.getDate());
            },
        },
    },
    {
        timestamps: true,
    }
);

const CategorySearch = mongoose.model<ICategorySearch>(
    "CategorySearch",
    categorySearchSchema
);

export default CategorySearch;
